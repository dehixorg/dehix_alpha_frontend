import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';

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
  return (
    <ScrollArea className="h-[85vh]">
      <div className="flex flex-col gap-2 pt-0">
        {conversations.length > 0 ? (
          conversations.map((conversation) => {
            const lastUpdated = conversation.timestamp
              ? formatDistanceToNow(new Date(conversation.timestamp)) + ' ago'
              : 'N/A';

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
                        {conversation.project_name || 'Unnamed Project'}
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
                  <div className="text-xs font-medium">Last updated</div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {/* Optional: Include additional text or conversation preview */}
                </div>
                {/* If you have labels or other indicators, you can use badges */}
                {/* {conversation.labels?.length ? (
                  <div className="flex items-center gap-2">
                    {conversation.labels.map((label) => (
                      <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null} */}
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

// function getBadgeVariantFromLabel(
//   label: string,
// ): ComponentProps<typeof Badge>['variant'] {
//   if (['work'].includes(label.toLowerCase())) {
//     return 'default';
//   }

//   if (['personal'].includes(label.toLowerCase())) {
//     return 'outline';
//   }

//   return 'secondary';
// }
