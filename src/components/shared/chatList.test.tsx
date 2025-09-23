/**
 * Test runner/framework: Jest + React Testing Library (assumed from common project conventions).
 * If this project uses Vitest, replace imports from '@testing-library/jest-dom' and jest.fn with the Vitest equivalents,
 * and ensure setup files are configured accordingly.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';

// We mock external hooks and libs used by ChatList to keep tests deterministic.
jest.mock('date-fns', () => ({
  // Return a stable relative time for predictable UI assertions
  formatDistanceToNow: jest.fn(() => '2 minutes'),
}));

// Mock Redux selector
jest.mock('react-redux', () => ({
  useSelector: (sel: any) => sel({ user: { uid: 'currentUser' } }),
}));

// Mock hooks/useAllUsers and hooks/use-toast as they are used in effects
jest.mock('@/hooks/useAllUsers', () => ({
  useAllUsers: () => ({ users: [] }),
}));
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock UI components with simple passthroughs to avoid style/portal issues in tests
jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));
jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
}));
jest.mock('../ui/avatar', () => ({
  Avatar: ({ children, ...rest }: any) => <div data-testid="avatar" {...rest}>{children}</div>,
  AvatarImage: (props: any) => <img data-testid="avatar-image" {...props} />,
  AvatarFallback: ({ children }: any) => <span data-testid="avatar-fallback">{children}</span>,
}));

// Mock icon components
jest.mock('lucide-react', () => ({
  SquarePen: (props: any) => <svg data-testid="icon-square-pen" {...props} />,
  Search: (props: any) => <svg data-testid="icon-search" {...props} />,
  MessageSquare: (props: any) => <svg data-testid="icon-message-square" {...props} />,
}));

// Mock cn utility to simply join classes for determinism
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Import the component under test.
// If the project exposes ChatList from a different path, update the import accordingly.
import { ChatList } from './chatList';

type Conversation = Parameters<typeof ChatList>[0]['conversations'][number];

// Helpers to build conversations

const baseUserDetails = {
  userA: { userName: 'Alice', profilePic: 'https://example.com/a.png', email: 'alice@example.com' },
  userB: { userName: 'Bob', profilePic: 'https://example.com/b.png', email: 'bob@example.com' },
};

const individualConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'c1',
  participants: ['currentUser', 'userA'],
  type: 'individual',
  lastMessage: { content: 'Hello <b>World</b>&nbsp;\\!', senderId: 'userA', timestamp: new Date().toISOString() },
  participantDetails: { userA: baseUserDetails.userA },
  project_name: 'Project Alpha',
  timestamp: new Date().toISOString(),
  ...overrides,
});

const groupConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'c2',
  participants: ['currentUser', 'userA', 'userB'],
  type: 'group',
  groupName: 'Dev Group',
  avatar: 'https://example.com/group.png',
  lastMessage: { content: 'Group update posted', senderId: 'userB', timestamp: new Date().toISOString() },
  participantDetails: { userA: baseUserDetails.userA, userB: baseUserDetails.userB },
  project_name: 'Project Beta',
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe('ChatList', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // For setInterval in component
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('renders conversations with cleaned and possibly truncated last message plus relative time', () => {
    const conversations: Conversation[] = [
      individualConversation(), // has HTML in message
      individualConversation({
        id: 'c3',
        lastMessage: { content: 'x'.repeat(60) }, // triggers truncation to 40 + ...
        participantDetails: { userA: baseUserDetails.userA },
        participants: ['currentUser', 'userA'],
        project_name: 'Project Gamma',
      }),
      individualConversation({
        id: 'c4',
        lastMessage: null, // "No messages yet"
        participantDetails: { userA: baseUserDetails.userA },
        participants: ['currentUser', 'userA'],
        project_name: 'Project Delta',
      }),
    ];

    render(
      <ChatList
        conversations={conversations}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    // First conversation: HTML stripped, &nbsp; converted to space
    expect(screen.getByText('Hello World\\!')).toBeInTheDocument();

    // Second conversation: truncated to 40 chars + ellipsis
    const truncated = 'x'.repeat(40) + '...';
    expect(screen.getByText(truncated)).toBeInTheDocument();

    // Third conversation: no messages yet
    expect(screen.getByText('No messages yet')).toBeInTheDocument();

    // Relative time from mocked date-fns
    // Each rendered item should show "2 minutes ago"
    const timeBadges = screen.getAllByText('2 minutes ago');
    expect(timeBadges.length).toBeGreaterThanOrEqual(2);
  });

  test('shows "N/A" when conversation has no timestamp and "Invalid date" for bad timestamp', () => {
    const conversations: Conversation[] = [
      individualConversation({ id: 'no-ts', timestamp: undefined }),
      individualConversation({ id: 'bad-ts', timestamp: 'not-a-date' as any }),
    ];

    // Override date-fns to throw on invalid date
    const dateFns = require('date-fns');
    (dateFns.formatDistanceToNow as jest.Mock).mockImplementationOnce(() => '2 minutes')
      .mockImplementationOnce(() => { throw new Error('invalid'); });

    render(
      <ChatList
        conversations={conversations}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    // For no timestamp, UI uses 'N/A'
    expect(screen.getByText('N/A')).toBeInTheDocument();

    // For invalid timestamp, UI shows 'Invalid date'
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  test('filters by project name and last message content via search input', () => {
    const conversations: Conversation[] = [
      individualConversation({ id: 'alpha', project_name: 'Alpha Project', lastMessage: { content: 'alpha ping' } }),
      individualConversation({ id: 'beta', project_name: 'Beta Board', lastMessage: { content: 'status: ok' } }),
    ];

    render(
      <ChatList
        conversations={conversations}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    // Initially both visible by last message content lines
    expect(screen.getByText(/alpha ping/i)).toBeInTheDocument();
    expect(screen.getByText(/status: ok/i)).toBeInTheDocument();

    const input = screen.getByLabelText('Search conversations');

    // Filter by project name
    fireEvent.change(input, { target: { value: 'beta' } });
    expect(screen.queryByText(/alpha ping/i)).not.toBeInTheDocument();
    expect(screen.getByText(/status: ok/i)).toBeInTheDocument();

    // Filter by last message content
    fireEvent.change(input, { target: { value: 'alpha ping' } });
    expect(screen.getByText(/alpha ping/i)).toBeInTheDocument();
    expect(screen.queryByText(/status: ok/i)).not.toBeInTheDocument();
  });

  test('clicking a conversation item calls setConversation; clicking profile icon stops propagation', () => {
    const setConversation = jest.fn();
    const onOpenProfileSidebar = jest.fn();

    const conversations: Conversation[] = [
      individualConversation({ id: 'item1' }),
    ];

    render(
      <ChatList
        conversations={conversations}
        active={null}
        setConversation={setConversation}
        onOpenProfileSidebar={onOpenProfileSidebar}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    // There should be a list item div; click it to set active conversation
    const item = screen.getByText('Alice').closest('div');
    // Find the clickable container that has both avatar and details; the item clickable has role none, use nearest "cursor-pointer" container by test approach:
    // We will click on the user name text which resides in the clickable container.
    fireEvent.click(screen.getByText('Alice'));
    expect(setConversation).toHaveBeenCalledTimes(1);
    expect(setConversation.mock.calls[0][0].id).toBe('item1');

    // Click the avatar container which delegates to handleProfileIconClick and stops propagation
    const avatar = screen.getAllByTestId('avatar')[0];
    fireEvent.click(avatar);
    expect(onOpenProfileSidebar).toHaveBeenCalledTimes(1);
    expect(setConversation).toHaveBeenCalledTimes(1); // no additional call due to stopPropagation
  });

  test('profile sidebar opens with correct args for group vs. individual', () => {
    const onOpenProfileSidebar = jest.fn();

    const conversations: Conversation[] = [
      individualConversation({ id: 'ind', participants: ['currentUser', 'userA'] }),
      groupConversation({ id: 'grp', groupName: 'Dev Group', avatar: 'https://example.com/group.png' }),
    ];

    render(
      <ChatList
        conversations={conversations}
        active={null}
        setConversation={jest.fn()}
        onOpenProfileSidebar={onOpenProfileSidebar}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    const avatars = screen.getAllByTestId('avatar');

    // First avatar: individual
    fireEvent.click(avatars[0]);
    expect(onOpenProfileSidebar).toHaveBeenCalledWith(
      'userA',
      'user',
      expect.objectContaining({
        userName: 'Alice',
        email: 'alice@example.com',
        profilePic: 'https://example.com/a.png',
      })
    );

    // Second avatar: group
    fireEvent.click(avatars[1]);
    expect(onOpenProfileSidebar).toHaveBeenCalledWith(
      'grp',
      'group',
      expect.objectContaining({
        userName: 'Dev Group',
        profilePic: 'https://example.com/group.png',
      })
    );
  });

  test('"New Chat" button triggers onOpenNewChatDialog', () => {
    const onOpenNewChatDialog = jest.fn();

    render(
      <ChatList
        conversations={[individualConversation()]}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={onOpenNewChatDialog}
      />
    );

    const btn = screen.getByRole('button', { name: /new chat/i });
    fireEvent.click(btn);
    expect(onOpenNewChatDialog).toHaveBeenCalledTimes(1);
  });

  test('empty states: no conversations vs. no matches when searching', () => {
    const { rerender } = render(
      <ChatList
        conversations={[]}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    // No conversations
    expect(screen.getByText('No conversations found')).toBeInTheDocument();
    expect(screen.getByText('Start a new chat or wait for others to connect\\!')).toBeInTheDocument();

    // Now with conversations but search that yields no result
    rerender(
      <ChatList
        conversations={[individualConversation({ project_name: 'Zeta' })]}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    const input = screen.getByLabelText('Search conversations');
    fireEvent.change(input, { target: { value: 'nope' } });

    expect(screen.getByText('No matching conversations')).toBeInTheDocument();
    expect(screen.queryByText('Start a new chat or wait for others to connect\\!')).not.toBeInTheDocument();
  });

  test('avatar image src/alt and fallback initials render correctly', () => {
    const convs: Conversation[] = [
      groupConversation({ id: 'g', groupName: 'Builders', avatar: 'https://example.com/g.png' }),
      individualConversation({
        id: 'i',
        participants: ['currentUser', 'userA'],
        participantDetails: { userA: { ...baseUserDetails.userA, userName: 'Charlie' } },
      }),
      individualConversation({
        id: 'i2',
        participants: ['currentUser', 'userX'],
        participantDetails: {}, // missing details: fallback should display 'P'
      }),
    ];

    render(
      <ChatList
        conversations={convs}
        active={null}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    const images = screen.getAllByTestId('avatar-image');
    expect(images[0]).toHaveAttribute('src', 'https://example.com/g.png');
    expect(images[0]).toHaveAttribute('alt', 'Builders'); // group alt equals groupName
    expect(images[1]).toHaveAttribute('src', 'https://example.com/a.png');
    expect(images[1]).toHaveAttribute('alt', 'Charlie');

    // Fallback initials: first group "B" from Builders, then "C" from Charlie, then default "P"
    const fallbacks = screen.getAllByTestId('avatar-fallback').map((el) => el.textContent);
    expect(fallbacks).toEqual(expect.arrayContaining(['B', 'C', 'P']));
  });

  test('active conversation row has the active background classes', () => {
    const activeConv = individualConversation({ id: 'active' });
    const otherConv = individualConversation({ id: 'other', participants: ['currentUser', 'userB'], participantDetails: { userB: baseUserDetails.userB } });

    render(
      <ChatList
        conversations={[activeConv, otherConv]}
        active={activeConv}
        setConversation={jest.fn()}
        onOpenNewChatDialog={jest.fn()}
      />
    );

    // Find rows by last message snippets to differentiate them
    const activeRow = screen.getByText('Hello World\\!').closest('div');
    expect(activeRow).toHaveClass('bg-[#d6dae2a8]', 'dark:bg-[#35383b9e]');
  });
});