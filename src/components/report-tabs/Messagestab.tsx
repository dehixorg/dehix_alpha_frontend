import { useState, useEffect, useRef } from 'react';

import { apiHelperService } from '@/services/report';
import { toast } from '@/components/ui/use-toast';

interface MessagesTabProps {
  id: string;
  reportStatus: 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'RESOLVED';
}

export const MessagesTab = ({ id, reportStatus }: MessagesTabProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDisabled =
    reportStatus === 'OPEN' || reportStatus === 'CLOSED' || sending;

  const fetchMessages = async () => {
    try {
      const res = await apiHelperService.getSingleReport(id);
      const newMessages = res.data?.data?.messages || [];

      if (newMessages.length !== messages.length) {
        setMessages(newMessages);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages.',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    setSending(true);
    try {
      await apiHelperService.sendMessageToReport(id, {
        sender: 'user',
        text,
      });
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text, createdAt: new Date().toISOString() },
      ]);
      setText('');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] border border-border rounded-md overflow-hidden bg-transparent text-card-foreground">
      <div className="px-4 py-2 border-b border-border bg-card text-center font-semibold">
        Past Reports
      </div>

      <div className="flex-1 overflow-y-auto bg-background px-4 py-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No messages yet
          </p>
        )}
        <div className="flex flex-col gap-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] px-4 py-2 rounded-lg text-sm break-words whitespace-pre-wrap shadow-sm border ${
                m.sender === 'admin'
                  ? 'bg-primary text-primary-foreground border-transparent text-right self-end ml-auto'
                  : 'bg-muted text-foreground border-border text-left self-start mr-auto'
              }`}
            >
              <span className="block font-semibold mb-1">{m.sender}</span>
              <span className="block">{m.text}</span>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex items-center space-x-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isDisabled}
            className="flex-1 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder={
              reportStatus !== 'IN_PROGRESS'
                ? 'Messaging disabled'
                : 'Type your message...'
            }
          />
          <button
            onClick={sendMessage}
            disabled={isDisabled}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
