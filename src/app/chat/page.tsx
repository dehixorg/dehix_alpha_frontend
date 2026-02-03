'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
} from 'firebase/firestore';
import { MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { db } from '@/config/firebaseConfig';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
import ChatLayout from '@/components/shared/ChatLayout';
import { ChatList, type Conversation } from '@/components/shared/chatList';
import ProfileSidebar from '@/components/shared/ProfileSidebar';
import { NewChatDialog } from '@/components/shared/NewChatDialog';
import type { CombinedUser as NewChatUser } from '@/hooks/useAllUsers';
import EmptyState from '@/components/shared/EmptyState';
import {
  menuItemsBottom as businessMenuItemsBottom,
  menuItemsTop as businessMenuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { subscribeToUserConversations } from '@/utils/common/firestoreUtils';
import { RootState } from '@/lib/store';

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const allConversationsRef = useRef<Conversation[]>([]); // Raw list (before inboxFor filter) for existence check
  const removedConversationIdsRef = useRef<Set<string>>(new Set()); // User deleted these from sidebar; keep them out even if subscription returns stale data
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [lastReadAt, setLastReadAt] = useState<Record<string, string>>({}); // conversationId -> ISO timestamp when last opened (so unread glow goes away after seeing)
  const [loading, setLoading] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // State for ProfileSidebar
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [profileSidebarId, setProfileSidebarId] = useState<string | null>(null);
  const [profileSidebarType, setProfileSidebarType] = useState<
    'user' | 'group' | null
  >(null);
  const [profileSidebarInitialData, setProfileSidebarInitialData] = useState<
    object | undefined
  >(undefined);

  // State for NewChatDialog
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  const handleOpenProfileSidebar = (
    id: string,
    type: 'user' | 'group',
    initialDetails?: object,
  ) => {
    setProfileSidebarId(id);
    setProfileSidebarType(type);
    setProfileSidebarInitialData(initialDetails);
    setIsProfileSidebarOpen(true);
  };

  const handleCloseProfileSidebar = () => {
    setIsProfileSidebarOpen(false);
    setProfileSidebarInitialData(undefined);
  };

  // Handle conversation update from ProfileSidebar (mute, delete, etc.)
  const handleConversationUpdate = useCallback(
    (conv: Conversation | null) => {
      setActiveConversation(conv);
      if (conv === null) {
        const url = new URL(window.location.href);
        url.searchParams.delete('c');
        router.push(url.pathname + url.search, { scroll: false });
      } else {
        // Keep list in sync (e.g. mute state) so chat list row updates immediately
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c)),
        );
      }
    },
    [router],
  );

  // Remove conversation from sidebar list when user deletes chat (optimistic + keep it out when subscription fires with stale data)
  const handleConversationRemovedFromList = useCallback(
    (conversationId: string) => {
      removedConversationIdsRef.current.add(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setActiveConversation((prev) =>
        prev?.id === conversationId ? null : prev,
      );
      const url = new URL(window.location.href);
      if (url.searchParams.get('c') === conversationId) {
        url.searchParams.delete('c');
        router.push(url.pathname + url.search, { scroll: false });
      }
    },
    [router],
  );

  const toggleChatExpanded = () => {
    setIsChatExpanded((prev) => !prev);
  };

  // Mark conversation as "read" when user opens it so unread glow goes away and stays away until new message
  useEffect(() => {
    if (activeConversation?.id) {
      // Small delay to ensure timestamp is definitely after the last message
      const timer = setTimeout(() => {
        setLastReadAt((prev) => ({
          ...prev,
          [activeConversation.id]: new Date().toISOString(),
        }));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeConversation?.id]);

  // Handle back button on mobile - clear active conversation and URL param
  const handleBackToList = useCallback(() => {
    setActiveConversation(null);
    // Clear the URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('c');
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  async function handleCreateGroupChat(
    selectedUsers: NewChatUser[],
    groupName: string,
    description: string,
  ) {
    if (!user || !user.uid) {
      notifyError('You must be logged in.', 'Error');
      return;
    }
    if (!groupName.trim()) {
      notifyError('Group name cannot be empty.', 'Error');
      return;
    }
    if (selectedUsers.length < 1) {
      notifyError('You must select at least one other member.', 'Error');
      return;
    }

    // Use Firebase UIDs so the conversation appears in each user's chat list (Firestore query uses participants)
    const otherUids = selectedUsers
      .map((u) => u.firebaseUid ?? u.id)
      .filter(Boolean) as string[];
    const allParticipantIds = [user.uid, ...otherUids];
    const participantDetails: Record<
      string,
      {
        userName: string;
        profilePic: string | null;
        email: string | null;
        userType?: string;
        viewState: string;
      }
    > = {
      [user.uid]: {
        userName: user.displayName || user.email,
        profilePic: user.photoURL || null,
        email: user.email || null,
        userType: user.type,
        viewState: 'inbox',
      },
    };
    selectedUsers.forEach((selected: any) => {
      const uid = selected.firebaseUid ?? selected.id;
      if (!uid) return;
      participantDetails[uid] = {
        userName: selected.displayName,
        profilePic: selected.profilePic || null,
        email: selected.email || null,
        userType: selected.userType,
        viewState: 'inbox',
      };
    });

    const newGroupData = {
      groupName: groupName.trim(),
      description: description.trim(),
      avatar: null,
      participants: allParticipantIds,
      participantDetails: participantDetails,
      type: 'group' as const,
      inboxFor: allParticipantIds, // All members see the group (WhatsApp-style)
      admins: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
    };

    try {
      const docRef = await addDoc(
        collection(db, 'conversations'),
        newGroupData,
      );
      notifySuccess(`Group "${groupName}" created.`, 'Success');

      const participantDetailsForState: NonNullable<
        Conversation['participantDetails']
      > = Object.fromEntries(
        Object.entries(participantDetails as Record<string, any>).map(
          ([k, v]) => [
            k,
            {
              userName: v.userName,
              profilePic: v.profilePic || undefined,
              email: v.email || undefined,
              userType: v.userType,
              viewState: v.viewState,
            },
          ],
        ),
      );

      const groupDataForState: Conversation = {
        id: docRef.id,
        participants: newGroupData.participants,
        participantDetails: participantDetailsForState,
        type: 'group',
        groupName: newGroupData.groupName,
        description: newGroupData.description,
        admins: newGroupData.admins,
        lastMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveConversation(groupDataForState);
      setIsNewChatDialogOpen(false);
    } catch (error) {
      console.error('Error creating group chat: ', error);
      notifyError('Failed to create group.', 'Error');
    }
  }

  // Handle URL parameters when component mounts
  useEffect(() => {
    if (initialLoad && searchParams) {
      setInitialLoad(false);
    }
  }, [searchParams, initialLoad]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Handle starting a new chat with a user
  const handleStartNewChat = useCallback(
    async (selectedUser: NewChatUser) => {
      if (!user?.uid) {
        notifyError('You must be logged in to start a new chat.', 'Error');
        return null;
      }

      // Only "existing" = same person AND you haven't deleted it.
      const existingConv = allConversationsRef.current.find(
        (conv) =>
          conv.type === 'individual' &&
          conv.participants.includes(selectedUser.id) &&
          // If you deleted it before (even if inboxFor is missing on legacy docs), don't reuse
          !(
            Array.isArray((conv as any).deletedForUsers) &&
            ((conv as any).deletedForUsers as string[]).includes(user.uid)
          ) &&
          (!conv.inboxFor || conv.inboxFor.includes(user.uid)), // not in inboxFor = you deleted it → don't reuse
      );

      if (existingConv) {
        if (
          existingConv.inboxFor &&
          !existingConv.inboxFor.includes(user.uid)
        ) {
          // Other user created this chat; add current user to inboxFor so they see it
          try {
            await updateDoc(doc(db, 'conversations', existingConv.id), {
              inboxFor: arrayUnion(user.uid),
              deletedForUsers: arrayRemove(user.uid),
              updatedAt: serverTimestamp(),
            });
          } catch (e) {
            console.error('Failed to add user to inboxFor', e);
          }
        }
        setActiveConversation(existingConv);
        setConversations((prev) => {
          const inList = prev.some((c) => c.id === existingConv.id);
          if (!inList) return [...prev, existingConv];
          return prev;
        });
        const url = new URL(window.location.href);
        url.searchParams.set('c', existingConv.id);
        router.push(url.pathname + url.search, { scroll: false });
        setIsNewChatDialogOpen(false);
        notifySuccess('Conversation already exists, switching to it.', 'Info');
        return existingConv;
      }

      // Create new conversation (WhatsApp-style: visible only to creator until the other user messages)
      try {
        const newConvData = {
          participants: [user.uid, selectedUser.id].sort(),
          type: 'individual' as const,
          inboxFor: [user.uid], // Only creator sees it until the other user sends a message
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null,
          participantDetails: {
            [user.uid]: {
              userName: user.displayName || user.email || 'Current User',
              profilePic: user.photoURL || null,
              email: user.email || null,
              userType: user.type,
              viewState: 'inbox',
            },
            [selectedUser.id]: {
              userName: selectedUser.displayName || 'User',
              profilePic: selectedUser.profilePic || null,
              email: selectedUser.email || null,
              userType: selectedUser.userType || 'freelancer',
              viewState: 'inbox',
            },
          },
        };

        const docRef = await addDoc(
          collection(db, 'conversations'),
          newConvData,
        );
        const newConversation = {
          ...newConvData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Conversation;

        setActiveConversation(newConversation);
        setConversations((prev) => [...prev, newConversation]);
        setIsNewChatDialogOpen(false);
        notifySuccess(
          `New chat started with ${selectedUser.displayName || 'User'}.`,
          'Success',
        );
        return newConversation;
      } catch (error) {
        console.error('Error creating conversation:', error);
        notifyError('Failed to start chat', 'Error');
        setIsNewChatDialogOpen(false);
        return null;
      }
    },
    [user, router],
  );

  // Handle URL parameters for opening specific chats or starting new ones
  useEffect(() => {
    // Wait until user is known, initial conversations have loaded, and we have search params
    if (!searchParams || !user?.uid || loading) return;

    const sessionKey = searchParams.get('session');
    if (!sessionKey) return;

    // Get the chat data from session storage
    const chatDataStr = sessionStorage.getItem(sessionKey);
    if (!chatDataStr) return;

    try {
      const chatData = JSON.parse(chatDataStr);

      // Clear the session data after reading it
      sessionStorage.removeItem(sessionKey);

      // Clear the URL parameter using Next.js router to maintain consistency
      const url = new URL(window.location.href);
      url.searchParams.delete('session');
      window.history.replaceState({}, '', url.toString());

      // Only proceed if it's a new chat request with valid data
      if (chatData.newChat && chatData.userId) {
        // Check if conversation already exists
        const existingConversation = conversations.find(
          (conv) =>
            conv.type === 'individual' &&
            conv.participants.includes(chatData.userId),
        );

        if (existingConversation) {
          setActiveConversation(existingConversation);
          notifySuccess(
            'Conversation already exists, switching to it.',
            'Info',
          );
        } else {
          // Create a new conversation with the provided user data
          handleStartNewChat({
            id: chatData.userId,
            displayName: chatData.userName || 'User',
            email: chatData.userEmail,
            profilePic: chatData.userPhoto,
            userType: chatData.userType || 'freelancer',
          });
        }
      }
    } catch (error) {
      console.error('Error processing chat session:', error);
    }
  }, [searchParams, user?.uid, loading, conversations, handleStartNewChat]);

  // Load all conversations
  useEffect(() => {
    if (!user?.uid) return;

    let isMounted = true;
    setLoading(true);

    const unsubscribe = subscribeToUserConversations(
      'conversations',
      user.uid,
      (data) => {
        if (!isMounted) return;
        const typedData = data as Conversation[];
        allConversationsRef.current = typedData; // Keep raw list for "existing conversation" check
        // WhatsApp-style: individual chats only visible to users in inboxFor; groups visible to all participants
        const visibleConversations = typedData
          .filter(
            (conv) =>
              conv.type !== 'individual' ||
              !conv.inboxFor ||
              conv.inboxFor.includes(user.uid),
          )
          // If user deleted this conversation, don't show it until a new message re-adds them
          .filter(
            (conv) =>
              !(
                Array.isArray((conv as any).deletedForUsers) &&
                ((conv as any).deletedForUsers as string[]).includes(user.uid)
              ),
          )
          .filter((conv) => !removedConversationIdsRef.current.has(conv.id)); // Never re-add conversations user deleted from sidebar (subscription can return stale data)
        setConversations(visibleConversations);

        const convId = searchParams?.get('c');
        if (convId) {
          const match =
            visibleConversations.find((c) => c.id === convId) || null;
          setActiveConversation(match);
        } else if (!isMobile) {
          // Desktop default behavior: auto-select first conversation.
          if (visibleConversations.length > 0 && !searchParams?.get('userId')) {
            setActiveConversation((prev) => prev ?? visibleConversations[0]);
          }
        } else {
          // Mobile behavior: show list first (no active chat) unless URL explicitly selects one.
          setActiveConversation(null);
        }

        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, searchParams, isMobile]);

  useEffect(() => {
    const convId = searchParams?.get('c');
    if (!conversations.length) return;

    if (convId) {
      const match = conversations.find((c) => c.id === convId) || null;
      setActiveConversation(match);
      return;
    }

    if (
      !isMobile &&
      !loading &&
      conversations.length > 0 &&
      !activeConversation
    ) {
      setActiveConversation(conversations[0]);
    }

    if (isMobile && !convId) {
      setActiveConversation(null);
    }
  }, [loading, conversations, activeConversation, searchParams, isMobile]);

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      setActiveConversation(conv);
      const url = new URL(window.location.href);
      url.searchParams.set('c', conv.id);
      router.push(url.pathname + url.search, { scroll: false });
    },
    [router],
  );

  let chatListComponentContent;
  if (loading) {
    chatListComponentContent = (
      <div className="space-y-3 p-3">
        <Skeleton className="h-12 w-full rounded-full" />

        <Skeleton className="h-10 w-full rounded-full" />

        <div className="mt-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 rounded-lg bg-[hsl(var(--card))]"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (conversations.length > 0) {
    chatListComponentContent = (
      <ChatList
        conversations={conversations}
        active={activeConversation}
        setConversation={handleSelectConversation}
        onOpenProfileSidebar={handleOpenProfileSidebar}
        onOpenNewChatDialog={() => setIsNewChatDialogOpen(true)}
        lastReadAt={lastReadAt}
      />
    );
  } else {
    chatListComponentContent = (
      <EmptyState
        icon={<MessageSquare className="w-10 h-10 text-muted-foreground/80" />}
        title="No conversations"
        description="New chats will appear here."
        actions={
          <Button onClick={() => setIsNewChatDialogOpen(true)} className="mt-2">
            Start a Chat
          </Button>
        }
        className="h-[80vh] border-0 bg-transparent py-8 m-2"
      />
    );
  }

  let chatWindowComponentContent;
  if (loading && !activeConversation) {
    chatWindowComponentContent = (
      <div className="col-span-3 flex flex-col h-full bg-[hsl(var(--card))] shadow-xl dark:shadow-lg">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {/* Incoming message skeleton */}
          <div className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-64 rounded-lg" />
            </div>
          </div>

          {/* Outgoing message skeleton */}
          <div className="flex justify-end">
            <div className="space-y-2 max-w-[80%]">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-20 w-72 rounded-lg bg-primary/20" />
            </div>
          </div>
        </div>

        {/* Input area skeleton */}
        <div className="p-3 border-t border-[hsl(var(--border))]">
          <div className="flex items-center space-x-2">
            <Skeleton className="flex-1 h-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    );
  } else if (activeConversation) {
    chatWindowComponentContent = (
      <CardsChat
        key={activeConversation.id}
        conversation={activeConversation}
        isChatExpanded={isChatExpanded}
        onToggleExpand={toggleChatExpanded}
        onOpenProfileSidebar={handleOpenProfileSidebar}
        onConversationUpdate={setActiveConversation}
        onBack={isMobile ? handleBackToList : undefined}
      />
    );
  } else if (!loading && conversations.length > 0) {
    chatWindowComponentContent = (
      <div className="flex flex-col h-full items-center justify-center text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm">Choose from the list to start chatting.</p>
      </div>
    );
  } else {
    chatWindowComponentContent = (
      <EmptyState
        icon={<MessageSquare className="w-10 h-10 text-muted-foreground/80" />}
        title="No conversations found"
        description="Start a new chat to get connected!"
        className="h-full bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none"
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={
          user.type === 'business'
            ? businessMenuItemsTop
            : freelancerMenuItemsTop
        }
        menuItemsBottom={
          user.type === 'business'
            ? businessMenuItemsBottom
            : freelancerMenuItemsBottom
        }
        active="Chats"
      />
      <div className="flex flex-col flex-1 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={
            user.type === 'business'
              ? businessMenuItemsTop
              : freelancerMenuItemsTop
          }
          menuItemsBottom={
            user.type === 'business'
              ? businessMenuItemsBottom
              : freelancerMenuItemsBottom
          }
          activeMenu="Chats"
          breadcrumbItems={[{ label: 'Chats', link: '/chat' }]}
          searchPlaceholder="Search chats..."
        />
        <main className="h-[96vh] overflow-hidden min-h-0">
          {isMobile ? (
            <div className="h-full">
              {activeConversation
                ? chatWindowComponentContent
                : chatListComponentContent}
            </div>
          ) : (
            <ChatLayout
              chatListComponent={chatListComponentContent}
              chatWindowComponent={chatWindowComponentContent}
              isChatAreaExpanded={isChatExpanded}
              onOpenProfileSidebar={handleOpenProfileSidebar}
            />
          )}
        </main>
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={handleCloseProfileSidebar}
          profileId={profileSidebarId}
          profileType={profileSidebarType}
          initialData={profileSidebarInitialData}
          onConversationUpdate={handleConversationUpdate}
          onConversationRemovedFromList={handleConversationRemovedFromList}
          conversationId={activeConversation?.id}
          conversation={
            profileSidebarId && profileSidebarType
              ? profileSidebarType === 'group'
                ? (conversations.find((c) => c.id === profileSidebarId) ?? null)
                : (conversations.find(
                    (c) =>
                      c.type === 'individual' &&
                      c.participants?.includes(profileSidebarId),
                  ) ?? null)
              : null
          }
        />
        {user && (
          <NewChatDialog
            isOpen={isNewChatDialogOpen}
            onClose={() => setIsNewChatDialogOpen(false)}
            onSelectUser={handleStartNewChat}
            onCreateGroup={handleCreateGroupChat}
            currentUserUid={user.uid}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
