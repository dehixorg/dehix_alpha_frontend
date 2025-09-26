'use client';

import { useEffect, useState } from 'react';
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

type UserType = 'freelancer' | 'business' | undefined;

// Helper function to safely get user type
const getUserType = (type: string | undefined): UserType => {
  return type === 'freelancer' || type === 'business' ? type : undefined;
};
// Toast wrapper to keep existing call sites working without edits
const toast = ({
  variant,
  title,
  description,
}: {
  variant?: 'destructive';
  title?: string;
  description: string;
}) => {
  if (variant === 'destructive') {
    notifyError(description, title || 'Error');
  } else {
    notifySuccess(description, title);
  }
};
// Helper function to check if two arrays contain the same elements, regardless of order
const arraysHaveSameElements = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

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

  const handleStartNewChat = async (selectedUser: NewChatUser) => {
    if (!user || !user.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to start a new chat.',
      });
      return;
    }

    const existingConversation = conversations.find(
      (conv) =>
        conv.type === 'individual' &&
        arraysHaveSameElements(conv.participants, [user.uid, selectedUser.id]),
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
      setIsNewChatDialogOpen(false);
      toast({
        title: 'Info',
        description: 'Conversation already exists, switching to it.',
      });
      return;
    }

    const newConversationData = {
      participants: [user.uid, selectedUser.id].sort(),
      type: 'individual' as const,
      description: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      participantDetails: {
        [user.uid]: {
          userName: user.displayName || user.email || 'Current User',
          profilePic: user.photoURL || null,
          email: user.email || null,
          userType: user.type,
        },
        [selectedUser.id]: {
          userName: selectedUser.displayName,
          profilePic: selectedUser.profilePic || null,
          email: selectedUser.email || null,
          userType: selectedUser.userType,
        },
      },
    };

    try {
      const docRef = await addDoc(
        collection(db, 'conversations'),
        newConversationData,
      );
      toast({
        title: 'Success',
        description: `New chat started with ${selectedUser.displayName}.`,
      });

      const conversationDataForState: Conversation = {
        id: docRef.id,
        participants: newConversationData.participants,
        type: 'individual',
        description: undefined,
        lastMessage: null,
        participantDetails: {
          [user.uid]: {
            userName: user.displayName || user.email || 'Current User',
            profilePic: user.photoURL || undefined,
            email: user.email || undefined,
            userType: getUserType(user.type),
          },
          [selectedUser.id]: {
            userName: selectedUser.displayName,
            profilePic: selectedUser.profilePic || undefined,
            email: selectedUser.email || undefined,
            userType: getUserType(selectedUser.userType),
          },
        } as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveConversation(conversationDataForState);
      setIsNewChatDialogOpen(false);
    } catch (error) {
      console.error('Error starting new chat: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start new chat.',
      });
      setIsNewChatDialogOpen(false);
    }
  };

  async function handleCreateGroupChat(
    selectedUsers: NewChatUser[],
    groupName: string,
    description: string,
  ) {
    if (!user || !user.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in.',
      });
      return;
    }
    if (!groupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name cannot be empty.',
      });
      return;
    }
    if (selectedUsers.length < 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must select at least one other member.',
      });
      return;
    }

    const allParticipantIds = [user.uid, ...selectedUsers.map((u) => u.id)];
    const participantDetails = {
      [user.uid]: {
        userName: user.displayName || user.email,
        profilePic: user.photoURL || null,
        email: user.email || null,
        userType: user.type,
      },
    };
    selectedUsers.forEach((selected: any) => {
      participantDetails[selected.id] = {
        userName: selected.displayName,
        profilePic: selected.profilePic || null,
        email: selected.email || null,
        userType: selected.userType,
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
      toast({ title: 'Success', description: `Group "${groupName}" created.` });

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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create group.',
      });
    }
  }

  useEffect(() => {
    if (!user.uid) return;

    let isMounted = true;
    setLoading(true);
    const unsubscribe = subscribeToUserConversations(
      'conversations',
      user.uid,
      (data) => {
        if (!isMounted) return;
        const typedData = data as Conversation[];
        setConversations(typedData);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user.uid]);

  useEffect(() => {
    if (!loading && conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [loading, conversations, activeConversation]);

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
        setConversation={setActiveConversation}
        onOpenProfileSidebar={handleOpenProfileSidebar}
        onOpenNewChatDialog={() => setIsNewChatDialogOpen(true)}
      />
    );
  } else {
    chatListComponentContent = (
      <div className="flex flex-col items-center justify-center h-full text-center text-[hsl(var(--muted-foreground))] p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">No conversations</p>
        <p className="text-sm">New chats will appear here.</p>
        <Button onClick={() => setIsNewChatDialogOpen(true)} className="mt-4">
          Start a Chat
        </Button>
      </div>
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
      <div className="flex flex-col h-full items-center justify-center text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">No conversations found</p>
        <p className="text-sm">Start a new chat to get connected!</p>
      </div>
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
          breadcrumbItems={[
            {
              label: user.type === 'business' ? 'Business' : 'Freelancer',
              link: '/dashboard',
            },
            { label: 'Chats', link: '/chat' },
          ]}
          searchPlaceholder="Search chats..."
        />
        <main className="h-[93vh]">
          <ChatLayout
            chatListComponent={chatListComponentContent}
            chatWindowComponent={chatWindowComponentContent}
            isChatAreaExpanded={isChatExpanded}
            onOpenProfileSidebar={handleOpenProfileSidebar}
          />
        </main>
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={handleCloseProfileSidebar}
          profileId={profileSidebarId}
          profileType={profileSidebarType}
          initialData={profileSidebarInitialData}
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
