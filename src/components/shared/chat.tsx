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
import { Textarea } from '../ui/textarea';
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
}

export function CardsChat({ conversation }: CardsChatProps) {
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
  const [clickedMessageId, setClickedMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null); // state to track hovered message
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showFormattingOptions, setShowFormattingOptions] =
    useState<boolean>(false); // Toggle formatting options

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function sendMessage(
    conversation: Conversation,
    message: Partial<Message>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    replyTo?: string,
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
        console.log('Message sent with ID:', messageId);
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

  useEffect(() => {
    const fetchPrimaryUser = async () => {
      const primaryUid = conversation.participants.find(
        (participant: string) => participant !== user.uid,
      );

      if (primaryUid) {
        try {
          const response = await axiosInstance.get(`/freelancer/${primaryUid}`);
          setPrimaryUser(response.data);
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

    // Initialize the reactions object if it doesn't exist
    const updatedReactions = { ...currentMessage?.reactions };

    // Check if the user has already reacted with a different emoji
    const userHasReactedWithOtherEmoji = Object.keys(updatedReactions).some(
      (existingEmoji) =>
        existingEmoji !== emoji &&
        updatedReactions[existingEmoji]?.includes(user.uid),
    );

    // If the user has reacted with another emoji, remove it
    if (userHasReactedWithOtherEmoji) {
      Object.keys(updatedReactions).forEach((existingEmoji) => {
        if (
          existingEmoji !== emoji &&
          updatedReactions[existingEmoji]?.includes(user.uid)
        ) {
          updatedReactions[existingEmoji] = updatedReactions[
            existingEmoji
          ].filter((uid: any) => uid !== user.uid);
          if (updatedReactions[existingEmoji].length === 0) {
            delete updatedReactions[existingEmoji];
          }
        }
      });
    }

    // Toggle the current emoji reaction
    if (!updatedReactions[emoji]) {
      updatedReactions[emoji] = [];
    }

    // Add the user's UID to the reaction array
    updatedReactions[emoji].push(user.uid);

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
        <div className="flex justify-center items-center p-5 col-span-2">
          <LoaderCircle className="h-6 w-6 text-white animate-spin" />
        </div>
      ) : (
        <Card className="col-span-2 min-h-[85vh]  ">
          <CardHeader className="flex flex-row items-center border ">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={primaryUser.profilePic} alt="Image" />
                <AvatarFallback>{primaryUser.userName}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {primaryUser.userName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {primaryUser.email}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-6 pb-4">
            <div className="flex flex-col-reverse reverse space-y-4 overflow-y-auto h-[60vh]">
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
                        'flex w-max max-w-[50%] flex-col gap-1 rounded-lg px-3 py-2 text-sm shadow-sm',
                        message.senderId === user.uid
                          ? 'ml-auto bg-blue-100 text-black'
                          : 'bg-muted',
                      )}
                      onClick={() => {
                        setClickedMessageId(message.id); // Set the clicked message ID
                        if (message.replyTo) {
                          const replyMessage = messages.find(
                            (msg) => msg.id === message.replyTo,
                          );
                          if (replyMessage) {
                            const replyMessageElement = document.getElementById(
                              replyMessage.id,
                            );
                            if (replyMessageElement) {
                              // Add a very light gray highlight with transparency before scrolling
                              replyMessageElement.classList.add(
                                'bg-gray-200',
                                'border-2',
                                'border-gray-300',
                                'bg-opacity-50',
                              );

                              // Scroll to the referred message with smooth behavior
                              replyMessageElement.scrollIntoView({
                                behavior: 'smooth',
                              });

                              // Remove the highlight classes after 2 seconds
                              setTimeout(() => {
                                replyMessageElement.classList.remove(
                                  'bg-gray-200',
                                  'border-2',
                                  'border-gray-300',
                                  'bg-opacity-50',
                                );
                              }, 2000); // Highlight removed after 2 seconds
                            }
                          }
                        }
                      }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="break-words rounded-lg  w-full ">
                              {message.replyTo && (
                                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg border-l-4 border-gray-100 shadow-sm opacity-100 transition-opacity duration-300 max-w-2xl ">
                                  <div className="text-sm italic text-gray-400 bg-gray-100 overflow-hidden whitespace-pre-wrap text-ellipsis max-h-[3em] line-clamp-2 max-w-2xl">
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
                                  src={message.content}
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
                                // {/* <div className="break-words rounded-lg  w-full"> */}
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                // {/* </div> */}
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p>{readableTimestamp}</p>
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
                          'text-xs mt-1',
                          message.senderId === user.uid
                            ? 'text-gray-700'
                            : 'text-muted-foreground',
                        )}
                      >
                        {formattedTimestamp}
                      </div>
                    </div>

                    {hoveredMessageId === message.id && (
                      <Button
                        className="absolute  top-0 right-0 h-6 w-6 z-10 pointer-events-auto"
                        onClick={() => setReplyToMessageId(message.id)}
                        size="icon"
                        title="Reply"
                      >
                        <Reply className="h-4 w-4 " />
                      </Button>
                    )}

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

          <CardFooter>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (input.trim().length === 0) return;

                const newMessage: Partial<Message> = {
                  senderId: user.uid,
                  content: input,
                  timestamp: new Date().toISOString(),
                  replyTo: replyToMessageId || null,
                };

                sendMessage(
                  conversation,
                  newMessage,
                  setInput,
                  replyToMessageId,
                );
                setReplyToMessageId('');
              }}
              className="flex flex-col bg-primary-foreground shadow-md w-full border rounded-[10%] "
            >
              {/* Reply Preview Area */}
              {replyToMessageId && (
                <div className="flex items-center justify-between p-2 rounded-[10%] shadow-sm opacity-90 bg-muted transition-opacity duration-300 ">
                  <div className="text-sm italic text-gray-400 rounded-[10%] overflow-hidden whitespace-nowrap text-ellipsis max-w-full">
                    <span className="font-semibold">
                      {messages.find((msg) => msg.id === replyToMessageId)
                        ?.content || 'Message not found'}
                    </span>
                  </div>
                  <Button
                    onClick={() => setReplyToMessageId('')}
                    className="text-foreground hover:text-gray-500 bg-muted hover:bg-gray-600 h-6 rounded-full"
                    title="Cancel Reply"
                  >
                    <X className="h-4 w-4 text-foreground" />
                  </Button>
                </div>
              )}

              {/* Input area with dynamic height on reply */}
              <div className="h-20 flex items-center space-x-2 p-2 rounded-[10%] shadow-sm bg-primary-foreground ">
                <textarea
                  ref={textAreaRef}
                  className="flex-1 h-20 resize-none border-none hover:border-none p-2 text-foreground  bg-primary-foreground placeholder:text-gray-500  rounded-[10%]"
                  placeholder="Type your message..."
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim().length > 0) {
                        const newMessage: Partial<Message> = {
                          senderId: user.uid,
                          content: input,
                          timestamp: new Date().toISOString(),
                          replyTo: replyToMessageId,
                        };
                        sendMessage(
                          conversation,
                          newMessage,
                          setInput,
                          replyToMessageId,
                        );
                        setReplyToMessageId('');
                      }
                    }
                  }}
                />

                <div className="flex items-center space-x-2">
                  {/* Text Formatting Icon Button */}
                  {/* Text Formatting Icon Button */}
                  <Button
                    size="icon"
                    variant="outline"
                    title="Text Formatting"
                    className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
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
                        className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        onClick={handleitalics}
                        title="Italics"
                        className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        onClick={handleUnderline}
                        title="Underline"
                        className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    size="icon"
                    variant="outline"
                    title="Attach File"
                    className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
                    onClick={() => handleFileUpload()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    title="Send Video"
                    className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
                    onClick={handleCreateMeet}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  size="icon"
                  type="submit"
                  variant="outline"
                  disabled={inputLength === 0 || isSending}
                  className="text-foreground hover:text-foreground bg-primary-foreground border-none rounded-full"
                >
                  {isSending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
