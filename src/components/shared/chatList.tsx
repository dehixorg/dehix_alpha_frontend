import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import {
  MessageSquare,
  Search,
  SquarePen,
  Loader2,
  Archive,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
      viewState?: 'archived' | 'inbox';
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
  onOpenProfileSidebar?: (
    id: string,
    type: 'user' | 'group',
    initialDetails?: {
      userName?: string;
      email?: string;
      profilePic?: string;
    },
  ) => void;
  onOpenNewChatDialog: () => void;
  // Optional handlers to start a new chat with a specific user
  onSelectUser?: (user: CombinedUser) => void | Promise<void>;
  openNewChat?: (user: CombinedUser) => void | Promise<void>;
}

export function ChatList({
  conversations,
  active,
  setConversation,
  onOpenProfileSidebar,
  onOpenNewChatDialog,
  onSelectUser,
  openNewChat,
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const { users: allFetchedUsers } = useAllUsers();
  const currentUser = useSelector((state: RootState) => state.user);
  const userSearchTerm = searchTerm;
  const [searchResults, setSearchResults] = useState<CombinedUser[]>([]);
  interface SelectedUser {
    id: string;
    displayName?: string;
    email?: string;
  }

  const selectedUsers: SelectedUser[] = [];
  const [isSearching, setIsSearching] = useState(false);
  const [activeView, setActiveView] = useState<'inbox' | 'archived'>('inbox');

  const stripHtml = (html: string): string =>
    html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

  // Utility function to detect and format media messages
  const formatLastMessage = (lastMessage: any): string => {
    if (!lastMessage?.content) return 'No messages yet';
    
    const content = lastMessage.content;
    const s3BucketUrl = process.env.NEXT_PUBLIC__S3_BUCKET_URL;
    
    // Check if content is an S3 URL
    if (
      typeof content === 'string' &&
      s3BucketUrl &&
      content.startsWith(s3BucketUrl)
    ) {
      try {
        const url = new URL(content);
        const fileName = decodeURIComponent(url.pathname.substring(1));
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        
        // Check if it's a voice message based on the message type
        if (lastMessage.voiceMessage) {
          return '🎤 Voice message';
        }
        
        // Check file extension for different media types
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac'];
        const documentExtensions = [
          'pdf',
          'doc',
          'docx',
          'ppt',
          'pptx',
          'xls',
          'xlsx',
          'txt',
        ];
        
        if (imageExtensions.includes(fileExtension)) {
          return '📷 Photo';
        } else if (videoExtensions.includes(fileExtension)) {
          return '🎥 Video';
        } else if (audioExtensions.includes(fileExtension)) {
          return '🎵 Audio';
        } else if (documentExtensions.includes(fileExtension)) {
          return '📄 Document';
        } else {
          return '📎 File';
        }
      } catch (error) {
        console.error('Error parsing S3 URL:', error);
        return '📎 Attachment';
      }
    }
    
    // Check if there are attachments
    if (
      lastMessage.attachments &&
      Array.isArray(lastMessage.attachments) &&
      lastMessage.attachments.length > 0
    ) {
      const attachment = lastMessage.attachments[0];
      if (attachment.type) {
        if (attachment.type.startsWith('image/')) {
          return '📷 Photo';
        } else if (attachment.type.startsWith('video/')) {
          return '🎥 Video';
        } else if (attachment.type.startsWith('audio/')) {
          return '🎵 Audio';
        } else {
          return '📄 Document';
        }
      }
      return '📎 File';
    }
    
    // Return stripped HTML content for regular text messages
    const textContent = stripHtml(content);
    return textContent || 'Message';
  };

  const handleProfileIconClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    if (!onOpenProfileSidebar) return;
    if (conv.type === 'group') {
      onOpenProfileSidebar(conv.id, 'group', {
        userName: conv.groupName || 'Group',
        profilePic: conv.avatar,
      });
    } else {
      const otherParticipantUid = conv.participants.find(
        (p) => p !== currentUser.uid,
      );
      if (otherParticipantUid) {
        const participantDetails =
          conv.participantDetails?.[otherParticipantUid];
        onOpenProfileSidebar(otherParticipantUid, 'user', {
          userName: participantDetails?.userName,
          email: participantDetails?.email,
          profilePic: participantDetails?.profilePic,
        });
      }
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
      notifyError('Failed to search users. Please try again.', 'Error');
    } finally {
      setIsSearching(false);
    }
  }, [userSearchTerm, allFetchedUsers, currentUser.uid]);

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

  const handleOpenArchivedChats = () => {
    setActiveView('archived');
  };

  const handleOpenInbox = () => {
    setActiveView('inbox');
  };

  const displayedConversations = conversations
    .filter((conversation) => {
      const userDetails = conversation.participantDetails?.[currentUser.uid];
      if (activeView === 'archived') {
        return userDetails?.viewState === 'archived';
      } else {
        return userDetails?.viewState !== 'archived';
      }
    })
    .filter((conversation) => {
      const name =
        conversation.groupName ||
        conversation.participantDetails?.[
          conversation.participants.find((p) => p !== currentUser.uid) || ''
        ]?.userName ||
        '';
      const lastMessageContent = formatLastMessage(conversation.lastMessage);
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

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
          <Button
            variant="outline"
            className="flex items-center justify-center text-sm px-3 py-2 rounded-full shadow-lg"
            onClick={handleOpenArchivedChats}
            aria-label="View archived chats"
          >
            <Archive className="h-4 w-4" />
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

      {activeView === 'archived' && (
        <div className="p-3 text-center border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <Button variant="link" onClick={handleOpenInbox}>
              &larr; Back to Inbox
            </Button>
            <h3 className="font-semibold text-lg">Archived Chats</h3>
            <div style={{ width: '95px' }}></div>
          </div>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2 space-y-2">
          {searchTerm && (
            <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-2">
              {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSearching ? 'Searching users…' : 'Search results'}</span>
            </div>
          )}
          {searchTerm && searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                aria-label={`Start chat with ${user.displayName || user.email}`}
                className="flex items-center p-3 rounded-md border border-transparent hover:border-border hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer transition"
                onClick={async () => {
                  // Start the new chat flow for this user
                  setIsSearching(true);
                  try {
                    if (onSelectUser) {
                      await onSelectUser(user);
                    } else if (openNewChat) {
                      await openNewChat(user);
                    } else {
                      // Fallback: open the generic new chat dialog
                      onOpenNewChatDialog();
                      notifySuccess(
                        `Preparing a new chat with ${user.displayName || user.email}`,
                        'Starting new chat',
                      );
                    }
                    // Close search UI
                    setSearchTerm('');
                    setSearchResults([]);
                  } catch (err: any) {
                    console.error('Failed to start chat:', err);
                    notifyError(
                      err?.message || 'Please try again',
                      'Could not start chat',
                    );
                  } finally {
                    setIsSearching(false);
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))
          ) : searchTerm && !isSearching && searchResults.length === 0 ? (
            <div className="text-sm text-muted-foreground px-3 py-6 text-center border rounded-md bg-muted/30">
              No users found for &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            <>
              {displayedConversations.length > 0 ? (
                displayedConversations.map((conversation) => {
                  const lastUpdated =
                    lastUpdatedTimes[conversation.id] || 'N/A';
                  const isActive = active?.id === conversation.id;
                  const displayText = formatLastMessage(
                    conversation.lastMessage,
                  );

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
                                ? conversation.avatar
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
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
