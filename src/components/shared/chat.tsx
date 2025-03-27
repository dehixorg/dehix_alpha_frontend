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
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { DocumentData } from 'firebase/firestore';
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
}

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
        <Card className="col-span-3 w-[92vw] mt-0 min-h-[70vh] border-white border-2 shadow-none">
          <CardHeader className="flex flex-row items-center  bg-[#F3F4F6] dark:bg-[#1A1D21] text-gray-800 dark:text-white p-2 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={primaryUser.profilePic} alt="Image" />
                <AvatarFallback>{primaryUser.userName}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none text-gray-800 dark:text-white">
                  {primaryUser.userName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {primaryUser.email}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-2 pb-2 pt-2 bg-[#E5E7EB] dark:bg-[#121417]">
            <div className="flex flex-col-reverse space-y-4 space-y-reverse overflow-y-auto h-[65vh] md:h-[58vh]">
              <div ref={messagesEndRef} />
              {messages.map((message, index) => {
                const formattedTimestamp = formatChatTimestamp(
                  message.timestamp,
                );
                const readableTimestamp =
                  formatDistanceToNow(new Date(message.timestamp)) + ' ago';

                return (
                  <div
                    id={message.id}
                    key={index}
                    className="flex flex-row relative"
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {message.senderId !== user.uid && (
                      <Avatar key={index} className="w-8 h-8 mr-1 my-auto">
                        <AvatarImage
                          src={primaryUser.profilePic}
                          alt={message.senderId}
                        />
                        <AvatarFallback>
                          {message.senderId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        'flex w-max max-w-[65%] flex-col gap-1 rounded-lg px-3 py-2 text-sm',
                        message.senderId === user.uid
                          ? 'ml-auto bg-[#28c24ed8] dark:bg-[#2A4D69] text-white dark:text-gray-200 rounded-tr-none'
                          : 'bg-[#F3F4F6] dark:bg-[#1E2D3D] text-black dark:text-gray-300 rounded-tl-none',
                      )}
                      onClick={() => {
                        if (message.replyTo) {
                          const replyMessage = messages.find(
                            (msg) => msg.id === message.replyTo,
                          );
                          if (replyMessage) {
                            const replyMessageElement =
                              document.getElementById(replyMessage.id);
                            if (replyMessageElement) {
                              replyMessageElement.classList.add(
                                'bg-gray-200',
                                'dark:bg-gray-600',
                                'border-2',
                                'border-gray-300',
                                'dark:border-gray-500',
                                'bg-opacity-50',
                                'dark:bg-opacity-50',
                              );

                              replyMessageElement.scrollIntoView({
                                behavior: 'smooth',
                              });

                              setTimeout(() => {
                                replyMessageElement.classList.remove(
                                  'bg-gray-200',
                                  'dark:bg-gray-600',
                                  'border-2',
                                  'border-gray-300',
                                  'dark:border-gray-500',
                                  'bg-opacity-50',
                                  'dark:bg-opacity-50',
                                );
                              }, 2000);
                            }
                          }
                        }
                      }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="break-words rounded-lg w-full">
                              {message.replyTo && (
                                <div className="flex items-center justify-between p-2 bg-gray-200 dark:bg-gray-600 rounded-lg border-l-4 border-gray-400 dark:border-gray-500 shadow-sm opacity-100 transition-opacity duration-300 max-w-2xl mb-1">
                                  <div className="text-sm italic text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 overflow-hidden whitespace-pre-wrap text-ellipsis max-h-[3em] line-clamp-2 max-w-2xl">
                                    <span className="font-semibold">
                                      {messages.find(
                                        (msg) => msg.id === message.replyTo,
                                      )?.content || 'Message not found'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {message.content.match(
                                /\.(jpeg|jpg|gif|png)$/,
                              ) ? (
                                <Image
                                  src={message.content || '/placeholder.svg'}
                                  alt="Message Image"
                                  width={300}
                                  height={300}
                                  className="rounded-lg"
                                />
                              ) : message.content.match(
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
                                <ReactMarkdown className="text-gray-800 dark:text-gray-100">
                                  {message.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="  p-1 rounded">
                              {readableTimestamp}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* Render reactions inside the message bubble */}
                      <Reactions
                        messageId={message.id}
                        reactions={message.reactions || {}}
                        toggleReaction={toggleReaction}
                      />

                      <div
                        className={cn(
                          'text-[10px] mt-1 text-right',
                          message.senderId === user.uid
                            ? 'text-gray-100 dark:text-gray-300 flex items-center gap-0.5'
                            : 'text-gray-500 dark:text-gray-400',
                        )}
                      >
                        {formattedTimestamp}
                        {message.senderId === user.uid && (
                          <span className="ml-1">
                            <CheckCheck className="w-4" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`relative ${message.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                      {hoveredMessageId === message.id && (
                        <Reply
                          className={`h-4 w-4 text-white absolute cursor-pointer top-0 z-10 pointer-events-auto 
        ${message.senderId === user.uid ? 'right-2' : '-left-5'}`}
                          onClick={() => setReplyToMessageId(message.id)}
                        />
                      )}
                    </div>


                    {message.senderId !== user.uid && (
                      <EmojiPicker
                        onSelect={(emoji: string) =>
                          toggleReaction(message.id, emoji)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-200 dark:bg-[#121417] rounded-b-lg p-2">
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
                setReplyToMessageId('');
              }}
              className="flex flex-col w-full mb-2"
            >
              {/* Reply Preview Area */}
              {replyToMessageId && (
                <div className="flex items-center justify-between p-2 rounded-lg shadow-sm opacity-90 bg-white dark:bg-[#2D2D2D] mb-2 border-l-4 border-gray-400 dark:border-gray-500 ">
                  <div className="text-sm italic text-gray-600 dark:text-gray-300 overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
                    <span className="font-semibold">
                      {messages
                        .find((msg) => msg.id === replyToMessageId)
                        ?.content.replace(/\*/g, '') || 'Message not found'}
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
              <div className="relative bg-[#D1D5DB] dark:bg-[#2A2E35] rounded-full border border-gray-300 dark:border-gray-600 p-1 flex items-center space-x-2">
                <div className="sm:hidden">
                  <button
                    onClick={() => setOpenDrawer(!openDrawer)}
                    className="p-2 text-gray-500 dark:text-gray-400"
                  >
                    <Text className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                  </button>
                </div>

                <div
                  className={`absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg transition-transform duration-300 ${openDrawer
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-5 opacity-0 pointer-events-none'
                    }`}
                >
                  <div className="flex justify-around space-x-3">
                    <button onClick={handleBold} className="p-2">
                      <Bold className="h-5 w-5" />
                    </button>
                    <button onClick={handleitalics} className="p-2">
                      <Italic className="h-5 w-5" />
                    </button>
                    <button onClick={handleUnderline} className="p-2">
                      <Underline className="h-5 w-5" />
                    </button>
                    <button onClick={handleFileUpload} className="p-2">
                      <Upload className="h-5 w-5" />
                    </button>
                    <button onClick={handleCreateMeet} className="p-2">
                      <Video className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Text Formatting"
                    className="group text-gray-500 hidden md:flex dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                    onClick={toggleFormattingOptions}
                  >
                    <Text className="h-4 w-4" />
                  </Button>

                  {showFormattingOptions && (
                    <div className="formatting-options">
                      <Button
                        size="icon"
                        type="button"
                        onClick={handleBold}
                        title="Bold"
                        className="group text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                      >
                        <Bold className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        onClick={handleitalics}
                        title="Italics"
                        className="group text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                      >
                        <Italic className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        onClick={handleUnderline}
                        title="Underline"
                        className="group text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                      >
                        <Underline className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Textarea */}
                <textarea
                  ref={textAreaRef}
                  className="w-full flex-1 h-10 max-h-32 resize-none border-none p-2 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-100 focus:outline-none"
                  placeholder="Type message"
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim().length > 0) {
                        setIsSending(true);
                        setTimeout(() => {
                          setInput('');
                          setIsSending(false);
                        }, 1000);
                      }
                    }
                  }}
                />
                <button
                  disabled={!input.trim().length || isSending}
                  className="p-2 flex md:hidden"
                >
                  {isSending ? (
                    <LoaderCircle className="h-5 w-5 animate-spin " />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
                {/* Attach & Send Buttons (Visible on md+) */}
                <div className="hidden sm:flex items-center space-x-2 pr-2">
                  <button onClick={handleFileUpload} className="p-2">
                    <Upload className="h-5 w-5" />
                  </button>
                  <button onClick={handleCreateMeet} className="p-2">
                    <Video className="h-5 w-5" />
                  </button>
                  <button
                    disabled={!input.trim().length || isSending}
                    className="p-2"
                  >
                    {isSending ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}

