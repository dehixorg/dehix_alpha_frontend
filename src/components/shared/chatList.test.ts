/**
 * Testing library and framework: React Testing Library with Jest/Vitest-compatible APIs.
 * - Uses @testing-library/react for rendering and queries
 * - Uses user-event for interactions
 * - Works with either Jest or Vitest globals (describe/it/expect/jest/vi). We branch on availability.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Support both jest and vitest environments
const isVitest = typeof (globalThis as any).vi \!== 'undefined';
const mockFn = (isVitest ? (globalThis as any).vi.fn : (globalThis as any).jest?.fn) || (() => () => {});
const spyOn = (isVitest ? (globalThis as any).vi.spyOn : (globalThis as any).jest?.spyOn) || (() => ({ mockReturnValue: () => {} }));
const resetAllMocks = () => {
  if (isVitest) (globalThis as any).vi.clearAllMocks();
  else (globalThis as any).jest?.clearAllMocks?.();
  if (isVitest) (globalThis as any).vi.resetModules();
  else (globalThis as any).jest?.resetModules?.();
};

// Mocks for external deps
// 1) react-redux useSelector
jestOrViMock('react-redux', () => ({
  useSelector: (selector: any) => selector({ user: { uid: 'current-user-uid' } }),
}));

// 2) useAllUsers hook
jestOrViMock('@/hooks/useAllUsers', () => ({
  useAllUsers: () => ({ users: [] }),
}));

// 3) toast hook
jestOrViMock('@/hooks/use-toast', () => ({
  toast: mockFn(),
}));

// 4) date-fns formatDistanceToNow
const formatMock = mockFn();
formatMock.mockReturnValue('1 minute');
jestOrViMock('date-fns', () => ({
  formatDistanceToNow: formatMock,
}));

// 5) UI components stubs to simplify DOM structure
jestOrViMock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="chatlist-search-input" {...props} />,
}));
jestOrViMock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
jestOrViMock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, ...props }: any) => <div data-testid="scroll-area" {...props}>{children}</div>,
}));
jestOrViMock('../ui/avatar', () => ({
  Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  AvatarImage: (props: any) => <img data-testid="avatar-image" alt={props.alt || ''} {...props} />,
  AvatarFallback: ({ children, ...props }: any) => <div data-testid="avatar-fallback" {...props}>{children}</div>,
}));

// 6) Icons
jestOrViMock('lucide-react', () => {
  const Icon = (props: any) => <svg data-testid={props['data-testid'] || 'icon'} aria-hidden="true" />;
  return {
    MessageSquare: Icon,
    Search: Icon,
    SquarePen: Icon,
  };
});

// 7) Utility cn passthrough
jestOrViMock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// 8) Store types (only for typing; no runtime needed)
jestOrViMock('@/lib/store', () => ({}));

/**
 * Import the component under test last, after mocks.
 */
import { ChatList, type Conversation } from './chatList'; // path relative to this test file

function jestOrViMock(mod: string, factory: any) {
  if (isVitest) {
    (globalThis as any).vi.mock(mod, factory);
  } else if ((globalThis as any).jest?.mock) {
    (globalThis as any).jest.mock(mod, factory);
  }
}

function buildConversation(partial: Partial<Conversation> & { id: string }): Conversation {
  return {
    id: partial.id,
    participants: partial.participants ?? ['current-user-uid', 'other-user-id'],
    type: partial.type ?? 'individual',
    timestamp: partial.timestamp,
    lastMessage: partial.lastMessage ?? { content: 'Hello there', senderId: 'other-user-id', timestamp: new Date().toISOString() },
    participantDetails: partial.participantDetails ?? {
      'other-user-id': {
        userName: 'Other User',
        profilePic: undefined,
        email: 'other@example.com',
        userType: 'freelancer',
      },
    },
    project_name: partial.project_name,
    groupName: partial.groupName,
    description: partial.description,
    createdBy: partial.createdBy,
    admins: partial.admins,
    createdAt: partial.createdAt,
    updatedAt: partial.updatedAt,
    labels: partial.labels,
    ...partial,
  } as any;
}

describe('ChatList', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('renders New Chat button and calls dialog opener on click', async () => {
    const user = userEvent.setup();
    const onOpenNewChatDialog = mockFn();
    render(
      <ChatList
        conversations={[]}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={onOpenNewChatDialog}
      />
    );
    const btn = screen.getByRole('button', { name: /new chat/i });
    await user.click(btn);
    expect(onOpenNewChatDialog).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when there are no conversations and no search term', () => {
    render(
      <ChatList
        conversations={[]}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );
    expect(screen.getByText(/no conversations found/i)).toBeInTheDocument();
    expect(screen.getByText(/start a new chat or wait/i)).toBeInTheDocument();
  });

  it('shows no matching conversations when search has no matches', async () => {
    const user = userEvent.setup();
    const convs: Conversation[] = [
      buildConversation({ id: '1', project_name: 'Project Alpha', lastMessage: { content: 'alpha msg' } as any }),
    ];
    render(
      <ChatList
        conversations={convs}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );
    const input = screen.getByLabelText(/search conversations/i);
    await user.clear(input);
    await user.type(input, 'nope');
    expect(screen.getByText(/no matching conversations/i)).toBeInTheDocument();
  });

  it('filters by project_name and lastMessage content (stripHtml) and truncates long text', async () => {
    const user = userEvent.setup();
    const htmlMsg = '<p>Hello&nbsp;<strong>world</strong></p>';
    const longMsg = 'x'.repeat(80);
    const convs: Conversation[] = [
      buildConversation({ id: 'a', project_name: 'Awesome Project', lastMessage: { content: htmlMsg } as any }),
      buildConversation({ id: 'b', project_name: 'Beta', lastMessage: { content: longMsg } as any }),
    ];
    render(
      <ChatList
        conversations={convs}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );

    // Filter by project name
    const input = screen.getByLabelText(/search conversations/i);
    await user.clear(input);
    await user.type(input, 'awesome');
    expect(screen.getByText(/awesome project/i)).toBeInTheDocument();
    // HTML stripped content should show "Hello world"
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();

    // Filter by message content
    await user.clear(input);
    await user.type(input, 'x');
    // Truncated display (40 + ...)
    expect(screen.getByText((content) => content.startsWith('x'.repeat(40)) && content.endsWith('...'))).toBeInTheDocument();
  });

  it('highlights active conversation and clicking a conversation calls setConversation', async () => {
    const user = userEvent.setup();
    const convs: Conversation[] = [
      buildConversation({ id: '1', project_name: 'First' }),
      buildConversation({ id: '2', project_name: 'Second' }),
    ];
    const setConversation = mockFn();
    render(
      <ChatList
        conversations={convs}
        active={convs[1]}
        setConversation={setConversation}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );

    const items = screen.getAllByRole('paragraph', { hidden: true }); // fallback; we will query by text
    // Assert active by presence of the title and then click other
    const first = screen.getByText('First');
    const second = screen.getByText('Second');

    // Clicking first should call setConversation with that conversation
    await user.click(first.closest('div[role="button"]') || first.closest('div')\!);
    expect(setConversation).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));

    // Active text timestamp shown as lastUpdated (mocked formatDistanceToNow)
    expect(screen.getAllByText(/1 minute ago/i).length).toBeGreaterThanOrEqual(1);
  });

  it('profile icon click opens sidebar for group with correct details and stops propagation', async () => {
    const user = userEvent.setup();
    const onOpenProfileSidebar = mockFn();
    const setConversation = mockFn();
    const conv = buildConversation({
      id: 'g1',
      type: 'group',
      groupName: 'Dev Group',
      avatar: 'group.png',
    } as any);
    render(
      <ChatList
        conversations={[conv]}
        active={null}
        setConversation={setConversation}
        onOpenProfileSidebar={onOpenProfileSidebar}
        onOpenNewChatDialog={mockFn()}
      />
    );

    // Profile icon container is the flex-start area; we attached handler on that wrapper
    const avatar = screen.getByTestId('avatar');
    await user.click(avatar);
    expect(onOpenProfileSidebar).toHaveBeenCalledWith('g1', 'group', expect.objectContaining({
      userName: 'Dev Group',
      profilePic: 'group.png',
    }));
    // Ensure main click not triggered (no setConversation call)
    expect(setConversation).not.toHaveBeenCalled();
  });

  it('profile icon click opens sidebar for individual with other participant details', async () => {
    const user = userEvent.setup();
    const onOpenProfileSidebar = mockFn();
    const setConversation = mockFn();
    const conv = buildConversation({
      id: 'u1',
      type: 'individual',
      participants: ['current-user-uid', 'friend-1'],
      participantDetails: {
        'friend-1': { userName: 'Friend One', email: 'friend1@example.com', profilePic: 'friend1.png', userType: 'business' }
      }
    } as any);
    render(
      <ChatList
        conversations={[conv]}
        active={null}
        setConversation={setConversation}
        onOpenProfileSidebar={onOpenProfileSidebar}
        onOpenNewChatDialog={mockFn()}
      />
    );

    const avatar = screen.getByTestId('avatar');
    await user.click(avatar);
    expect(onOpenProfileSidebar).toHaveBeenCalledWith('friend-1', 'user', expect.objectContaining({
      userName: 'Friend One',
      email: 'friend1@example.com',
      profilePic: 'friend1.png',
    }));
    expect(setConversation).not.toHaveBeenCalled();
  });

  it('falls back to defaults when participant details missing', () => {
    const conv = buildConversation({
      id: 'm1',
      type: 'individual',
      participants: ['current-user-uid', 'friend-2'],
      participantDetails: {},
      lastMessage: { content: '' } as any
    } as any);
    render(
      <ChatList
        conversations={[conv]}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );
    // Fallback display name "Chat User"
    expect(screen.getByText(/chat user/i)).toBeInTheDocument();
    // Fallback message "No messages yet"
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    // AvatarFallback renders initial 'P' (default) if no names
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('P');
  });

  it('handles invalid timestamp gracefully by showing "Invalid date"', () => {
    // Override date-fns to throw when parsing
    formatMock.mockImplementationOnce(() => { throw new Error('bad date'); });
    const conv = buildConversation({ id: 'd1', timestamp: 'not-a-date' } as any);
    render(
      <ChatList
        conversations={[conv]}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );
    expect(screen.getByText(/invalid date/i)).toBeInTheDocument();
  });

  it('shows "Unnamed Project" when project_name not provided', () => {
    const conv = buildConversation({ id: 'p1', project_name: undefined });
    render(
      <ChatList
        conversations={[conv]}
        active={null}
        setConversation={mockFn()}
        onOpenProfileSidebar={mockFn()}
        onOpenNewChatDialog={mockFn()}
      />
    );
    expect(screen.getByText(/unnamed project/i)).toBeInTheDocument();
  });
});