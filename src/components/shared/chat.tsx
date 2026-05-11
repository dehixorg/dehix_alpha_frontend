/* eslint-disable prettier/prettier */
//chat.tsx
import * as React from 'react';
import {
  Video,
  Maximize2,
  Search,
  MoreVertical,
  Minimize2,
  X,
  ArchiveRestore,
  Archive,
  ArrowLeft,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { doc, DocumentData, updateDoc } from 'firebase/firestore';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

import { Conversation } from './chatList'; // Assuming Conversation type includes 'type' field
import ChatMessageItem from './ChatMessageItem';
import { ChatComposer } from './ChatComposer';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  subscribeToFirestoreCollection,
  updateConversationWithMessageTransaction,
  updateDataInFirestore,
} from '@/utils/common/firestoreUtils';
import { RootState } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { uploadFileViaSignedUrl } from '@/services/imageSignedUpload';
import { db } from '@/config/firebaseConfig';

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler); // cleanup on value change or unmount
    };
  }, [value, delay]); // Add [value, delay] as dependencies

  return debouncedValue;
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
  voiceMessage?: {
    duration: number;
    type: 'voice';
  };
};

interface CardsChatProps {
  conversation: Conversation;
  conversations?: any;
  setActiveConversation?: any;
  isChatExpanded?: boolean;
  onToggleExpand?: () => void;
  onOpenProfileSidebar?: (
    id: string,
    type: 'user' | 'group',
    initialDetails?: { userName?: string; email?: string; profilePic?: string },
  ) => void;
  onConversationUpdate?: (updatedConversation: Conversation) => void;
  onBack?: () => void;
}

export function CardsChat({
  conversation,
  isChatExpanded,
  onToggleExpand,
  onOpenProfileSidebar,
  onConversationUpdate,
  onBack,
}: CardsChatProps) {
  const { toast } = useToast();
  const [primaryUser, setPrimaryUser] = useState<User>({
    userName: '',
    email: '',
    profilePic: '',
  });

  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 500); /* wait for .5 sec */
  const [messagesCache, setMessagesCache] = useState<Record<string, DocumentData[]>>({});
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({});
  const messages = messagesCache[conversation?.id || ''] || [];
  const loading = conversation?.id ? !cacheStatus[conversation.id] : false;
  const [isSending, setIsSending] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string>('');
  const [, setHoveredMessageId] = useState<string | null>(null);

  const prevMessagesLength = useRef(messages.length);
  const [, setOpenDrawer] = useState(false);

  // === OPTIMIZATION: Create messageById map for O(1) lookups ===
  const messageById = React.useMemo(() => {
    const map = new Map<string, DocumentData>();
    messages.forEach((msg) => {
      map.set(msg.id, msg);
    });
    return map;
  }, [messages]);

  // === Get reply message from map instead of repeated array scan ===
  const replyMessage = React.useMemo(() => {
    if (!replyToMessageId) return null;
    const msg = messageById.get(replyToMessageId);
    if (!msg) return null;
    return {
      content:
        msg.voiceMessage?.type === 'voice'
          ? 'Voice message'
          : (msg.content ?? '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim() || 'Message',
      voiceMessage: msg.voiceMessage,
    };
  }, [replyToMessageId, messageById]);

  // === Stable callback for sending messages ===
  const handleSendMessage = React.useCallback(
    async (message: Partial<Message>) => {
      try {
        setIsSending(true);
        const datentime = new Date().toISOString();

        const result = await updateConversationWithMessageTransaction(
          'conversations',
          conversation?.id,
          {
            ...message,
            timestamp: datentime,
            replyTo: replyToMessageId || null,
          },
          datentime,
        );

        if (result === 'Transaction successful') {
          setIsSending(false);
        } else {
          console.error('Failed to send message - unexpected result:', result);
          throw new Error(`Failed to send message: ${result}`);
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        setIsSending(false);
        throw error;
      }
    },
    [conversation?.id, replyToMessageId],
  );

  // === Stable callback for file upload ===
  const handleFileUpload = React.useCallback(async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.ppt,.pptx';

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) {
        fileInput.remove();
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'File size should not exceed 10MB',
        });
        fileInput.remove();
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];

      const allowedExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'pdf',
        'doc',
        'docx',
        'ppt',
        'pptx',
      ];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      const isAllowedType = allowedTypes.includes(file.type);
      const isAllowedExtension =
        file.type === '' && allowedExtensions.includes(fileExtension);

      if (!isAllowedType && !isAllowedExtension) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload an image, PDF, Word, or PowerPoint file',
        });
        fileInput.remove();
        return;
      }

      try {
        setIsSending(true);
        const { url: fileUrl } = await uploadFileViaSignedUrl(file, {
          keyPrefix: `chat/${conversation?.id || 'conversation'}`,
        });

        const message: Partial<Message> = {
          senderId: user.uid,
          content: fileUrl,
          timestamp: new Date().toISOString(),
        };

        await handleSendMessage(message);

        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
      } catch (error: any) {
        console.error('Error uploading file:', error);
        let errorMessage = 'Failed to upload file. Please try again.';
        if (error.code === 'ERR_CANCELED') {
          errorMessage = 'Upload was canceled. Please try again.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage =
            'Connection was aborted. Please check your network connection and try again.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: errorMessage,
        });
      } finally {
        setIsSending(false);
        fileInput.remove();
      }
    });

    fileInput.click();
  }, [conversation?.id, handleSendMessage, user.uid, toast]);



  // State for image modal
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Audio playback handlers and refs for ChatMessageItem
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const handleLoadedMetadata = React.useCallback(() => {
    // Handle metadata loaded for audio - can be used to update duration display
  }, []);
  const handlePlay = React.useCallback((id: string) => {
    // Handle audio play event - can be used to pause other audio elements
    Object.keys(audioRefs.current).forEach((audioId) => {
      if (audioId !== id && audioRefs.current[audioId]) {
        audioRefs.current[audioId]?.pause();
      }
    });
  }, []);

  const handleHeaderClick = () => {
    if (!onOpenProfileSidebar) return;

    if (conversation.type === 'group') {
      onOpenProfileSidebar(conversation.id, 'group', {
        userName: conversation.groupName,
        email: '',
        profilePic: conversation.avatar,
      });
    } else {
      // For 1:1 chats, pass the other user's details
      const otherParticipantUid = conversation.participants?.find(
        (p: string) => p !== user.uid,
      );
      if (otherParticipantUid) {
        const participantDetails =
          conversation.participantDetails?.[otherParticipantUid];
        const initialUserData = {
          userName: participantDetails?.userName || primaryUser.userName,
          email: participantDetails?.email || primaryUser.email,
          profilePic: participantDetails?.profilePic || primaryUser.profilePic,
        };
        onOpenProfileSidebar(otherParticipantUid, 'user', initialUserData);
      } else {
        console.error(
          'Could not determine the other participant in an individual chat for profile sidebar.',
        );
      }
    }
  };






  useEffect(() => {
    if (debouncedSearch.trim() && messages) {
      /* logic to filter out the conversation/message of the chat */
      const searchTerm = debouncedSearch.toLowerCase();

      const filteredConversations = messages.filter((message) =>
        (message.content ?? '').toLowerCase().includes(searchTerm),
      );

      if (filteredConversations.length > 0) {
        const firstMatchId = `message-${filteredConversations[0].id}`;
        const element = document.getElementById(firstMatchId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          /* add temporary style here to highlight the message */
          element.classList.add('message-highlight');

          /* remove the added style from the matched message element */
          setTimeout(() => {
            element.classList.remove('message-highlight');
          }, 2000);
        }
      }
    }
  }, [debouncedSearch]);

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

  // Reset UI state when conversation changes
  useEffect(() => {
    setSearchValue('');
    setIsSearchVisible(false);
    setReplyToMessageId('');
    setModalImage(null);
  }, [conversation?.id]);

  // Subscribe to messages for this conversation and manage loading state
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = subscribeToFirestoreCollection(
      `conversations/${conversation.id}/messages/`,
      (data) => {
        setMessagesCache(prev => ({ ...prev, [conversation.id]: data }));
        setCacheStatus(prev => ({ ...prev, [conversation.id]: true }));
      },
      'asc',
    );
    return () => {
      try {
        if (typeof unsubscribe === 'function') unsubscribe();
      } catch {
        // no-op
      }
    };
  }, [conversation?.id]);

  // Resolve and set primary user details for 1:1 chats
  useEffect(() => {
    if (!conversation) return;
    if (conversation.type === 'group') return;
    const otherParticipantUid = conversation.participants?.find(
      (p: string) => p !== user.uid,
    );
    if (!otherParticipantUid) return;
    const participantDetails =
      conversation.participantDetails?.[otherParticipantUid];
    setPrimaryUser({
      userName: participantDetails?.userName || '',
      email: participantDetails?.email || '',
      profilePic: participantDetails?.profilePic || '',
    });
  }, [conversation, user.uid]);

  const prevConversationId = useRef(conversation?.id);
  useLayoutEffect(() => {
    if (loading) return;

    if (conversation?.id !== prevConversationId.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      prevConversationId.current = conversation?.id;
    } else if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [conversation?.id, messages.length, loading]);

  async function handleCreateMeet() {
    // Video call functionality is currently disabled
    toast({
      title: 'Feature Unavailable',
      description: 'This functionality is not available for now.',
      variant: 'default',
    });
  }

  /**
   * Apply bold using execCommand so the formatting appears live.
   */


  async function toggleReaction(
    messageId: string,
    emoji: string,
  ): Promise<void> {
    const currentMessage = messages.find((msg) => msg.id === messageId);
    const updatedReactions: Record<string, string[]> = currentMessage?.reactions
      ? { ...currentMessage.reactions }
      : {};

    const userReaction = Object.keys(updatedReactions).find((existingEmoji) =>
      updatedReactions[existingEmoji]?.includes(user.uid),
    );

    if (userReaction === emoji) {
      updatedReactions[emoji] = updatedReactions[emoji].filter(
        (uid: string) => uid !== user.uid,
      );

      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji];
      }
    } else {
      if (userReaction) {
        updatedReactions[userReaction] = updatedReactions[userReaction].filter(
          (uid: string) => uid !== user.uid,
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

    await updateDataInFirestore(
      `conversations/${conversation.id}/messages/`,
      messageId,
      {
        reactions: updatedReactions,
      },
    );
  }

  // --- ADD THIS LOGIC ---
  // 1. Determine if the current conversation is blocked
  const isBlocked = conversation?.blocked?.status === true;
  const isArchived =
    conversation?.participantDetails?.[user.uid]?.viewState === 'archived';
  // 2. Create a dynamic message to show the user
  let blockMessage = '';
  if (isBlocked) {
    if (conversation.blocked?.by === user.uid) {
      blockMessage =
        'You have blocked this conversation. Unblock them to send a message.';
    } else {
      blockMessage = 'This conversation is blocked. You cannot send a message.';
    }
  }

  // Inside your CardsChat component in chat.tsx

  // --- HIGHLIGHT: ADD THIS ENTIRE FUNCTION ---
  async function handleToggleArchive() {
    if (!user?.uid || !conversation?.id) return;

    // 1. Determine the current and new state
    const currentState = conversation.participantDetails?.[user.uid]?.viewState;

    const newState = currentState === 'archived' ? 'inbox' : 'archived';

    // 2. Prepare the update for Firestore
    const conversationDocRef = doc(db, 'conversations', conversation.id);
    const fieldToUpdate = `participantDetails.${user.uid}.viewState`;

    try {
      // 3. Update the document in Firestore
      await updateDoc(conversationDocRef, { [fieldToUpdate]: newState });

      // 4. Create the updated conversation object for the local state
      const updatedConversation = {
        ...conversation,
        participantDetails: {
          ...conversation.participantDetails,
          [user.uid]: {
            ...conversation.participantDetails?.[user.uid],
            viewState: newState,
          },
        },
      };

      // 5. Call the prop to update the parent's state instantly
      onConversationUpdate?.(updatedConversation as Conversation);

      toast({
        title: `Conversation ${newState === 'archived' ? 'Archived' : 'Unarchived'}`,
      });
    } catch (error) {
      console.error('Error toggling archive state:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update archive status.',
      });
    }
  }
  return (
    <>
      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 z-10"
              onClick={() => setModalImage(null)}
            >
              <X className="w-6 h-6 text-black" />
            </button>
            <Image
              src={modalImage}
              alt="Full Image"
              width={800}
              height={800}
              className="rounded-lg max-h-[80vh] w-auto h-auto object-contain bg-white"
            />
          </div>
        </div>
      )}
      {loading ? (
        <Card className="col-span-3 flex flex-col h-full bg-[hsl(var(--card))] rounded-none border-0 shadow-none">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--border))]">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Messages Skeleton */}
          <div className="flex-1 p-4 overflow-y-auto space-y-6">
            {/* Incoming message skeleton */}
            <div className="flex items-start space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            </div>

            {/* Outgoing message skeleton */}
            <div className="flex justify-end">
              <div className="space-y-2 max-w-[80%]">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-20 w-72 rounded-lg bg-primary/20" />
              </div>
            </div>
          </div>

          {/* Input area skeleton */}
          <div className="p-3 border-t border-[hsl(var(--border))]">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="flex-1 h-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="col-span-3 flex flex-col h-full w-full overflow-hidden bg-[hsl(var(--card))] rounded-none border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient text-[hsl(var(--card-foreground))] p-3 border-b border-[hsl(var(--border))] shadow-md dark:shadow-sm">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mr-2 md:hidden text-[hsl(var(--card-foreground))] hover:text-[hsl(var(--foreground))] p-1 rounded-md transition-colors"
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleHeaderClick}
                className="flex px-3 items-center space-x-3 text-left hover:bg-[#e4e7ecd1] dark:hover:bg-[hsl(var(--accent)_/_0.5)] p-1 rounded-md transition-colors"
                aria-label="View profile information"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={
                      conversation.type === 'group'
                        ? conversation.avatar || ''
                        : primaryUser.profilePic
                    }
                    alt={
                      conversation.type === 'group'
                        ? conversation.groupName
                        : primaryUser.userName || 'User'
                    }
                  />
                  <AvatarFallback className="bg-[#d7dae0] dark:bg-[#35383b9e] text-[hsl(var(--foreground))]">
                    {(
                      conversation.type === 'group'
                        ? conversation.groupName
                        : primaryUser.userName
                    )
                      ? conversation.type === 'group'
                        ? conversation.groupName?.charAt(0).toUpperCase()
                        : primaryUser.userName?.charAt(0).toUpperCase()
                      : 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="cursor-pointer">
                  <p className="text-base pb-1 font-semibold leading-none text-[hsl(var(--card-foreground))] hover:underline">
                    {conversation.type === 'group'
                      ? conversation.groupName
                      : primaryUser.userName || 'Chat'}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] hover:underline">
                    {conversation.type === 'group'
                      ? `${Object.keys(conversation.participantDetails || {}).length} members`
                      : primaryUser.email || 'Click to view profile'}
                  </p>
                </div>
              </button>
              {/* create a search bar input here to take input from user to search conversation */}
              <TooltipProvider>
                <div className="flex items-center space-x-0.5 sm:space-x-1">
                  {/* Desktop controls */}
                  {isSearchVisible ? (
                    <div className="hidden sm:flex items-center space-x-2">
                      <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search in conversation..."
                        className="w-40 sm:w-56 rounded-full text-sm"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close search"
                            onClick={() => {
                              setIsSearchVisible(false);
                              setSearchValue('');
                            }}
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          >
                            ✕
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Close search
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Search in chat"
                          onClick={() => setIsSearchVisible(true)}
                          className="hidden sm:inline-flex text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Search</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          isArchived ? 'Unarchive chat' : 'Archive chat'
                        }
                        onClick={handleToggleArchive}
                        className="hidden sm:inline-flex text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        {isArchived ? (
                          <ArchiveRestore className="h-5 w-5" />
                        ) : (
                          <Archive className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {isArchived ? 'Unarchive' : 'Archive'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Video call"
                        onClick={handleCreateMeet}
                        className="hidden sm:inline-flex text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] opacity-50 cursor-not-allowed"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      This functionality is not available for now
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          isChatExpanded ? 'Collapse chat' : 'Expand chat'
                        }
                        onClick={() => {
                          if (onToggleExpand) {
                            onToggleExpand();
                          } else {
                            console.error(
                              '[CardsChat] onToggleExpand is undefined!',
                            );
                          }
                        }}
                        className="hidden sm:inline-flex text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        {isChatExpanded ? (
                          <Minimize2 className="h-5 w-5" />
                        ) : (
                          <Maximize2 className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {isChatExpanded ? 'Collapse' : 'Expand'}
                    </TooltipContent>
                  </Tooltip>

                  {/* Mobile: everything in the three-dot menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="More options"
                            className="sm:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">More</TooltipContent>
                      </Tooltip>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={5}
                      className="w-52 bg-[#d7dae0] dark:bg-[hsl(var(--popover))]"
                    >
                      <DropdownMenuItem
                        onClick={() => setIsSearchVisible((v) => !v)}
                        className="px-2 py-1.5 cursor-pointer flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        <span className="text-sm font-medium">Search</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleToggleArchive}
                        className="px-2 py-1.5 cursor-pointer flex items-center gap-2"
                      >
                        {isArchived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {isArchived ? 'Unarchive' : 'Archive'}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleCreateMeet}
                        className="px-2 py-1.5 cursor-pointer flex items-center gap-2 opacity-50"
                      >
                        <Video className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Video call (Not available)
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (onToggleExpand) {
                            onToggleExpand();
                          } else {
                            console.error(
                              '[CardsChat] onToggleExpand is undefined!',
                            );
                          }
                        }}
                        className="px-2 py-1.5 cursor-pointer flex items-center gap-2"
                      >
                        {isChatExpanded ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {isChatExpanded ? 'Collapse' : 'Expand'}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 bg-[hsl(var(--background))]">
              <ScrollArea className="flex flex-col space-y-3">
                {messages.map((message, index) => (
                  <ChatMessageItem
                    key={message.id}
                    message={message as any}
                    index={index}
                    messages={messages as any}
                    userId={user.uid}
                    conversation={conversation}
                    onHoverChange={(id) => setHoveredMessageId(id)}
                    setModalImage={setModalImage}
                    audioRefs={audioRefs}
                    handleLoadedMetadata={handleLoadedMetadata}
                    handlePlay={handlePlay}
                    toggleReaction={toggleReaction}
                    setReplyToMessageId={setReplyToMessageId}
                    messagesEndRef={messagesEndRef}
                    onOpenProfileSidebar={onOpenProfileSidebar}
                  />
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="sticky bottom-0 bg-[hsl(var(--card))] p-2 border-t border-[hsl(var(--border))] shadow-md dark:shadow-sm">
              <ChatComposer
                userId={user.uid}
                isSending={isSending}
                isBlocked={isBlocked}
                blockMessage={blockMessage}
                replyToMessageId={replyToMessageId}
                replyMessage={replyMessage}
                onSendMessage={handleSendMessage}
                onSetReplyToMessageId={setReplyToMessageId}
                onFileUpload={handleFileUpload}
              />
            </CardFooter>
          </Card>
        </>
      )}
    </>
  );
}