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
    getDoc,
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
 * @param onError - Optional error callback.
 */
export function subscribeToFirestoreDoc(
    collectionPath: string,
    docId: string,
    callback: (data: DocumentData | null) => void,
    onError?: (error: FirestoreError) => void,
) {
    const docRef = doc(db, collectionPath, docId);
    return onSnapshot(
        docRef,
        (docSnapshot) => {
            if (docSnapshot.exists()) {
                callback(docSnapshot.data());
            } else {
                callback(null); // Document doesn't exist
            }
        },
        (error: FirestoreError) => {
            logger.error('Error in Firestore document subscription:', error);
            callback(null); // Notify consumer of failure
            onError?.(error);
        },
    );
}


/**
 * Subscribe to a Firestore collection for real-time updates.
 * @param collectionPath - Path to the collection.
 * @param callback - Function to handle the updated collection data.
 * @param sort - Sort order ('asc' or 'desc'), defaults to 'asc'.
 * @param orderByField - Field to order by, defaults to 'timestamp'.
 * @param onError - Optional error callback.
 */
export function subscribeToFirestoreCollection(
    collectionPath: string,
    callback: (data: { id: string;[key: string]: any }[]) => void,
    sort: 'asc' | 'desc' = 'asc',
    orderByField: string = 'timestamp',
    onError?: (error: FirestoreError) => void,
) {
    // Create a collection reference
    const collectionRef = collection(db, collectionPath);

    // Create a query that orders the documents by the specified field
    const orderedQuery = query(collectionRef, orderBy(orderByField, sort));

    // Subscribe to the query with onSnapshot
    return onSnapshot(
        orderedQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
            // Map the snapshot to an array of document data with their ID
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Pass the ordered data to the callback function
            callback(data);
        },
        (error: FirestoreError) => {
            logger.error('Error in Firestore collection subscription:', error);
            onError?.(error);
        },
    );
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
        data: { id: string; lastMessage: DocumentData | null;[key: string]: unknown }[],
    ) => void,
) {
    const collectionRef = collection(db, collectionPath);
    const filteredQuery = query(
        collectionRef,
        where('participants', 'array-contains', userID),
        orderBy('updatedAt', 'desc'),
    );

    let activeUnsubscribe: (() => void) | null = null;
    let didUnsubscribe = false; // Guard against double unsubscribe

    // Centralized cleanup function - called exactly once
    const cleanup = () => {
        if (didUnsubscribe) return; // Already cleaned up
        didUnsubscribe = true;

        if (activeUnsubscribe) {
            try {
                activeUnsubscribe();
            } catch (e) {
                logger.error('Error during subscription cleanup:', e);
            }
            activeUnsubscribe = null;
        }
    };

    // Helper to convert timestamps safely
    const getTimestampMs = (raw: any): number => {
        if (!raw) return 0;
        if (typeof raw === 'object' && raw !== null) {
            if ('toMillis' in raw && typeof raw.toMillis === 'function') {
                return raw.toMillis();
            }
            if ('seconds' in raw && typeof raw.seconds === 'number') {
                return raw.seconds * 1000;
            }
        }
        if (typeof raw === 'string') {
            return new Date(raw).getTime();
        }
        return 0;
    };

    const processSnapshot = async (snapshot: QuerySnapshot<DocumentData>) => {
        if (didUnsubscribe) return; // Don't process if already cleaned up
        const data = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    ...docData,
                    lastMessage: docData?.lastMessage || null,
                };
            }),
        );
        callback(data);
    };

    // Try primary query with orderBy
    activeUnsubscribe = onSnapshot(
        filteredQuery,
        processSnapshot,
        (error) => {
            // Fallback if index doesn't exist - DON'T call cleanup() here to avoid double unsubscribe
            if (
                error.code === 'failed-precondition' ||
                error.code === 'invalid-argument'
            ) {
                logger.warn('Falling back to unordered query:', error.message);

                // Store old unsubscribe and clear it (don't call cleanup())
                const oldUnsubscribe = activeUnsubscribe;
                activeUnsubscribe = null;

                // Unsubscribe the failed primary listener safely
                if (oldUnsubscribe) {
                    try {
                        oldUnsubscribe();
                    } catch (e) {
                        logger.error('Error unsubscribing primary listener:', e);
                    }
                }

                const fallbackQuery = query(
                    collectionRef,
                    where('participants', 'array-contains', userID),
                );

                activeUnsubscribe = onSnapshot(
                    fallbackQuery,
                    async (snapshot: QuerySnapshot<DocumentData>) => {
                        if (didUnsubscribe) return; // Don't process if already cleaned up
                        const data = await Promise.all(
                            snapshot.docs.map(async (doc) => {
                                const docData = doc.data();
                                return {
                                    id: doc.id,
                                    ...docData,
                                    lastMessage: docData?.lastMessage || null,
                                };
                            }),
                        );

                        // Sort manually in JavaScript if Firestore ordering fails
                        data.sort((a, b) => {
                            const aTime = getTimestampMs(
                                (a as any).timestamp ||
                                (a as any).updatedAt ||
                                (a as any).createdAt
                            );
                            const bTime = getTimestampMs(
                                (b as any).timestamp ||
                                (b as any).updatedAt ||
                                (b as any).createdAt
                            );
                            return bTime - aTime;
                        });

                        callback(data);
                    },
                    (fallbackError: FirestoreError) => {
                        // Just log - don't call cleanup() or unsubscribe here
                        logger.error('Fallback subscription error:', fallbackError);
                    },
                );
            } else {
                // Just log - don't call cleanup() or unsubscribe here
                logger.error('Subscription error:', error);
            }
        },
    );

    return cleanup;
}


/**
 * Subscribe to a Firestore query for real-time updates.
 * @param queryRef - Query object from Firestore.
 * @param callback - Function to handle the updated query results.
 */
export function subscribeToFirestoreQuery(
    queryRef: Query<DocumentData>,
    callback: (data: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
) {
    return onSnapshot(
        queryRef,
        (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(data);
        },
        (error: FirestoreError) => {
            logger.error('Error in Firestore query subscription:', error);
            onError?.(error);
        },
    );
}

/**
 * Add a new document to Firestore (auto-generated ID).
 */
export async function addDataToFirestore(
    collectionPath: string,
    data: Record<string, any>,
): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, collectionPath), data);
        return docRef.id;
    } catch (error) {
        logger.error('Error adding document:', (error as FirestoreError).message);
        throw error; // Re-throw so caller knows it failed
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
    message: Record<string, unknown>,
    datentime: string,
) {
    try {
        await runTransaction(db, async (transaction) => {
            // Reference to the conversation document
            const conversationRef = doc(db, collectionPath, conversationId);

            // Read conversation to check type and inboxFor (WhatsApp-style: recipient sees chat when they receive a message)
            const convSnap = await transaction.get(conversationRef);

            // Guard: Fail fast if conversation doesn't exist
            if (!convSnap.exists()) {
                throw new Error(`Conversation ${conversationId} not found`);
            }

            const convData = convSnap.data();
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
                updatedAt: serverTimestamp(),
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
                }
            }


            // Increment unread count for all participants except sender
            if (senderId && typeof senderId === 'string') {
                participants.forEach((pid: string) => {
                    if (pid !== senderId) {
                        conversationUpdate[`unreadCountByUser.${pid}`] = increment(1);
                    }
                });
            } else {
                // Log when senderId is missing to help debug
                logger.warn('Skipping unread count update: senderId is missing or invalid', {
                    conversationId,
                    senderId,
                });
            }
            transaction.update(conversationRef, conversationUpdate as Record<string, any>);

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
    data: Record<string, unknown>,
): Promise<void> {
    try {
        await setDoc(doc(db, collectionPath, docId), data);
    } catch (error) {
        logger.error('Error setting document', (error as FirestoreError).message);
        throw error; // Re-throw so caller knows it failed
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
        logger.error(
            'Error updating document:',
            (error as FirestoreError).message,
        );
        throw error; // Re-throw so caller knows it failed
    }
}

export const subscribeToUserNotifications = (
    userId: string,
    callback: (notifications: DocumentData[]) => void,
    onError?: (error: FirestoreError) => void,
) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
        notificationsRef,
        where('userId', 'array-contains', userId),
        where('isRead', '==', false),
    );

    // Real-time listener with error handler
    const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
            const notifications: DocumentData[] = [];
            querySnapshot.forEach((doc) => {
                notifications.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            callback(notifications);
        },
        (error: FirestoreError) => {
            logger.error('Error in notifications subscription:', error);
            onError?.(error);
        },
    );

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

        const BATCH_SIZE = 500; // Firestore batch write limit
        const docs = querySnapshot.docs;

        // Process in chunks of 500 to respect Firestore limits
        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + BATCH_SIZE);

            chunk.forEach((docSnap) => {
                const notificationDocRef = doc(db, 'notifications', docSnap.id);
                batch.update(notificationDocRef, {
                    isRead: true,
                    readAt: serverTimestamp(),
                });
            });

            // Commit this batch
            await batch.commit();
        }
    } catch (error) {
        logger.error('Error marking notifications as read:', error);
        throw new Error('Failed to mark notifications as read');
    }
};

/**
 * Delete a message from a conversation.
 * Atomically deletes the message and updates the conversation's lastMessage.
 * Uses a two-phase approach: query outside transaction (transactions cannot get(Query)), then transaction.get(docRef) inside.
 * @param currentUserId - Required. User requesting deletion. Must be sender or admin.
 */
export async function deleteMessageFromConversation(
    conversationId: string,
    messageId: string,
    currentUserId: string, // Required for auth check
): Promise<void> {
    const messageRef = doc(
        db,
        'conversations',
        conversationId,
        'messages',
        messageId,
    );
    const conversationRef = doc(db, 'conversations', conversationId);
    try {
        await runTransaction(db, async (transaction) => {
            const messageSnap = await transaction.get(messageRef);
            if (!messageSnap.exists()) return; // Message already deleted or doesn't exist

            const messageData = messageSnap.data();
            const conversationSnap = await transaction.get(conversationRef);

            // Guard: Fail fast if conversation doesn't exist
            if (!conversationSnap.exists()) {
                throw new Error(`Conversation ${conversationId} not found`);
            }

            const conversationData = conversationSnap.data();
            const admins = conversationData?.admins || [];

            // Auth Check: Can deleting user delete this?
            // Allowed if: matches senderId OR user is an admin
            const isSender = messageData.senderId === currentUserId;
            const isAdmin = admins.includes(currentUserId);

            if (!isSender && !isAdmin) {
                throw new Error("Unauthorized to delete this message");
            }


            // Hard Delete (Delete for everyone)
            transaction.delete(messageRef);

            // Update lastMessage if we deleted the current last message
            const existingLast = conversationData?.lastMessage;

            if (existingLast?.id === messageId) {
                // We deleted the last message, need to update to null or find a new one
                // Since we're in a transaction, we can't easily query. Set to null for now.
                // The next message sent will update this automatically.
                transaction.update(conversationRef, {
                    lastMessage: null,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Just update the timestamp
                transaction.update(conversationRef, {
                    updatedAt: serverTimestamp(),
                });
            }
        });

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
        messages: { id: string;[key: string]: any }[],
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
    return onSnapshot(
        q,
        (snapshot) => {
            const data = snapshot.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((msg) => {
                    const deletedFor = (msg as any).deletedFor as string[] | undefined;
                    return !deletedFor || !deletedFor.includes(userId);
                });
            const getOldestSnapshot = () =>
                snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
            callback(data, getOldestSnapshot);
        },
        (error: FirestoreError) => {
            logger.error('Error in messages subscription:', error);
        },
    );
}

/**
 * Load older messages (before the given document snapshot). Returns chronological order (oldest first).
 * Compensates for client-side deleted message filtering by fetching additional batches if needed.
 */
export async function loadMoreMessages(
    conversationId: string,
    userId: string,
    lastDocSnapshot: DocumentSnapshot<DocumentData>,
    pageSize: number = MESSAGES_PAGE_SIZE,
): Promise<{
    messages: { id: string;[key: string]: unknown }[];
    lastDoc: DocumentSnapshot<DocumentData> | null;
}> {
    const messagesRef = collection(
        db,
        'conversations',
        conversationId,
        'messages',
    );

    type MessageDoc = { id: string; deletedFor?: string[];[key: string]: unknown };
    const allMessages: MessageDoc[] = [];
    let cursor: DocumentSnapshot<DocumentData> = lastDocSnapshot;
    let hasMore = true;

    // Continue fetching until we have enough non-deleted messages or exhausted results
    while (allMessages.length < pageSize && hasMore) {
        const batchQuery: Query<DocumentData> = query(
            messagesRef,
            orderBy('timestamp', 'desc'),
            startAfter(cursor),
            limit(pageSize),
        );
        const batchSnapshot: QuerySnapshot<DocumentData> = await getDocs(batchQuery);


        if (batchSnapshot.empty) {
            hasMore = false;
            break;
        }

        // Filter out deleted messages
        for (const docSnap of batchSnapshot.docs) {
            const data = docSnap.data() as { deletedFor?: string[];[key: string]: unknown };
            if (!data.deletedFor || !data.deletedFor.includes(userId)) {
                allMessages.push({ id: docSnap.id, ...data });
            }
        }

        // Update cursor for next iteration
        cursor = batchSnapshot.docs[batchSnapshot.docs.length - 1];

        // If snapshot had fewer docs than requested, we've exhausted results
        if (batchSnapshot.docs.length < pageSize) {
            hasMore = false;
        }
    }

    // Trim to requested page size and return oldest-first (chronological order)
    const trimmed = allMessages.slice(0, pageSize);
    return { messages: trimmed.reverse(), lastDoc: cursor };
}




// --- Typing indicator ---
export function setUserTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean,
): void {
    const typingRef = doc(db, 'conversations', conversationId, 'typing', userId);
    if (isTyping) {
        setDoc(typingRef, { at: serverTimestamp() }).catch((err) => {
            logger.error('Failed to set typing indicator', err);
        });
    } else {
        deleteDoc(typingRef).catch((err) => {
            logger.error('Failed to clear typing indicator', err);
        });
    }
}

export function subscribeToTyping(
    conversationId: string,
    callback: (userIds: string[]) => void,
): () => void {
    const typingRef = collection(db, 'conversations', conversationId, 'typing');
    const TYPING_TTL_MS = 8000;
    return onSnapshot(
        typingRef,
        (snapshot) => {
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
        },
        (error: FirestoreError) => {
            logger.error('Error in typing subscription:', error);
        },
    );
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
            // Removed updatedAt to prevent reordering on read
        });
    } catch (e) {
        logger.error('Error updating readBy', e);
        throw e; // Re-throw so caller knows it failed
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
            // Removed updatedAt to prevent reordering on read
        });
    } catch (e) {
        logger.error('Error resetting unread count', e);
        throw e; // Re-throw so caller knows it failed
    }
}


// --- Pin message: set or clear pinned message on conversation ---
export async function pinMessage(
    conversationId: string,
    messageId: string,
    content: string,
    currentUserId: string,
): Promise<void> {
    const convRef = doc(db, 'conversations', conversationId);

    try {
        await runTransaction(db, async (transaction) => {
            const convSnap = await transaction.get(convRef);

            if (!convSnap.exists()) {
                throw new Error('Conversation not found');
            }

            const data = convSnap.data();
            const participants = data?.participants || [];
            const admins = data?.admins || [];

            // Auth check: must be participant or admin
            if (!participants.includes(currentUserId) && !admins.includes(currentUserId)) {
                throw new Error('Unauthorized: Only participants or admins can pin messages');
            }

            // Atomically update pinnedMessage and updatedAt
            transaction.update(convRef, {
                pinnedMessage: {
                    messageId,
                    pinnedAt: serverTimestamp(),
                    pinnedBy: currentUserId,
                    content: content?.slice(0, 200) || '',
                },
                updatedAt: serverTimestamp(),
            });
        });
    } catch (e) {
        logger.error('Error pinning message', e);
        throw e;
    }
}


export async function unpinMessage(
    conversationId: string,
    currentUserId: string,
): Promise<void> {
    const convRef = doc(db, 'conversations', conversationId);

    try {
        await runTransaction(db, async (transaction) => {
            const convSnap = await transaction.get(convRef);

            if (!convSnap.exists()) {
                throw new Error('Conversation not found');
            }

            const data = convSnap.data();
            const participants = data?.participants || [];
            const admins = data?.admins || [];

            // Auth check: must be participant or admin
            if (!participants.includes(currentUserId) && !admins.includes(currentUserId)) {
                throw new Error('Unauthorized: Only participants or admins can unpin messages');
            }

            // Atomically clear pinnedMessage and update updatedAt
            transaction.update(convRef, {
                pinnedMessage: deleteField(),
                updatedAt: serverTimestamp(),
            });
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
    meta: Record<string, unknown>,
    currentUserId: string,
): Promise<void> {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);

        if (!conversationSnap.exists()) {
            throw new Error('Conversation not found');
        }

        const conversationData = conversationSnap.data();
        const admins = conversationData?.admins || [];

        if (!admins.includes(currentUserId)) {
            throw new Error('Unauthorized: Only admins can add system messages');
        }

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
            timestamp: serverTimestamp(),
        });
    } catch (e) {
        logger.error('Error adding group system message', e, { conversationId, currentUserId });
        throw e;
    }
}

