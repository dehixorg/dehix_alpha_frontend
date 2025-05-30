//chatlist.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare } from 'lucide-react'; // Import an icon from lucide-react

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'; // Importing Table components
import { Card } from '@/components/ui/card'; // Importing Card component

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  timestamp?: string;
  labels?: string[]; // Assuming you have labels field in your conversation
}

interface ChatListProps {
  conversations: Conversation[];
  active: Conversation;
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

  return (
    <Card className="p-4">
      <ScrollArea className="h-[85vh]">
        <Table className="w-full border-separate border-spacing-y-2">
          <TableBody>
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';

                return (
                  <TableRow
                    key={conversation.id}
                    className="cursor-pointer border-none hover:bg-transparent" // Remove default hover/bg classes from <tr>
                    onClick={() => setConversation(conversation)}
                  >
                    <TableCell colSpan={2} className="p-0 my-2">
                      <div
                        className={cn(
                          'flex items-center justify-between p-4 rounded-md hover:bg-muted', // Apply rounded corners and hover effect
                          active?.id === conversation.id && 'bg-muted',
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={`https://api.adorable.io/avatars/285/${conversation.participants[0]}.png`}
                              alt={conversation.participants[0]}
                            />
                            <AvatarFallback>
                              {conversation.participants[0]
                                ?.charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="font-medium">
                              {conversation.project_name || 'Unnamed Project'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {conversation.lastMessage?.content?.length > 50
                                ? conversation.lastMessage.content.substring(
                                    0,
                                    50,
                                  ) + '...'
                                : conversation.lastMessage?.content}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <span>{lastUpdated}</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-2" />
                <p className="text-lg font-medium">No conversations found</p>
                <p className="text-sm">
                  Start a new chat or wait for others to connect!
                </p>
              </div>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

// Function to determine badge variant based on label
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
