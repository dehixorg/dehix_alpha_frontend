import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare } from 'lucide-react'; // Import an icon from lucide-react

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

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
    <Card className="h-full">
      {conversations.length > 0 ? (
        <Table>
          <TableBody>
            {conversations.map((conversation) => {
              const lastUpdated = conversation.timestamp
                ? formatDistanceToNow(new Date(conversation.timestamp)) + ' ago'
                : 'N/A';

              return (
                <TableRow
                  key={conversation.id}
                  className={
                    active?.id === conversation.id
                      ? 'bg-muted'
                      : 'cursor-pointer hover:bg-muted'
                  }
                  onClick={() => setConversation(conversation)}
                >
                  <TableCell>
                    {conversation.project_name || 'Unnamed Project'}
                    {/* You can optionally add more details here */}
                  </TableCell>
                  <TableCell className="text-right">{lastUpdated}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-muted-foreground">
          <MessageSquare className="w-10 h-10 mb-2" />
          <p className="text-lg font-medium">No conversations found</p>
          <p className="text-sm">
            Start a new chat or wait for others to connect!
          </p>
        </div>
      )}
    </Card>
  );
}
