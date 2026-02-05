import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import {
  MessageSquare,
  Search,
  SquarePen,
  Loader2,
  Archive,
  ArrowLeft,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { getLastMessagePreview } from '@/utils/common/chatUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import type { CombinedUser } from '@/hooks/useAllUsers';
import { useAllUsers } from '@/hooks/useAllUsers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string;
  type?: 'individual' | 'group';
  timestamp?: string;
  avatar?: string;
  lastMessage: {
    content?: string;
    senderId?: string;
    timestamp?: string;
    voiceMessage?: boolean;
    attachments?: Array<{ type?: string }>;
    deletedFor?: string[];
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
  /** Unread message count (legacy) */
  unreadCount?: number;
  /** Per-user unread count (Firestore: unreadCountByUser[userId]) */
  unreadCountByUser?: Record<string, number>;
  /** User IDs who have this conversation in their inbox (WhatsApp-style: individual = creator until other messages) */
  inboxFor?: string[];
  /** User IDs who have muted this conversation (no notification sound/badge emphasis) */
  mutedByUsers?: string[];
  /** Single pinned message (WhatsApp-style); null when none */
  pinnedMessage?: {
    messageId: string;
    pinnedAt: string;
    pinnedBy: string;
    content?: string;
  } | null;
  /** Object containing block status and the user ID who initiated the block */
  blocked?: {
    status: boolean;
    by: string;
  };
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
  /** When each conversation was last opened (so unread glow goes away after seeing) */
  lastReadAt?: Record<string, string>;
  // Optional handlers to start a new chat with a specific user
  onSelectUser?: (user: CombinedUser) => void | Promise<void>;
  openNewChat?: (user: CombinedUser) => void | Promise<void>;
}

// Memoized chat list item to prevent unnecessary re-renders
const ChatListItem = React.memo<{
  conversation: Conversation;
  isActive: boolean;
  currentUser: { uid: string };
  lastReadAt: Record<string, string>;
  setConversation: (conv: Conversation) => void;
  onOpenProfileSidebar?: (
    id: string,
    type: 'user' | 'group',
    initialDetails?: { userName?: string; email?: string; profilePic?: string },
  ) => void;
  lastUpdated?: string;
}>(
  ({
    conversation,
    isActive,
    currentUser,
    lastReadAt,
    setConversation,
    onOpenProfileSidebar,
    lastUpdated,
  }) => {
    const lastMessagePreview = useMemo(
      () => getLastMessagePreview(conversation.lastMessage),
      [conversation.lastMessage],
    );
    const handleProfileIconClick = useCallback(
      (e: React.MouseEvent | React.KeyboardEvent, conv: Conversation) => {
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
      },
      [currentUser.uid, onOpenProfileSidebar],
    );

    // Calculate logic for unread, last deleted, etc.
    const lastMsgDeletedByMe =
      conversation.lastMessage &&
      conversation.lastMessage.deletedFor &&
      Array.isArray(conversation.lastMessage.deletedFor) &&
      conversation.lastMessage.deletedFor.includes(currentUser.uid);

    const { text: displayText, icon: displayIcon } = lastMsgDeletedByMe
      ? { text: 'No messages yet', icon: null }
      : lastMessagePreview;

    const unreadCount =
      conversation.unreadCountByUser?.[currentUser.uid] ??
      conversation.unreadCount ??
      0;

    const lastFromOther =
      conversation.lastMessage &&
      conversation.lastMessage.senderId !== currentUser.uid &&
      !lastMsgDeletedByMe;

    const hasUnread = useMemo(() => {
      if (isActive) return false;
      if (unreadCount > 0) return true;

      if (lastFromOther && conversation.lastMessage) {
        const readAt = lastReadAt[conversation.id];
        if (!readAt) return true;

        const lastMsgTime = conversation.lastMessage.timestamp;
        if (lastMsgTime != null) {
          let lastMsgMs: number = 0;
          if (typeof lastMsgTime === 'string') {
            lastMsgMs = new Date(lastMsgTime).getTime();
          } else if (
            typeof lastMsgTime === 'object' &&
            lastMsgTime !== null &&
            'toDate' in lastMsgTime
          ) {
            lastMsgMs = (lastMsgTime as { toDate: () => Date })
              .toDate()
              .getTime();
          } else if (
            typeof lastMsgTime === 'object' &&
            lastMsgTime !== null &&
            'seconds' in lastMsgTime
          ) {
            lastMsgMs =
              ((lastMsgTime as { seconds: number }).seconds ?? 0) * 1000;
          } else {
            lastMsgMs = new Date(String(lastMsgTime)).getTime();
          }
          const readAtMs = new Date(readAt).getTime();
          if (Number.isNaN(lastMsgMs) || Number.isNaN(readAtMs)) return true;
          return lastMsgMs > readAtMs;
        }
      }
      return false;
    }, [
      conversation.id,
      conversation.lastMessage,
      lastReadAt,
      isActive,
      unreadCount,
      lastFromOther,
    ]);

    const otherParticipantId =
      conversation.participants.find((p) => p !== currentUser.uid) || '';
    const displayName =
      conversation.type === 'group'
        ? conversation.groupName
        : conversation.participantDetails?.[otherParticipantId]?.userName ||
          'Chat User';

    const profilePic =
      conversation.type === 'group'
        ? conversation.avatar
        : conversation.participantDetails?.[otherParticipantId]?.profilePic;

    return (
      <div
        key={conversation.id}
        role="button"
        tabIndex={0}
        aria-label={`Open chat with ${displayName}${hasUnread ? ', unread messages' : ''}`}
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--card))]',
          isActive &&
            'bg-[hsl(var(--accent)_/_0.6)] dark:bg-[hsl(var(--accent)_/_0.4)]',
        )}
        onClick={() => setConversation(conversation)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setConversation(conversation);
          }
        }}
      >
        <div
          className="flex items-center flex-shrink-0"
          onClick={(e) => handleProfileIconClick(e, conversation)}
          role="button"
          tabIndex={0}
          aria-label="View profile"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleProfileIconClick(e, conversation);
            }
          }}
        >
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={profilePic} alt={displayName} />
            <AvatarFallback>
              {displayName?.charAt(0)?.toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow min-w-0 overflow-hidden">
          <div className="flex justify-between items-baseline gap-2">
            <p className="text-sm truncate flex-1 text-[hsl(var(--foreground))] font-semibold">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {unreadCount > 0 && !isActive && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--primary))] text-[10px] font-semibold text-[hsl(var(--primary-foreground))]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {hasUnread && unreadCount === 0 && (
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
              )}
              <p className="text-[10px] sm:text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                {lastUpdated ?? '—'}
              </p>
            </div>
          </div>
          <p className="text-xs truncate flex items-center gap-1 mt-0.5 text-[hsl(var(--muted-foreground))]">
            {displayIcon && (
              <span className="flex-shrink-0">{displayIcon}</span>
            )}
            <span className="truncate">
              {displayText.length > 50
                ? displayText.substring(0, 50) + '…'
                : displayText}
            </span>
          </p>
        </div>
      </div>
    );
  },
);

ChatListItem.displayName = 'ChatListItem';

export function ChatList({
  conversations,
  active,
  setConversation,
  onOpenProfileSidebar,
  onOpenNewChatDialog,
  lastReadAt = {},
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

  // No local getLastMessagePreview - using shared utility from chatUtils.ts

  // No local getLastMessagePreview - using shared utility from chatUtils.ts

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
      const lastMessageContent = getLastMessagePreview(
        conversation.lastMessage,
      ).text;
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
          {activeView !== 'archived' && (
            <Button
              variant="outline"
              className="flex items-center justify-center text-sm px-3 py-2 rounded-full shadow-lg"
              onClick={handleOpenArchivedChats}
              aria-label="View archived chats"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
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
        <div className="p-3 text-center border-b bg-gradient">
          <div className="flex items-center justify-between">
            <Button
              size="icon"
              className="rounded-full"
              onClick={handleOpenInbox}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg">Archived Chats</h3>
            <div style={{ width: '60px' }}></div>
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
                displayedConversations.map((conversation) => (
                  <ChatListItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={active?.id === conversation.id}
                    currentUser={currentUser}
                    lastReadAt={lastReadAt}
                    setConversation={setConversation}
                    onOpenProfileSidebar={onOpenProfileSidebar}
                    lastUpdated={lastUpdatedTimes[conversation.id] ?? '—'}
                  />
                ))
              ) : (
                <EmptyState
                  icon={
                    <MessageSquare className="w-10 h-10 text-muted-foreground/80" />
                  }
                  title={
                    searchTerm
                      ? 'No matching conversations'
                      : 'No conversations found'
                  }
                  description={
                    !searchTerm
                      ? 'Start a new chat or wait for others to connect!'
                      : undefined
                  }
                  className="h-full px-4 py-12 border-0 bg-transparent"
                />
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
