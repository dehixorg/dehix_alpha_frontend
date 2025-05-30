'use client';

import { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { LoaderCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

import Header from '@/components/header/header'; // Adjust the import path as necessary
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
import ChatLayout from '@/components/shared/ChatLayout'; // Added
import { ChatList } from '@/components/shared/chatList'; // Added
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


  // Prepare components for ChatLayout
  const chatListComponent = loading ? (
    <div className="flex justify-center items-center h-full">
      <LoaderCircle className="h-6 w-6 text-primary animate-spin" />
    </div>
  ) : conversations.length > 0 ? (
    <ChatList
      conversations={conversations}
      active={activeConversation!} // Non-null assertion as it's set if conversations.length > 0
      setConversation={setActiveConversation}
    />
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
      <MessageSquare className="w-10 h-10 mb-2" />
      <p className="text-lg font-medium">No conversations</p>
      <p className="text-sm">New chats will appear here.</p>
    </div>
  );

  const chatWindowComponent = loading && !activeConversation ? (
    <div className="col-span-3 flex justify-center items-center p-5 h-full"> {/* Ensure full height */}
      <LoaderCircle className="h-6 w-6 text-primary animate-spin" />
    </div>
  ) : activeConversation ? (
    <CardsChat
      conversation={activeConversation}
      isChatExpanded={isChatExpanded} // Pass state
      onToggleExpand={toggleChatExpanded} // Pass toggle function
    />
  ) : conversations.length > 0 ? ( // If there are chats, but none is active
    <div className="col-span-3 flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
      <MessageSquare className="w-10 h-10 mb-2" />
      <p className="text-lg font-medium">Select a conversation</p>
      <p className="text-sm">Choose a conversation from the list to start chatting.</p>
    </div>
  ) : ( // No conversations at all
    <div className="col-span-3 flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
      <MessageSquare className="w-10 h-10 mb-2" />
      <p className="text-lg font-medium">No conversations found</p>
      <p className="text-sm">Start a new chat or wait for others to connect!</p>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={
          user.type === 'business' ? businessMenuItemsTop : chatsMenu
        }
        menuItemsBottom={
          user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
        }
        active="Chats"
        conversations={conversations}
        setActiveConversation={setActiveConversation}
        activeConversation={activeConversation}
      />
      <div className="flex flex-col mb-8 sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={
            user.type === 'business' ? businessMenuItemsTop : chatsMenu
          }
          menuItemsBottom={
            user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
          }
          activeMenu="Chats"
          // Pass conversation related props if Header still needs to display them for mobile or other specific views
          conversations={conversations}
          setActiveConversation={setActiveConversation}
          activeConversation={activeConversation}
          breadcrumbItems={[
            // Example breadcrumb, adjust as per actual app structure
            { label: user.type === 'business' ? 'Business' : 'Freelancer', link: '/dashboard' },
            { label: 'Chats', link: '/chat' },
          ]}
          searchPlaceholder="Search chats..." // Or a more general search placeholder
        />
        {/* Main content area where ChatLayout will be used */}
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-4"> {/* Adjusted classes */}
          <ChatLayout
            chatListComponent={chatListComponent}
            chatWindowComponent={chatWindowComponent}
            isChatAreaExpanded={isChatExpanded} // Pass state to ChatLayout
          />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
