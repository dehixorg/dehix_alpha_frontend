'use client';

import { useEffect, useState, useRef } from 'react'; // Import useRef
import { DocumentData } from 'firebase/firestore';
import { LoaderCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils'; // Added cn

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
import ChatLayout from '@/components/shared/ChatLayout';
import { ChatList } from '@/components/shared/chatList';
import ProfileSidebar from '@/components/shared/ProfileSidebar'; // Import ProfileSidebar
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

// Define the Conversation interface to match the expected shape
// This should ideally be a shared type with chatList.tsx
interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string; // Used for groups in chatList, maps to groupName or similar
  type?: 'individual' | 'group';
  timestamp?: string; // Represents last activity
  lastMessage?: { content?: string; senderId?: string; timestamp?: string };
  participantDetails?: { [uid: string]: { userName: string; profilePic?: string; email?: string } };
  groupName?: string; // Actual group name
  description?: string; // Group description
  createdBy?: string;
  admins?: string[];
  createdAt?: string; // Original creation timestamp
  updatedAt?: string; // Last update to conversation metadata or message
  // labels?: string[]; // Not currently used in page.tsx's direct logic for activeConversation
}

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Initialize activeConversation with null
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const activeConversationRef = useRef<Conversation | null>(null); // Ref to track active conversation
  const [loading, setLoading] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // State for ProfileSidebar
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [profileSidebarId, setProfileSidebarId] = useState<string | null>(null);
  const [profileSidebarType, setProfileSidebarType] = useState<'user' | 'group' | null>(null);

  const handleOpenProfileSidebar = (id: string, type: 'user' | 'group') => {
    setProfileSidebarId(id);
    setProfileSidebarType(type);
    setIsProfileSidebarOpen(true);
  };

  const handleCloseProfileSidebar = () => {
    setIsProfileSidebarOpen(false);
    // Optionally clear id and type:
    // setProfileSidebarId(null);
    // setProfileSidebarType(null);
  };

  const toggleChatExpanded = () => {
    console.log("[page.tsx] toggleChatExpanded called. Current isChatExpanded:", isChatExpanded);
    setIsChatExpanded(prev => {
      console.log("[page.tsx] setIsChatExpanded. New value will be:", !prev);
      return !prev;
    });
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
  }, [user.uid]); // activeConversation removed from deps to avoid re-fetching when it changes

  // Effect to set active conversation when conversations load or change, if not already set
  useEffect(() => {
    activeConversationRef.current = activeConversation; // Keep ref updated
  }, [activeConversation]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationRef.current) {
      // Only set if there's truly no active one (ref helps avoid race conditions with direct sets)
      // And ensure conversations[0] is a valid object with an id
      if (conversations[0] && conversations[0].id) {
         setActiveConversation(conversations[0]);
      }
    }
  }, [conversations]); // Intentionally only depends on conversations for the default setting logic

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
      />
    );
  } else {
    chatListComponentContent = (
      <div className="flex flex-col items-center justify-center h-full text-center text-[hsl(var(--muted-foreground))] p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">No conversations</p>
        <p className="text-sm">New chats will appear here.</p>
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
        <p className="text-sm">Choose a conversation from the list to start chatting.</p>
      </div>
    );
  } else { // No conversations and not loading
    chatWindowComponentContent = (
      <div className="flex flex-col h-full items-center justify-center text-center text-[hsl(var(--muted-foreground))] bg-[hsl(var(--card))] rounded-lg shadow-sm dark:shadow-none p-4">
        <MessageSquare className="w-10 h-10 mb-2" />
        <p className="text-lg font-medium">No conversations found</p>
        <p className="text-sm">Start a new chat or wait for others to connect!</p>
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
            { label: user.type === 'business' ? 'Business' : 'Freelancer', link: '/dashboard' },
            { label: 'Chats', link: '/chat' },
          ]}
          searchPlaceholder="Search chats..."
        />
        {/* Main content area where ChatLayout will be used, ensure it can fill height */}
        <main className="h-[90vh] border-4 border-red-500 p-1 sm:p-2 md:p-4"> {/* Applied fixed height and debug border */}
          <ChatLayout
            chatListComponent={chatListComponentForLayout}
            chatWindowComponent={chatWindowComponentContent}
            isChatAreaExpanded={isChatExpanded}
            // Pass onOpenProfileSidebar through ChatLayout if ChatLayout needs to pass it to its children
            // This specific prop name is for ChatLayout to know what to pass down.
            // We'll need to adjust ChatLayoutProps and how it passes this down.
             onOpenProfileSidebar={handleOpenProfileSidebar}
          />
        </main>
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={handleCloseProfileSidebar}
          profileId={profileSidebarId}
          profileType={profileSidebarType}
        />
      </div>
    </div>
  );
};

export default HomePage;
