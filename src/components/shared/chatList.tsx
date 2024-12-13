import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare } from 'lucide-react'; // Import an icon from lucide-react
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'; // Avatar components
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  lastMessage?: string; // Add a lastMessage field
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
      {conversations.length > 0 ? (
        <Table>
          <TableBody>
            {conversations.map((conversation) => {
              const lastUpdated = conversation.timestamp
                ? formatDistanceToNow(new Date(conversation.timestamp)) + ' ago'
                : 'N/A';

              // Assume you have logic to get the last message (can be from Firestore)
              const lastMessage = conversation.lastMessage || 'No messages yet';

              // Simulating user profile data
              const participantId = conversation.participants[0]; // Just use the first participant as an example
              const participant = { name: 'John Doe', profilePic: 'https://placekitten.com/50/50' }; // Replace with real data

              return (
                <TableRow
                  key={conversation.id}
                  className={active?.id === conversation.id ? 'bg-muted' : 'cursor-pointer hover:bg-muted'}
                  onClick={() => setConversation(conversation)}
                >
                  <TableCell className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={participant.profilePic} alt="User Avatar" />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">{conversation.project_name || 'Unnamed Project'}</p>
                      <p className="text-sm text-muted-foreground">{lastMessage}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    <span>{lastUpdated}</span>
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
