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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
}: Props) {
  const formattedTimestamp = useMemo(() => formatChatTimestamp(message.timestamp), [message.timestamp]);
  const readableTimestamp = useMemo(() => formatDistanceToNow(new Date(message.timestamp)) + ' ago', [message.timestamp]);

  const prev = messages[index - 1];
  const isNewDay = useMemo(() => {
    return !prev || !isSameDay(new Date(prev.timestamp), new Date(message.timestamp));
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

  const isSender = useMemo(() => message.senderId === userId, [message.senderId, userId]);
  const isGroupChat = useMemo(() => conversation.type === 'group', [conversation.type]);
  const showSenderName = isGroupChat && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
  const senderName = useMemo(
    () => (isGroupChat && !isSender ? (conversation.participantDetails?.[message.senderId]?.userName || 'Unknown User') : ''),
    [conversation.participantDetails, isGroupChat, isSender, message.senderId]
  );

  const sanitizedContent = useMemo(
    () =>
      DOMPurify.sanitize(message.content, {
        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
      }),
    [message.content]
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
          <div className="flex-shrink-0 mr-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={conversation.participantDetails?.[message.senderId]?.profilePic}
                alt={conversation.participantDetails?.[message.senderId]?.userName}
              />
              <AvatarFallback className="bg-sw-gradient dark:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
                {senderName ? senderName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <div id={`message-${message.id}`} className={cn('flex flex-col', isSender ? 'items-end' : 'items-start', 'max-w-[80%]')}>
          {isGroupChat && showSenderName && !isSender && (
            <div className="mb-0.5">
              <span className="text-xs font-medium text-muted-foreground">{senderName}</span>
            </div>
          )}

          <div
            className={cn(
              'flex w-max max-w-full flex-col gap-1 rounded-lg p-2 text-sm shadow-xl',
              message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ||
                isEmojiOnly ||
                (message.voiceMessage && message.voiceMessage.type === 'voice')
                ? isSender
                  ? 'bg-transparent text-[hsl(var(--foreground))] dark:bg-transparent dark:text-gray-50 rounded-br-none'
                  : 'bg-transparent text-[hsl(var(--foreground))] dark:bg-transparent dark:text-[hsl(var(--secondary-foreground))] rounded-tl-none'
                : isSender
                  ? 'bg-muted-foreground/20 dark:bg-muted-foreground/20 dark:text-gray-50 rounded-br-none relative flex justify-center items-center pr-20 min-w-[180px]'
                  : 'bg-muted-foreground/20 dark:bg-muted-foreground/20 dark:text-[hsl(var(--secondary-foreground))] rounded-tl-none relative flex justify-center items-center pr-20 min-w-[180px]'
            )}
            onClick={() => {
              if (message.replyTo) {
                const replyMessageElement = document.getElementById(message.replyTo);
                if (replyMessageElement) {
                  replyMessageElement.classList.add(
                    'ring-2',
                    'ring-primary',
                    'ring-offset-2',
                    'dark:ring-offset-gray-800',
                    'transition-all',
                    'duration-300',
                  );
                  replyMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                            isSender ? 'text-primary-foreground dark:text-primary-foreground' : 'text-primary dark:text-primary',
                          )}
                        >
                          <span className="font-medium">
                            {messages.find((msg) => msg.id === message.replyTo)?.content.substring(0, 100) || 'Original message'}
                            {(messages.find((msg) => msg.id === message.replyTo)?.content?.length || 0) > 100 && '...'}
                          </span>
                        </div>
                      </div>
                    )}

                    {message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ? (
                      <div className="relative inline-block w-full cursor-pointer" onClick={() => setModalImage(message.content)}>
                        <Image
                          src={message.content || '/placeholder.svg'}
                          alt="Message Image"
                          width={300}
                          height={300}
                          className="rounded-md my-1 w-full object-contain"
                        />
                        <div className="absolute bottom-2 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded flex items-center space-x-1">
                          <span>{formattedTimestamp}</span>
                          {isSender && <CheckCheck className="w-3.5 h-3.5 ml-1" />}
                        </div>
                      </div>
                    ) : message.content.match(/\.(pdf|doc|docx|ppt|pptx)(\?|$)/i) ? (
                      <FileAttachment
                        fileName={message.content.split('/').pop() || 'File'}
                        fileUrl={message.content}
                        fileType={message.content.split('.').pop() || 'file'}
                      />
                    ) : (
                      !message.voiceMessage &&
                      !message.content.match(/\.(jpeg|jpg|gif|png|pdf|doc|docx|ppt|pptx)(\?|$)/i) && (
                        <>
                          <div
                            className={cn('w-full break-words', isEmojiOnly && 'text-4xl leading-snug text-center')}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
                              {isSender && <CheckCheck className="w-3.5 h-3.5" />}
                            </div>
                          )}
                        </>
                      )
                    )}

                    {message.voiceMessage && message.voiceMessage.type === 'voice' && (
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
                          onLoadedMetadata={() => handleLoadedMetadata(message.id)}
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
                <TooltipContent side="bottom" sideOffset={5} className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs p-1 rounded">
                  <p>{readableTimestamp}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="absolute -bottom-3 left-2 z-10">
              <Reactions messageId={message.id} reactions={message.reactions || {}} toggleReaction={toggleReaction} />
            </div>

            <div
              className={cn(
                'flex items-center text-xs mt-1',
                isSender ? 'text-[hsl(var(--foreground)_/_0.8)] dark:text-purple-500' : 'text-[hsl(var(--foreground)_/_0.8)] dark:text-[hsl(var(--muted-foreground))]',
                isSender ? 'justify-end' : 'justify-start',
              )}
            >
              {isEmojiOnly && (
                isSingleEmoji ? (
                  <div className="inline-flex items-center align-middle leading-none space-x-1 bg-[#c8a3ed] dark:bg-[#9966ccba] px-1.5 py-0.5 rounded text-[hsl(var(--foreground))]">
                    <span>{formattedTimestamp}</span>
                    {isSender && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                ) : (
                  <>
                    <span>{formattedTimestamp}</span>
                    {isSender && <CheckCheck className="w-3.5 h-3.5 ml-1" />}
                  </>
                )
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'flex items-start pt-2 opacity-0 group-hover:opacity-100 transition-opacity',
            isSender ? 'ml-2' : 'mr-2',
          )}
        >
          {!isSender && (
            <EmojiPicker
              aria-label="Add reaction"
              onSelect={(emoji: string) => toggleReaction(message.id, emoji)}
              className="mr-1"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 hover:bg-primary-hover/10 dark:hover:bg-primary-hover/20',
              isSender ? 'text-[hsl(var(--foreground)_/_0.8)] dark:text-purple-300' : 'text-[hsl(var(--muted-foreground))]',
            )}
            onClick={() => setReplyToMessageId(message.id)}
            aria-label="Reply to message"
          >
            <Reply className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  );
}

export default memo(ChatMessageItem);
