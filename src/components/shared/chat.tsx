/* eslint-disable prettier/prettier */
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
  Text,
  Bold,
  Italic,
  Underline,
  Flag,
  Mic,
  StopCircle,
  Trash2,
  X,
  ArchiveRestore,
  Archive,
  ArrowLeft,
  ChevronDown,
  Pin,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { doc, DocumentData, updateDoc } from 'firebase/firestore';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

import { Conversation } from './chatList'; // Assuming Conversation type includes 'type' field
import ChatMessageItem from './ChatMessageItem';

import { useDebounce } from '@/hooks/use-debounce';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  subscribeToMessagesPaginated,
  loadMoreMessages,
  updateConversationWithMessageTransaction,
  updateDataInFirestore,
  deleteMessageFromConversation,
  setUserTyping,
  subscribeToTyping,
  updateConversationReadBy,
  resetUnreadCount,
  pinMessage as pinMessageFirestore,
  unpinMessage as unpinMessageFirestore,
} from '@/utils/common/firestoreUtils';
import { logger } from '@/utils/logger';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { uploadFileViaSignedUrl } from '@/services/imageSignedUpload';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { db } from '@/config/firebaseConfig';



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
  type?: 'system' | 'text' | 'image' | 'file';
  adminsOnly?: boolean;
  deletedFor?: string[];
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
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [headMessages, setHeadMessages] = useState<DocumentData[]>([]); // Older messages (load more)
  const getOldestTailSnapshotRef = useRef<(() => unknown) | null>(null);
  const oldestHeadSnapshotRef = useRef<unknown>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [removedFailedIds] = useState<string[]>([]); // Removed unused setter setRemovedFailedIds
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showNewMessagesPill, setShowNewMessagesPill] = useState(false);
  const [unreadDividerId, setUnreadDividerId] = useState<string | null>(null);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [replyToMessageId, setReplyToMessageId] = useState<string>('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [, setHoveredMessageId] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [showFormattingOptions, setShowFormattingOptions] =
    useState<boolean>(false);

  const prevMessagesLength = useRef(0);
  const prevMessageIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedMessagesRef = useRef(false);
  const prevLastMessageTimeRef = useRef<number>(0);
  const trackingConversationIdRef = useRef<string | null>(null);
  const didInitialScrollToBottomRef = useRef(false);
  const [, setOpenDrawer] = useState(false);

  // States for voice recording
  type RecordingStatus =
    | 'idle'
    | 'permission_pending'
    | 'recording'
    | 'recorded'
    | 'uploading';
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>('idle');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // For preview
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [, setRecordingStartTime] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0); // In seconds
  const recordingDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // State for image modal
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Reporting modal state & helpers
  const [openReport, setOpenReport] = useState(false);
  const pathname = usePathname();
  const reportType = getReportTypeFromPath(pathname);

  const reportData = {
    subject: '',
    description: '',
    report_role: user.type || 'STUDENT',
    report_type: reportType,
    status: 'OPEN',
    reportedbyId: user.uid,
    reportedId: user.uid,
  };
  // For robust force update
  const [, forceUpdate] = useState(0);

  // For voice message duration display
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const handleLoadedMetadata = (id: string) => {
    const audio = audioRefs.current[id];
    if (
      audio &&
      isFinite(audio.duration) &&
      !isNaN(audio.duration) &&
      audio.duration > 0
    ) {
      setAudioDurations((prev) => ({ ...prev, [id]: audio.duration }));
    } else {
      // Try again after a short delay if duration is not available yet
      setTimeout(() => {
        const audioRetry = audioRefs.current[id];
        if (
          audioRetry &&
          isFinite(audioRetry.duration) &&
          !isNaN(audioRetry.duration) &&
          audioRetry.duration > 0
        ) {
          setAudioDurations((prev) => ({ ...prev, [id]: audioRetry.duration }));
          forceUpdate((n) => n + 1); // force re-render
        }
      }, 500);
    }
  };

  // Pause any other playing audio when a new one starts
  const handlePlay = (id: string) => {
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (key !== id && audio && !audio.paused) {
        audio.pause();
      }
    });
  };
  const [, setAudioDurations] = useState<{
    [key: string]: number;
  }>({});

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
        onOpenProfileSidebar(otherParticipantUid, 'user', {
          userName: participantDetails?.userName || '',
          email: participantDetails?.email || '',
          profilePic: participantDetails?.profilePic || '',
        });
        conversation.participantDetails?.[otherParticipantUid];
        const initialUserData = {
          userName: participantDetails?.userName || primaryUser.userName,
          email: participantDetails?.email || primaryUser.email,
          profilePic: participantDetails?.profilePic || primaryUser.profilePic,
        };
        onOpenProfileSidebar(otherParticipantUid, 'user', initialUserData);
      } else {
        logger.error(
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
  }, [debouncedSearch, messages]);

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

  // Paginated messages: subscribe to last 50 (tail), head = older pages from "Load more"
  useEffect(() => {
    if (!conversation?.id || !user?.uid) return;
    setLoading(true);
    setHeadMessages([]);
    setHasMoreMessages(true);
    oldestHeadSnapshotRef.current = null;
    const unsubscribe = subscribeToMessagesPaginated(
      conversation.id,
      user.uid,
      (tailData, getOldestSnapshot) => {
        getOldestTailSnapshotRef.current = getOldestSnapshot;
        setMessages(tailData);
        setLoading(false);
      },
      50,
    );
    return () => {
      try {
        if (typeof unsubscribe === 'function') unsubscribe();
      } catch (e) {
        console.debug('Messages subscription cleanup error:', e);
      }
    };
  }, [conversation?.id, user?.uid]);

  // Typing indicator: subscribe to who is typing
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubTyping = subscribeToTyping(conversation.id, setTypingUserIds);
    return () => {
      try {
        unsubTyping();
      } catch (e) {
        console.debug('Typing subscription cleanup error:', e);
      }
    };
  }, [conversation?.id]);

  // Mark conversation as read and reset unread when opened
  useEffect(() => {
    if (!conversation?.id || !user?.uid) return;
    updateConversationReadBy(conversation.id, user.uid).catch((err) => {
      logger.error(`Error in updateConversationReadBy for conversation ${conversation.id}, user ${user.uid}:`, err);
    });
    resetUnreadCount(conversation.id, user.uid).catch((err) => {
      logger.error(`Error in resetUnreadCount for conversation ${conversation.id}, user ${user.uid}:`, err);
    });
  }, [conversation?.id, user?.uid]);


  // Clear new message indicators/messages immediately when switching chats (avoid pill on open)
  useLayoutEffect(() => {
    setNewMessagesCount(0);
    setShowNewMessagesPill(false);
    setUnreadDividerId(null);
    setMessages([]);
    setHeadMessages([]);
    didInitialScrollToBottomRef.current = false;
    // Reset tracking so initial load doesn't count as "new"
    prevMessagesLength.current = 0;
    prevMessageIdsRef.current = new Set();
    hasInitializedMessagesRef.current = false;
    prevLastMessageTimeRef.current = 0;
    trackingConversationIdRef.current = conversation?.id ?? null;
  }, [conversation?.id]);

  // Always open the chat at the bottom (latest message) once the first page loads.
  useEffect(() => {
    if (!conversation?.id) return;
    if (loading) return;
    if (didInitialScrollToBottomRef.current) return;
    // Only when we have messages (avoid scrolling on empty)
    if (messages.length === 0 && headMessages.length === 0) return;
    didInitialScrollToBottomRef.current = true;
    // Use viewport so it works after load; "auto" to avoid jank on open
    const viewport = messagesScrollRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    setIsScrolledUp(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scroll once when messages load; messages ref would re-run too often
  }, [conversation?.id, loading, messages.length, headMessages.length]);

  const toTime = (t: unknown): number => {
    if (!t) return 0;
    if (typeof t === 'string') return new Date(t).getTime();
    if (typeof t === 'object' && t !== null && 'toMillis' in t) return (t as { toMillis: () => number }).toMillis();
    if (typeof t === 'object' && t !== null && 'seconds' in t) return ((t as { seconds: number }).seconds ?? 0) * 1000;
    return new Date(String(t)).getTime();
  };
  const allMessagesRaw = [...headMessages, ...messages].sort(
    (a, b) => toTime(a.timestamp) - toTime(b.timestamp),
  );
  const allMessages = allMessagesRaw.filter((m) => !removedFailedIds.includes(m.id));
  const unreadDividerIndex =
    unreadDividerId != null
      ? allMessages.findIndex((m) => m?.id === unreadDividerId)
      : -1;

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!conversation?.id || !user?.uid) return;
    // Capture IDs at effect start to avoid stale closure in cleanup
    const cid = conversation.id;
    const uid = user.uid;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const trimmed = (typeof input === 'string' ? input : '').trim();
    if (trimmed.length > 0) {
      // Set typing indicator immediately when user starts typing
      setUserTyping(cid, uid, true);
      // Clear typing indicator after 400ms of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(cid, uid, false);
        typingTimeoutRef.current = null;
      }, 400);
    } else {
      setUserTyping(cid, uid, false);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (cid && uid) setUserTyping(cid, uid, false);
    };
  }, [input, conversation?.id, user?.uid]);

  const handleLoadMoreMessages = useCallback(async () => {
    if (!conversation?.id || !user?.uid || loadingMore) return;
    const getOldest = getOldestTailSnapshotRef.current;
    const snapshot = (oldestHeadSnapshotRef.current ?? (getOldest ? getOldest() : null)) as import('firebase/firestore').DocumentSnapshot<DocumentData> | null;
    if (!snapshot) return;
    setLoadingMore(true);
    try {
      const { messages: older, lastDoc } = await loadMoreMessages(
        conversation.id,
        user.uid,
        snapshot as import('firebase/firestore').DocumentSnapshot<DocumentData>,
      );
      if (lastDoc) oldestHeadSnapshotRef.current = lastDoc;
      setHasMoreMessages(older.length >= 50);
      setHeadMessages((prev) => [...older, ...prev]);
    } catch {
      setHasMoreMessages(false);
    } finally {
      setLoadingMore(false);
    }
  }, [conversation?.id, user?.uid, loadingMore]);

  const clearTypingOnBlur = useCallback(() => {
    if (conversation?.id && user?.uid) setUserTyping(conversation.id, user.uid, false);
  }, [conversation?.id, user?.uid]);

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

  // Track "new messages while scrolled up" robustly:
  // - Never count initial load
  // - Never count "load older messages" pagination (older messages prepended)
  // - Only count appended newer messages from OTHER users while not at bottom
  useEffect(() => {
    // If the conversation just changed, ignore any existing message state from the previous chat.
    // This prevents showing the unread pill/line on open.
    if (trackingConversationIdRef.current !== (conversation?.id ?? null)) {
      trackingConversationIdRef.current = conversation?.id ?? null;
      hasInitializedMessagesRef.current = false;
      prevLastMessageTimeRef.current = 0;
      prevMessageIdsRef.current = new Set();
      prevMessagesLength.current = 0;
      return;
    }

    const total = allMessages.length;
    const currentLastTime =
      total > 0 ? toTime(allMessages[total - 1].timestamp) : 0;

    // Initialize (first REAL snapshot for this conversation).
    // IMPORTANT: don't treat our own "cleared state" (total === 0 right after switching chats)
    // as initialization, otherwise the first real snapshot will be miscounted as "new messages".
    if (!hasInitializedMessagesRef.current) {
      if (total === 0) return;
      hasInitializedMessagesRef.current = true;
      prevLastMessageTimeRef.current = currentLastTime;
      prevMessageIdsRef.current = new Set(
        allMessages.map((m) => m.id),
      );
      prevMessagesLength.current = total;
      return;
    }

    const prevLastTime = prevLastMessageTimeRef.current;
    const appendedNewer = currentLastTime > prevLastTime;

    // Update refs early (so we don't double-count on fast re-renders)
    prevLastMessageTimeRef.current = Math.max(prevLastTime, currentLastTime);

    const prevIds = prevMessageIdsRef.current;
    const newlyAdded = allMessages.filter((m) => !prevIds.has(m.id));

    // Always update IDs snapshot
    prevMessageIdsRef.current = new Set(allMessages.map((m) => m.id));
    prevMessagesLength.current = total;

    // Ignore non-appends (typically pagination / reorder)
    if (!appendedNewer) return;

    const newlyAddedFromOthers = newlyAdded.filter((m) => {
      const senderId = m?.senderId;
      if (!senderId || senderId === user?.uid) return false;
      const t = toTime(m?.timestamp);
      return t >= prevLastTime;
    });

    if (newlyAddedFromOthers.length === 0) return;

    const el = messagesScrollRef.current;
    const threshold = 100;
    const nearBottom = !!el && el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    // If user is at bottom, follow conversation and don't show indicators.
    if (nearBottom && el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      return;
    }

    // User is not at bottom: show indicators.
    setIsScrolledUp(true);
    setNewMessagesCount((n) => n + newlyAddedFromOthers.length);
    setUnreadDividerId((prev) => prev ?? newlyAddedFromOthers[0]?.id);
    setShowNewMessagesPill(true);
  }, [allMessages, unreadDividerId, user?.uid, conversation?.id]);

  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleMessagesScroll = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      const el = messagesScrollRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const threshold = 100;
      const nearBottom = scrollHeight - scrollTop - clientHeight < threshold;
      if (nearBottom) {
        setIsScrolledUp(false);
        // Pill disappears when user scrolls to bottom; line stays until they send
        setShowNewMessagesPill(false);
      } else {
        setIsScrolledUp(true);
      }
      scrollDebounceRef.current = null;
    }, 100);
  }, []);

  const scrollToBottom = () => {
    const viewport = messagesScrollRef.current;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsScrolledUp(false);
    // Pill disappears when user jumps to bottom; line stays until they send
    setShowNewMessagesPill(false);
  };

  async function sendMessage(
    conversation: Conversation,
    message: Partial<Message>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    if (!conversation?.id || !user?.uid) return;
    if (conversation.blocked?.status === true) {
      toast({
        variant: 'destructive',
        title: 'Action Denied',
        description: 'You cannot send messages to a blocked conversation.',
      });
      return;
    }

    // Centralized sanitization: ensure all message content is sanitized before processing
    const sanitizedMessage = {
      ...message,
      content: message.content
        ? DOMPurify.sanitize(message.content, {
          ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
          KEEP_CONTENT: true,
        })
        : message.content,
    };


    try {
      setIsSending(true);
      const datentime = new Date().toISOString();

      const result = await updateConversationWithMessageTransaction(
        'conversations',
        conversation?.id,
        {
          ...sanitizedMessage,
          timestamp: datentime,
          replyTo: replyToMessageId || null,
        },
        datentime,
      );

      if (result === 'Transaction successful') {
        setInput('');
        setIsSending(false);
        // Clear unread indicators after successful send
        if (newMessagesCount > 0) {
          setNewMessagesCount(0);
          setShowNewMessagesPill(false);
        }
        if (unreadDividerId) {
          setUnreadDividerId(null);
        }
      } else {
        logger.error('Failed to send message - unexpected result:', result);
        throw new Error(`Failed to send message: ${result}`);
      }
    } catch (error: any) {
      logger.error('Error sending message:', error?.message, error?.stack);
      throw error;
    } finally {
      setIsSending(false);
    }
  }

  // Always call hooks at the top level, not conditionally.
  // Move this conditional return after all hooks.

  async function handleFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.ppt,.pptx';

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'File size should not exceed 10MB',
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload an image, PDF, Word, or PowerPoint file',
        });
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

        await sendMessage(conversation, message, setInput);

        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
      } catch (error: any) {
        logger.error('Error uploading file:', {
          error: error.message,
          code: error.code,
          response: error.response?.data,
          timestamp: new Date().toISOString(),
        });

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

      await sendMessage(conversation, message, setInput);
    } catch (error) {
      logger.error('Error creating meet:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create meeting. Please try again.',
      });
    }
  }

  /**
   * Apply bold using execCommand so the formatting appears live.
   */
  function handleBold() {
    composerRef.current?.focus();
    document.execCommand('bold');
  }

  /**
   * Underline uses <u> tags (markdown has no underline). Same logic as bold.
   */
  const handleUnderline = () => {
    composerRef.current?.focus();
    document.execCommand('underline');
  };

  /**
   * Italic formatting with single * markers.
   */
  function handleitalics() {
    composerRef.current?.focus();
    document.execCommand('italic');
  }

  const toggleFormattingOptions = () => {
    setShowFormattingOptions((prev) => !prev);
  };

  // Insert emoji into composer at caret position
  const handleInsertEmoji = (emoji: string) => {
    if (composerRef.current) {
      composerRef.current.focus();
      const htmlEmoji = `<span class="chat-emoji">${emoji}</span>&nbsp;`;
      document.execCommand('insertHTML', false, htmlEmoji);
      // Update input state with new HTML
      const html = composerRef.current.innerHTML;
      setInput(html);
    }
  };

  // Voice Recording Functions
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startRecording = async () => {
    if (recordingStatus === 'recording') return;
    setRecordingStatus('permission_pending');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // Stop mic access
        setRecordingStatus('recorded');
        if (recordingDurationIntervalRef.current) {
          clearInterval(recordingDurationIntervalRef.current);
        }
      };

      recorder.start();
      setAudioChunks([]); // Clear previous chunks
      setAudioBlob(null); // Clear previous blob
      setAudioUrl(null); // Clear previous URL
      setRecordingStartTime(Date.now());
      setRecordingDuration(0);
      recordingDurationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingStatus('recording');
      toast({
        title: 'Recording started',
        description: 'Speak into your microphone.',
      });
    } catch (err) {
      logger.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone Error',
        description: 'Could not access microphone. Please check permissions.',
      });
      setRecordingStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recordingStatus === 'recording') {
      mediaRecorder.stop();
      // The onstop event handler will set status to "recorded" and clear interval
      // Create blob and URL after chunks are all collected in onstop, or here if preferred.
      // For simplicity, let's assume onstop handles setting the final audioBlob and audioUrl
    }
    // Ensure interval is cleared if stopRecording is called unexpectedly
    if (recordingDurationIntervalRef.current) {
      clearInterval(recordingDurationIntervalRef.current);
    }
  };

  useEffect(() => {
    // This effect runs when audioChunks changes, specifically after recording stops and all chunks are in.
    if (recordingStatus === 'recorded' && audioChunks.length > 0) {
      const blob = new Blob(audioChunks, {
        type: mediaRecorder?.mimeType || 'audio/webm',
      });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioChunks([]); // Clear chunks after creating blob
    }
  }, [audioChunks, recordingStatus, mediaRecorder?.mimeType]);

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioChunks([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setMediaRecorder(null);
    setRecordingStatus('idle');
    setRecordingDuration(0);
    if (recordingDurationIntervalRef.current) {
      clearInterval(recordingDurationIntervalRef.current);
    }
    toast({ title: 'Recording discarded' });
  };

  const handleSendVoiceMessage = async () => {
    if (!audioBlob || !user || !conversation) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No audio recorded or user/conversation not found.',
      });
      return;
    }

    setRecordingStatus('uploading');

    try {
      // Step 1: Convert audio blob to file (same as before)
      const extPart = audioBlob.type.split('/')[1] || 'webm';
      const cleanExt = extPart.split(';')[0]; // remove codec parameters like 'webm;codecs=opus'
      const audioFile = new File([audioBlob], `voice-message.${cleanExt}`, {
        type: audioBlob.type,
      });

      // Step 2: Create FormData (same as regular file upload)
      const { url: fileUrl } = await uploadFileViaSignedUrl(audioFile, {
        keyPrefix: `chat/${conversation?.id || 'conversation'}/voice`,
      });

      // Step 5: Create message with voice file URL and duration metadata
      const message: Partial<Message> = {
        senderId: user.uid,
        content: fileUrl, // Voice file URL becomes message content
        timestamp: new Date().toISOString(),
        // Add voice message metadata
        voiceMessage: {
          duration: recordingDuration,
          type: 'voice',
        },
      };

      // Step 6: Send message using the same working sendMessage function
      await sendMessage(conversation, message, setInput);

      toast({ title: 'Success', description: 'Voice message sent!' });
    } catch (error: any) {
      logger.error('Error sending voice message:', error);
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response?.data,
        conversationId: conversation?.id,
        duration: recordingDuration,
      });

      let errorMessage = 'Failed to upload voice message. Please try again.';

      // Check if it's a file upload error
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Check if it's a network error
      else if (error.code === 'ERR_CANCELED') {
        errorMessage = 'Upload was canceled. Please try again.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage =
          'Connection was aborted. Please check your network connection and try again.';
      }
      // Check if it's a Firestore error
      else if (
        error.message &&
        error.message.includes('Failed to send message')
      ) {
        errorMessage = 'Failed to save message to chat. Please try again.';
      }
      // Check if it's a general error
      else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage,
      });
    } finally {
      discardRecording(); // Clean up states regardless of success/failure
      setRecordingStatus('idle');
    }
  };

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

  // Delete message handler (also removes failed/optimistic messages from UI on error)
  async function handleDeleteMessage(messageId: string): Promise<void> {
    if (!conversation?.id) return;
    try {
      if (!user?.uid) return;
      await deleteMessageFromConversation(conversation.id, messageId, user.uid);
      // If the deleted message was pinned, clear the pin
      if (conversation.pinnedMessage?.messageId === messageId && onConversationUpdate) {
        try {
          await unpinMessageFirestore(conversation.id, user.uid);
          onConversationUpdate({
            ...conversation,
            pinnedMessage: undefined,
          });
        } catch (err) {
          logger.error('Error unpinning deleted message', err);
        }
      }
    } catch (error) {
      logger.error('Delete message failed', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete message. Please try again.',
      });
      // Do NOT add to removedFailedIds - we want it to remain visible so user knows it exists
      // setRemovedFailedIds((prev) => (prev.includes(messageId) ? prev : [...prev, messageId]));
    }
  }

  /** Retry failed message – delete failed and re-send */
  async function handleRetryMessage(messageId: string): Promise<void> {
    const msg = allMessagesRaw.find((m) => m.id === messageId);
    if (!msg || !conversation?.id || msg.senderId !== user?.uid) return;
    try {
      try {
        if (!user?.uid) return;
        await deleteMessageFromConversation(conversation.id, messageId, user.uid);
      } catch {
        // Message may not exist in Firestore if it failed before write
      }

      // Preserve ALL metadata from original message (excluding id, timestamp, editedAt)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, timestamp, editedAt, ...originalMetadata } = msg;

      const messageData = {
        ...originalMetadata,  // Preserve all original metadata (type, voiceMessage, adminsOnly, deletedFor, attachments, etc.)
        senderId: user.uid,   // Ensure sender is current user
        timestamp: new Date().toISOString(),  // Fresh timestamp
      };

      await sendMessage(conversation, messageData, setInput);
      toast({ title: 'Message resent' });
    } catch (error) {
      logger.error('Error retrying message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to resend',
        description: 'Please try again.',
      });
    }
  }

  // Start editing: put message content in composer
  function handleStartEdit(messageId: string, content: string): void {
    setReplyToMessageId('');
    setEditingMessageId(messageId);
    setInput(content);
    requestAnimationFrame(() => {
      if (composerRef.current) {
        // Sanitize content to prevent XSS when setting innerHTML
        const sanitized = DOMPurify.sanitize(content, {
          ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
        });
        composerRef.current.innerHTML = sanitized;
        composerRef.current.focus();
      }
    });
  }

  // Update message in Firestore
  async function handleUpdateMessage(messageId: string, newContent: string): Promise<void> {
    if (!conversation?.id) return;

    // Sanitize content to prevent stored XSS
    const sanitized = DOMPurify.sanitize(newContent, {
      ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
    });

    try {
      await updateDataInFirestore(
        `conversations/${conversation.id}/messages`,
        messageId,
        {
          content: sanitized,
          editedAt: new Date().toISOString()
        },
      );
      setEditingMessageId(null);
      setInput('');
      if (composerRef.current) composerRef.current.innerHTML = '';
      toast({ title: 'Message updated', description: 'Your message has been edited.' });
    } catch (error) {
      logger.error('Error updating message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update message. Please try again.',
      });
    }
  }

  async function handlePinMessage(messageId: string, content: string): Promise<void> {
    if (!conversation?.id || !user?.uid || !onConversationUpdate) return;
    try {
      await pinMessageFirestore(conversation.id, messageId, content, user.uid);
      onConversationUpdate({
        ...conversation,
        pinnedMessage: {
          messageId,
          pinnedAt: new Date().toISOString(),
          pinnedBy: user.uid,
          content: (content || '').slice(0, 200),
        },
      });
      toast({ title: 'Message pinned' });
    } catch (error) {
      logger.error('Error pinning message', error);
      toast({
        variant: 'destructive',
        title: 'Failed to pin',
        description: 'Please try again.',
      });
    }
  }

  async function handleUnpinMessage(): Promise<void> {
    if (!conversation?.id || !onConversationUpdate || !user?.uid) return;
    try {
      await unpinMessageFirestore(conversation.id, user.uid);
      onConversationUpdate({
        ...conversation,
        pinnedMessage: undefined,
      });
      toast({ title: 'Message unpinned' });
    } catch (error) {
      logger.error('Error unpinning message', error);
      toast({
        variant: 'destructive',
        title: 'Failed to unpin',
        description: 'Please try again.',
      });
    }
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
      logger.error('Error toggling archive state:', error);
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
        <Card className="col-span-3 flex flex-col h-full bg-[hsl(var(--card))] shadow-xl dark:shadow-lg">
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
          <Card className="col-span-3 flex flex-col h-full w-full min-w-0  bg-[hsl(var(--card))] shadow-xl dark:shadow-lg rounded-none sm:rounded-xl">
            {/* Chat header: consistent 16px/24px spacing, clear divider */}
            <CardHeader className="flex flex-row items-center justify-between gap-4 py-4 px-4 sm:px-6 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-b border-[hsl(var(--border))] shadow-sm rounded-none sm:rounded-t-xl">
              <div className="flex items-center min-w-0 flex-1">
                {/* Back button for mobile */}
                {onBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="flex-shrink-0 sm:hidden mr-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                    aria-label="Go back to chat list"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <button
                  onClick={handleHeaderClick}
                  className="flex items-center gap-3 text-left hover:bg-[hsl(var(--accent)_/_0.5)] rounded-lg px-2 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 min-w-0"
                  aria-label="View profile information"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
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
                  <div className="cursor-pointer min-w-0 text-left">
                    <p className="text-base font-semibold leading-tight text-[hsl(var(--card-foreground))] truncate hover:underline">
                      {conversation.type === 'group'
                        ? conversation.groupName
                        : primaryUser.userName || 'Chat'}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate hover:underline">
                      {conversation.type === 'group'
                        ? `${(conversation.participants?.length ?? 0)} members`
                        : primaryUser.email || 'Click to view profile'}
                    </p>
                  </div>
                </button>
              </div>
              <TooltipProvider>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" role="toolbar" aria-label="Chat actions">
                  {/* Desktop controls */}
                  {isSearchVisible ? (
                    <div className="hidden sm:flex items-center space-x-2">
                      <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search in conversation..."
                        className="w-32 sm:w-40 md:w-56 rounded-full text-sm"
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
                        className="hidden sm:inline-flex text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Video call</TooltipContent>
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
                            logger.error(
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
                      className="w-52 bg-[hsl(var(--popover))]"
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
                        className="px-2 py-1.5 cursor-pointer flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        <span className="text-sm font-medium">Video call</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (onToggleExpand) {
                            onToggleExpand();
                          } else {
                            logger.error(
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
                      <DropdownMenuItem
                        onClick={() => setOpenReport(true)}
                        className="text-red-600 hover:text-red-700 focus:text-red-700 dark:text-red-500 dark:hover:text-red-400 px-2 py-1.5 cursor-pointer flex items-center gap-2"
                      >
                        <Flag className="h-4 w-4" />
                        <span className="text-sm font-medium">Report</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Desktop: existing more options menu (report) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="More options"
                        className="hidden sm:inline-flex text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={5}
                      className="w-48 bg-[hsl(var(--popover))]"
                    >
                      <DropdownMenuItem
                        onClick={() => setOpenReport(true)}
                        className="text-red-600 hover:text-red-700 focus:text-red-700 dark:text-red-500 dark:hover:text-red-400 px-2 py-1.5 cursor-pointer flex items-center gap-2"
                      >
                        <Flag className="h-4 w-4" />
                        <span className="text-sm font-medium">Report</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipProvider>
            </CardHeader>
            {/* Mobile search bar */}
            {isSearchVisible && (
              <div className="sm:hidden flex items-center gap-2 p-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search in conversation..."
                  className="flex-1 rounded-full text-sm"
                />
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
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <CardContent className="relative flex-1 flex flex-col min-h-0 py-4 px-1 sm:px-2 bg-[hsl(var(--background))]">
              {/* New message pill – click to jump to latest */}
              {showNewMessagesPill && newMessagesCount > 0 && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium shadow-lg hover:bg-[hsl(var(--primary))]/90 transition-colors pointer-events-auto"
                  aria-label={`${newMessagesCount} new messages`}
                >
                  {newMessagesCount} new{' '}
                  {newMessagesCount === 1 ? 'message' : 'messages'}
                </button>
              )}
              {/* Pinned message header – fixed at top, does not scroll */}
              {conversation.pinnedMessage && (
                <div className="flex-shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[hsl(var(--muted))] dark:bg-[hsl(var(--accent)_/_0.3)] border border-[hsl(var(--border))] mx-1 mb-2">
                  <Pin className="h-4 w-4 flex-shrink-0 text-[hsl(var(--muted-foreground))]" />
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left hover:opacity-80"
                    onClick={() => {
                      const pinnedId = conversation.pinnedMessage?.messageId;
                      if (!pinnedId) return;
                      const el = document.getElementById(`message-${pinnedId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        toast({
                          title: 'Pinned message not loaded',
                          description:
                            'Load older messages above to view the pinned message.',
                        });
                      }
                    }}
                  >
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Pinned message</p>
                    <p className="text-sm text-[hsl(var(--foreground))] truncate">{conversation.pinnedMessage.content || 'Photo or file'}</p>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-xs"
                    onClick={() => handleUnpinMessage()}
                    aria-label="Unpin message"
                  >
                    Unpin
                  </Button>
                </div>
              )}
              <ScrollArea
                viewportRef={messagesScrollRef}
                onViewportScroll={handleMessagesScroll}
                className="flex-1 min-h-0"
                viewportClassName="overflow-x-hidden"
              >
                <div className="flex flex-col gap-2 py-2 pl-2">
                  {hasMoreMessages && (messages.length >= 50 || headMessages.length > 0) && (
                    <div className="flex justify-center py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMoreMessages}
                        disabled={loadingMore}
                        className="text-[hsl(var(--muted-foreground))]"
                      >
                        {loadingMore ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin mr-1 inline" />
                            Loading...
                          </>
                        ) : (
                          'Load older messages'
                        )}
                      </Button>
                    </div>
                  )}
                  {allMessages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-[hsl(var(--muted-foreground))] text-sm" role="status" aria-label="No messages">
                      <p>No messages yet.</p>
                      <p className="mt-1">Send a message to start the conversation.</p>
                    </div>
                  )}
                  {allMessages.map((message, index) => {
                    const showUnreadDivider =
                      unreadDividerIndex !== -1 && index === unreadDividerIndex;
                    const isAdmin =
                      Array.isArray(conversation.admins) &&
                      conversation.admins.includes(user.uid);
                    const isAdminsOnly = message?.adminsOnly === true;
                    if (isAdminsOnly && !isAdmin) return null;
                    const isSystem = message?.type === 'system';
                    return (
                      <React.Fragment key={message.id}>
                        {showUnreadDivider && (
                          <div className="flex items-center gap-2 py-2">
                            <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                            <span className="px-2 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                              {newMessagesCount} new{' '}
                              {newMessagesCount === 1 ? 'message' : 'messages'}
                            </span>
                            <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                          </div>
                        )}
                        {isSystem ? (
                          <div className="flex justify-center py-2">
                            <span className="px-3 py-1 rounded-full text-xs bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] max-w-[90%] truncate">
                              {message?.content || 'System update'}
                            </span>
                          </div>
                        ) : (
                          <ChatMessageItem
                            message={message as Message}
                            index={index}
                            messages={allMessages as Message[]}
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
                            onDeleteMessage={handleDeleteMessage}
                            onEditMessage={handleStartEdit}
                            onRetryMessage={handleRetryMessage}
                            pinnedMessage={conversation.pinnedMessage}
                            onPinMessage={handlePinMessage}
                            onUnpinMessage={handleUnpinMessage}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Scroll-to-bottom button */}
              {isScrolledUp && newMessagesCount === 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full shadow-lg"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              )}

              {/* Typing indicator – only show OTHER people typing (not yourself) */}
              {(() => {
                const otherTypingIds = (typingUserIds || []).filter((id) => id !== user?.uid);
                if (otherTypingIds.length === 0) return null;
                return (
                  <div className="px-2 py-1.5 text-xs text-[hsl(var(--muted-foreground))] italic flex items-center gap-1">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    {otherTypingIds.length === 1
                      ? (conversation.participantDetails?.[otherTypingIds[0]]?.userName || 'Someone') + ' is typing...'
                      : 'Several people are typing...'}
                  </div>
                );
              })()}
            </CardContent>
            <CardFooter className="bg-[hsl(var(--card))] p-4 border-t border-[hsl(var(--border))] shadow-sm rounded-none sm:rounded-b-xl overflow-hidden w-full min-w-0">
              {isBlocked ? (
                // If blocked, show this message
                <div className="flex h-full w-full items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  <p>{blockMessage}</p>
                </div>
              ) : (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (input.trim().length === 0) return;
                    if (editingMessageId) {
                      const sanitized = DOMPurify.sanitize(input, {
                        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
                        ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
                      });
                      await handleUpdateMessage(editingMessageId, sanitized);
                      return;
                    }
                    const newMessage = {
                      senderId: user.uid,
                      content: input,
                      timestamp: new Date().toISOString(),
                      replyTo: replyToMessageId || null,
                    };
                    clearTypingOnBlur();
                    try {
                      await sendMessage(conversation, newMessage, setInput);
                    } catch (error) {
                      logger.error('Error sending message:', error);
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Failed to send message. Please try again.',
                      });
                    }
                    setReplyToMessageId('');
                  }}
                  className="flex flex-col w-full min-w-0 gap-3"
                  aria-label="Message input form"
                >
                  {editingMessageId && (
                    <div className="flex items-center justify-between p-2 rounded-md bg-[hsl(var(--accent))] border-l-2 border-[hsl(var(--primary))_/_0.7] w-full min-w-0">
                      <span className="text-sm text-[hsl(var(--muted-foreground))]">
                        Editing message
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        aria-label="Cancel edit"
                        onClick={() => {
                          setEditingMessageId(null);
                          setInput('');
                          if (composerRef.current) composerRef.current.innerHTML = '';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {replyToMessageId && (
                    <div className="flex items-center justify-between p-2 rounded-md bg-[hsl(var(--accent))] border-l-2 border-[hsl(var(--primary))_/_0.7] w-full min-w-0 overflow-hidden">
                      {(() => {
                        const replyMsg = allMessages.find(
                          (msg) => msg.id === replyToMessageId,
                        );
                        const raw = replyMsg?.content || '';

                        const isImage = /\.(jpeg|jpg|gif|png)(\?|$)/i.test(raw);
                        const isFile =
                          /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)(\?|$)/i.test(
                            raw,
                          );

                        const label = replyMsg?.voiceMessage
                          ? 'Voice message'
                          : isImage
                            ? 'Photo'
                            : isFile
                              ? 'Document'
                              : raw
                                .replace(/<[^>]*>/g, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/\*|__/g, '')
                                .trim() || 'Message';

                        return (
                          <div className="flex items-center gap-2 min-w-0">
                            {isImage ? (
                              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                                <Image
                                  src={raw}
                                  alt="Reply preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : null}

                            <div className="text-xs italic text-[hsl(var(--muted-foreground))] overflow-hidden whitespace-nowrap text-ellipsis max-w-full min-w-0">
                              Replying to:{' '}
                              <span className="font-semibold">{label}</span>
                            </div>
                          </div>
                        );
                      })()}
                      <Button
                        onClick={() => setReplyToMessageId('')}
                        variant="ghost"
                        size="icon"
                        className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] h-6 w-6 rounded-full"
                        aria-label="Cancel reply"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div className="chat-input-wrapper flex-1 min-w-0 flex items-end gap-3 rounded-xl border-0 bg-[hsl(var(--input))] px-1 shadow-none ring-0 focus-within:ring-0 focus-within:border-0">
                      <div
                        className="flex-shrink-0 self-center pl-2 pr-1 py-1.5"
                        aria-hidden
                      >
                        <EmojiPicker
                          aria-label="Insert emoji"
                          onSelect={handleInsertEmoji}
                        />
                      </div>
                      <div
                        ref={composerRef}
                        contentEditable
                        aria-label="Type a message"
                        aria-placeholder="Type a message..."
                        data-placeholder="Type a message..."
                        className="chat-composer-input flex-1 min-w-0 min-h-[40px] max-h-48 py-2.5 pl-1 pr-3 overflow-y-auto overflow-x-hidden w-full break-words bg-transparent text-[hsl(var(--foreground))] text-sm outline-none border-0 ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[hsl(var(--muted-foreground))]"
                        onBlur={clearTypingOnBlur}
                        onInput={(e) => {
                          const html = (e.currentTarget as HTMLElement)
                            .innerHTML;
                          setInput(html);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                            e.preventDefault();
                            const html = composerRef.current?.innerHTML || '';
                            const textContent =
                              composerRef.current?.innerText || '';
                            if (textContent.trim().length > 0) {
                              const sanitized = DOMPurify.sanitize(html, {
                                ALLOWED_TAGS: [
                                  'b',
                                  'strong',
                                  'i',
                                  'em',
                                  'u',
                                  'br',
                                  'div',
                                  'span',
                                  'a',
                                ],
                                ALLOWED_ATTR: [
                                  'href',
                                  'target',
                                  'rel',
                                  'style',
                                  'class',
                                ],
                              });
                              if (editingMessageId) {
                                await handleUpdateMessage(editingMessageId, sanitized);
                                return;
                              }
                              const newMessage = {
                                senderId: user.uid,
                                content: sanitized,
                                timestamp: new Date().toISOString(),
                                replyTo: replyToMessageId || null,
                              };
                              try {
                                await sendMessage(conversation, newMessage, setInput);
                              } catch (error) {
                                logger.error('Error sending message:', error);
                                toast({
                                  variant: 'destructive',
                                  title: 'Error',
                                  description: 'Failed to send message. Please try again.',
                                });
                              }
                              setReplyToMessageId('');
                              composerRef.current!.innerHTML = '';
                              setInput('');
                            }
                          }
                        }}
                        suppressContentEditableWarning
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="rounded-full border-0 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-[hsl(var(--primary-foreground))] disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 flex-shrink-0"
                      disabled={!input.trim().length || isSending}
                      aria-label={editingMessageId ? 'Update message' : 'Send message'}
                      onClick={async () => {
                        const html = composerRef.current?.innerHTML || '';
                        const textContent =
                          composerRef.current?.innerText || '';
                        if (textContent.trim().length === 0) return;
                        const sanitized = DOMPurify.sanitize(html, {
                          ALLOWED_TAGS: [
                            'b',
                            'strong',
                            'i',
                            'em',
                            'u',
                            'br',
                            'div',
                            'span',
                            'a',
                          ],
                          ALLOWED_ATTR: [
                            'href',
                            'target',
                            'rel',
                            'style',
                            'class',
                          ],
                        });
                        if (editingMessageId) {
                          await handleUpdateMessage(editingMessageId, sanitized);
                          return;
                        }
                        const newMessage = {
                          senderId: user.uid,
                          content: sanitized,
                          timestamp: new Date().toISOString(),
                          replyTo: replyToMessageId || null,
                        };
                        try {
                          await sendMessage(conversation, newMessage, setInput);
                        } catch (error) {
                          logger.error('Error sending message:', error);
                          toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Failed to send message. Please try again.',
                          });
                        }
                        setReplyToMessageId('');
                        composerRef.current!.innerHTML = '';
                        setInput('');
                      }}
                    >
                      {isSending ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1">
                    {/* Desktop: Always visible formatting buttons */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleBold}
                      title="Bold"
                      aria-label="Bold"
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hidden md:inline-flex"
                    >
                      {' '}
                      <Bold className="h-4 w-4" />{' '}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleitalics}
                      title="Italic"
                      aria-label="Italic"
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hidden md:inline-flex"
                    >
                      {' '}
                      <Italic className="h-4 w-4" />{' '}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleUnderline}
                      title="Underline"
                      aria-label="Underline"
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hidden md:inline-flex"
                    >
                      {' '}
                      <Underline className="h-4 w-4" />{' '}
                    </Button>

                    {/* Mobile: Toggle button for formatting options */}
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleFormattingOptions}
                            title="Formatting options"
                            aria-label="Formatting options"
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] md:hidden"
                          >
                            {' '}
                            <Text className="h-4 w-4" />{' '}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Formatting</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Mobile: Expandable formatting options */}
                    {showFormattingOptions && (
                      <div className="flex md:hidden items-center space-x-1 bg-[hsl(var(--muted))] dark:bg-[hsl(var(--accent))] rounded-md">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleBold}
                          title="Bold"
                          aria-label="Bold"
                          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        >
                          {' '}
                          <Bold className="h-4 w-4" />{' '}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleitalics}
                          title="Italic"
                          aria-label="Italic"
                          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        >
                          {' '}
                          <Italic className="h-4 w-4" />{' '}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleUnderline}
                          title="Underline"
                          aria-label="Underline"
                          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        >
                          {' '}
                          <Underline className="h-4 w-4" />{' '}
                        </Button>
                      </div>
                    )}
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleFileUpload}
                            title="Upload file"
                            aria-label="Upload file"
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                          >
                            {' '}
                            <Upload className="h-4 w-4" />{' '}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Upload file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        {/* <TooltipTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" onClick={handleCreateMeet} title="Create Google Meet" aria-label="Create Google Meet" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"> <Video className="h-4 w-4" /> </Button>
                        </TooltipTrigger> */}
                        <TooltipContent side="top">
                          <p>Create Google Meet</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {recordingStatus === 'idle' && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={startRecording}
                              title="Record voice message"
                              aria-label="Record voice message"
                              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Record voice</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <div className="ml-auto md:hidden"></div>
                  </div>

                  {/* Voice Recording UI */}
                  {recordingStatus !== 'idle' &&
                    recordingStatus !== 'uploading' && ( // Hide this part during uploading too
                      <div className="p-2 border-t border-[hsl(var(--border))]">
                        {recordingStatus === 'permission_pending' && (
                          <div className="flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Requesting microphone permission...
                          </div>
                        )}
                        {recordingStatus === 'recording' && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-red-500">
                              <Mic className="w-4 h-4 mr-2 animate-pulse" />
                              Recording... {formatDuration(recordingDuration)}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={stopRecording}
                              title="Stop recording"
                              className="text-red-500 hover:text-red-700"
                            >
                              <StopCircle className="h-6 w-6" />
                            </Button>
                          </div>
                        )}
                        {recordingStatus === 'recorded' && audioUrl && (
                          <div className="flex flex-col space-y-2">
                            <div className="text-sm font-medium">
                              Recording complete (
                              {formatDuration(recordingDuration)})
                            </div>
                            <audio
                              ref={audioPreviewRef}
                              src={audioUrl}
                              controls
                              className="w-full h-10"
                            />
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={discardRecording}
                                title="Discard recording"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Discard
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={handleSendVoiceMessage}
                                title="Send voice message"
                              >
                                <Send className="h-4 w-4 mr-1" /> Send
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Uploading indicator was here, moved below */}
                      </div>
                    )}
                  {/* Separate block for uploading indicator to ensure it's visible */}
                  {recordingStatus === 'uploading' && (
                    <div className="p-2 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))]">
                      <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                      Uploading voice message...
                    </div>
                  )}
                </form>
              )}
            </CardFooter>
          </Card>
          <Dialog open={openReport} onOpenChange={setOpenReport}>
            <DialogPortal>
              <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] transition-opacity duration-300 animate-in fade-in" />

              <DialogContent
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             z-[50] bg-background border border-border
             shadow-2xl rounded-2xl max-w-xl w-full p-6
             transition-transform duration-300 animate-in fade-in zoom-in-95"
              >
                <DialogHeader></DialogHeader>
                <NewReportTab reportData={reportData} />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </>
      )}
    </>
  );
}
