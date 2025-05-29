//chat.tsx
import * as React from 'react';
import {
  Send,
  LoaderCircle,
  Video,
  Upload,
  Reply,
  Text,
  X,
  Bold,
  Italic,
  Underline,
  CheckCheck,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { DocumentData } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  isThisYear,
} from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { EmojiPicker } from '../emojiPicker';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Input } from '@/components/ui/input';

import { Conversation } from './chatList';
import Reactions from './reactions';
import { FileAttachment } from './fileAttachment';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  subscribeToFirestoreCollection,
  updateConversationWithMessageTransaction,
  updateDataInFirestore,
} from '@/utils/common/firestoreUtils';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

function formatChatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, 'hh:mm a');
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'hh:mm a')}`;
  }

  if (isThisYear(date)) {
    return format(date, 'MMM dd, hh:mm a');
  }

  return format(date, 'yyyy MMM dd, hh:mm a');
}

type User = {
  userName: string;
  email: string;
  profilePic: string;
};

type MessageReaction = Record<string, string[]> | undefined;

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  replyTo?: string | null;
  reactions?: MessageReaction;
};

interface CardsChatProps {
  conversation: Conversation | null;
  conversations?: any;
  setActiveConversation?: any;
}

function getValidAvatarSrc(src: string | undefined) {
  if (!src) return '/default-avatar.png';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;
  return '/default-avatar.png';
}

const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function CardsChat({
  conversation,
  conversations,
  setActiveConversation,
}: CardsChatProps) {
  const [primaryUser, setPrimaryUser] = useState<User>({
    userName: '',
    email: '',
    profilePic: '',
  });

  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const inputLength = input.trim().length;
  const user = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string>('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showFormattingOptions, setShowFormattingOptions] =
    useState<boolean>(false);

  const prevMessagesLength = useRef(messages.length);
  const [openDrawer, setOpenDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpenDrawer(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPrimaryUser = async () => {
      const primaryUid = conversation?.participants?.find(
        (participant: string) => participant !== user.uid,
      );

      if (primaryUid) {
        try {
          const response = await axiosInstance.get(`/freelancer/${primaryUid}`);
          setPrimaryUser(response.data.data);
        } catch (error) {
          console.error('Error fetching primary user:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong.Please try again.',
          });
        }
      } else {
        setPrimaryUser({
          userName: 'Unknown User',
          email: '',
          profilePic: '',
        });
      }
    };
    let unsubscribeMessages: (() => void) | undefined;

    const fetchMessages = async () => {
      setLoading(true);
      if (conversation?.id) {
        unsubscribeMessages = subscribeToFirestoreCollection(
          `conversations/${conversation.id}/messages`,
          (messagesData) => {
            setMessages(messagesData);
            setLoading(false);
          },
          'desc',
        );
      } else {
        setMessages([]);
        setLoading(false);
      }
    };

    if (conversation) {
      fetchPrimaryUser();
      fetchMessages();
      inputRef.current?.focus();
    }

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [conversation?.id, user.uid]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  async function sendMessage(
    conversation: Conversation | null,
    message: Partial<Message>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    if (!conversation?.id) return;

    try {
      setIsSending(true);
      const datentime = new Date().toISOString();

      const messageId = await updateConversationWithMessageTransaction(
        'conversations',
        conversation.id,
        {
          ...message,
          timestamp: datentime,
          replyTo: replyToMessageId || null,
        },
        datentime,
      );

      if (messageId) {
        setInput('');
        setReplyToMessageId('');
        setIsSending(false);
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }

  if (!conversation) {
    return null;
  }

  async function handleFileUpload() {
    if (!conversation?.id) {
      console.log('handleFileUpload: No conversation ID, returning.');
      return;
    }
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    console.log('handleFileUpload: Created file input element.');

    fileInput.onchange = async () => {
      console.log('handleFileUpload: File input onchange triggered.');
      const file = fileInput.files?.[0];
      if (!file) {
        console.log('handleFileUpload: No file selected.');
        return;
      }

      console.log('handleFileUpload: File selected:', file.name);

      try {
        const formData = new FormData();
        formData.append('file', file);
        console.log('handleFileUpload: FormData created, appending file.');

        console.log('handleFileUpload: Making API call to /register/upload-image');
        const postFileResponse = await axiosInstance.post(
          '/register/upload-image',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );

        const fileUrl = postFileResponse.data.data.Location;
        console.log('handleFileUpload: File uploaded successfully, URL:', fileUrl);

        const message: Partial<Message> = {
          senderId: user.uid,
          content: fileUrl,
          timestamp: new Date().toISOString(),
        };

        console.log('handleFileUpload: Sending message with file URL.');
        sendMessage(conversation, message, setInput);
      } catch (error) {
        console.error('handleFileUpload: Error uploading file:', error);
      }
    };

    fileInput.click();
    console.log('handleFileUpload: Triggered file input click.');
  }

  async function handleCreateMeet() {
    if (!conversation?.participants) return;

    try {
      const response = await axiosInstance.post('/meeting', {
        participants: conversation.participants,
      });

      const meetLink = response.data.meetLink;
      const message: Partial<Message> = {
        senderId: user.uid,
        content: `🔗 Join the Meet: [Click here](${meetLink})`,
        timestamp: new Date().toISOString(),
      };

      sendMessage(conversation, message, setInput);
    } catch (error) {
      console.error('Error creating meet:', error);
    }
  }

  function handleBold() {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const { selectionStart, selectionEnd, value } = textarea;

      if (selectionStart === selectionEnd) return;

      const selectedText = value.slice(selectionStart, selectionEnd);
      const newText = `${value.slice(0, selectionStart)}**${selectedText}**${value.slice(selectionEnd)}`;

      setInput(newText);
      textarea.setSelectionRange(selectionStart + 2, selectionEnd + 2);
    }
  }

  const handleUnderline = () => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const { selectionStart, selectionEnd, value } = textarea;
      if (selectionStart === selectionEnd) return;

      const selectedText = value.slice(selectionStart, selectionEnd);
      const newText = `${value.slice(0, selectionStart)}__${selectedText}__${value.slice(selectionEnd)}`;

      setInput(newText);

      textarea.setSelectionRange(selectionStart + 2, selectionEnd + 2);
    }
  };

  function handleitalics() {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const { selectionStart, selectionEnd, value } = textarea;

      if (selectionStart === selectionEnd) return;

      const selectedText = value.slice(selectionStart, selectionEnd);
      const newText = `${value.slice(0, selectionStart)}*${selectedText}*${value.slice(selectionEnd)}`;

      setInput(newText);
      textarea.setSelectionRange(selectionStart + 1, selectionEnd + 1);
    }
  }

  const toggleFormattingOptions = () => {
    setShowFormattingOptions((prev) => !prev);
  };

  async function toggleReaction(messageId: string, emoji: string) {
    const currentMessage = messages.find((msg) => msg.id === messageId);
    const updatedReactions = { ...currentMessage?.reactions };

    const userReaction = Object.keys(updatedReactions).find((existingEmoji) =>
      updatedReactions[existingEmoji]?.includes(user.uid),
    );

    if (userReaction === emoji) {
      updatedReactions[emoji] = updatedReactions[emoji].filter(
        (uid: any) => uid !== user.uid,
      );

      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      if (userReaction) {
        updatedReactions[userReaction] = updatedReactions[userReaction].filter(
          (uid: any) => uid !== user.uid,
        );
        if (updatedReactions[userReaction].length === 0) {
          delete updatedReactions[userReaction];
        }
      }

      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = [];
      }
      updatedReactions[emoji].push(user.uid);
    }

    if (conversation?.id) {
      await updateDataInFirestore(
        `conversations/${conversation.id}/messages/`,
        messageId,
        {
          reactions: updatedReactions,
        },
      );
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#27272a] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={getValidAvatarSrc(primaryUser.profilePic)} alt={primaryUser.userName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">{primaryUser.userName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{primaryUser.userName}</h3>
            {primaryUser && (
              <p className="text-sm text-green-500 dark:text-green-400">Active</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse bg-white dark:bg-[#27272a]" ref={messagesEndRef}>
        {messages.map((message, index) => {
          const isOwn = message.senderId === user.uid;
          const messageTime = formatMessageTime(message.timestamp);
          const senderName = isOwn ? 'You' : primaryUser.userName;

          return (
            <div
              key={message.id}
              id={message.id}
              className={cn(
                "flex items-start space-x-3",
                isOwn && "flex-row-reverse space-x-reverse ml-auto",
                "w-full max-w-[90%] md:max-w-[70%] lg:max-w-[60%]",
              )}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {!isOwn && (conversation?.participants?.length || 0) > 1 && primaryUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={getValidAvatarSrc(primaryUser.profilePic)} alt={primaryUser.userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-medium">{primaryUser.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}

              <div className={cn(
                "flex flex-col",
                isOwn && "items-end",
                "relative",
              )}>
                <div className={cn(
                  "mb-1 text-xs text-gray-500 dark:text-gray-400",
                  isOwn && "text-right pr-2",
                )}>
                  <span className="font-medium">{senderName}</span>
                  <span className="ml-2">{messageTime}</span>
                </div>

                <div className={cn(
                  "rounded-2xl px-4 py-2 text-sm break-words",
                  isOwn
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-bl-md",
                      message.replyTo && "border-l-4 border-gray-400 dark:border-gray-500 pl-3",
                )}>
                  {message.replyTo && messages.find(msg => msg.id === message.replyTo) && (
                    <div className="text-xs italic text-gray-600 dark:text-gray-300 mb-1">
                       Replying to: {messages.find(msg => msg.id === message.replyTo)?.content?.substring(0, 50) + '...' || 'Message not found'}
                    </div>
                   )}

                  {message.content?.match(
                    /\.(jpeg|jpg|gif|png)$/,
                  ) ? (
                    <Image
                      src={message.content?.startsWith('... ') ? message.content.substring(4) : message.content || '/placeholder.svg'}
                      alt="Message Image"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  ) : message.content?.match(
                      /\.(pdf|doc|docx|ppt|pptx)$/,
                    ) ? (
                    <FileAttachment
                      fileName={
                        message.content.split('/').pop() || 'File'
                      }
                      fileUrl={message.content}
                      fileType={
                        message.content.split('.').pop() || 'file'
                      }
                    />
                  ) : (
                    <ReactMarkdown
                      className={cn(isOwn ? 'text-white' : 'text-gray-900 dark:text-gray-100')}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>

                 {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={cn("mt-1", isOwn ? "justify-end" : "justify-start", "flex")}>
                       <Reactions
                         messageId={message.id}
                         reactions={message.reactions || {}}
                         toggleReaction={toggleReaction}
                       />
                    </div>
                 )}

                 {isOwn && (
                    <div className="text-[10px] mt-1 text-gray-100 dark:text-gray-300 flex items-center gap-0.5 pr-2">
                       {formatChatTimestamp(message.timestamp)}
                       <CheckCheck className="w-3 h-3" />
                    </div>
                 )}

                 {hoveredMessageId === message.id && (
                    <Reply
                      className={cn(
                        "h-4 w-4 absolute cursor-pointer top-0 z-10 pointer-events-auto",
                        isOwn ? 'right-2 text-white' : '-left-5 text-black dark:text-white',
                      )}
                      onClick={() => setReplyToMessageId(message.id)}
                    />
                 )}

                 {!isOwn && (conversation?.participants?.length || 0) > 1 && (
                    <div className={cn("absolute top-0 z-10 pointer-events-auto", "-right-5")}>
                      <EmojiPicker
                         onSelect={(emoji: string) =>
                           toggleReaction(message.id, emoji)
                         }
                      />
                    </div>
                 )}

              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#27272a]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (input.trim().length === 0) return;

            const newMessage = {
              senderId: user.uid,
              content: input,
              timestamp: new Date().toISOString(),
              replyTo: replyToMessageId || null,
            };

            sendMessage(conversation, newMessage, setInput);
          }}
          className="flex flex-col w-full mb-0"
        >
          {replyToMessageId && (
            <div className="flex items-center justify-between p-2 rounded-lg shadow-sm opacity-90 bg-white dark:bg-[#2D2D2D] mb-2 border-l-4 border-gray-400 dark:border-gray-500 ">
              <div className="text-sm italic text-gray-600 dark:text-gray-300 overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
                <span className="font-semibold">
                  {messages
                    .find((msg) => msg.id === replyToMessageId)
                    ?.content?.replace(/\*/g, '') || 'Message not found'}
                </span>
              </div>
              <Button
                onClick={() => setReplyToMessageId('')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 h-6 rounded-full"
                title="Cancel Reply"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-3">
            <div className="sm:hidden">
              <button
                onClick={() => setOpenDrawer(!openDrawer)}
                className="p-2 text-gray-500 dark:text-gray-400"
              >
                <Text className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
              </button>
            </div>

            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg transition-transform duration-300 ${ openDrawer ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0' }`}
            >
              <div className="flex justify-around space-x-3">
                <button onClick={handleBold} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <Bold className="h-5 w-5" />
                </button>
                <button onClick={handleitalics} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <Italic className="h-5 w-5" />
                </button>
                <button onClick={handleUnderline} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <Underline className="h-5 w-5" />
                </button>
                <button onClick={handleFileUpload} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <Upload className="h-5 w-5" />
                </button>
                <button onClick={handleCreateMeet} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <Video className="h-5 w-5" />
                </button>
              </div>
            </div>

            <EmojiPicker onSelect={(emoji: string) => setInput(input + emoji)} />

            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:flex" onClick={handleFileUpload}>
              <Paperclip className="w-5 h-5" />
            </Button>

            <Input
              ref={inputRef}
              placeholder="Send a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   if (input.trim().length > 0) {
                     const newMessage = {
                       senderId: user.uid,
                       content: input,
                       timestamp: new Date().toISOString(),
                       replyTo: replyToMessageId || null,
                     };
                     sendMessage(conversation, newMessage, setInput);
                   }
                 }
               }}
              className="flex-1 border-none bg-transparent dark:bg-transparent focus:ring-0 focus:outline-none text-gray-900 dark:text-gray-100"
            />

              <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:flex">
                <Mic className="w-5 h-5" />
              </Button>
            
            <Button
              type="submit"
              disabled={!input.trim().length || isSending}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
