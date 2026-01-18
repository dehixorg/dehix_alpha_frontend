'use client';

/* eslint-disable prettier/prettier */
import React, { RefObject, useMemo, memo } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { formatDistanceToNow, format } from 'date-fns';
import { CheckCheck, Reply } from 'lucide-react';

import { EmojiPicker } from '../emojiPicker';

import Reactions from './reactions';
import { FileAttachment } from './fileAttachment';
import { Conversation } from './chatList';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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
}: Props) {
  const formattedTimestamp = useMemo(
    () => formatChatTimestamp(message.timestamp),
    [message.timestamp],
  );
  const readableTimestamp = useMemo(
    () => formatDistanceToNow(new Date(message.timestamp)) + ' ago',
    [message.timestamp],
  );

  const prev = messages[index - 1];
  const isNewDay = useMemo(() => {
    return (
      !prev || !isSameDay(new Date(prev.timestamp), new Date(message.timestamp))
    );
  }, [prev, message.timestamp]);
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
  const isGroupChat = useMemo(
    () => conversation.type === 'group',
    [conversation.type],
  );
  const showSenderName =
    isGroupChat &&
    (index === 0 || messages[index - 1]?.senderId !== message.senderId);
  const senderName = useMemo(
    () =>
      isGroupChat && !isSender
        ? conversation.participantDetails?.[message.senderId]?.userName ||
          'Unknown User'
        : '',
    [conversation.participantDetails, isGroupChat, isSender, message.senderId],
  );

  const senderAvatar = useMemo(
    () =>
      isGroupChat && !isSender
        ? conversation.participantDetails?.[message.senderId]?.profilePic || ''
        : '',
    [conversation.participantDetails, isGroupChat, isSender, message.senderId],
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

  return (
    <div className="w-full" key={message.id}>
      {isNewDay && (
        <div className="w-full flex justify-center my-2">
          <span className="text-xs bg-[hsl(var(--muted))] dark:bg-[hsl(var(--secondary))] px-3 py-0.5 rounded-full text-[hsl(var(--muted-foreground))]">
            {formatDateHeader(message.timestamp)}
          </span>
        </div>
      )}
      <div
        id={message.id}
        className={cn(
          'flex items-start group w-full mb-2',
          isSender ? 'justify-end' : 'justify-start',
        )}
        onMouseEnter={() => onHoverChange(message.id)}
        onMouseLeave={() => onHoverChange(null)}
      >
        {!isSender && (
          <div
            role="button"
            tabIndex={0}
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
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
            'flex flex-col',
            isSender ? 'items-end' : 'items-start',
            'max-w-[80%]',
          )}
        >
          {isGroupChat && showSenderName && !isSender && (
            <div className="mb-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                {senderName}
              </span>
            </div>
          )}

          <div
            className={cn(
              'flex w-max max-w-full flex-col gap-1 rounded-lg p-2 text-sm',
              message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ||
                isEmojiOnly ||
                (message.voiceMessage && message.voiceMessage.type === 'voice')
                ? isSender
                  ? 'bg-transparent text-[hsl(var(--foreground))] dark:bg-transparent dark:text-gray-50 rounded-br-none'
                  : 'bg-transparent text-[hsl(var(--foreground))] dark:bg-transparent dark:text-[hsl(var(--secondary-foreground))] rounded-tl-none'
                : isSender
                  ? 'bg-muted-foreground/20 dark:bg-muted-foreground/20 dark:text-gray-50 rounded-br-none relative flex justify-center items-center pr-20 min-w-[180px]'
                  : 'bg-muted-foreground/20 dark:bg-muted-foreground/20 dark:text-[hsl(var(--secondary-foreground))] rounded-tl-none relative flex justify-center items-center pr-20 min-w-[180px]',
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
                          {isSender && (
                            <CheckCheck className="w-3.5 h-3.5 ml-1" />
                          )}
                        </div>
                      </div>
                    ) : message.content.match(
                        /\.(pdf|doc|docx|ppt|pptx)(\?|$)/i,
                      ) ? (
                      <FileAttachment
                        fileName={message.content.split('/').pop() || 'File'}
                        fileUrl={message.content}
                        fileType={message.content.split('.').pop() || 'file'}
                      />
                    ) : (
                      !message.voiceMessage &&
                      !message.content.match(
                        /\.(jpeg|jpg|gif|png|pdf|doc|docx|ppt|pptx)(\?|$)/i,
                      ) && (
                        <>
                          <div
                            className={cn(
                              'w-full break-words',
                              isEmojiOnly &&
                                'text-4xl leading-snug text-center',
                            )}
                            dangerouslySetInnerHTML={{
                              __html: sanitizedContent,
                            }}
                          />
                          {!isEmojiOnly && (
                            <div
                              className={cn(
                                'absolute bottom-1 right-2 text-xs flex items-center space-x-1',
                                isSender
                                  ? 'text-[hsl(var(--foreground)_/_0.8)] dark:text-purple-300'
                                  : 'text-[hsl(var(--foreground)_/_0.8)] dark:text-[hsl(var(--muted-foreground))]',
                              )}
                            >
                              <span>{formattedTimestamp}</span>
                              {isSender && (
                                <CheckCheck className="w-3.5 h-3.5" />
                              )}
                            </div>
                          )}
                        </>
                      )
                    )}

                    {message.voiceMessage &&
                      message.voiceMessage.type === 'voice' && (
                        <div className="mt-2 flex items-center space-x-2 max-w-full">
                          <audio
                            ref={(el) => {
                              audioRefs.current[message.id] = el;
                              return undefined;
                            }}
                            src={message.content}
                            controls
                            preload="metadata"
                            className="h-10 w-40 sm:w-44 md:w-56 lg:w-64 rounded-md"
                            onLoadedMetadata={() =>
                              handleLoadedMetadata(message.id)
                            }
                            onPlay={() => handlePlay(message.id)}
                          />
                          <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap flex items-center min-w-[48px] justify-end">
                            {formattedTimestamp}
                            {isSender && (
                              <CheckCheck className="w-3.5 h-3.5 ml-1 align-middle text-[hsl(var(--foreground)_/_0.8)] dark:text-purple-300" />
                            )}
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

            <div className="absolute -bottom-3 left-2 z-10">
              <Reactions
                messageId={message.id}
                reactions={message.reactions || {}}
                toggleReaction={toggleReaction}
              />
            </div>

            <div
              className={cn(
                'flex items-center text-xs mt-1',
                isSender
                  ? 'text-[hsl(var(--foreground)_/_0.8)] dark:text-purple-500'
                  : 'text-[hsl(var(--foreground)_/_0.8)] dark:text-[hsl(var(--muted-foreground))]',
                isSender ? 'justify-end' : 'justify-start',
              )}
            >
              {isEmojiOnly &&
                (isSingleEmoji ? (
                  <div className="inline-flex items-center align-middle leading-none space-x-1 bg-[#c8a3ed] dark:bg-[#9966ccba] px-1.5 py-0.5 rounded text-[hsl(var(--foreground))]">
                    <span>{formattedTimestamp}</span>
                    {isSender && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                ) : (
                  <>
                    <span>{formattedTimestamp}</span>
                    {isSender && <CheckCheck className="w-3.5 h-3.5 ml-1" />}
                  </>
                ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-200',
            isSender ? 'ml-2' : 'mr-2',
          )}
        >
          <div
            className={cn(
              'flex items-center rounded-full border shadow-sm backdrop-blur-sm',
              'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]',
              'dark:bg-[hsl(var(--accent)_/_0.15)] dark:text-[hsl(var(--accent-foreground))]',
              isSender ? 'ml-[-40px] mt-[-20px]' : 'ml-[-60px]',
            )}
          >
            {!isSender && (
              <EmojiPicker
                aria-label="Add reaction"
                onSelect={(emoji: string) => toggleReaction(message.id, emoji)}
                className="mr-0"
              />
            )}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-7 w-7 hover:bg-primary-hover/10 dark:hover:bg-primary-hover/20 focus-visible:ring-2 focus-visible:ring-offset-2',
                      isSender
                        ? 'text-[hsl(var(--foreground)_/_0.85)] dark:text-purple-300'
                        : 'text-[hsl(var(--muted-foreground))]',
                    )}
                    onClick={() => setReplyToMessageId(message.id)}
                    aria-label="Reply to message"
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  Reply
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  );
}

export default memo(ChatMessageItem);
