import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';

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
    <Card>
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
                  {conversation.project_name}
                  {/* {conversation.participants
                    .filter((participant: string) => participant !== user.uid)
                    .join(', ')} */}
                </TableCell>
                <TableCell className="text-right">{lastUpdated}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
