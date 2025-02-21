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
import { ChatList } from '@/components/shared/chatList';
import { subscribeToUserConversations } from '@/utils/common/firestoreUtils';
import { RootState } from '@/lib/store';
import {
  menuItemsBottom,
  menuItemsTop,
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
  const [activeConversation, setActiveConversation] = useState<Conversation>(
    conversations[0],
  );
  const [loading, setLoading] = useState(true);

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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={
          user.type === 'business' ? businessMenuItemsTop : menuItemsTop
        }
        menuItemsBottom={
          user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
        }
        active="Chats"
      />
      <div className="flex flex-col mb-8 sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={
            user.type === 'business' ? businessMenuItemsTop : menuItemsTop
          }
          menuItemsBottom={
            user.type === 'business' ? businessMenuItemsBottom : menuItemsBottom
          }
          activeMenu="Chats"
          breadcrumbItems={[
            {
              label: (user.type ?? '').replace(/\b\w/g, (char: string) =>
                char.toUpperCase(),
              ),

              link: '#',
            },
            { label: 'Chats', link: '/dashboard/chats' },
          ]}
          searchPlaceholder="Search..."
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-4 lg:grid-cols-3 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center p-5">
              <LoaderCircle className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : conversations.length > 0 ? (
            <>
              <ChatList
                conversations={conversations}
                active={activeConversation}
                setConversation={setActiveConversation}
              />
              <CardsChat conversation={activeConversation} />
            </>
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center h-full px-4 py-16 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium">No conversations found</p>
              <p className="text-sm">
                Start a new chat or wait for others to connect!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
