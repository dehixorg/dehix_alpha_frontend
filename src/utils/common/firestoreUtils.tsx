import {
  doc,
  collection,
  onSnapshot,
  Query,
  DocumentData,
  setDoc,
  FirestoreError,
  addDoc,
  orderBy,
  QuerySnapshot,
  query,
  where,
  getDocs,
  writeBatch,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';

import { db } from '../../config/firebaseConfig';

/**
 * Subscribe to a single Firestore document for real-time updates.
 * @param collectionPath - Path to the collection.
 * @param docId - ID of the document to listen to.
 * @param callback - Function to handle the updated document data.
 */
export function subscribeToFirestoreDoc(
  collectionPath: string,
  docId: string,
  callback: (data: DocumentData | null) => void,
) {
  const docRef = doc(db, collectionPath, docId);
  return onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback(docSnapshot.data());
    } else {
      callback(null); // Document doesn't exist
    }
  });
}

/**
 * Subscribe to a Firestore collection for real-time updates.
 * @param collectionPath - Path to the collection.
 * @param callback - Function to handle the updated collection data.
 */
export function subscribeToFirestoreCollection(
  collectionPath: string,
  callback: (data: { id: string; [key: string]: any }[]) => void,
  sort: 'asc' | 'desc' = 'asc',
) {
  // Create a collection reference
  const collectionRef = collection(db, collectionPath);

  // Create a query that orders the documents by the timestamp field in ascending order
  const orderedQuery = query(collectionRef, orderBy('timestamp', sort));

  // Subscribe to the query with onSnapshot
  return onSnapshot(orderedQuery, (snapshot: QuerySnapshot<DocumentData>) => {
    // Map the snapshot to an array of document data with their ID
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Pass the ordered data to the callback function
    callback(data);
  });
}

/**
 * Subscribe to a Firestore collection for real-time updates with participants filter and sorted by the last message's timestamp.
 * @param collectionPath - Path to the collection.
 * @param userID - The ID of the user to filter conversations by (participants should contain userID).
 * @param callback - Function to handle the updated collection data with the last message details.
 */
export function subscribeToUserConversations(
  collectionPath: string,
  userID: string,
  callback: (
    data: { id: string; lastMessage: any | null; [key: string]: any }[],
  ) => void,
) {
  // Create a collection reference
  const collectionRef = collection(db, collectionPath);

  // Create a query that filters conversations where the participants array contains the userID
  const filteredQuery = query(
    collectionRef,
    where('participants', 'array-contains', userID),
    orderBy('lastMessage.timestamp', 'desc'), // Sort conversations by the timestamp of the last message (descending)
  );

  // Subscribe to the query with onSnapshot
  return onSnapshot(
    filteredQuery,
    async (snapshot: QuerySnapshot<DocumentData>) => {
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const conversation: {
            id: string;
            [key: string]: any;
          } = {
            id: doc.id,
            ...doc.data(),
          };

          // Get the last message from the `lastMessage` field, if available
          const lastMessage = conversation?.lastMessage || null;

          return {
            ...conversation,
            lastMessage, // Include the last message for each conversation
          };
        }),
      );

      // Pass the updated data to the callback function
      callback(data);
    },
  );
}

/**
 * Subscribe to a Firestore query for real-time updates.
 * @param queryRef - Query object from Firestore.
 * @param callback - Function to handle the updated query results.
 */
export function subscribeToFirestoreQuery(
  queryRef: Query<DocumentData>,
  callback: (data: DocumentData[]) => void,
) {
  return onSnapshot(queryRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
}

/**
 * Add a new document to Firestore (auto-generated ID).
 */
export async function addDataToFirestore(
  collectionPath: string,
  data: Record<string, any>,
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, collectionPath), data);
    console.log('Document added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', (error as FirestoreError).message);
    return null;
  }
}

/**
 * Updates the conversation document and adds the message to its subcollection in a single transaction.
 * @param collectionPath - Path to the Firestore collection.
 * @param conversationId - The ID of the conversation.
 * @param message - The message object to add.
 * @param datentime - The timestamp for the message.
 */
export async function updateConversationWithMessageTransaction(
  collectionPath: string,
  conversationId: string,
  message: any,
  datentime: any,
) {
  try {
    await runTransaction(db, async (transaction: any) => {
      // Reference to the conversation document
      const conversationRef = doc(db, collectionPath, conversationId);

      // Reference to the messages subcollection
      const messagesRef = collection(
        db,
        collectionPath,
        conversationId,
        'messages',
      );

      // Update the conversation document with the last message and timestamp
      transaction.update(conversationRef, {
        lastMessage: message,
        timestamp: datentime,
      });

      // Add the message to the messages subcollection
      const newMessageRef = doc(messagesRef); // Generate a new document ID for the message
      transaction.set(newMessageRef, {
        ...message,
        timestamp: datentime,
      });

      console.log(`Transaction committed: Message ID - ${newMessageRef.id}`);
    });

    return 'Transaction successful';
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

/**
 * Set a document in Firestore with a specific ID.
 */
export async function setDataToFirestore(
  collectionPath: string,
  docId: string,
  data: Record<string, any>,
): Promise<void> {
  try {
    await setDoc(doc(db, collectionPath, docId), data);
    console.log('Document written with ID:', docId);
  } catch (error) {
    console.error('Error setting document:', (error as FirestoreError).message);
  }
}

/**
 * Update a document in Firestore with a specific ID.
 */
export async function updateDataInFirestore(
  collectionPath: string,
  docId: string,
  data: Record<string, any>,
): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await updateDoc(docRef, data);
    console.log('Document updated with ID:', docId);
  } catch (error) {
    console.error(
      'Error updating document:',
      (error as FirestoreError).message,
    );
  }
}

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: DocumentData[]) => void,
) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', 'array-contains', userId));

  // Real-time listener
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    callback(notifications);
  });

  return unsubscribe; // Return the unsubscribe function to stop listening when needed
};

// Function to mark all notifications as read in Firestore
export const markAllNotificationsAsRead = async (userId: string) => {
  const batch = writeBatch(db); // Initialize Firestore batch operation

  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('isRead', '==', false),
    );
    const querySnapshot = await getDocs(q);

    // Loop through all the unread notifications and add them to the batch for updating
    querySnapshot.forEach((docSnap) => {
      const notificationDocRef = doc(db, 'notifications', docSnap.id);
      batch.update(notificationDocRef, { isRead: true }); // Add update to batch
    });

    // Commit the batch update
    await batch.commit();
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw new Error('Failed to mark notifications as read');
  }
};
