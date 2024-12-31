import * as React from 'react';
import { Send, LoaderCircle, Video, Upload, Reply, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { DocumentData } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

import { EmojiPicker } from '../emojiPicker';

import { Conversation } from './chatList';
import Reactions from './reactions';

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  subscribeToFirestoreCollection,
  updateConversationWithMessageTransaction,
  updateDataInFirestore,
} from '@/utils/common/firestoreUtils';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

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
  replyTo?: string;
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
          replyTo,
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

  async function handleDocumentUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      try {
        // const storageRef = firebase.storage().ref();
        // const fileRef = storageRef.child(`documents/${conversation.id}/${file.name}`);
        // await fileRef.put(file);
        // const fileUrl = await fileRef.getDownloadURL();
        // const message: Message = {
        //   senderId: user.uid,
        //   content: `📄 [${file.name}](${fileUrl})`,
        //   timestamp: new Date().toISOString(),
        // };
        // sendMessage(conversation, message, setInput);
      } catch (error) {
        console.error('Error uploading document:', error);
      }
    };

    fileInput.click();
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

  async function toggleReaction(messageId: string, emoji: string) {
    const currentMessage = messages.find((msg) => msg.id === messageId);
    const userHasReacted = currentMessage?.reactions?.[emoji]?.includes(
      user.uid,
    );

    const updatedReactions = { ...currentMessage?.reactions };
    if (userHasReacted) {
      updatedReactions[emoji] = updatedReactions[emoji].filter(
        (uid: any) => uid !== user.uid,
      );
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = [];
      }
      updatedReactions[emoji].push(user.uid);
    }

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
        <Card className="col-span-2 min-h-[85vh]">
          <CardHeader className="flex flex-row items-center">
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
                const readableTimestamp =
                  formatDistanceToNow(new Date(message.timestamp)) + ' ago';
                return (
                  <div
                    id={message.id}
                    key={index}
                    className="flex flex-row"
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {message.senderId !== user.uid && (
                      <Avatar key={index} className="w-8 h-8 mr-1 my-auto">
                        <AvatarImage
                          src={`https://api.adorable.io/avatars/285/${message.senderId}.png`}
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
                          ? 'ml-auto bg-primary text-primary-foreground'
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
                            <div className="break-words">
                              {message.replyTo && (
                                <div className="flex items-center justify-between p-2 bg-foreground rounded-lg border-l-4 border-primary shadow-sm opacity-100 transition-opacity duration-300">
                                  <div className="text-sm italic text-gray-400 bg-foreground ">
                                    <span className="font-semibold">
                                      {messages.find(
                                        (msg) => msg.id === message.replyTo,
                                      )?.content || 'Message not found'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div>{message.content}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p>{readableTimestamp}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {hoveredMessageId === message.id && (
                      <Button
                        className="h-6 w-6"
                        onClick={() => setReplyToMessageId(message.id)}
                        size="icon"
                        title="Reply"
                      >
                        <Reply className="h-4 w-4 " />
                      </Button>
                    )}
                    {message?.reactions &&
                      Object.keys(message.reactions).length > 0 && (
                        <div className="flex items-center gap-2">
                          <Reactions
                            messageId={message.id}
                            reactions={message.reactions}
                            toggleReaction={toggleReaction}
                          />
                        </div>
                      )}
                    {message.senderId !== user.uid && (
                      <EmojiPicker
                        onSelect={(emoji: any) =>
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
                  replyTo: replyToMessageId,
                };

                sendMessage(
                  conversation,
                  newMessage,
                  setInput,
                  replyToMessageId,
                );
                setReplyToMessageId('');
              }}
              className="flex flex-col bg-foreground  rounded-md shadow-md w-full"
            >
              {replyToMessageId && (
                <div className="flex items-center justify-between p-2 bg-foreground rounded-lg border-l-4 border-primary shadow-sm opacity-90 transition-opacity duration-300">
                  <div className="text-sm italic text-gray-400 ">
                    <span className="font-semibold">
                      {messages.find((msg) => msg.id === replyToMessageId)
                        ?.content || 'Message not found'}
                    </span>
                  </div>
                  <Button
                    onClick={() => setReplyToMessageId('')}
                    className="text-foreground hover:text-gray-500 bg-background h-6 "
                    title="Cancel Reply"
                  >
                    <X className="h-4 w-4 text-foreground " />
                  </Button>
                </div>
              )}

              {/* Input area with dynamic height on reply */}
              <div className="flex items-center space-x-2 p-2 rounded-lg shadow-sm bg-foreground border-l-4 border-primary">
                <textarea
                  className="w-full resize-none p-2 text-background outline-none bg-foreground placeholder:text-gray-500"
                  placeholder="Type your message..."
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Only send the message if Enter is pressed (not Shift + Enter)
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
                  <Button
                    size="icon"
                    variant="outline"
                    title="Attach File"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleDocumentUpload()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    title="Send Video"
                    className="text-gray-500 hover:text-gray-700"
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
                  className="text-gray-500 hover:text-gray-700"
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
