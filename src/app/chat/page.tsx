'use client';

import { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { LoaderCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils'; // Added cn

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
import ChatLayout from '@/components/shared/ChatLayout';
import { ChatList } from '@/components/shared/chatList';
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
interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  timestamp?: string;
  lastMessage?: any;
}

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // Initialize activeConversation with null
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false); // State for chat expansion

  const toggleChatExpanded = () => setIsChatExpanded(prev => !prev); // Function to toggle expansion

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
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

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
        conversation={activeConversation}
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


  // Manually re-typed return statement and component closing
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
      <div className="flex flex-col flex-1 sm:pl-14 overflow-hidden"> {/* Added flex-1 and overflow-hidden */}
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
        <main className="flex-1 overflow-hidden p-1 sm:p-2 md:p-4"> {/* Added overflow-hidden and adjusted padding */}
          <ChatLayout
            chatListComponent={chatListComponentForLayout} 
            chatWindowComponent={chatWindowComponentContent}
          />
        </main>
      </div>
    </div>
  );
};

export default HomePage;


