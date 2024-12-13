import * as React from 'react';
import { Send, LoaderCircle, Video, Upload } from 'lucide-react'; // Import LoaderCircle for the spinner
import { useSelector } from 'react-redux';
import { DocumentData } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns'; // Import for human-readable timestamps

import { EmojiPicker } from '../emojiPicker';

import { Conversation } from './chatList';
import Reactions from './reactions';

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'; // Import Tooltip components
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
  addDataToFirestore,
  subscribeToFirestoreCollection,
  updateDataInFirestore,
} from '@/utils/common/firestoreUtils';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

type User = {
  userName: string;
  email: string;
  profilePic: string;
};

// Define the types for reactions and messages
type MessageReaction = Record<string, string[]> | undefined; // Maps emoji to user IDs

// Firestore document structure might look different, but we'll convert it to Message
type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions?: MessageReaction; // Optional reactions property
};

interface CardsChatProps {
  conversation: Conversation;
}

export function CardsChat({ conversation }: CardsChatProps) {
  const [primaryUser, setPrimaryUser] = React.useState<User>({
    userName: '',
    email: '',
    profilePic: '',
  });
  const [messages, setMessages] = React.useState<DocumentData[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true); // Loading state for data fetch
  const [isSending, setIsSending] = React.useState(false); // Loading state for message sending
  const inputLength = input.trim().length;
  const user = useSelector((state: RootState) => state.user);

  // Function to send a message
  async function sendMessage(
    conversation: Conversation,
    message: Partial<Message>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    try {
      setIsSending(true); // Set loading state to true when sending a message
      const datentime = new Date().toISOString();

      // Add the message to Firestore
      const messageId = await addDataToFirestore(
        `conversations/${conversation?.id}/messages`, // Updated to sub-collection messages
        {
          ...message,
          timestamp: datentime, // Include a timestamp
        },
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
      setIsSending(false); // Set loading state to false after sending
    }
  }

  React.useEffect(() => {
    const fetchPrimaryUser = async () => {
      const primaryUid = conversation.participants.find(
        (participant: string) => participant !== user.uid,
      );

      if (primaryUid) {
        try {
          const response = await axiosInstance.get(`/freelancer/${primaryUid}`);
          setPrimaryUser(response.data);
          console.log('Conversation data:', conversation);
          console.log('Primary User:', response.data);
        } catch (error) {
          console.error('Error fetching primary user:', error);
        }
      }
    };
    let unsubscribeMessages: (() => void) | undefined;

    const fetchMessages = async () => {
      setLoading(true); // Set loading to true when fetching messages
      unsubscribeMessages = subscribeToFirestoreCollection(
        `conversations/${conversation.id}/messages`, // Sub-collection for messages
        (messagesData) => {
          setMessages(messagesData); // Update messages state with fetched messages
          setLoading(false); // Set loading to false after messages are loaded
        },
      );
    };

    if (conversation) {
      fetchPrimaryUser();
      fetchMessages();
    }

    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [conversation, user.uid]);

  // Return early if the conversation is undefined or null
  if (!conversation) {
    return null; // Don't display anything
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

    // Check if the user already reacted with this emoji
    const userHasReacted = currentMessage?.reactions?.[emoji]?.includes(
      user.uid,
    );

    // Prepare the update for Firestore
    const updatedReactions = { ...currentMessage?.reactions };
    if (userHasReacted) {
      // Remove user reaction
      updatedReactions[emoji] = updatedReactions[emoji].filter(
        (uid: any) => uid !== user.uid,
      );
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      // Add user reaction
      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = [];
      }
      updatedReactions[emoji].push(user.uid);
    }
    // Update message in Firestore
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
        <Card className="col-span-2 max-h-[85vh]">
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
            {/* Scrollable messages container */}
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Show loading spinner while fetching data */}
              {messages.map((message, index) => {
                const readableTimestamp =
                  formatDistanceToNow(new Date(message.timestamp)) + ' ago';

                return (
                  <div key={index} className="flex flex-row">
                    <div
                      className={cn(
                        'flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm shadow-sm',
                        message.senderId === user.uid
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'bg-muted',
                      )}
                    >
                      {/* Tooltip for human-readable timestamp */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="break-words">{message.content}</div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p>{readableTimestamp}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Reactions Section */}
                    {message?.reactions &&
                      Object.keys(message.reactions).length > 0 && (
                        <div className="flex items-center gap-2">
                          {/* Display existing reactions */}
                          <Reactions
                            messageId={message.id} // Pass in the message object
                            reactions={message.reactions}
                            toggleReaction={toggleReaction} // Pass in the toggle function
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
                if (inputLength === 0) return;

                const newMessage: Partial<Message> = {
                  senderId: user.uid,
                  content: input,
                  timestamp: new Date().toISOString(),
                };

                sendMessage(conversation, newMessage, setInput);
              }}
              className="flex w-full items-center space-x-2"
            >
              <div className="flex items-center space-x-2">
                {/* Upload Document Button */}
                <Button
                  size="icon"
                  onClick={() => handleDocumentUpload()}
                  title="Send a Document"
                >
                  <Upload className="h-4 w-4" />
                </Button>

                {/* Create Meet Button */}
                <Button
                  size="icon"
                  onClick={() => handleCreateMeet()}
                  title="Create a Meet"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>

              <Input
                id="message"
                placeholder="Type your message..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                disabled={inputLength === 0 || isSending}
              >
                {isSending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
