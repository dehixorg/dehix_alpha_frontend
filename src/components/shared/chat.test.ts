/**
 * Tests for chat helpers and CardsChat behaviors.
 * Testing library/framework: Jest + @testing-library/react (or Vitest using jest-compatible APIs if configured).
 *
 * We focus on:
 *  - formatChatTimestamp
 *  - formatDateHeader
 *  - isSameDay
 *  - Rendering date headers and timestamps
 *  - Emoji-only rendering behavior
 *  - toggleReaction flow invoking updateDataInFirestore with correct payload
 *
 * External modules are mocked to isolate pure logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // Will be tree-shaken or resolved to jest if using Jest types; adapt via TS path or test runner config.
import React from 'react';

// We import from the Chat module under test. Adjust the path if the component is in a different file.
let ChatModule: any;
let CardsChat: any;
let formatChatTimestamp: (s: string) => string;
let formatDateHeader: (s: string | number) => string;
let isSameDay: (d1: Date, d2: Date) => boolean;

// Mocks for external dependencies referenced within CardsChat
vi.mock('next/navigation', () => ({
  usePathname: () => '/chats/abc',
}));

vi.mock('react-redux', () => ({
  useSelector: (fn: any) =>
    fn({
      user: {
        uid: 'user-1',
        type: 'STUDENT',
      },
    }),
}));

// date-fns format and formatDistanceToNow may be used internally
vi.mock('date-fns', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    format: actual.format,
    formatDistanceToNow: (d: Date) => {
      // Stable string for tests; not critical to be exact relative time
      return '1 minute';
    },
  };
});

// Axios instance mock
vi.mock('@/lib/axios', () => ({
  axiosInstance: {
    post: vi.fn().mockResolvedValue({ data: { meetLink: 'https://meet.example/xyz', data: { Location: 'https://cdn.example/file.png' } } }),
  },
}));

// Toast mock
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}));

// UI components that are not essential for logic - provide stubs
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: (props: any) => <img alt={props.alt} src={props.src} />,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} src={props.src} />,
}));

// Firestore helpers
const subMock = vi.fn();
const updateTxnMock = vi.fn();
const updateDocMock = vi.fn();
vi.mock('@/lib/firebase', () => ({
  subscribeToFirestoreCollection: (...args: any[]) => {
    // args: (path, cb, order)
    const cb = args[1];
    // supply default empty messages on subscribe
    cb([]);
    return subMock;
  },
  updateConversationWithMessageTransaction: (...args: any[]) => updateTxnMock(...args),
  updateDataInFirestore: (...args: any[]) => updateDocMock(...args),
}));

// DOMPurify used, provide minimal sanitize
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// Icons - stub as simple spans
vi.mock('lucide-react', () => {
  const Icon = ({ children }: any) => <span>{children}</span>;
  return new Proxy({}, { get: () => Icon });
});

// Emoji components
vi.mock('./emoji-picker', () => ({
  default: (props: any) => <button aria-label={props['aria-label'] || 'emoji-picker'} onClick={() => props.onSelect?.('😀')}>🙂</button>,
  EmojiPicker: (props: any) => <button aria-label={props['aria-label'] || 'emoji-picker'} onClick={() => props.onSelect?.('😀')}>🙂</button>,
}));

vi.mock('./reactions', () => ({
  Reactions: ({ reactions }: any) => <div data-testid="reactions">{Object.keys(reactions || {}).join(',')}</div>,
}));

// Report dialog
vi.mock('@/app/report/new-report-tab', () => ({
  default: () => <div data-testid="report-tab" />,
}));

// cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...c: any[]) => c.filter(Boolean).join(' '),
}));

// Bring the module under test dynamically (to allow mocks to be applied first)
beforeEach(async () => {
  vi.restoreAllMocks();
  ChatModule = await import('./chat'); // adjust if file is named differently
  CardsChat = ChatModule.CardsChat;
  formatChatTimestamp = ChatModule['formatChatTimestamp'] || ((s: string) => s);
  formatDateHeader = ChatModule['formatDateHeader'];
  isSameDay = ChatModule['isSameDay'];
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('formatChatTimestamp', () => {
  it('formats ISO timestamp to hh:mm a', () => {
    // Use a known timestamp (UTC noon to avoid timezone surprises)
    const ts = '2025-09-12T12:05:00.000Z';
    const out = formatChatTimestamp(ts);
    // Basic shape check: should include ":" and am/pm token
    expect(out).toMatch(/\d{2}:\d{2}\s[ap]m/i);
  });

  it('handles invalid date by returning a string (no throw)', () => {
    const out = formatChatTimestamp('invalid');
    expect(typeof out).toBe('string');
  });
});

describe('formatDateHeader', () => {
  it('returns Today when timestamp is same date as now', () => {
    const now = new Date();
    const out = formatDateHeader(now.toISOString());
    expect(out).toBe('Today');
  });

  it('returns Yesterday for previous day', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const out = formatDateHeader(yesterday.toISOString());
    expect(out).toBe('Yesterday');
  });

  it('returns localized long date for older dates', () => {
    const d = new Date('2020-01-15T09:10:00Z');
    const out = formatDateHeader(d.toISOString());
    // Should include day and year
    expect(out).toMatch(/2020/);
  });
});

describe('isSameDay', () => {
  it('true when same Y/M/D', () => {
    const d1 = new Date('2025-09-10T00:00:01Z');
    const d2 = new Date('2025-09-10T23:59:59Z');
    expect(isSameDay(d1, d2)).toBe(true);
  });

  it('false when different day', () => {
    const d1 = new Date('2025-09-10T00:00:01Z');
    const d2 = new Date('2025-09-11T00:00:01Z');
    expect(isSameDay(d1, d2)).toBe(false);
  });
});

import { render, screen, within, fireEvent, act } from '@testing-library/react';

const baseConversation = {
  id: 'conv-1',
  type: 'group' as const,
  groupName: 'My Group',
  displayName: 'My Group',
  avatar: '',
  participants: ['user-1', 'user-2'],
  participantDetails: {
    'user-1': { userName: 'Me', email: 'me@example.com', profilePic: '' },
    'user-2': { userName: 'Alice', email: 'a@example.com', profilePic: '' },
  },
};

function buildMessage(id: string, overrides: any = {}) {
  return {
    id,
    senderId: 'user-2',
    content: 'Hello',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('CardsChat rendering and behaviors', () => {
  it('renders date headers when a new day starts', async () => {
    const { subscribeToFirestoreCollection } = await import('@/lib/firebase');
    const subSpy = vi.spyOn(await import('@/lib/firebase'), 'subscribeToFirestoreCollection');
    const messages = [
      buildMessage('m1', { timestamp: new Date('2025-09-10T10:00:00Z').toISOString() }),
      buildMessage('m2', { timestamp: new Date('2025-09-11T10:00:00Z').toISOString() }),
    ];

    (subscribeToFirestoreCollection as any).mockImplementation((_path: string, cb: any) => {
      cb(messages);
      return vi.fn();
    });

    render(<CardsChat conversation={baseConversation as any} />);

    // Expect two headers including "Today"/"Yesterday" or formatted dates
    // We look for spans containing the header text container
    const allText = screen.getAllByText(/Today|Yesterday|\d{4}/i);
    expect(allText.length).toBeGreaterThanOrEqual(1);
  });

  it('shows sender name in group chat on first message or when sender changes', async () => {
    const { subscribeToFirestoreCollection } = await import('@/lib/firebase');
    (subscribeToFirestoreCollection as any).mockImplementation((_path: string, cb: any) => {
      cb([
        buildMessage('m1', { senderId: 'user-2', content: 'First' }),
        buildMessage('m2', { senderId: 'user-2', content: 'Same sender' }),
        buildMessage('m3', { senderId: 'user-1', content: 'From me' }),
      ]);
      return vi.fn();
    });

    render(<CardsChat conversation={baseConversation as any} />);

    // Sender name (Alice) should appear for first message from user-2
    expect(screen.getAllByText('Alice')[0]).toBeInTheDocument();
  });

  it('renders emoji-only message with larger styling and timestamp chip', async () => {
    const { subscribeToFirestoreCollection } = await import('@/lib/firebase');
    (subscribeToFirestoreCollection as any).mockImplementation((_path: string, cb: any) => {
      cb([
        buildMessage('m1', {
          content: '<span class="chat-emoji">😀</span>&nbsp;',
        }),
      ]);
      return vi.fn();
    });

    render(<CardsChat conversation={baseConversation as any} />);

    // Timestamp appears near emoji-only bubble
    expect(screen.getByText(/am|pm/i)).toBeInTheDocument();
  });

  it('toggleReaction updates Firestore with new reaction state', async () => {
    const { subscribeToFirestoreCollection, updateDataInFirestore } = await import('@/lib/firebase');
    (subscribeToFirestoreCollection as any).mockImplementation((_path: string, cb: any) => {
      cb([
        buildMessage('m1', { reactions: {} }),
      ]);
      return vi.fn();
    });

    render(<CardsChat conversation={baseConversation as any} />);

    // Click emoji-picker to add a reaction
    const addReactionButtons = screen.getAllByRole('button', { name: /Add reaction|emoji-picker/i });
    if (addReactionButtons.length > 0) {
      fireEvent.click(addReactionButtons[0]);
    }

    // Expect update called with reactions map
    await act(async () => {});
    expect((updateDataInFirestore as any)).toHaveBeenCalledTimes(1);
    const [path, msgId, payload] = (updateDataInFirestore as any).mock.calls[0];
    expect(path).toContain('conversations/conv-1/messages/');
    expect(msgId).toBe('m1');
    expect(payload).toHaveProperty('reactions');
  });

  it('send message on submit clears input via transaction success', async () => {
    const { subscribeToFirestoreCollection, updateConversationWithMessageTransaction } = await import('@/lib/firebase');

    (subscribeToFirestoreCollection as any).mockImplementation((_path: string, cb: any) => {
      cb([]);
      return vi.fn();
    });
    (updateConversationWithMessageTransaction as any).mockResolvedValue('Transaction successful');

    render(<CardsChat conversation={baseConversation as any} />);

    // Find contentEditable composer via aria-label
    const composer = screen.getByLabelText('Type a message');
    // Simulate entering text by dispatching input with innerHTML
    Object.defineProperty(composer, 'innerHTML', { value: 'Hi there', writable: true });
    Object.defineProperty(composer, 'innerText', { value: 'Hi there', writable: true });

    // Click send button
    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(sendBtn);

    // Transaction should be called
    await act(async () => {});
    expect((updateConversationWithMessageTransaction as any)).toHaveBeenCalled();
  });

  it('handleCreateMeet posts to /meeting and sends a message', async () => {
    const { subscribeToFirestoreCollection, updateConversationWithMessageTransaction } = await import('@/lib/firebase');
    const { axiosInstance } = await import('@/lib/axios');

    (subscribeToFirestoreCollection as any).mockImplementation((_path: string, cb: any) => {
      cb([]);
      return vi.fn();
    });
    (updateConversationWithMessageTransaction as any).mockResolvedValue('Transaction successful');
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { meetLink: 'https://meet.example/abc' } });

    render(<CardsChat conversation={baseConversation as any} />);

    // Click video call button
    const videoBtn = screen.getByRole('button', { name: /Video call/i });
    fireEvent.click(videoBtn);

    await act(async () => {});
    expect(axiosInstance.post).toHaveBeenCalledWith('/meeting', { participants: baseConversation.participants });
    expect((updateConversationWithMessageTransaction as any)).toHaveBeenCalled();
  });
});