import React, { useState, useEffect, ComponentProps } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';

import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
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

  // Function to update the last updated time for each conversation
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

  // Update lastUpdated every minute
  useEffect(() => {
    updateLastUpdated();
    const intervalId = setInterval(updateLastUpdated, 60000); // Update every minute

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [conversations]);

  return (
    <ScrollArea className="h-[85vh]">
      <div className="flex flex-col gap-2 pt-0">
        {conversations.length > 0 ? (
          conversations.map((conversation) => {
            const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';

            return (
              <button
                key={conversation.id}
                className={cn(
                  'bg-black flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
                  active?.id === conversation.id && 'bg-muted',
                )}
                onClick={() => setConversation(conversation)}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {conversation.name || ''}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'ml-auto text-xs',
                        active?.id === conversation.id
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {lastUpdated}
                    </div>
                  </div>
                  <div className="text-xs font-medium mt-2">
                    {conversation?.lastMessage?.content?.length > 50
                      ? conversation.lastMessage.content.substring(0, 50) +
                        '...'
                      : conversation?.lastMessage?.content}
                  </div>
                </div>
                {/* Display the participants' avatars */}
                <div className="flex items-center gap-2 mt-2">
                  {conversation.participants
                    .slice(0, 3) // Show only the first 3 avatars
                    .map((participant, index) => (
                      <Avatar
                        key={index}
                        className={`w-8 h-8 ${index !== 0 ? '-ml-5' : ''}`} // Apply negative margin to create overlap
                      >
                        <AvatarImage
                          src={`https://api.adorable.io/avatars/285/${participant}.png`}
                          alt={participant}
                        />
                        <AvatarFallback>
                          {participant.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}

                  {/* Show the +n if there are more than 3 participants */}
                  {conversation.participants.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs text-foreground -ml-5">
                      +{conversation.participants.length - 3}
                    </div>
                  )}
                </div>

                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {/* Optional: Include additional text or conversation preview */}
                </div>
                {/* If you have labels or other indicators, you can use badges */}
                {conversation.labels?.length ? (
                  <div className="flex items-center gap-2">
                    {conversation.labels.map((label: any) => (
                      <Badge
                        key={label}
                        className="text-normal"
                        variant={getBadgeVariantFromLabel(label)}
                      >
                        {label.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium">No conversations found</p>
            <p className="text-sm">
              Start a new chat or wait for others to connect!
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>['variant'] {
  if (['a'].includes(label.toLowerCase())) {
    return 'default';
  }

  if (['Project'].includes(label.toLowerCase())) {
    return 'outline';
  }

  return 'secondary';
}
