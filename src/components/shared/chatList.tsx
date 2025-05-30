//chatlist.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare, Search } from 'lucide-react'; // Import icons from lucide-react
import { Input } from '@/components/ui/input'; // Import Input for search

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  timestamp?: string;
  lastMessage?: { content?: string; senderId?: string }; // Added lastMessage structure
  labels?: string[];
}

interface ChatListProps {
  conversations: Conversation[];
  active: Conversation | null; // active can be null
  setConversation: (activeConversation: Conversation) => void;
}

export function ChatList({
  conversations,
  active,
  setConversation,
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  // Function to update the last updated time for each conversation
  const updateLastUpdated = useCallback(() => {
    const updatedTimes: Record<string, string> = {};
    conversations.forEach((conversation) => {
      if (conversation.timestamp) {
        try {
          updatedTimes[conversation.id] =
            formatDistanceToNow(new Date(conversation.timestamp)) + ' ago';
        } catch (e) {
          // console.error("Error formatting date for conversation:", conversation.id, conversation.timestamp, e);
          updatedTimes[conversation.id] = 'Invalid date';
        }
      }
    });
    setLastUpdatedTimes(updatedTimes);
  }, [conversations]);

  useEffect(() => {
    updateLastUpdated();
    const intervalId = setInterval(updateLastUpdated, 60000);
    return () => clearInterval(intervalId);
  }, [updateLastUpdated]);

  const filteredConversations = conversations.filter(conversation => {
    const name = conversation.project_name || 'Unnamed Project';
    const lastMessageContent = conversation.lastMessage?.content || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Search Bar Area */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <Input
            placeholder="Search or start new chat"
            aria-label="Search conversations"
            className="pl-10 w-full rounded-full bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-grow"> {/* ScrollArea will take remaining height */}
        <div className="p-2 space-y-1" role="listbox" aria-label="Conversations list"> {/* Container for conversation items */}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';
              const isActive = active?.id === conversation.id;
              const lastMessageText = conversation.lastMessage?.content || 'No messages yet';

              return (
                <div
                  key={conversation.id}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={0} // Make it focusable
                  className={cn(
                    'flex items-start p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                    isActive && 'bg-blue-100 dark:bg-blue-700/50', // Adjusted active style
                  )}
                  onClick={() => setConversation(conversation)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setConversation(conversation); }} // Allow selection with Enter/Space
                >
                  <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                    <AvatarImage
                      src={`https://api.adorable.io/avatars/285/${conversation.participants[0]}.png`} // Placeholder
                      alt={conversation.participants[0]}
                    />
                    <AvatarFallback>
                      {conversation.participants[0]?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <p className={cn("text-sm font-medium truncate", isActive ? "text-blue-800 dark:text-blue-100" : "text-gray-900 dark:text-gray-100")}>
                        {conversation.project_name || 'Unnamed Project'}
                      </p>
                      <p className={cn("text-xs flex-shrink-0 ml-2", isActive ? "text-blue-600 dark:text-blue-200" : "text-gray-500 dark:text-gray-400")}>
                        {lastUpdated}
                      </p>
                    </div>
                    <p className={cn("text-xs truncate", isActive ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-400")}>
                      {lastMessageText.length > 40 ? lastMessageText.substring(0, 40) + '...' : lastMessageText}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No matching conversations' : 'No conversations found'}
              </p>
              {!searchTerm && (
                 <p className="text-sm">
                   Start a new chat or wait for others to connect!
                 </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
