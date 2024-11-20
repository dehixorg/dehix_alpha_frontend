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
) {
  // Create a collection reference
  const collectionRef = collection(db, collectionPath);

  // Create a query that orders the documents by the timestamp field in ascending order
  const orderedQuery = query(collectionRef, orderBy('timestamp', 'asc'));

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
