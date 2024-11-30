'use client';

import { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { LoaderCircle, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';

import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { CardsChat } from '@/components/shared/chat';
import Breadcrumb from '@/components/shared/breadcrumbList';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Search } from '@/components/search';
import { ChatList } from '@/components/shared/chatList';
import { subscribeToFirestoreCollection } from '@/utils/common/firestoreUtils';
import { RootState } from '@/lib/store';

// Define the Conversation interface to match the expected shape
interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  timestamp?: string;
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
      unsubscribe = await subscribeToFirestoreCollection(
        'conversations',
        (data) => {
          // Explicitly cast data as Conversation[]
          const filteredConversations = (data as Conversation[]).filter(
            (conversation) => conversation.participants.includes(user.uid),
          );
          setConversations(filteredConversations);
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
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Chats"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Chats"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Chats', link: '/dashboard/chats' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
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
