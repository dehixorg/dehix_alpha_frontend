'use client';

import { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { LoaderCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

import Header from '@/components/header/header'; // Adjust the import path as necessary
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
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
import ChatLayout from '@/components/shared/ChatLayout';
import { ChatList } from '@/components/shared/chatList';

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
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "unread">("home");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchConversations = async () => {
      setLoading(true);
      unsubscribe = await subscribeToUserConversations(
        'conversations',
        user.uid,
        (data) => {
          setConversations(data as Conversation[]);
          setLoading(false);
        },
      );
    };

    fetchConversations();

    // Cleanup on component unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user.uid]);

  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 overflow-hidden">
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
      <Header
        menuItemsTop={
          user.type === 'business' ? businessMenuItemsTop : chatsMenu
        }
        menuItemsBottom={
          user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
        }
        activeMenu="Chats"
        conversations={conversations}
        setActiveConversation={setActiveConversation}
        activeConversation={activeConversation}
        breadcrumbItems={[
          { label: 'Freelancer', link: '/dashboard/freelancer' },
          { label: 'Chats', link: '/dashboard/chats' },
        ]}
        searchPlaceholder="Search..."
      />
      <ChatLayout
        sidebar={
          <ChatList
            conversations={conversations}
            active={activeConversation}
            setConversation={setActiveConversation}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        }
        main={
          loading ? (
            <div className="flex flex-1 justify-center items-center">
              <LoaderCircle className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : activeConversation ? (
            <CardsChat
              conversation={activeConversation}
              conversations={conversations}
              setActiveConversation={setActiveConversation}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium">No conversation selected</p>
              <p className="text-sm">
                Select a chat from the sidebar to start messaging.
              </p>
            </div>
          )
        }
      />
    </div>
  );
};

export default HomePage;
