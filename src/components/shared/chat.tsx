import * as React from 'react';
import { Send, LoaderCircle } from 'lucide-react'; // Import LoaderCircle for the spinner
import { useSelector } from 'react-redux';
import { DocumentData } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns'; // Import for human-readable timestamps

import { Conversation } from './chatList';

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
} from '@/utils/common/firestoreUtils';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

type User = {
  userName: string;
  email: string;
  profilePic: string;
};

type Message = {
  senderId: string;
  content: string;
  timestamp: string;
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
    message: Message,
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

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center p-5 col-span-2">
          <LoaderCircle className="h-6 w-6 text-white animate-spin" />
        </div>
      ) : (
        <Card className="col-span-2">
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
          <CardContent className="flex-1 overflow-y-auto mb-5">
            {/* Show loading spinner while fetching data */}
            <div className="space-y-4 max-h-screen">
              {messages.map((message, index) => {
                const readableTimestamp =
                  formatDistanceToNow(new Date(message.timestamp)) + ' ago';

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                      message.senderId === user.uid
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    {/* Tooltip for human-readable timestamp */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center break-words whitespace-normal">
                            {message.content}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={10}>
                          <p>{readableTimestamp}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

                const newMessage: Message = {
                  senderId: user.uid,
                  content: input,
                  timestamp: new Date().toISOString(),
                };

                // Use the sendMessage function
                sendMessage(conversation, newMessage, setInput);
              }}
              className="flex w-full items-center space-x-2"
            >
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
                {/* Show spinner when the button is in loading state */}
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
