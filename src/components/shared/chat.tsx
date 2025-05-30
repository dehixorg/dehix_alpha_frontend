//chat.tsx
import * as React from 'react';
import {
  Send,
  LoaderCircle,
  Video,
  Upload,
  Maximize2,
  Search,
  MoreVertical,
  Minimize2,
  Reply,
  Text,
  X,
  Bold,
  Italic,
  Underline,
  CheckCheck,
  Flag, // Added
  HelpCircle, // Added
  Flag,
  HelpCircle,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // Added
import ReactMarkdown from 'react-markdown'; // Import react-markdown to render markdown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added

import { Conversation } from './chatList';
import Reactions from './reactions';
import { FileAttachment } from './fileAttachment';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
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
    return format(date, 'hh:mm a'); // Example: "10:30 AM"
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'hh:mm a')}`; // Example: "Yesterday, 10:30 AM"
  }

  if (isThisYear(date)) {
    return format(date, 'MMM dd, hh:mm a'); // Example: "Oct 12, 10:30 AM"
  }

  return format(date, 'yyyy MMM dd, hh:mm a'); // Example: "2023 Oct 12, 10:30 AM"
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
  replyTo?: string | null; // Allow null
  reactions?: MessageReaction;
};

interface CardsChatProps {
  conversation: Conversation;
  conversations?: any;
  setActiveConversation?: any;
  isChatExpanded?: boolean; // Added
  onToggleExpand?: () => void; // Added
}

export function CardsChat({
  conversation,
  conversations,
  setActiveConversation,
  isChatExpanded,
  onToggleExpand,
}: CardsChatProps) {
  const router = useRouter(); // Added
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
  const [hoveredMessageId, setHoveredMessageId] = useState(null); // state to track hovered message
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showFormattingOptions, setShowFormattingOptions] =
    useState<boolean>(false); // Toggle formatting options

  const prevMessagesLength = useRef(messages.length);
  const [openDrawer, setOpenDrawer] = useState(false);

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
      const primaryUid = conversation.participants.find(
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
          }); // Error toast
        }
      }
    };
    let unsubscribeMessages: (() => void) | undefined;

    const fetchMessages = async () => {
      setLoading(true);
      unsubscribeMessages = subscribeToFirestoreCollection(
        `conversations/${conversation.id}/messages`,
        (messagesData) => {
          setMessages(messagesData);
          setLoading(false);
        },
        'desc',
      );
    };

    if (conversation) {
      fetchPrimaryUser();
      fetchMessages();
    }

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [conversation, user.uid]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  async function sendMessage(
    conversation: Conversation,
    message: Partial<Message>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    try {
      setIsSending(true);
      const datentime = new Date().toISOString();

      const messageId = await updateConversationWithMessageTransaction(
        'conversations',
        conversation?.id,
        {
          ...message,
          timestamp: datentime,
          replyTo: replyToMessageId || null,
        },
        datentime,
      );

      if (messageId) {
        setInput('');
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

  // Handle image upload
  async function handleFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; // Allows selection of any file type

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return; // Exit if no file is selected

      try {
        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file);

        // Post request to upload the file
        const postFileResponse = await axiosInstance.post(
          '/register/upload-image', // Endpoint that handles both files and images
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );

        // Assuming the response contains the URL of the uploaded file
        const fileUrl = postFileResponse.data.data.Location;

        // Prepare a message containing the file URL
        const message: Partial<Message> = {
          senderId: user.uid,
          content: fileUrl, // Use the file URL as the message content
          timestamp: new Date().toISOString(),
        };

        // Send the message with the file URL
        sendMessage(conversation, message, setInput);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };

    fileInput.click(); // Trigger file selection
  }

  async function handleCreateMeet() {
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

      if (selectionStart === selectionEnd) return; // No selection, do nothing

      const selectedText = value.slice(selectionStart, selectionEnd);
      const newText = `${value.slice(0, selectionStart)}**${selectedText}**${value.slice(selectionEnd)}`;

      // Update the state with the new text (including the bold markdown)
      setInput(newText);
      textarea.setSelectionRange(selectionStart + 2, selectionEnd + 2); // Adjust selection to include the bold syntax
    }
  }
  const handleUnderline = () => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const { selectionStart, selectionEnd, value } = textarea;
      if (selectionStart === selectionEnd) return; // No selection, do nothing

      // Apply the underline markdown syntax (__text__)
      const selectedText = value.slice(selectionStart, selectionEnd);
      const newText = `${value.slice(0, selectionStart)}__${selectedText}__${value.slice(selectionEnd)}`;

      // Update the state with the new text (including the underline markdown)
      setInput(newText);

      // Adjust the selection range to include the underline syntax
      textarea.setSelectionRange(selectionStart + 2, selectionEnd + 2); // Add 2 for the __ around the text
    }
  };

  function handleitalics() {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const { selectionStart, selectionEnd, value } = textarea;

      if (selectionStart === selectionEnd) return; // No selection, do nothing

      const selectedText = value.slice(selectionStart, selectionEnd);
      const newText = `${value.slice(0, selectionStart)}*${selectedText}*${value.slice(selectionEnd)}`;

      // Update the state with the new text (including the italic markdown)
      setInput(newText);
      textarea.setSelectionRange(selectionStart + 1, selectionEnd + 1); // Adjust selection to include the italic syntax
    }
  }
  const toggleFormattingOptions = () => {
    setShowFormattingOptions((prev) => !prev);
  };

  async function toggleReaction(messageId: string, emoji: string) {
    const currentMessage = messages.find((msg) => msg.id === messageId);
    const updatedReactions = { ...currentMessage?.reactions };

    // Check if the user has already reacted with a different emoji
    const userReaction = Object.keys(updatedReactions).find((existingEmoji) =>
      updatedReactions[existingEmoji]?.includes(user.uid),
    );

    // If the user is reacting with the same emoji, remove it (toggle off)
    if (userReaction === emoji) {
      updatedReactions[emoji] = updatedReactions[emoji].filter(
        (uid: any) => uid !== user.uid,
      );

      // Remove emoji key if no users remain
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      // Remove the previous reaction (if any)
      if (userReaction) {
        updatedReactions[userReaction] = updatedReactions[userReaction].filter(
          (uid: any) => uid !== user.uid,
        );
        if (updatedReactions[userReaction].length === 0) {
          delete updatedReactions[userReaction];
        }
      }

      // Add the new reaction
      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = [];
      }
      // Add the user's UID to the reaction array
      updatedReactions[emoji].push(user.uid);
    }

    // Update the Firestore database with the updated reactions
    await updateDataInFirestore(
      `conversations/${conversation.id}/messages/`,
      messageId,
      {
        reactions: updatedReactions,
      },
    );
  }

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center p-5 col-span-3">
          <LoaderCircle className="h-6 w-6 text-white animate-spin" />
        </div>
      ) : (
        <Card className="col-span-3 flex flex-col h-full bg-[hsl(var(--background))] shadow-lg dark:shadow-none border-none">
          <CardHeader className="flex flex-row items-center justify-between bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-3 border-b border-[hsl(var(--border))] shadow-md dark:shadow-none">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={primaryUser.profilePic} alt={primaryUser.userName || 'User'} />
                <AvatarFallback>{primaryUser.userName ? primaryUser.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold leading-none text-[hsl(var(--card-foreground))]">
                  {primaryUser.userName || conversation.project_name || 'Chat'}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {primaryUser.email || 'View participants'} {/* Or some other status */}
                </p>
              </div>
            </div>
            {/* Icons added here */}
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <Button variant="ghost" size="icon" aria-label="Search in chat" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Video call" onClick={handleCreateMeet} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={isChatExpanded ? "Collapse chat" : "Expand chat"} onClick={onToggleExpand} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                {isChatExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More options" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] border-[hsl(var(--border))]">
                  <DropdownMenuItem onSelect={() => console.log('Report option clicked')} className="hover:!bg-[hsl(var(--accent))] focus:!bg-[hsl(var(--accent))] text-[hsl(var(--popover-foreground))] focus:text-[hsl(var(--accent-foreground))]">
                    <Flag className="mr-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span>Report</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push('http://localhost:3000/settings/support')}
                    className="hover:!bg-[hsl(var(--accent))] focus:!bg-[hsl(var(--accent))] text-[hsl(var(--popover-foreground))] focus:text-[hsl(var(--accent-foreground))]">
                    <HelpCircle className="mr-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span>Help</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 bg-[hsl(var(--background))]">
            <div className="flex flex-col-reverse space-y-3 space-y-reverse">
              <div ref={messagesEndRef} />
              {messages.map((message, index) => {
                const formattedTimestamp = formatChatTimestamp(message.timestamp);
                const readableTimestamp = formatDistanceToNow(new Date(message.timestamp)) + ' ago';
                const isSender = message.senderId === user.uid;

                return (
                  <div
                    id={message.id}
                    key={index}
                    className={cn(
                      "flex flex-row items-start relative group",
                      isSender ? "justify-end" : "justify-start"
                    )}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {!isSender && (
                      <Avatar key={index} className="w-8 h-8 mr-2 mt-0.5 flex-shrink-0">
                        <AvatarImage src={primaryUser.profilePic} alt={message.senderId} />
                        <AvatarFallback>{primaryUser.userName ? primaryUser.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'flex w-max max-w-[70%] md:max-w-[60%] flex-col gap-1 rounded-2xl px-4 py-3 text-sm shadow-sm',
                        isSender
                          ? 'ml-auto bg-[hsl(var(--primary)_/_0.2)] text-blue-800 dark:bg-[hsl(var(--primary))] dark:text-gray-50 rounded-br-none'
                          : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-bl-none',
                      )}
                      onClick={() => {
                        if (message.replyTo) {
                          const replyMessageElement = document.getElementById(message.replyTo);
                          if (replyMessageElement) {
                            replyMessageElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-800', 'transition-all', 'duration-300');
                            replyMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => {
                              replyMessageElement.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-gray-800');
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
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md border-l-2 border-blue-400 dark:border-blue-500 mb-1.5 text-xs">
                                  <div className={cn("italic overflow-hidden whitespace-pre-wrap text-ellipsis max-h-[3em] line-clamp-2", isSender ? "text-blue-50 dark:text-blue-100" : "text-blue-600 dark:text-blue-300")}>
                                    <span className="font-medium">
                                      {messages.find(msg => msg.id === message.replyTo)?.content.substring(0,100) || 'Original message'}
                                      { (messages.find(msg => msg.id === message.replyTo)?.content?.length || 0) > 100 && "..."}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {message.content.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) ? (
                                <Image src={message.content || '/placeholder.svg'} alt="Message Image" width={300} height={300} className="rounded-md my-1" />
                              ) : message.content.match(/\.(pdf|doc|docx|ppt|pptx)(\?|$)/i) ? (
                                <FileAttachment fileName={message.content.split('/').pop() || 'File'} fileUrl={message.content} fileType={message.content.split('.').pop() || 'file'} />
                              ) : (
                                <ReactMarkdown className={cn("prose prose-sm dark:prose-invert max-w-none",
                                  isSender
                                    ? "text-blue-800 dark:text-gray-50"
                                    : "text-[hsl(var(--secondary-foreground))]"
                                )}>
                                  {message.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={5} className="bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] text-xs p-1 rounded">
                            <p>{readableTimestamp}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Reactions messageId={message.id} reactions={message.reactions || {}} toggleReaction={toggleReaction} isSender={isSender} />
                      <div className={cn('text-[10px] mt-1 text-right flex items-center',
                        isSender
                          ? 'text-blue-600 dark:text-gray-300'
                          : 'text-[hsl(var(--muted-foreground))] dark:text-[hsl(var(--muted-foreground))]',
                        isSender ? "justify-end" : "justify-start")}>
                        {formattedTimestamp}
                        {isSender && (
                          <span className="ml-1"><CheckCheck className="w-3.5 h-3.5" /></span>
                        )}
                      </div>
                    </div>
                    <div className={cn("relative opacity-0 group-hover:opacity-100 transition-opacity", isSender ? 'mr-1' : 'ml-1')}>
                      {!isSender && (
                         <EmojiPicker aria-label="Add reaction" onSelect={(emoji: string) => toggleReaction(message.id, emoji)} variant="iconButton" />
                      )}
                      <Button variant="ghost" size="icon"
                        className={cn("h-7 w-7 hover:bg-[hsl(var(--accent)_/_0.1)] dark:hover:bg-[hsl(var(--accent)_/_0.2)]",
                          isSender ? "text-blue-600 dark:text-gray-300"
                          : "text-[hsl(var(--muted-foreground))]"
                        )}
                        onClick={() => setReplyToMessageId(message.id)} aria-label="Reply to message">
                         <Reply className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="bg-[hsl(var(--card))] p-2 border-t border-[hsl(var(--border))] shadow-md dark:shadow-none">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (input.trim().length === 0) return;
                const newMessage = { senderId: user.uid, content: input, timestamp: new Date().toISOString(), replyTo: replyToMessageId || null };
                sendMessage(conversation, newMessage, setInput);
                setReplyToMessageId('');
              }}
              className="flex flex-col w-full space-y-2"
              aria-label="Message input form"
            >
              {replyToMessageId && (
                <div className="flex items-center justify-between p-2 rounded-md bg-[hsl(var(--accent))] border-l-2 border-[hsl(var(--primary))_/_0.7]">
                  <div className="text-xs italic text-[hsl(var(--muted-foreground))] overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
                    Replying to: <span className="font-semibold">{messages.find((msg) => msg.id === replyToMessageId)?.content.replace(/\*|__/g, '').substring(0,50) || 'Message'}...</span>
                  </div>
                  <Button onClick={() => setReplyToMessageId('')} variant="ghost" size="icon" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] h-6 w-6 rounded-full" aria-label="Cancel reply">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="relative flex items-center">
                <textarea
                  ref={textAreaRef}
                  aria-label="Type a message"
                  className="flex-1 resize-none border border-[hsl(var(--input))] rounded-lg p-2.5 pr-10 bg-[hsl(var(--input))] placeholder-[hsl(var(--muted-foreground))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))]"
                  placeholder="Type a message..."
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize textarea
                    if (textAreaRef.current) {
                      textAreaRef.current.style.height = 'auto';
                      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                      e.preventDefault();
                      if (input.trim().length > 0) {
                        const newMessage = { senderId: user.uid, content: input, timestamp: new Date().toISOString(), replyTo: replyToMessageId || null };
                        sendMessage(conversation, newMessage, setInput);
                        setReplyToMessageId('');
                        if (textAreaRef.current) textAreaRef.current.style.height = 'auto'; // Reset height
                      }
                    }
                  }}
                />
                <div className="absolute right-2.5 bottom-2.5 flex items-center space-x-1">
                  <Button type="submit" size="icon" variant="ghost" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)_/_0.8)] disabled:text-[hsl(var(--muted-foreground)_/_0.6)]" disabled={!input.trim().length || isSending} aria-label="Send message">
                    {isSending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                 {/* Formatting buttons for mobile, simplified for now */}
                 <Button type="button" variant="ghost" size="icon" onClick={handleBold} title="Bold" aria-label="Bold" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] md:hidden"> <Bold className="h-4 w-4" /> </Button>
                 <Button type="button" variant="ghost" size="icon" onClick={handleitalics} title="Italic" aria-label="Italic" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] md:hidden"> <Italic className="h-4 w-4" /> </Button>
                 <Button type="button" variant="ghost" size="icon" onClick={handleUnderline} title="Underline" aria-label="Underline" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] md:hidden"> <Underline className="h-4 w-4" /> </Button>

                 {/* Desktop Formatting Options Toggle */}
                 <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" onClick={toggleFormattingOptions} title="Formatting options" aria-label="Formatting options" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hidden md:inline-flex"> <Text className="h-4 w-4" /> </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Formatting</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>

                {showFormattingOptions && (
                    <div className="hidden md:flex items-center space-x-1 bg-[hsl(var(--accent))] p-1 rounded-md">
                      <Button type="button" variant="ghost" size="icon" onClick={handleBold} title="Bold" aria-label="Bold" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"> <Bold className="h-4 w-4" /> </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={handleitalics} title="Italic" aria-label="Italic" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"> <Italic className="h-4 w-4" /> </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={handleUnderline} title="Underline" aria-label="Underline" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"> <Underline className="h-4 w-4" /> </Button>
                    </div>
                )}
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" onClick={handleFileUpload} title="Upload file" aria-label="Upload file" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"> <Upload className="h-4 w-4" /> </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Upload file</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" onClick={handleCreateMeet} title="Create Google Meet" aria-label="Create Google Meet" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"> <Video className="h-4 w-4" /> </Button>
                        </TooltipTrigger>
                         <TooltipContent side="top"><p>Create Google Meet</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 <div className="ml-auto md:hidden"> {/* Send button for mobile, already handled by textarea's absolute send button */}
                 </div>
              </div>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
