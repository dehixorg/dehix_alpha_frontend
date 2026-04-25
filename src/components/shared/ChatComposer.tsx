'use client';

import React, { useRef, useState, useCallback, useEffect, memo } from 'react';
import DOMPurify from 'dompurify';
import {
  Send,
  LoaderCircle,
  Upload,
  Text,
  Bold,
  Italic,
  Underline,
  Mic,
  StopCircle,
  X,
} from 'lucide-react';

import { EmojiPicker } from '../emojiPicker';

import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Message = {
  senderId: string;
  content: string;
  timestamp: string;
  replyTo?: string | null;
  voiceMessage?: { duration: number; type: 'voice' };
};

interface ChatComposerProps {
  userId: string;
  isSending: boolean;
  isBlocked: boolean;
  blockMessage: string;
  replyToMessageId: string;
  replyMessage?: { content: string; voiceMessage?: any } | null;
  onSendMessage: (message: Message) => Promise<void>;
  onSetReplyToMessageId: (id: string) => void;
  onFileUpload: () => Promise<void>;
}

// Consolidate all sanitization logic into one function
const sanitizeMessage = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'span', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
  });
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Memoize composer to prevent re-renders from parent
export const ChatComposer = memo(
  ({
    userId,
    isSending,
    isBlocked,
    blockMessage,
    replyToMessageId,
    replyMessage,
    onSendMessage,
    onSetReplyToMessageId,
    onFileUpload,
  }: ChatComposerProps) => {
    const { toast } = useToast();
    const composerRef = useRef<HTMLDivElement | null>(null);
    const [input, setInput] = useState('');
    const [showFormattingOptions, setShowFormattingOptions] = useState(false);
    const [, setTick] = useState(0);

    // Voice recording state
    type RecordingStatus =
      | 'idle'
      | 'permission_pending'
      | 'recording'
      | 'recorded'
      | 'uploading';
    const [recordingStatus, setRecordingStatus] =
      useState<RecordingStatus>('idle');
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
      null,
    );
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const recordingDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Unified send logic - consolidates all send paths
    const sendComposedMessage = useCallback(async () => {
      const html = composerRef.current?.innerHTML || '';
      const textContent = composerRef.current?.innerText || '';

      if (textContent.trim().length === 0) return;

      const sanitized = sanitizeMessage(html);
      const newMessage: Message = {
        senderId: userId,
        content: sanitized,
        timestamp: new Date().toISOString(),
        replyTo: replyToMessageId || null,
      };

      try {
        await onSendMessage(newMessage);
        composerRef.current!.innerHTML = '';
        setInput('');
        onSetReplyToMessageId('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }, [userId, replyToMessageId, onSendMessage, onSetReplyToMessageId]);

    // Handle Enter key
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSending) {
          e.preventDefault();
          sendComposedMessage();
        }
      },
      [isSending, sendComposedMessage],
    );

    // Formatting commands
    const isFormatActive = useCallback((command: string): boolean => {
      try {
        return document.queryCommandState(command);
      } catch {
        return false;
      }
    }, []);

    const handleBold = useCallback(() => {
      composerRef.current?.focus();
      document.execCommand('bold');
      setTick((t) => t + 1);
    }, []);

    const handleItalics = useCallback(() => {
      composerRef.current?.focus();
      document.execCommand('italic');
      setTick((t) => t + 1);
    }, []);

    const handleUnderline = useCallback(() => {
      composerRef.current?.focus();
      document.execCommand('underline');
      setTick((t) => t + 1);
    }, []);

    const handleInsertEmoji = useCallback((emoji: string) => {
      if (composerRef.current) {
        composerRef.current.focus();
        const htmlEmoji = `<span class="chat-emoji">${emoji}</span>&nbsp;`;
        document.execCommand('insertHTML', false, htmlEmoji);
        const html = composerRef.current.innerHTML;
        setInput(html);
      }
    }, []);

    // Voice recording handlers
    const startRecording = useCallback(async () => {
      if (recordingStatus === 'recording') return;
      setRecordingStatus('permission_pending');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          setAudioChunks((prev) => [...prev, event.data]);
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          setRecordingStatus('recorded');
          if (recordingDurationIntervalRef.current) {
            clearInterval(recordingDurationIntervalRef.current);
          }
        };

        recorder.start();
        setAudioChunks([]);
        setAudioBlob(null);
        setAudioUrl(null);
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
        console.error('Error accessing microphone:', err);
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access microphone. Please check permissions.',
        });
        setRecordingStatus('idle');
      }
    }, [recordingStatus, toast]);

    const stopRecording = useCallback(() => {
      if (mediaRecorder && recordingStatus === 'recording') {
        mediaRecorder.stop();
      }
      if (recordingDurationIntervalRef.current) {
        clearInterval(recordingDurationIntervalRef.current);
      }
    }, [mediaRecorder, recordingStatus]);

    const discardRecording = useCallback(() => {
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
    }, [audioUrl, toast]);

    // Create blob when recording stops
    useEffect(() => {
      if (recordingStatus === 'recorded' && audioChunks.length > 0) {
        const blob = new Blob(audioChunks, {
          type: mediaRecorder?.mimeType || 'audio/webm',
        });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioChunks([]);
      }
    }, [audioChunks, recordingStatus, mediaRecorder?.mimeType]);

    if (isBlocked) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-lg border bg-gray-100 p-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <p>{blockMessage}</p>
        </div>
      );
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim().length === 0) return;
          sendComposedMessage();
        }}
        className="flex flex-col w-full space-y-2"
        aria-label="Message input form"
      >
        {/* Reply Preview */}
        {replyToMessageId && replyMessage && (
          <div className="flex items-center justify-between p-2 rounded-md bg-[hsl(var(--accent))] border-l-2 border-[hsl(var(--primary))_/_0.7]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-xs italic text-[hsl(var(--muted-foreground))] overflow-hidden whitespace-nowrap text-ellipsis max-w-full min-w-0">
                Replying to:{' '}
                <span className="font-semibold">{replyMessage.content}</span>
              </div>
            </div>
            <Button
              onClick={() => onSetReplyToMessageId('')}
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] h-6 w-6 rounded-full"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Input Area */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 flex items-center justify-center pl-0.1 z-10">
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
              className="w-full pl-12 min-h-[36px] max-h-60 overflow-y-auto break-words border border-[hsl(var(--input))] rounded-lg p-2.5 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[hsl(var(--muted-foreground))]"
              onInput={(e) => {
                const html = (e.currentTarget as HTMLElement).innerHTML;
                setInput(html);
              }}
              onKeyUp={() => setTick((t) => t + 1)}
              onMouseUp={() => setTick((t) => t + 1)}
              onFocus={() => setTick((t) => t + 1)}
              onKeyDown={handleKeyDown}
              suppressContentEditableWarning
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full bg-[#96c] hover:bg-[#96c]/90 text-white disabled:bg-[#96c]/50"
            disabled={!input.trim().length || isSending}
            aria-label="Send message"
            onClick={sendComposedMessage}
          >
            {isSending ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-1">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setShowFormattingOptions(!showFormattingOptions)
                  }
                  title="Formatting options"
                  aria-label="Formatting options"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hidden md:inline-flex"
                >
                  <Text className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Formatting</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {showFormattingOptions && (
            <div className="hidden md:flex items-center space-x-1 bg-[#d7dae0] dark:bg-[hsl(var(--accent))] rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleBold}
                title="Bold"
                aria-label="Bold"
                className={
                  isFormatActive('bold')
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleItalics}
                title="Italic"
                aria-label="Italic"
                className={
                  isFormatActive('italic')
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleUnderline}
                title="Underline"
                aria-label="Underline"
                className={
                  isFormatActive('underline')
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }
              >
                <Underline className="h-4 w-4" />
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
                  onClick={onFileUpload}
                  title="Upload file"
                  aria-label="Upload file"
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Upload file</p>
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
        {recordingStatus !== 'idle' && recordingStatus !== 'uploading' && (
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
              <div className="flex items-center gap-2">
                <audio src={audioUrl} controls className="flex-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={discardRecording}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Discard recording"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </form>
    );
  },
);

ChatComposer.displayName = 'ChatComposer';
