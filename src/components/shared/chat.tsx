import * as React from 'react';
import { Send } from 'lucide-react';
import { useSelector } from 'react-redux';

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
  subscribeToFirestoreDoc,
} from '@/utils/common/firestoreUtils';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

type User = {
  userName: string;
  email: string;
  avatar: string;
};

type Message = {
  role: 'user' | 'agent';
  content: string;
};

interface CardsChatProps {
  initialMessages?: Message[];
  conversationId: string;
}

export function CardsChat({
  initialMessages = [],
  conversationId,
}: CardsChatProps) {
  const [primaryUser, setPrimaryUser] = React.useState<User>({
    userName: '',
    email: '',
    avatar: '',
  });
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [input, setInput] = React.useState('');
  const inputLength = input.trim().length;
  const user = useSelector((state: RootState) => state.user);

  async function sendMessage(
    conversationId: string,
    message: Message,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    try {
      const datentime = new Date().toISOString();
      const dateOnly = datentime.split('T')[0]; // Extract the date portion (YYYY-MM-DD)

      // Add the message to Firestore
      const messageId = await addDataToFirestore(
        `conversations/${conversationId}/${dateOnly}`, // Firestore sub-collection path with date
        {
          ...message,
          timestamp: datentime, // Include a timestamp
        },
      );

      if (messageId) {
        console.log('Message sent with ID:', messageId);

        // Optimistically update the local state
        setMessages((prevMessages) => [...prevMessages, message]);
        setInput('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchData = async () => {
      unsubscribe = subscribeToFirestoreDoc(
        'conversations',
        conversationId,
        async (data) => {
          if (data) {
            // Identify the primary UID (the other participant)
            const primaryUid = data.participants.find(
              (participant: string) => participant !== user.uid,
            );

            if (primaryUid) {
              try {
                const response = await axiosInstance.get(
                  `/freelancer/${primaryUid}`,
                );
                setPrimaryUser(response.data);
                console.log('Conversation data:', data);
                console.log('Primary User:', response.data);
              } catch (error) {
                console.error('Error fetching primary user:', error);
              }
            }
          }
        },
      );
    };

    fetchData();

    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [conversationId, user.uid]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={primaryUser.avatar} alt="Image" />
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
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted',
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputLength === 0) return;

              const newMessage: Message = {
                role: 'user',
                content: input,
              };

              // Use the sendMessage function
              sendMessage(conversationId, newMessage, setMessages, setInput);
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
            <Button type="submit" size="icon" disabled={inputLength === 0}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </>
  );
}
