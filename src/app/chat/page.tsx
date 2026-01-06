'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
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

  const toggleChatExpanded = () => {
    setIsChatExpanded((prev) => !prev);
  };

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

    const allParticipantIds = [user.uid, ...selectedUsers.map((u) => u.id)];
    const participantDetails = {
      [user.uid]: {
        userName: user.displayName || user.email,
        profilePic: user.photoURL || null,
        email: user.email || null,
        userType: user.type,
        viewState: 'inbox',
      },
    };
    selectedUsers.forEach((selected: any) => {
      participantDetails[selected.id] = {
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

      // Check if conversation already exists
      const existingConv = conversations.find(
        (conv) =>
          conv.type === 'individual' &&
          conv.participants.includes(selectedUser.id),
      );

      if (existingConv) {
        setActiveConversation(existingConv);
        setIsNewChatDialogOpen(false);
        notifySuccess('Conversation already exists, switching to it.', 'Info');
        return existingConv;
      }

      // Create new conversation
      try {
        const newConvData = {
          participants: [user.uid, selectedUser.id].sort(),
          type: 'individual' as const,
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
    [conversations, user],
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
        setConversations(typedData);

        const convId = searchParams?.get('c');
        if (convId) {
          const match = typedData.find((c) => c.id === convId) || null;
          setActiveConversation(match);
        } else if (!isMobile) {
          // Desktop default behavior: auto-select first conversation.
          if (typedData.length > 0 && !searchParams?.get('userId')) {
            setActiveConversation((prev) => prev ?? typedData[0]);
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
      if (isMobile) {
        const url = new URL(window.location.href);
        url.searchParams.set('c', conv.id);
        router.push(url.pathname + url.search, { scroll: false });
      }
    },
    [isMobile, router],
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
      />
    );
  } else {
    chatListComponentContent = (
      <EmptyState
        Icon={MessageSquare}
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
        Icon={MessageSquare}
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
      <div className="flex flex-col flex-1 sm:py-0 sm:pl-14 overflow-hidden">
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
        <main className="h-[96vh]">
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
          onConversationUpdate={setActiveConversation}
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
