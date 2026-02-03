import {
  doc,
  collection,
  onSnapshot,
  Query,
  serverTimestamp,
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
  runTransaction,
  updateDoc,
  deleteDoc,
  deleteField,
  arrayUnion,
  arrayRemove,
  limit,
  startAfter,
  DocumentSnapshot,
  increment,
} from 'firebase/firestore';

import { db } from '../../config/firebaseConfig';
import { logger } from '../logger';

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
  // and orders by the most recently updated conversation (so new chats/groups appear first)
  const filteredQuery = query(
    collectionRef,
    where('participants', 'array-contains', userID),
    orderBy('updatedAt', 'desc'),
  );

  // Subscribe to the query with onSnapshot
  return onSnapshot(
    filteredQuery,
    async (snapshot: QuerySnapshot<DocumentData>) => {
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const docData = doc.data();

          const conversation: {
            id: string;
            [key: string]: any;
          } = {
            id: doc.id,
            ...docData,
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
    (error) => {
      // Fallback query without orderBy if the field doesn't exist
      if (
        error.code === 'failed-precondition' ||
        error.code === 'invalid-argument'
      ) {
        const fallbackQuery = query(
          collectionRef,
          where('participants', 'array-contains', userID),
        );

        return onSnapshot(
          fallbackQuery,
          async (snapshot: QuerySnapshot<DocumentData>) => {
            const data = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const conversation = {
                  id: doc.id,
                  ...doc.data(),
                  lastMessage: doc.data()?.lastMessage || null,
                };
                return conversation;
              }),
            );

            // Sort manually in JavaScript if Firestore ordering fails
            data.sort((a, b) => {
              const aTime =
                (a as any).timestamp ||
                (a as any).updatedAt ||
                (a as any).createdAt ||
                '';
              const bTime =
                (b as any).timestamp ||
                (b as any).updatedAt ||
                (b as any).createdAt ||
                '';
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            });

            callback(data);
          },
        );
      }
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

      // Read conversation to check type and inboxFor (WhatsApp-style: recipient sees chat when they receive a message)
      const convSnap = await transaction.get(conversationRef);
      const convData = convSnap.exists() ? convSnap.data() : {};
      const isIndividual = convData.type === 'individual';
      const inboxFor = Array.isArray(convData.inboxFor)
        ? [...convData.inboxFor]
        : [];
      const participants = Array.isArray(convData.participants)
        ? convData.participants
        : [];
      const senderId = message?.senderId;

      const conversationUpdate: Record<string, unknown> = {
        lastMessage: message,
        timestamp: datentime,
      };

      // For individual chats: ensure both sender and all participants are in inboxFor so recipient sees the conversation
      if (isIndividual && participants.length > 0) {
        const missingFromInbox = participants.filter(
          (id: string) => !inboxFor.includes(id),
        );
        if (missingFromInbox.length > 0) {
          conversationUpdate.inboxFor = arrayUnion(...missingFromInbox);
          // If a user previously deleted this conversation, bring it back for them when a new message arrives
          conversationUpdate.deletedForUsers = arrayRemove(...missingFromInbox);
          conversationUpdate.updatedAt = serverTimestamp();
        }
      }

      // Increment unread count for all participants except sender
      if (senderId) {
        participants.forEach((pid: string) => {
          if (pid !== senderId) {
            (conversationUpdate as any)[`unreadCountByUser.${pid}`] =
              increment(1);
          }
        });
      }
      transaction.update(conversationRef, conversationUpdate);

      // Reference to the messages subcollection
      const messagesRef = collection(
        db,
        collectionPath,
        conversationId,
        'messages',
      );

      // Add the message to the messages subcollection
      const newMessageRef = doc(messagesRef);
      transaction.set(newMessageRef, {
        ...message,
        timestamp: datentime,
      });
    });

    return 'Transaction successful';
  } catch (error) {
    logger.error('Transaction failed', error);
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
  } catch (error) {
    logger.error('Error setting document', (error as FirestoreError).message);
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

// Function to mark all notifications as read in Firestore using a single transaction
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    // Query for notifications where the userId is in the array
    const q = query(
      notificationsRef,
      where('userId', 'array-contains', userId),
    );

    // First, get all unread notification IDs
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return; // No unread notifications
    }

    // Use a transaction to update all notifications
    const batch = writeBatch(db);

    querySnapshot.forEach((docSnap) => {
      const notificationDocRef = doc(db, 'notifications', docSnap.id);
      batch.update(notificationDocRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    });

    // Commit the batch update
    await batch.commit();
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw new Error('Failed to mark notifications as read');
  }
};

/**
 * Delete a message from a conversation.
 * Also updates the conversation's lastMessage if the deleted message was the last one.
 */
export async function deleteMessageFromConversation(
  conversationId: string,
  messageId: string,
): Promise<void> {
  try {
    // Reference to the message document
    const messageRef = doc(
      db,
      'conversations',
      conversationId,
      'messages',
      messageId,
    );

    // Delete the message
    await deleteDoc(messageRef);

    // Optionally update the conversation's lastMessage
    // Get the latest message after deletion
    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages',
    );
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const conversationRef = doc(db, 'conversations', conversationId);

    if (!querySnapshot.empty) {
      // Update lastMessage to the new latest message
      const latestMessage = querySnapshot.docs[0].data();
      await updateDoc(conversationRef, {
        lastMessage: latestMessage,
        updatedAt: serverTimestamp(),
      });
    } else {
      // No messages left, clear lastMessage
      await updateDoc(conversationRef, {
        lastMessage: null,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    logger.error('Error deleting message', (error as FirestoreError).message);
    throw error;
  }
}

// --- Paginated messages (last 50, load more on scroll) ---
const MESSAGES_PAGE_SIZE = 50;

/**
 * Subscribe to the last N messages of a conversation (real-time). Filter out messages deleted by userId.
 * getOldestSnapshot() returns the snapshot of the oldest message in this page (for loadMoreMessages).
 */
export function subscribeToMessagesPaginated(
  conversationId: string,
  userId: string,
  callback: (
    messages: { id: string; [key: string]: any }[],
    getOldestSnapshot: () => DocumentSnapshot<DocumentData> | null,
  ) => void,
  pageSize: number = MESSAGES_PAGE_SIZE,
) {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages',
  );
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(pageSize));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((msg) => {
        const deletedFor = (msg as any).deletedFor as string[] | undefined;
        return !deletedFor || !deletedFor.includes(userId);
      });
    const getOldestSnapshot = () =>
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    callback(data, getOldestSnapshot);
  });
}

/**
 * Load older messages (before the given document snapshot). Returns chronological order (oldest first).
 */
export async function loadMoreMessages(
  conversationId: string,
  userId: string,
  lastDocSnapshot: DocumentSnapshot<DocumentData>,
): Promise<{
  messages: { id: string; [key: string]: any }[];
  lastDoc: DocumentSnapshot<DocumentData> | null;
}> {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages',
  );
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    startAfter(lastDocSnapshot),
    limit(MESSAGES_PAGE_SIZE),
  );
  const snapshot = await getDocs(q);
  const messages = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((msg) => {
      const deletedFor = (msg as any).deletedFor as string[] | undefined;
      return !deletedFor || !deletedFor.includes(userId);
    });
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
  return { messages, lastDoc };
}

// --- Typing indicator ---
export function setUserTyping(
  conversationId: string,
  userId: string,
  isTyping: boolean,
): void {
  const typingRef = doc(db, 'conversations', conversationId, 'typing', userId);
  if (isTyping) {
    setDoc(typingRef, { at: serverTimestamp() }).catch(() => {});
  } else {
    deleteDoc(typingRef).catch(() => {});
  }
}

export function subscribeToTyping(
  conversationId: string,
  callback: (userIds: string[]) => void,
): () => void {
  const typingRef = collection(db, 'conversations', conversationId, 'typing');
  const TYPING_TTL_MS = 8000;
  return onSnapshot(typingRef, (snapshot) => {
    const now = Date.now();
    const userIds: string[] = [];
    snapshot.docs.forEach((d) => {
      const data = d.data() as {
        at?: { toMillis?: () => number };
        seconds?: number;
      };
      const atMs =
        data?.at?.toMillis?.() ??
        (data?.at && typeof (data.at as any).seconds === 'number'
          ? (data.at as any).seconds * 1000
          : 0);
      // If at is 0 or very old, treat as "just wrote" (serverTimestamp may not be resolved yet) and include for TTL
      const elapsed = atMs > 0 ? now - atMs : 0;
      if (elapsed < TYPING_TTL_MS) userIds.push(d.id);
    });
    callback(userIds);
  });
}

// --- Read receipts: mark conversation as read by user ---
export async function updateConversationReadBy(
  conversationId: string,
  userId: string,
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`readBy.${userId}`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    logger.error('Error updating readBy', e);
  }
}

// --- Unread count: reset when user opens conversation ---
export async function resetUnreadCount(
  conversationId: string,
  userId: string,
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unreadCountByUser.${userId}`]: 0,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    logger.error('Error resetting unread count', e);
  }
}

// --- Mute: toggle conversation mute for a user (persisted in Firestore) ---
export async function toggleConversationMute(
  conversationId: string,
  userId: string,
  mute: boolean,
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    if (mute) {
      await updateDoc(convRef, {
        mutedByUsers: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(convRef, {
        mutedByUsers: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    logger.error('Error toggling conversation mute', e);
    throw e;
  }
}

// --- Pin message: set or clear pinned message on conversation ---
export async function pinMessage(
  conversationId: string,
  messageId: string,
  content: string,
  userId: string,
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      pinnedMessage: {
        messageId,
        pinnedAt: new Date().toISOString(),
        pinnedBy: userId,
        content: content?.slice(0, 200) || '',
      },
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    logger.error('Error pinning message', e);
    throw e;
  }
}

export async function unpinMessage(conversationId: string): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      pinnedMessage: deleteField(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    logger.error('Error unpinning message', e);
    throw e;
  }
}

// --- Group system messages (admins-only) ---
export async function addGroupSystemMessage(
  conversationId: string,
  text: string,
  meta?: Record<string, any>,
): Promise<void> {
  try {
    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages',
    );
    await addDoc(messagesRef, {
      type: 'system',
      adminsOnly: true,
      content: text,
      meta: meta || {},
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    logger.error('Error adding group system message', e);
  }
}
