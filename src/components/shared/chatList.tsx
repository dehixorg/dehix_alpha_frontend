import React, { useState, useEffect, ComponentProps } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare } from 'lucide-react'; // Import an icon from lucide-react
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names
import { Badge } from '../ui/badge';

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  lastMessage?: string;
  timestamp?: string;
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

  const updateLastUpdated = () => {
    const updatedTimes: Record<string, string> = {};
    conversations.forEach((conversation) => {
      if (conversation.timestamp) {
        updatedTimes[conversation.id] =
          formatDistanceToNow(new Date(conversation.timestamp)) + ' ago';
      }
    });
    setLastUpdatedTimes(updatedTimes);
  };

  useEffect(() => {
    updateLastUpdated();
    const intervalId = setInterval(updateLastUpdated, 60000);
    return () => clearInterval(intervalId);
  }, [conversations]);

  return (
    <Card className="h-[85vh]">
      {conversations.length > 0 ? (
        <Table>
          <TableBody>
            {conversations.map((conversation) => {
              const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';
              const lastMessage = conversation.lastMessage || 'No messages yet';
              const participantId = conversation.participants[0];
              const participant = {
                name: 'John Doe',
                profilePic: 'https://placekitten.com/50/50',
              };

              return (
                <TableRow
                  key={conversation.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted',
                    active?.id === conversation.id && 'bg-muted'
                  )}
                  onClick={() => setConversation(conversation)}
                >
                  <TableCell className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={participant.profilePic} alt="User Avatar" />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">
                        {conversation.project_name || 'Unnamed Project'}
                      </p>
                      <p className="text-sm text-muted-foreground">{lastMessage}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {lastUpdated}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-muted-foreground">
          <MessageSquare className="w-10 h-10 mb-2" />
          <p className="text-lg font-medium">No conversations found</p>
          <p className="text-sm">Start a new chat or wait for others to connect!</p>
        </div>
      )}
    </Card>
  );
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>['variant'] {
  if (['a'].includes(label.toLowerCase())) {
    return 'default';
  }

  if (['Project'].includes(label.toLowerCase())) {
    return 'outline';
  }

  return 'secondary';
}
