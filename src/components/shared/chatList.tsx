//chatlist.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare, Search, Home, Mail } from 'lucide-react'; // Import icons

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '@/components/ui/input'; // Import Input
import { Button } from '@/components/ui/button'; // Import Button

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names
// Remove Table imports as we'll use div-based layout
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'; // Importing Table components
// Remove Card import as the layout component handles the card styling
// import { Card } from '@/components/ui/card'; // Importing Card component

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  timestamp?: string;
  labels?: string[]; // Assuming you have labels field in your conversation
  lastMessage?: { content?: string }; // Added lastMessage type
}

interface ChatListProps {
  conversations: Conversation[];
  active: Conversation | null;
  setConversation: (activeConversation: Conversation) => void;
  // Add props for search and tabs from the new Sidebar component
  activeTab: "home" | "unread";
  onTabChange: (tab: "home" | "unread") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Helper to ensure avatar src is a valid URL
function getValidAvatarSrc(src: string | undefined) {
  if (!src) return '/default-avatar.png'; // Provide a default image path
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return '/default-avatar.png'; // Provide a default image path
}

// Function to format time (copied from the new Sidebar component)
const formatTime = (time: string) => {
  const now = new Date();
  const messageTime = new Date(time);
  const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return `${Math.floor(diffInHours * 60)}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else {
    return messageTime.toLocaleDateString();
  }
};

export function ChatList({
  conversations,
  active,
  setConversation,
  activeTab, // Destructure new props
  onTabChange,
  searchQuery,
  onSearchChange,
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});

  // Function to update the last updated time for each conversation
  const updateLastUpdated = useCallback(() => {
    const updatedTimes: Record<string, string> = {};

    conversations.forEach((conversation) => {
      if (conversation.timestamp) {
        updatedTimes[conversation.id] =
          formatDistanceToNow(new Date(conversation.timestamp)) + ' ago';
      }
    });

    setLastUpdatedTimes(updatedTimes);
  }, [conversations]);

  // Update lastUpdated every minute
  useEffect(() => {
    updateLastUpdated();
    const intervalId = setInterval(updateLastUpdated, 60000); // Update every minute

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [updateLastUpdated]);

  // Filter conversations based on the search query
  const filteredConversations = conversations.filter(chat => 
    chat.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // Removed Card wrapper - ChatLayout provides the main container styling
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search in chat"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={() => onTabChange("home")}
          className={cn(
            "flex-1 rounded-none border-b-2 border-transparent transition-colors",
            activeTab === "home"
              ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Button
          variant="ghost"
          onClick={() => onTabChange("unread")}
          className={cn(
            "flex-1 rounded-none border-b-2 border-transparent transition-colors",
            activeTab === "unread"
              ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
        >
          <Mail className="w-4 h-4 mr-2" />
          Unread
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredConversations && filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => {
            const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';
            const isActive = active?.id === conversation.id;

            return (
              <div
                key={conversation.id}
                onClick={() => setConversation(conversation)}
                className={cn(
                  "flex items-center p-4 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 last:border-b-0",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-800"
                    : "",
                )}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage
                    src={getValidAvatarSrc(`https://api.adorable.io/avatars/285/${conversation.participants[0]}.png`)}
                    alt={conversation.participants[0]}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                    {conversation.participants[0]
                      ?.charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conversation.project_name || 'Unnamed Project'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {lastUpdated}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {conversation.lastMessage?.content || 'No messages'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium">No conversations found</p>
              <p className="text-sm">
                Start a new chat or wait for others to connect!
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Keep the badge function if still in use elsewhere, otherwise remove
// function getBadgeVariantFromLabel(
//   label: string,
// ): ComponentProps<typeof Badge>['variant'] {
//   if (['a'].includes(label.toLowerCase())) {
//     return 'default';
//   }

//   if (['Project'].includes(label.toLowerCase())) {
//     return 'outline';
//   }

//   return 'secondary';
// }
