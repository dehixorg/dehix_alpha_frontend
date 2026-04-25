import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import {
  MessageSquare,
  Search,
  SquarePen,
  Loader2,
  Archive,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  FileText,
  Mic,
  Music2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import type { CombinedUser } from '@/hooks/useAllUsers';
import {
  CHAT_USER_SEARCH_MIN_CHARS,
  useRemoteUserSearch,
} from '@/hooks/useRemoteUserSearch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/shared/EmptyState';

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
    voiceMessage?: boolean;
    attachments?: Array<{ type?: string }>;
  } | null;
  participantDetails?: {
    [uid: string]: {
      userName: string;
      profilePic?: string;
      email?: string;
      userType?: 'freelancer' | 'business';
      viewState?: 'archived' | 'inbox';
      lastReadAt?: any;
      lastSeenMessageId?: string;
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

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

const getTimestampMs = (ts: any) => {
  if (!ts) return 0;
  if (typeof ts === 'object' && ts.seconds) return ts.seconds;
  if (typeof ts === 'number') return Math.floor(ts / 1000);
  return Math.floor(new Date(ts as string).getTime() / 1000) || 0;
};

const getRelativeTimeLabel = (timestamp?: string) => {
  if (!timestamp) return 'N/A';

  try {
    return formatDistanceToNow(new Date(timestamp)) + ' ago';
  } catch {
    return 'Invalid date';
  }
};

const getLastMessagePreview = (lastMessage: Conversation['lastMessage']) => {
  if (!lastMessage) return { text: 'No messages yet', icon: null };
  const content = lastMessage.content;
  const s3BucketUrl = process.env.NEXT_PUBLIC__S3_BUCKET_URL;

  if (lastMessage.voiceMessage) {
    return { text: 'Voice message', icon: <Mic className="h-3.5 w-3.5" /> };
  }

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

  const getExt = (raw: string) => {
    try {
      const url = new URL(raw);
      return url.pathname.split('.').pop()?.toLowerCase() || '';
    } catch {
      return raw.split('?')[0].split('.').pop()?.toLowerCase() || '';
    }
  };

  if (typeof content === 'string') {
    const ext = getExt(content);
    if (imageExtensions.includes(ext)) {
      return { text: 'Photo', icon: <ImageIcon className="h-3.5 w-3.5" /> };
    }
    if (videoExtensions.includes(ext)) {
      return { text: 'Video', icon: <Video className="h-3.5 w-3.5" /> };
    }
    if (audioExtensions.includes(ext)) {
      return { text: 'Audio', icon: <Music2 className="h-3.5 w-3.5" /> };
    }
    if (documentExtensions.includes(ext)) {
      return { text: 'Document', icon: <FileText className="h-3.5 w-3.5" /> };
    }
  }

  if (
    typeof content === 'string' &&
    s3BucketUrl &&
    content.startsWith(s3BucketUrl)
  ) {
    try {
      const url = new URL(content);
      const fileName = decodeURIComponent(url.pathname.substring(1));
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

      if (imageExtensions.includes(fileExtension)) {
        return { text: 'Photo', icon: <ImageIcon className="h-3.5 w-3.5" /> };
      }
      if (videoExtensions.includes(fileExtension)) {
        return { text: 'Video', icon: <Video className="h-3.5 w-3.5" /> };
      }
      if (audioExtensions.includes(fileExtension)) {
        return { text: 'Audio', icon: <Music2 className="h-3.5 w-3.5" /> };
      }
      if (documentExtensions.includes(fileExtension)) {
        return {
          text: 'Document',
          icon: <FileText className="h-3.5 w-3.5" />,
        };
      }
      return { text: 'File', icon: <FileText className="h-3.5 w-3.5" /> };
    } catch (error) {
      console.error('Error parsing S3 URL:', error);
      return {
        text: 'Attachment',
        icon: <FileText className="h-3.5 w-3.5" />,
      };
    }
  }

  if (
    lastMessage.attachments &&
    Array.isArray(lastMessage.attachments) &&
    lastMessage.attachments.length > 0
  ) {
    const attachment = lastMessage.attachments[0];
    if (attachment.type) {
      if (attachment.type.startsWith('image/')) {
        return { text: 'Photo', icon: <ImageIcon className="h-3.5 w-3.5" /> };
      }
      if (attachment.type.startsWith('video/')) {
        return { text: 'Video', icon: <Video className="h-3.5 w-3.5" /> };
      }
      if (attachment.type.startsWith('audio/')) {
        return { text: 'Audio', icon: <Music2 className="h-3.5 w-3.5" /> };
      }
      return { text: 'Document', icon: <FileText className="h-3.5 w-3.5" /> };
    }
    return { text: 'File', icon: <FileText className="h-3.5 w-3.5" /> };
  }

  const textContent = content ? stripHtml(content) : '';
  return { text: textContent || 'Message', icon: null };
};

export function ChatList({
  conversations,
  active,
  setConversation,
  onOpenProfileSidebar,
  onOpenNewChatDialog,
  onSelectUser,
  openNewChat,
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = useSelector((state: RootState) => state.user);
  const currentUserId = currentUser.uid;
  const userSearchTerm = searchTerm;
  const trimmedSearchTerm = userSearchTerm.trim();
  const {
    users: remoteUsers,
    isLoading: isSearching,
    error: searchError,
    hasSearched,
  } = useRemoteUserSearch(userSearchTerm);
  const [activeView, setActiveView] = useState<'inbox' | 'archived'>('inbox');
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [, setRelativeTimeTick] = useState<number>(Date.now());

  const searchResults = useMemo(
    () =>
      trimmedSearchTerm.length >= CHAT_USER_SEARCH_MIN_CHARS
        ? remoteUsers.filter((user) => user.id !== currentUserId)
        : [],
    [currentUserId, remoteUsers, trimmedSearchTerm.length],
  );

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
        (p) => p !== currentUserId,
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
    const intervalId = setInterval(() => {
      setRelativeTimeTick(Date.now());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenArchivedChats = () => {
    setActiveView('archived');
  };

  const handleOpenInbox = () => {
    setActiveView('inbox');
  };

  const normalizedSearchTerm = searchTerm.toLowerCase();

  const conversationEntries = useMemo(
    () =>
      conversations.map((conversation) => {
        const otherParticipantUid =
          conversation.type === 'group'
            ? null
            : conversation.participants.find((p) => p !== currentUserId) ||
              null;
        const otherParticipantDetails = otherParticipantUid
          ? conversation.participantDetails?.[otherParticipantUid]
          : undefined;
        const { text: previewText, icon: previewIcon } = getLastMessagePreview(
          conversation.lastMessage,
        );
        const messageTimestamp = getTimestampMs(
          conversation.lastMessage?.timestamp,
        );
        const lastReadAt = getTimestampMs(
          conversation.participantDetails?.[currentUserId]?.lastReadAt,
        );
        const isUnread =
          !!conversation.lastMessage?.senderId &&
          conversation.lastMessage.senderId !== currentUserId &&
          active?.id !== conversation.id &&
          messageTimestamp > lastReadAt;
        const displayName =
          conversation.type === 'group'
            ? conversation.groupName || 'Group'
            : otherParticipantDetails?.userName || 'Chat User';
        const searchableText = `${displayName} ${previewText}`.toLowerCase();

        return {
          conversation,
          displayName,
          avatarSrc:
            conversation.type === 'group'
              ? conversation.avatar
              : otherParticipantDetails?.profilePic,
          avatarFallback: displayName.charAt(0).toUpperCase() || 'P',
          previewText,
          previewIcon,
          searchableText,
          viewState:
            conversation.participantDetails?.[currentUserId]?.viewState ||
            'inbox',
          isUnread,
          timestampMs: getTimestampMs(conversation.timestamp),
        };
      }),
    [active?.id, conversations, currentUserId],
  );

  const visibleConversationEntries = useMemo(
    () =>
      conversationEntries
        .filter((entry) =>
          activeView === 'archived'
            ? entry.viewState === 'archived'
            : entry.viewState !== 'archived',
        )
        .filter(
          (entry) =>
            !normalizedSearchTerm ||
            entry.searchableText.includes(normalizedSearchTerm),
        )
        .sort((a, b) => {
          if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
          return b.timestampMs - a.timestampMs;
        }),
    [activeView, conversationEntries, normalizedSearchTerm],
  );

  const displayedConversations = useMemo(() => {
    return visibleConversationEntries.map((entry) => ({
      ...entry,
      relativeTime: getRelativeTimeLabel(entry.conversation.timestamp),
    }));
  }, [visibleConversationEntries]);

  return (
    <div className="flex flex-col h-full w-full bg-[hsl(var(--card))] overflow-hidden">
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
          {trimmedSearchTerm.length >= CHAT_USER_SEARCH_MIN_CHARS && (
            <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-2">
              {(isSearching || isStartingChat) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>
                {isSearching ? 'Searching users...' : 'Search results'}
              </span>
            </div>
          )}
          {trimmedSearchTerm.length >= CHAT_USER_SEARCH_MIN_CHARS &&
          searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                aria-label={`Start chat with ${user.displayName || user.email}`}
                className="flex items-center p-3 rounded-md border border-transparent hover:border-border hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer transition"
                onClick={async () => {
                  // Start the new chat flow for this user
                  setIsStartingChat(true);
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
                  } catch (err: any) {
                    console.error('Failed to start chat:', err);
                    notifyError(
                      err?.message || 'Please try again',
                      'Could not start chat',
                    );
                  } finally {
                    setIsStartingChat(false);
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                <Avatar className="w-10 h-10 mr-3 flex-shrink-0">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            ))
          ) : trimmedSearchTerm.length > 0 &&
            trimmedSearchTerm.length < CHAT_USER_SEARCH_MIN_CHARS ? (
            <div className="text-sm text-muted-foreground px-3 py-6 text-center border rounded-md bg-muted/30">
              Type at least {CHAT_USER_SEARCH_MIN_CHARS} characters to search
              for users.
            </div>
          ) : trimmedSearchTerm.length >= CHAT_USER_SEARCH_MIN_CHARS &&
            searchError ? (
            <div className="text-sm text-red-500 px-3 py-6 text-center border rounded-md bg-muted/30">
              {searchError}
            </div>
          ) : trimmedSearchTerm.length >= CHAT_USER_SEARCH_MIN_CHARS &&
            hasSearched &&
            !isSearching &&
            searchResults.length === 0 ? (
            <div className="text-sm text-muted-foreground px-3 py-6 text-center border rounded-md bg-muted/30">
              No users found for &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            <>
              {displayedConversations.length > 0 ? (
                displayedConversations.map((entry) => {
                  const { conversation } = entry;
                  const isActive = active?.id === conversation.id;
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
                            src={entry.avatarSrc}
                            alt={entry.displayName}
                          />
                          <AvatarFallback>
                            {entry.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <p
                            className={cn(
                              'text-sm truncate',
                              entry.isUnread ? 'font-bold' : 'font-medium',
                            )}
                          >
                            {entry.displayName}
                          </p>
                          <p
                            className={cn(
                              'text-xs flex-shrink-0 ml-2',
                              entry.isUnread
                                ? 'text-foreground font-semibold'
                                : 'text-muted-foreground',
                            )}
                          >
                            {entry.relativeTime}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={cn(
                              'text-xs truncate flex items-center gap-1',
                              entry.isUnread
                                ? 'font-semibold text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {entry.previewIcon ? (
                              <span className="text-[hsl(var(--muted-foreground))]">
                                {entry.previewIcon}
                              </span>
                            ) : null}
                            {entry.previewText.length > 40
                              ? entry.previewText.substring(0, 40) + '...'
                              : entry.previewText}
                          </p>
                          {entry.isUnread && (
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
