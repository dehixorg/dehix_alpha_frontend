'use client';

import { useEffect, useState, useRef } from 'react'; // Import useRef
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDoc,
} from 'firebase/firestore'; // Added addDoc, collection, doc, getDoc
import { LoaderCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils'; // Added cn
import { Button } from '@/components/ui/button';
import { db } from '@/config/firebaseConfig'; // Added db
import { toast } from '@/hooks/use-toast'; // Added toast
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
import ChatLayout from '@/components/shared/ChatLayout';
import { ChatList, type Conversation } from '@/components/shared/chatList';
import ProfileSidebar from '@/components/shared/ProfileSidebar'; // Import ProfileSidebar
import { NewChatDialog } from '@/components/shared/NewChatDialog'; // Import NewChatDialog
import type { CombinedUser as NewChatUser } from '@/hooks/useAllUsers';
// Card might not be needed if CardsChat itself is the shell or if we use generic divs for loading shell.
// For now, let's assume CardsChat component or a simple div can act as shell for chat window.
import {
  menuItemsBottom as businessMenuItemsBottom,
  menuItemsTop as businessMenuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { subscribeToUserConversations } from '@/utils/common/firestoreUtils';
import { RootState } from '@/lib/store';
import {
  menuItemsBottom,
  menuItemsTop,
  chatsMenu,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

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
  // Initialize activeConversation with null
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  // const activeConversationRef = useRef<Conversation | null>(null); // Ref to track active conversation - REMOVED
  const [loading, setLoading] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // State for ProfileSidebar
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [profileSidebarId, setProfileSidebarId] = useState<string | null>(null);
  const [profileSidebarType, setProfileSidebarType] = useState<
    'user' | 'group' | null
  >(null);
  const [profileSidebarInitialData, setProfileSidebarInitialData] = useState<
    { userName?: string; email?: string; profilePic?: string } | undefined
  >(undefined);

  // State for NewChatDialog
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  // Updated to accept initialDetails as third argument
  const handleOpenProfileSidebar = (
    id: string,
    type: 'user' | 'group',
    initialDetails?: { userName?: string; email?: string; profilePic?: string },
  ) => {
    setProfileSidebarId(id);
    setProfileSidebarType(type);
    setProfileSidebarInitialData(initialDetails);
    setIsProfileSidebarOpen(true);
  };

  const handleCloseProfileSidebar = () => {
    setIsProfileSidebarOpen(false);
    // Optionally clear id and type:
    // setProfileSidebarId(null);
    // setProfileSidebarType(null);
    setProfileSidebarInitialData(undefined);
  };

  const toggleChatExpanded = () => {
    console.log(
      '[page.tsx] toggleChatExpanded called. Current isChatExpanded:',
      isChatExpanded,
    );
    setIsChatExpanded((prev) => {
      console.log('[page.tsx] setIsChatExpanded. New value will be:', !prev);
      return !prev;
    });
  };

  const handleStartNewChat = async (selectedUser: NewChatUser) => {
    // This logic is now duplicated from chatList.tsx and should be unified
    // For now, let's keep it here to make the dialog functional from the page level.
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
        conv.participants.length === 2 &&
        // Use arraysHaveSameElements to ensure participant check is order-agnostic
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

    // Create new conversation
    const now = new Date().toISOString();
    // Ensure newConversationData is typed correctly, using Partial<Conversation> or a more specific type
    const newConversationData: Partial<Conversation> = {
      participants: [user.uid, selectedUser.id].sort(),
      type: 'individual',
      createdAt: now,
      updatedAt: now,
      lastMessage: null, // No messages yet
      participantDetails: {
        [user.uid]: {
          userName: user.displayName || user.email || 'Current User',
          profilePic: user.photoURL || undefined,
          email: user.email || undefined,
          userType: user.type, // Assuming user from Redux has 'type'
        },
        [selectedUser.id]: {
          userName: selectedUser.displayName,
          profilePic: selectedUser.profilePic,
          email: selectedUser.email,
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

      const newDocSnap = await getDoc(doc(db, 'conversations', docRef.id));
      if (newDocSnap.exists()) {
        const conversationDataForState = {
          id: newDocSnap.id,
          ...newDocSnap.data(),
        } as Conversation;
        setActiveConversation(conversationDataForState);
      } else {
        console.warn(
          'Newly created conversation document not found immediately after creation.',
        );
        // Potentially trigger a refresh of conversations list if direct setting fails
      }
      setIsNewChatDialogOpen(false); // Close dialog after successful creation
    } catch (error) {
      console.error('Error starting new chat: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start new chat.',
      });
      setIsNewChatDialogOpen(false); // Ensure dialog closes even on error
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchConversations = async () => {
      setLoading(true);
      unsubscribe = await subscribeToUserConversations(
        'conversations',
        user.uid,
        (data) => {
          const typedData = data as Conversation[];
          setConversations(typedData);
          // Set active conversation here if not already set and data is available
          if (typedData.length > 0 && !activeConversation) {
            setActiveConversation(typedData[0]);
          }
          setLoading(false);
        },
      );
    };

    // Ensure user.uid is available before fetching
    if (user.uid) {
      fetchConversations();
    }

    // Cleanup on component unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user.uid]);

  // Effect to set a default active conversation if none is set and conversations are available
  useEffect(() => {
    // Only set a default active conversation if:
    // 1. There are conversations available.
    // 2. The `activeConversation` state is currently null (or undefined).
    if (
      conversations.length > 0 &&
      !activeConversation &&
      conversations[0]?.id
    ) {
      console.log(
        '[Page Effect - Default Setter] Setting default active conversation:',
        conversations[0],
      );
      setActiveConversation(conversations[0]);
    } else if (activeConversation) {
      console.log(
        '[Page Effect - Default Setter] Active conversation IS SET, not changing default. Active ID:',
        activeConversation.id,
      );
    } else {
      console.log(
        '[Page Effect - Default Setter] No conversations or no active conversation to set, or conversations[0] is invalid.',
      );
    }
  }, [conversations, activeConversation]); // Now depends on both

  // Determine content for chat list
  let chatListComponentContent;
  if (loading) {
    chatListComponentContent = (
      <div className="flex justify-center items-center h-full">
        <LoaderCircle className="h-6 w-6 text-[hsl(var(--primary))] animate-spin" />
      </div>
    );
  } else if (conversations.length > 0) {
    chatListComponentContent = (
      <ChatList
        conversations={conversations}
        active={activeConversation}
        setConversation={setActiveConversation}
        onOpenProfileSidebar={handleOpenProfileSidebar} // Pass handler
        onOpenNewChatDialog={() => setIsNewChatDialogOpen(true)} // Pass handler
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

  // Content for the chat list component (sidebar)
  // This is passed directly to ChatLayout, which handles the <aside> shell.
  const chatListComponentForLayout = chatListComponentContent;

  // Determine content for chat window
  let chatWindowComponentContent;
  if (loading && !activeConversation) {
    // This is the main loader for the chat window area, rendered in a Card-like shell
    chatWindowComponentContent = (
      <div className="flex flex-col h-full items-center justify-center bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none">
        <LoaderCircle className="h-8 w-8 text-[hsl(var(--primary))] animate-spin" />
      </div>
    );
  } else if (activeConversation) {
    chatWindowComponentContent = (
      <CardsChat
        key={activeConversation.id} // Add key prop here
        conversation={activeConversation}
        isChatExpanded={isChatExpanded}
        onToggleExpand={toggleChatExpanded}
        onOpenProfileSidebar={handleOpenProfileSidebar} // Pass handler
      />
    );
  } else if (conversations.length > 0) {
    chatWindowComponentContent = (
      <div className="flex flex-col h-full items-center justify-center text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="text-sm">
          Choose a conversation from the list to start chatting.
        </p>
      </div>
    );
  } else {
    // No conversations and not loading
    chatWindowComponentContent = (
      <div className="flex flex-col h-full items-center justify-center text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">No conversations found</p>
        <p className="text-sm">
          Start a new chat or wait for others to connect!
        </p>
      </div>
    );
  }

  // console.log("page.tsx: Rendering, isChatExpanded:", isChatExpanded);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[hsl(var(--muted)_/_0.4)]">
      <SidebarMenu
        menuItemsTop={
          user.type === 'business' ? businessMenuItemsTop : chatsMenu
        }
        menuItemsBottom={
          user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
        }
        active="Chats"
        // Props below might be redundant if SidebarMenu doesn't use them or if ChatList handles its own data
        // conversations={conversations}
        // setActiveConversation={setActiveConversation}
        // activeConversation={activeConversation}
      />
      {/* Ensure this div allows content to take full height */}
      <div className="flex flex-col flex-1 sm:pl-14 overflow-hidden">
        <Header
          menuItemsTop={
            user.type === 'business' ? businessMenuItemsTop : chatsMenu
          }
          menuItemsBottom={
            user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
          }
          activeMenu="Chats"
          // Props below might be redundant if Header doesn't use them
          // conversations={conversations}
          // setActiveConversation={setActiveConversation}
          // activeConversation={activeConversation}
          breadcrumbItems={[
            {
              label: user.type === 'business' ? 'Business' : 'Freelancer',
              link: '/dashboard',
            },
            { label: 'Chats', link: '/chat' },
          ]}
          searchPlaceholder="Search chats..."
        />
        {/* Main content area where ChatLayout will be used, ensure it can fill height */}
        <main className="h-[90vh] p-1 sm:p-2 md:p-4">
          <ChatLayout
            chatListComponent={chatListComponentForLayout}
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
            currentUserUid={user.uid}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;