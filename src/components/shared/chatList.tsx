import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare, Search, SquarePen } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import type { CombinedUser } from '@/hooks/useAllUsers';
import { useAllUsers } from '@/hooks/useAllUsers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  type?: 'individual' | 'group';
  timestamp?: string;
  lastMessage: {
    content?: string;
    senderId?: string;
    timestamp?: string;
  } | null;
  participantDetails?: {
    [uid: string]: {
      userName: string;
      profilePic?: string;
      email?: string;
      userType?: 'freelancer' | 'business';
    };
  };
  groupName?: string;
  description?: string;
  createdBy?: string;
  admins?: string[];
  createdAt?: string;
  updatedAt?: string;
  labels?: string[];
}

interface ChatListProps {
  conversations: Conversation[];
  active: Conversation | null;
  setConversation: (activeConversation: Conversation) => void;
  onOpenProfileSidebar?: (id: string, type: 'user' | 'group') => void;
  onOpenNewChatDialog: () => void;
}

export function ChatList({
  conversations,
  active,
  setConversation,
  onOpenProfileSidebar,
  onOpenNewChatDialog,
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const { users: allFetchedUsers } = useAllUsers();
  const currentUser = useSelector((state: RootState) => state.user);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CombinedUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<CombinedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const stripHtml = (html: string): string =>
    html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

  const handleProfileIconClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    if (!onOpenProfileSidebar) return;
    if (conv.type === 'group') {
      onOpenProfileSidebar(conv.id, 'group');
    } else {
      const otherParticipantUid = conv.participants.find(
        (p) => p !== currentUser.uid,
      );
      if (otherParticipantUid)
        onOpenProfileSidebar(otherParticipantUid, 'user');
    }
  };

  useEffect(() => {
    const term = userSearchTerm.trim().toLowerCase();
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const filtered = allFetchedUsers.filter(
        (user) =>
          user.id !== currentUser.uid &&
          !selectedUsers.find((selected) => selected.id === user.id) &&
          (user.displayName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.rawUserName?.toLowerCase().includes(term) ||
            user.rawName?.toLowerCase().includes(term)),
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error filtering users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to search users. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  }, [userSearchTerm, allFetchedUsers, selectedUsers, currentUser.uid]);

  const handleUserSearch = (term: string): void => {
    setUserSearchTerm(term);
  };
  const handleSelectUser = (user: CombinedUser): void => {
    setSelectedUsers((prevSelectedUsers) => {
      if (!prevSelectedUsers.some((selected) => selected.id === user.id)) {
        return [...prevSelectedUsers, user];
      }
      return prevSelectedUsers;
    });
    setUserSearchTerm('');
  };
  const handleRemoveUser = (userId: string): void => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.filter((user) => user.id !== userId),
    );
  };

  const updateLastUpdated = useCallback(() => {
    const updatedTimes: Record<string, string> = {};
    conversations.forEach((conversation) => {
      if (conversation.timestamp) {
        try {
          updatedTimes[conversation.id] =
            formatDistanceToNow(new Date(conversation.timestamp)) + ' ago';
        } catch {
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

  const filteredConversations = conversations.filter(
    (conversation: Conversation) => {
      const name = conversation.project_name || 'Unnamed Project';
      const lastMessageContent = conversation.lastMessage?.content || '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
  );

  const handleCreateGroup = async (): Promise<void> => {
    if (!currentUser?.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a group.',
      });
      return;
    }
    if (selectedUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one user to create a group.',
      });
      return;
    }
    if (!groupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a group name.',
      });
      return;
    }

    const currentUserUID = currentUser.uid;
    const participantUIDs = Array.from(
      new Set([currentUserUID, ...selectedUsers.map((su) => su.id)]),
    );
    const now = new Date().toISOString();

    const newGroup: Conversation = {
      id: `group_${Date.now()}`,
      type: 'group',
      groupName: groupName.trim(),
      description: groupDescription.trim(),
      participants: participantUIDs,
      createdAt: now,
      updatedAt: now,
      admins: [currentUserUID],
      lastMessage: {
        content: `${currentUser.displayName || currentUser.email || currentUserUID} created the group "${groupName.trim()}"`,
        senderId: 'system',
        timestamp: now,
      },
      participantDetails: {
        [currentUserUID]: {
          userName:
            currentUser.displayName || currentUser.email || 'Current User',
          profilePic: currentUser.photoURL || undefined,
          email: currentUser.email || undefined,
          userType: currentUser.type,
        },
        ...Object.fromEntries(
          selectedUsers.map((user) => [
            user.id,
            {
              userName: user.displayName,
              profilePic: user.profilePic,
              email: user.email,
              userType: user.userType,
            },
          ]),
        ),
      },
    };

    setConversation(newGroup);
    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
    setShowCreateGroupDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]">
      <div className="p-3 border-b border-[hsl(var(--border))]">
        <div className="flex space-x-2 mb-3">
          <Button
            variant="default"
            className="flex-1 flex items-center justify-center text-sm px-4 py-2 rounded-full shadow-lg"
            onClick={onOpenNewChatDialog}
          >
            <SquarePen className="h-4 w-4 mr-2" /> New Chat
          </Button>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
            aria-hidden="true"
          />
          <Input
            placeholder="Search or start new chat"
            aria-label="Search conversations"
            className="pl-10 w-full rounded-full bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:bg-[hsl(var(--background))] border-transparent focus:ring-1 focus:ring-[hsl(var(--ring))]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2 space-y-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';
              const isActive = active?.id === conversation.id;
              const lastMessageText = stripHtml(
                conversation.lastMessage?.content || '',
              );
              const displayText = lastMessageText || 'No messages yet';

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    'flex items-start p-3 rounded-lg cursor-pointer space-x-3 hover:bg-[#d6dae2a8] dark:hover:bg-[#35383b9e]',
                    isActive && 'bg-[#d6dae2a8] dark:bg-[#35383b9e]',
                  )}
                  onClick={() => setConversation(conversation)}
                >
                  <div
                    className="flex items-center space-x-3 flex-shrink-0"
                    onClick={(e) => handleProfileIconClick(e, conversation)}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                      <AvatarImage
                        src={
                          conversation.type === 'group'
                            ? conversation.participantDetails?.[conversation.id]
                                ?.profilePic
                            : conversation.participantDetails?.[
                                conversation.participants.find(
                                  (p) => p !== currentUser.uid,
                                ) || ''
                              ]?.profilePic
                        }
                        alt={
                          conversation.type === 'group'
                            ? conversation.groupName
                            : conversation.participantDetails?.[
                                conversation.participants.find(
                                  (p) => p !== currentUser.uid,
                                ) || ''
                              ]?.userName
                        }
                      />
                      <AvatarFallback>
                        {(conversation.type === 'group'
                          ? conversation.groupName?.charAt(0)
                          : conversation.participantDetails?.[
                              conversation.participants.find(
                                (p) => p !== currentUser.uid,
                              ) || ''
                            ]?.userName?.charAt(0)
                        )?.toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-medium truncate">
                        {conversation.type === 'group'
                          ? conversation.groupName
                          : conversation.participantDetails?.[
                              conversation.participants.find(
                                (p) => p !== currentUser.uid,
                              ) || ''
                            ]?.userName || 'Chat User'}
                      </p>
                      <p className="text-xs flex-shrink-0 ml-2">
                        {lastUpdated}
                      </p>
                    </div>
                    <p className="text-xs truncate">
                      {displayText.length > 40
                        ? displayText.substring(0, 40) + '...'
                        : displayText}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-[hsl(var(--muted-foreground))]">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium">
                {searchTerm
                  ? 'No matching conversations'
                  : 'No conversations found'}
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
