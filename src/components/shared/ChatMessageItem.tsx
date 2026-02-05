'use client';

/* eslint-disable prettier/prettier */
import React, { useState, useRef, useEffect, useMemo, useCallback, RefObject, memo } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { formatDistanceToNow, format } from 'date-fns';
import { Reply, Flag, MoreVertical, Copy, Trash2, Pencil, RefreshCw, AlertCircle, Pin, PinOff } from 'lucide-react';

import { EmojiPicker } from '../emojiPicker';


import Reactions from './reactions';
import { FileAttachment } from './fileAttachment';
import { Conversation } from './chatList';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiHelperService } from '@/services/report';

// Local helpers to keep component self-contained
function formatChatTimestamp(timestamp: string) {
  return format(new Date(timestamp), 'hh:mm a');
}

function formatDateHeader(timestamp: string | number) {
  const msgDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const msgDay = msgDate.toDateString();

  if (msgDay === today.toDateString()) return 'Today';
  if (msgDay === yesterday.toDateString()) return 'Yesterday';

  return msgDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getMessagePreviewLabel(
  content: string,
  voiceMessage?: ChatMessage['voiceMessage'],
) {
  if (voiceMessage?.type === 'voice') return 'Voice message';
  if (content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i)) return 'Photo';
  if (content.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)(\?|$)/i))
    return 'Document';
  return content;
}

function isImageUrl(content: string) {
  return /\.(jpeg|jpg|gif|png)(\?|$)/i.test(content);
}

function isDocUrl(content: string) {
  return /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)(\?|$)/i.test(content);
}

export type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  replyTo?: string | null;
  reactions?: Record<string, string[]> | undefined;
  voiceMessage?: {
    duration: number;
    type: 'voice';
  };
  /** 'failed' when send fails – backend can set; UI shows retry/delete */
  status?: 'sent' | 'failed';
};

type Props = {
  message: ChatMessage;
  index: number;
  messages: ChatMessage[];
  userId: string;
  conversation: Conversation;
  onHoverChange: (id: string | null) => void;
  setModalImage: (url: string | null) => void;
  audioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement | null }>;
  handleLoadedMetadata: (id: string) => void;
  handlePlay: (id: string) => void;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  setReplyToMessageId: (id: string) => void;
  messagesEndRef?: RefObject<HTMLDivElement>;
  onOpenProfileSidebar?: (
    id: string,
    type: 'user' | 'group',
    initialDetails?: { userName?: string; email?: string; profilePic?: string },
  ) => void;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => void;
  onRetryMessage?: (messageId: string) => Promise<void>;
  pinnedMessage?: { messageId: string; content?: string } | null;
  onPinMessage?: (messageId: string, content: string) => Promise<void>;
  onUnpinMessage?: () => Promise<void>;
};

function ChatMessageItem({
  message,
  index,
  messages,
  userId,
  conversation,
  onHoverChange,
  setModalImage,
  audioRefs,
  handleLoadedMetadata,
  handlePlay,
  toggleReaction,
  setReplyToMessageId,
  messagesEndRef,
  onOpenProfileSidebar,
  onDeleteMessage,
  onEditMessage,
  onRetryMessage,
  pinnedMessage,
  onPinMessage,
  onUnpinMessage,
}: Props) {
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const formattedTimestamp = useMemo(
    () => formatChatTimestamp(message.timestamp),
    [message.timestamp],
  );
  const readableTimestamp = useMemo(
    () => formatDistanceToNow(new Date(message.timestamp)) + ' ago',
    [message.timestamp],
  );

  const prev = messages[index - 1];
  const next = messages[index + 1];
  const isNewDay = useMemo(() => {
    return (
      !prev || !isSameDay(new Date(prev.timestamp), new Date(message.timestamp))
    );
  }, [prev, message.timestamp]);

  // Group consecutive messages from same sender: show avatar/name only once per group
  const isFirstInGroup = useMemo(
    () =>
      !prev ||
      prev.senderId !== message.senderId ||
      !isSameDay(new Date(prev.timestamp), new Date(message.timestamp)),
    [prev, message.senderId, message.timestamp],
  );
  const isLastInGroup = useMemo(
    () =>
      !next ||
      next.senderId !== message.senderId ||
      !isSameDay(new Date(next.timestamp), new Date(message.timestamp)),
    [next, message.senderId, message.timestamp],
  );
  const emojiInfo = useMemo(() => {
    if (
      message.voiceMessage ||
      message.content.match(/\.(jpeg|jpg|gif|png|pdf|doc|docx|ppt|pptx)(\?|$)/i)
    ) {
      return { isEmojiOnly: false, isSingleEmoji: false };
    }
    const emojiSpanRegex = /<span[^>]*class="chat-emoji"[^>]*>[^<]*<\/span>/g;
    const emojiMatches = message.content.match(emojiSpanRegex) || [];
    const stripped = message.content
      .replace(emojiSpanRegex, '')
      .replace(/&nbsp;|<br\s*\/?>/gi, '')
      .replace(/\s+/g, '')
      .trim();
    const onlyEmojis = stripped.length === 0 && emojiMatches.length > 0;
    return {
      isEmojiOnly: onlyEmojis,
      isSingleEmoji: onlyEmojis && emojiMatches.length === 1,
    };
  }, [message.content, message.voiceMessage]);

  const { isEmojiOnly, isSingleEmoji } = emojiInfo;

  const isSender = useMemo(
    () => message.senderId === userId,
    [message.senderId, userId],
  );

  const [now, setNow] = useState(Date.now());

  // Only run timer if message is potentially editable
  useEffect(() => {
    // Quick check: Skip timer if message is definitely not editable
    if (!isSender || !onEditMessage) return;
    if (message.voiceMessage?.type === 'voice') return;

    const hasFileOrImage = /\.(jpeg|jpg|gif|png|pdf|doc|docx|ppt|pptx)(\?|$)/i.test(
      message.content
    );
    if (hasFileOrImage) return;

    // Check if message is already too old (>1 hour)
    const msgTime = new Date(message.timestamp).getTime();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (msgTime < oneHourAgo) return;

    // Message is editable, start timer
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [isSender, onEditMessage, message.voiceMessage, message.content, message.timestamp]);

  // Edit allowed only for sender, within 1 hour, and for text-only messages
  const canEditMessage = useMemo(() => {
    if (!isSender || !onEditMessage) return false;
    const msgTime = new Date(message.timestamp).getTime();
    const oneHourAgo = now - 60 * 60 * 1000;
    if (msgTime < oneHourAgo) return false;
    if (message.voiceMessage?.type === 'voice') return false;
    const hasFileOrImage = /\.(jpeg|jpg|gif|png|pdf|doc|docx|ppt|pptx)(\?|$)/i.test(
      message.content,
    );
    if (hasFileOrImage) return false;
    return true;
  }, [isSender, message.timestamp, message.content, message.voiceMessage, onEditMessage, now]);

  const isGroupChat = useMemo(
    () => conversation.type === 'group',
    [conversation.type],
  );
  // In group chats, show sender name label; in 1:1 use participantDetails so avatar/name match header
  const showSenderName =
    isGroupChat && !isSender;
  const senderName = useMemo(
    () =>
      !isSender
        ? conversation.participantDetails?.[message.senderId]?.userName ||
        'Unknown User'
        : '',
    [conversation.participantDetails, isSender, message.senderId],
  );

  const senderAvatar = useMemo(
    () =>
      !isSender
        ? conversation.participantDetails?.[message.senderId]?.profilePic || ''
        : '',
    [conversation.participantDetails, isSender, message.senderId],
  );

  const sanitizedContent = useMemo(
    () =>
      DOMPurify.sanitize(message.content, {
        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
        ALLOWED_ATTR: ['href', 'rel', 'class'],
        FORBID_ATTR: ['style', 'target'],
        ALLOWED_URI_REGEXP: /^(https?:|mailto:)/i,
      }),
    [message.content],
  );

  const handleReportMessage = async () => {
    if (isReporting) return;

    try {
      setIsReporting(true);

      // Get sender info from conversation
      const senderInfo = conversation.participantDetails?.[message.senderId];
      const messageSenderEmail = senderInfo?.email;
      const messageSenderUserName = senderInfo?.userName;

      const reportData = {
        messageId: message.id,
        conversationId: conversation.id || '',
        messageSenderId: message.senderId,
        messageSenderEmail,
        messageSenderUserName,
        messageContent: message.content,
        messageTimestamp: message.timestamp,
      };

      const response = await apiHelperService.reportMessage(reportData);

      if (response.success) {
        toast({
          title: 'Message Reported',
          description:
            'The message has been reported and will be reviewed by an admin.',
        });
      } else {
        throw new Error(response.data?.message || 'Failed to report message');
      }
    } catch (error: any) {
      console.error('Error reporting message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to report message. Please try again.',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleCopyMessage = async () => {
    try {
      // Extract plain text from HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitizedContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      await navigator.clipboard.writeText(plainText);
      toast({
        title: 'Copied',
        description: 'Message copied to clipboard.',
      });
    } catch (error) {
      console.error('Error copying message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy message. Please try again.',
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (isDeleting || !onDeleteMessage) return;

    try {
      setIsDeleting(true);
      await onDeleteMessage(message.id);
      toast({
        title: 'Message deleted',
        description: 'Your message has been removed.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete message. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditMessage = () => {
    if (canEditMessage && onEditMessage) {
      onEditMessage(message.id, message.content);
    }
  };

  return (
    <div className="w-full" key={message.id}>
      {isNewDay && (
        <div className="w-full flex justify-center py-2">
          <span className="text-xs bg-[hsl(var(--muted))] dark:bg-[hsl(var(--secondary))] px-3 py-1 rounded-full text-[hsl(var(--muted-foreground))]">
            {formatDateHeader(message.timestamp)}
          </span>
        </div>
      )}
      <div
        id={message.id}
        className={cn(
          'flex items-start group w-full mb-2 gap-2',
          isSender ? 'justify-end' : 'justify-start',
        )}
        onMouseEnter={() => onHoverChange(message.id)}
        onMouseLeave={() => onHoverChange(null)}
      >
        {!isSender && (
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 rounded-full',
              // In group chats, always show avatar; in individual chats, only show for first in group
              isGroupChat ? '' : (!isFirstInGroup && 'invisible w-8 h-8'),
            )}
            onClick={() => {
              if (onOpenProfileSidebar) {
                onOpenProfileSidebar(message.senderId, 'user', {
                  userName: senderName,
                  profilePic: senderAvatar,
                });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onOpenProfileSidebar) {
                  onOpenProfileSidebar(message.senderId, 'user', {
                    userName: senderName,
                    profilePic: senderAvatar,
                  });
                }
              }
            }}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={senderAvatar} alt={senderName} />
              <AvatarFallback className="bg-sw-gradient dark:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
                {senderName ? senderName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div
          id={`message-${message.id}`}
          className={cn(
            'flex flex-col min-w-0',
            isSender ? 'items-end' : 'items-start',
            'max-w-[85%] sm:max-w-[65%]',
          )}
        >
          {isGroupChat && showSenderName && (
            <div className="mb-1 px-1">
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {senderName}
              </span>
            </div>
          )}

          <div
            className={cn(
              'flex max-w-full flex-col gap-1 text-sm',
              // Border radius by group position: first/middle/last in group
              // Simplified and consistent bubble shapes (WhatsApp-style)
              'rounded-lg', // Base rounded corners
              isSender ? 'rounded-tr-none' : 'rounded-tl-none', // Sharp corner for the "tail" side by default
              // If grouped (not first), round the corner that would have had the tail
              !isFirstInGroup && (isSender ? 'rounded-tr-lg' : 'rounded-tl-lg'),
              // If grouped (not last), keep the corner rounded (no special tail connection needed, handled by spacing)
              // Padding: 12px horizontal, 8px vertical (consistent spacing)
              'px-3 py-2',
              message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ||
                isEmojiOnly
                ? 'overflow-hidden'
                : 'overflow-visible',
              message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ||
                isEmojiOnly
                ? isSender
                  ? 'bg-transparent text-[hsl(var(--foreground))] dark:bg-transparent dark:text-[hsl(var(--foreground))]'
                  : 'bg-transparent text-[hsl(var(--foreground))] dark:bg-transparent dark:text-[hsl(var(--secondary-foreground))]'
                : isSender
                  ? 'bg-[hsl(var(--primary))]/15 dark:bg-[hsl(var(--primary))]/25 text-[hsl(var(--foreground))] dark:text-[hsl(var(--foreground))] relative min-w-0'
                  : 'bg-[hsl(var(--muted))] dark:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] dark:text-[hsl(var(--secondary-foreground))] relative min-w-0',
              message.status === 'failed' && 'border border-destructive/50',
            )}
            onClick={() => {
              if (message.replyTo) {
                const replyMessageElement = document.getElementById(
                  message.replyTo,
                );
                if (replyMessageElement) {
                  replyMessageElement.classList.add(
                    'ring-2',
                    'ring-primary',
                    'ring-offset-2',
                    'dark:ring-offset-gray-800',
                    'transition-all',
                    'duration-300',
                  );
                  replyMessageElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                  setTimeout(() => {
                    replyMessageElement.classList.remove(
                      'ring-2',
                      'ring-primary',
                      'ring-offset-2',
                      'dark:ring-offset-gray-800',
                    );
                  }, 2500);
                }
              }
            }}
          >
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="break-words w-full">
                    {message.replyTo && (
                      <div className="p-1.5 bg-primary/10 dark:bg-primary/40 rounded-md border-l-2 border-primary/60 dark:border-primary/70 mb-1.5 text-xs">
                        <div
                          className={cn(
                            'italic overflow-hidden whitespace-pre-wrap text-ellipsis max-h-[3em] line-clamp-2',
                            isSender
                              ? 'text-primary-foreground dark:text-primary-foreground'
                              : 'text-primary dark:text-primary',
                          )}
                        >
                          {(() => {
                            const replyMsg = messages.find(
                              (msg) => msg.id === message.replyTo,
                            );
                            if (!replyMsg) {
                              return (
                                <span className="font-medium">
                                  Original message
                                </span>
                              );
                            }

                            const raw = replyMsg.content || '';
                            const label = replyMsg.voiceMessage
                              ? 'Voice message'
                              : isImageUrl(raw)
                                ? 'Photo'
                                : isDocUrl(raw)
                                  ? 'Document'
                                  : getMessagePreviewLabel(
                                    raw,
                                    replyMsg.voiceMessage,
                                  )
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/&nbsp;/g, ' ')
                                    .trim();

                            return (
                              <div className="flex items-center gap-2 min-w-0">
                                {isImageUrl(raw) ? (
                                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                                    <Image
                                      src={raw}
                                      alt="Reply preview"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : null}
                                <span className="font-medium truncate">
                                  {label || 'Original message'}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ? (
                      <div
                        className="relative inline-block w-full cursor-pointer"
                        onClick={() => setModalImage(message.content)}
                      >
                        <Image
                          src={message.content || '/placeholder.svg'}
                          alt="Message Image"
                          width={300}
                          height={300}
                          className="rounded-md my-1 w-full object-contain"
                        />
                        <div className="absolute bottom-2 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center space-x-1">
                          <span>{formattedTimestamp}</span>
                        </div>
                      </div>
                    ) : message.content.match(
                      /\.(pdf|doc|docx|ppt|pptx)(\?|$)/i,
                    ) ? (
                      <div className="flex flex-col gap-1">
                        <FileAttachment
                          fileName={message.content.split('/').pop() || 'File'}
                          fileUrl={message.content}
                          fileType={message.content.split('.').pop() || 'file'}
                        />
                        <div
                          className={cn(
                            'text-[10px] leading-none text-[hsl(var(--muted-foreground))]',
                            isSender ? 'text-right' : 'text-left',
                          )}
                          aria-hidden
                        >
                          <span>{formattedTimestamp}</span>
                        </div>
                      </div>
                    ) : (
                      !message.voiceMessage &&
                      !message.content.match(
                        /\.(jpeg|jpg|gif|png|pdf|doc|docx|ppt|pptx)(\?|$)/i,
                      ) && (
                        <>
                          {isEmojiOnly ? (
                            <div
                              className={cn(
                                'w-full break-all overflow-wrap-anywhere',
                                'text-4xl leading-snug text-center break-normal',
                              )}
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                              dangerouslySetInnerHTML={{
                                __html: sanitizedContent,
                              }}
                            />
                          ) : (
                            <div className="flex flex-row items-end gap-2 w-full min-w-0">
                              <div
                                className={cn(
                                  'flex-1 min-w-0 break-all overflow-wrap-anywhere',
                                )}
                                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                dangerouslySetInnerHTML={{
                                  __html: sanitizedContent,
                                }}
                              />
                              <div
                                className="flex flex-shrink-0 items-center text-[10px] leading-none text-[hsl(var(--muted-foreground))] whitespace-nowrap"
                                aria-hidden
                              >
                                <span>{formattedTimestamp}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )
                    )}

                    {message.voiceMessage &&
                      message.voiceMessage.type === 'voice' && (
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <audio
                            ref={(el) => {
                              audioRefs.current[message.id] = el;
                              return undefined;
                            }}
                            src={message.content}
                            controls
                            preload="metadata"
                            className="h-8 w-full max-w-[240px] rounded-md"
                            onLoadedMetadata={() =>
                              handleLoadedMetadata(message.id)
                            }
                            onPlay={() => handlePlay(message.id)}
                          />
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))] whitespace-nowrap self-end mb-1">
                            {formattedTimestamp}
                          </span>
                        </div>
                      )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={5}
                  className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs p-1 rounded"
                >
                  <p>{readableTimestamp}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div
              className={cn(
                'flex items-center mt-0.5',
                'text-[10px] leading-none text-[hsl(var(--muted-foreground))]',
                isSender ? 'justify-end' : 'justify-start',
              )}
              aria-hidden
            >
              {isEmojiOnly &&
                (isSingleEmoji ? (
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] dark:bg-[hsl(var(--muted))]">
                    <span>{formattedTimestamp}</span>
                  </div>
                ) : (
                  <>
                    <span>{formattedTimestamp}</span>
                  </>
                ))}
            </div>
          </div>

          {Object.keys(message.reactions || {}).length > 0 && (
            <div
              className={cn(
                'flex items-center gap-0.5 mt-1',
                isSender ? 'justify-end' : 'justify-start',
              )}
            >
              <Reactions
                messageId={message.id}
                reactions={message.reactions || {}}
                toggleReaction={toggleReaction}
                alignRight={isSender}
              />
            </div>
          )}

          {/* Failed message state – wire to backend when send fails */}
          {isSender && message.status === 'failed' && (
            <div
              className={cn(
                'flex items-center gap-2 mt-1.5 px-2 py-1.5 rounded-md bg-destructive/10 border border-destructive/30',
                isSender ? 'justify-end' : 'justify-start',
              )}
            >
              <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" aria-hidden />
              <span className="text-xs text-destructive">Failed to send</span>
              {onRetryMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-xs text-destructive hover:bg-destructive/20"
                  onClick={async () => {
                    if (isRetrying) return;
                    try {
                      setIsRetrying(true);
                      await onRetryMessage(message.id);
                    } catch (err) {
                      console.error('Error retrying message:', err);
                      toast({
                        variant: 'destructive',
                        title: 'Retry failed',
                        description: 'Please try again.',
                      });
                    } finally {
                      setIsRetrying(false);
                    }
                  }}
                  disabled={isRetrying}
                  aria-label="Retry sending"
                >
                  <RefreshCw className="h-3 w-3 mr-0.5" />
                  Retry
                </Button>
              )}
              {onDeleteMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-xs text-destructive hover:bg-destructive/20"
                  onClick={() => handleDeleteMessage()}
                  disabled={isDeleting}
                  aria-label="Delete failed message"
                >
                  <Trash2 className="h-3 w-3 mr-0.5" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 relative z-10',
            isSender ? 'ml-2' : 'mr-2',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-0.5 rounded-full border shadow-md px-0.5',
              'bg-[hsl(var(--card))] border-[hsl(var(--border))]',
              'dark:bg-[hsl(var(--card))] dark:border-[hsl(var(--border))]',
              isSender ? 'ml-[-40px] mt-[-20px]' : 'ml-[-60px]',
            )}
          >
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex">
                    <EmojiPicker
                      aria-label="Add reaction"
                      onSelect={(emoji: string) => toggleReaction(message.id, emoji)}
                      className="mr-0 h-7 w-7 rounded-full text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] dark:text-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--accent))] dark:hover:text-[hsl(var(--primary))] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  React
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] dark:text-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--accent))] dark:hover:text-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-offset-2"
                    onClick={() => setReplyToMessageId(message.id)}
                    aria-label="Reply to message"
                  >
                    <Reply className="h-4 w-4" strokeWidth={2.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  Reply
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] dark:text-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--accent))] focus-visible:ring-2 focus-visible:ring-offset-2"
                        aria-label="Message options"
                      >
                        <MoreVertical className="h-4 w-4" strokeWidth={2} />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    More options
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-48 bg-[hsl(var(--popover))]">
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy message</span>
                </DropdownMenuItem>
                {pinnedMessage?.messageId === message.id && onUnpinMessage && (
                  <DropdownMenuItem onClick={() => onUnpinMessage()}>
                    <PinOff className="mr-2 h-4 w-4" />
                    <span>Unpin message</span>
                  </DropdownMenuItem>
                )}
                {pinnedMessage?.messageId !== message.id && onPinMessage && (
                  <DropdownMenuItem
                    onClick={() =>
                      onPinMessage(
                        message.id,
                        typeof message.content === 'string' ? message.content : '',
                      )
                    }
                  >
                    <Pin className="mr-2 h-4 w-4" />
                    <span>Pin message</span>
                  </DropdownMenuItem>
                )}
                {canEditMessage && (
                  <DropdownMenuItem onClick={handleEditMessage}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit message</span>
                  </DropdownMenuItem>
                )}
                {isSender && onDeleteMessage && (
                  <DropdownMenuItem
                    onClick={handleDeleteMessage}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete message'}</span>
                  </DropdownMenuItem>
                )}
                {!isSender && (
                  <DropdownMenuItem
                    onClick={handleReportMessage}
                    disabled={isReporting}
                    className="text-destructive focus:text-destructive"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report message</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  );
}

export default memo(ChatMessageItem);
