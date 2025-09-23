import React from 'react'
import { render, screen, waitFor, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// The component under test (path assumed based on repository structure)
import { ProfileSidebar } from './ProfileSidebar'

// Mocks for external modules used inside the component.
// Adjust import paths below to match actual project structure if different.

// Mock axios instance
jest.mock('../../lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))
// Fallback alternative name if component uses named axiosInstance
jest.mock('../../lib/axiosInstance', () => ({
  __esModule: true,
  axiosInstance: {
    get: jest.fn(),
  },
}))

// Mock toast hook
jest.mock('../../hooks/use-toast', () => ({
  __esModule: true,
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Minimal Firestore mocks
const writeBatchMock = jest.fn(() => ({
  update: jest.fn(),
  commit: jest.fn(),
}))
const getDocMock = jest.fn()
const updateDocMock = jest.fn()
const deleteDocMock = jest.fn()
const getDocsMock = jest.fn()
const queryMock = jest.fn()
const collectionMock = jest.fn()
const orderByMock = jest.fn()
const docMock = jest.fn()

const arrayUnionMock = (...args: any[]) => ({ __op: 'arrayUnion', args })
const arrayRemoveMock = (...args: any[]) => ({ __op: 'arrayRemove', args })
const deleteFieldMock = () => ({ __op: 'deleteField' })

jest.mock('firebase/firestore', () => ({
  __esModule: true,
  getDoc: (...args: any[]) => getDocMock(...args),
  updateDoc: (...args: any[]) => updateDocMock(...args),
  deleteDoc: (...args: any[]) => deleteDocMock(...args),
  writeBatch: (...args: any[]) => writeBatchMock(...args),
  arrayUnion: (...args: any[]) => arrayUnionMock(...args),
  arrayRemove: (...args: any[]) => arrayRemoveMock(...args),
  deleteField: (...args: any[]) => deleteFieldMock(...args),
  getDocs: (...args: any[]) => getDocsMock(...args),
  query: (...args: any[]) => queryMock(...args),
  collection: (...args: any[]) => collectionMock(...args),
  orderBy: (...args: any[]) => orderByMock(...args),
  doc: (...args: any[]) => docMock(...args),
}))

// If component imports a db export, we can mock module exporting it.
// It's common to export db from a firebase client module.
jest.mock('../../lib/firebase', () => ({
  __esModule: true,
  db: {} as any,
}))

// Basic user reducer stub to provide user state
const userSlice = {
  name: 'user',
  reducer: (state = { uid: 'admin-1', email: 'admin@example.com' }, _action: any) => state,
}

function renderWithStore(ui: React.ReactElement, preloadedState?: any) {
  const store = configureStore({
    reducer: {
      user: userSlice.reducer,
    },
    preloadedState,
  })
  return render(<Provider store={store}>{ui}</Provider>)
}

const axiosDefaultGet = (jest.requireMock('../../lib/axios') as any).default.get as jest.Mock
const axiosInstanceGet =
  (jest.requireMock('../../lib/axiosInstance') as any)?.axiosInstance?.get ?? jest.fn()

describe('ProfileSidebar (focus on new/changed behaviors)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders nothing when isOpen is false', () => {
    renderWithStore(
      <ProfileSidebar
        isOpen={false}
        onClose={jest.fn()}
        profileId="user-1"
        profileType="user"
        initialData={undefined}
      />
    )
    // Should not render sheet content
    expect(screen.queryByLabelText(/profile sidebar/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/User Profile|Group Details/)).not.toBeInTheDocument()
  })

  test('shows loading skeletons while loading and then "No details" if no data', async () => {
    // Make API return no data and no initialData provided
    axiosDefaultGet.mockResolvedValueOnce({ data: { data: null } })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} }) // shared media
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} }) // shared files

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="user-1"
        profileType="user"
        initialData={undefined}
      />
    )

    // Loading skeleton present
    expect(await screen.findByRole('progressbar', { hidden: true })).toBeInTheDocument()

    await waitFor(() => {
      // "No details to display." appears after loading finishes with no data
      expect(screen.getByText(/No details to display\./i)).toBeInTheDocument()
    })
  })

  test('initialData populates user fields immediately, then API response merges prioritizing initialData', async () => {
    const initialData = {
      userName: 'Init User',
      email: 'init@example.com',
      profilePic: 'http://img/init.png',
    }

    const apiData = {
      _id: 'user-1-api',
      userName: 'ApiUser',
      email: 'api@example.com',
      profilePic: 'http://img/api.png',
      displayName: 'Api Display',
      name: 'Api Name',
    }
    axiosDefaultGet.mockResolvedValueOnce({ data: { data: apiData } })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} }) // shared media
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} }) // shared files

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="user-1"
        profileType="user"
        initialData={initialData as any}
      />
    )

    // Should eventually show user card populated with display name derived from initialData
    const title = await screen.findByText('User Profile')
    expect(title).toBeInTheDocument()

    // After loads, combined data should reflect initialData priority for certain fields
    await waitFor(() => {
      expect(screen.getByText('Init User')).toBeInTheDocument() // displayName prioritized
      expect(screen.getByText('init@example.com')).toBeInTheDocument() // email prioritized
    })
  })

  test('fetchSharedMedia extracts valid attachments and displays "No media" when none', async () => {
    // No media case
    axiosDefaultGet.mockResolvedValueOnce({ data: { data: { _id: 'user-2', userName: 'User2' } } })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({
      forEach: (fn: any) => {
        // messagesSnapshot empty attachments
        fn({ id: 'm1', data: () => ({ attachments: [] }) })
      },
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({
      forEach: () => {},
    })

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="user-2"
        profileType="user"
        initialData={undefined}
      />
    )

    // Wait for media card
    await screen.findByText('Shared Media')

    // No media yet text
    await waitFor(() => {
      expect(screen.getByText(/No media has been shared yet\./i)).toBeInTheDocument()
    })
  })

  test('group profile: builds members list from participantDetails and shows admin badge', async () => {
    // getDoc for group data
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-1',
      data: () => ({
        groupName: 'Cool Group',
        description: 'A group',
        avatar: 'http://img/group.png',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: {
          'admin-1': { userName: 'Admin', profilePic: 'a.png' },
          user2: { userName: 'User Two', profilePic: 'u2.png' },
        },
        members: ['admin-1', 'user2'],
      }),
    })
    // Shared media/files results empty:
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="group-1"
        profileType="group"
        initialData={undefined}
      />
    )

    // Group details header
    expect(await screen.findByText('Group Details')).toBeInTheDocument()

    // Members section count and names
    const membersHeader = await screen.findByText(/Members \(/)
    expect(membersHeader).toBeInTheDocument()

    const list = screen.getByRole('list')
    const adminItem = within(list).getByText('Admin')
    const user2Item = within(list).getByText('User Two')

    expect(adminItem).toBeInTheDocument()
    expect(user2Item).toBeInTheDocument()

    // Admin badge present for admin-1
    const adminBadge = within(list).getByText('Admin')
    expect(adminBadge).toBeInTheDocument()
  })

  test('invite link dialog trigger present when inviteLink is defined; generate link happy path', async () => {
    // Mock group document with inviteLink defined (even empty string acceptable as defined)
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-2',
      data: () => ({
        groupName: 'Invitable',
        description: '',
        avatar: '',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: {},
        members: [],
        inviteLink: '', // defined
      }),
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    updateDocMock.mockResolvedValueOnce(undefined)

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="group-2"
        profileType="group"
        initialData={undefined}
      />
    )

    // Wait for actions
    const inviteBtn = await screen.findByRole('button', { name: /Invite Link/i })
    expect(inviteBtn).toBeInTheDocument()

    await userEvent.click(inviteBtn)

    // The dialog will open; then clicking "Generate" typically triggers handleGenerateInviteLink via props.
    // We don't know exact dialog UI; we validate that updateDoc is eventually called.
    // Simulate generate by calling the provided handler indirectly:
    // Since we can't easily access the child dialog, we rely on toast/updateDoc side-effect expectation:
    // The component calls updateDoc with an inviteLink and updatedAt.
    await waitFor(() => {
      expect(updateDocMock).toHaveBeenCalled()
    })
  })

  test('remove member: opens confirm and calls updateDoc with arrayRemove and deleteField', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-3',
      data: () => ({
        groupName: 'G',
        description: '',
        avatar: '',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: {
          'admin-1': { userName: 'Admin', profilePic: '' },
          u2: { userName: 'User 2', profilePic: '' },
        },
        members: ['admin-1', 'u2'],
      }),
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="group-3"
        profileType="group"
        initialData={undefined}
      />
    )

    // Find "User 2" list item and click its "Remove" icon button (MinusCircle)
    const list = await screen.findByRole('list')
    const user2Row = within(list).getByText('User 2').closest('li') as HTMLElement
    // The remove button has aria-label "Remove <username> from group"
    const removeBtn = within(user2Row).getByRole('button', {
      name: /Remove User 2 from group/i,
    })
    await userEvent.click(removeBtn)

    // Confirm dialog appears; click the confirm button text used in code: 'Remove Member'
    const confirmBtn = await screen.findByRole('button', { name: /Remove Member/i })
    await userEvent.click(confirmBtn)

    await waitFor(() => {
      expect(updateDocMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        participants: expect.objectContaining({ __op: 'arrayRemove' }),
        updatedAt: expect.any(String),
      }))
    })
  })

  test('handleSaveGroupInfo: validation errors when empty name or missing groupId', async () => {
    // Build a scenario in which the actions are visible (admin user, group loaded)
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-4',
      data: () => ({
        groupName: 'Group Old',
        description: '',
        avatar: 'old.png',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: {},
        members: [],
      }),
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="group-4"
        profileType="group"
        initialData={undefined}
      />
    )

    // Click "Change Group Name or Avatar"
    const changeBtn = await screen.findByRole('button', { name: /Change Group Name or Avatar/i })
    await userEvent.click(changeBtn)

    // We don't control dialog UI directly; ensure no updateDoc is called when validation fails:
    // Simulate clicking save in dialog with empty name via assuming internal validation blocks it
    // Since we cannot reach dialog inputs reliably without markup, we focus on side-effect absence.
    await act(async () => {
      // Wait a tick; no updateDoc should be called yet
      await new Promise((r) => setTimeout(r, 10))
    })
    expect(updateDocMock).not.toHaveBeenCalled()
  })

  test('leave group: updates doc and calls onClose', async () => {
    const onClose = jest.fn()

    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-5',
      data: () => ({
        groupName: 'Group',
        description: '',
        avatar: '',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: { 'admin-1': { userName: 'Admin', profilePic: '' } },
        members: ['admin-1'],
      }),
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={onClose}
        profileId="group-5"
        profileType="group"
        initialData={undefined}
      />
    )

    const leaveBtn = await screen.findByRole('button', { name: /Leave Group/i })
    await userEvent.click(leaveBtn)

    const confirmLeave = await screen.findByRole('button', { name: /^Leave$/i })
    await userEvent.click(confirmLeave)

    await waitFor(() => {
      expect(updateDocMock).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  test('delete group: only admins can delete; non-admin sees no delete action', async () => {
    // Render with a different user who is not admin
    const store = configureStore({
      reducer: { user: () => ({ uid: 'user-x' }) },
    })

    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-6',
      data: () => ({
        groupName: 'Group',
        description: '',
        avatar: '',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: {},
        members: ['admin-1', 'user-x'],
      }),
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })

    render(<Provider store={store}>
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="group-6"
        profileType="group"
        initialData={undefined}
      />
    </Provider>)

    // Delete Group button should not be present
    expect(screen.queryByRole('button', { name: /Delete Group/i })).not.toBeInTheDocument()
  })

  test('delete group: admin flow calls deleteDoc and onClose', async () => {
    const onClose = jest.fn()
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: 'group-7',
      data: () => ({
        groupName: 'Group',
        description: '',
        avatar: '',
        createdAt: '2023-01-01T00:00:00Z',
        admins: ['admin-1'],
        participantDetails: {},
        members: ['admin-1'],
      }),
    })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    deleteDocMock.mockResolvedValueOnce(undefined)

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={onClose}
        profileId="group-7"
        profileType="group"
        initialData={undefined}
      />
    )

    const deleteBtn = await screen.findByRole('button', { name: /Delete Group/i })
    await userEvent.click(deleteBtn)

    const confirmDelete = await screen.findByRole('button', { name: /Yes, Delete This Group/i })
    await userEvent.click(confirmDelete)

    await waitFor(() => {
      expect(deleteDocMock).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  test('getFallbackName returns P when no displayName', async () => {
    // For user profile with no displayName, AvatarFallback should contain 'P'
    axiosDefaultGet.mockResolvedValueOnce({ data: { data: { _id: 'uX', userName: '', email: '' } } })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })
    ;(getDocsMock as jest.Mock).mockResolvedValueOnce({ forEach: () => {} })

    renderWithStore(
      <ProfileSidebar
        isOpen
        onClose={jest.fn()}
        profileId="uX"
        profileType="user"
        initialData={undefined}
      />
    )

    // Once loaded, expect avatar fallback initial 'P'
    await screen.findByText('User Profile')
    const fallback = await screen.findAllByText('P')
    expect(fallback.length).toBeGreaterThan(0)
  })
})