//chatlist.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  DocumentData,
  getFirestore,
  addDoc,
  collection,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  MessageSquare,
  Search,
  SquarePen,
  Users,
  X as LucideX,
} from 'lucide-react'; // Added X
import { useSelector } from 'react-redux'; // Added
import { LoaderCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { NewChatDialog } from './NewChatDialog'; // User as NewChatUser removed, CombinedUser will be inferred

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { RootState } from '@/lib/store'; // Added
import { db } from '@/config/firebaseConfig';
import { toast } from '@/hooks/use-toast';
import type { CombinedUser } from '@/hooks/useAllUsers'; // Import CombinedUser for type hint
import { useAllUsers } from '@/hooks/useAllUsers';
// ProfileSidebar is no longer imported or rendered here
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names
import { axiosInstance } from '@/lib/axiosinstance';

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string; // Used for groups
  type?: 'individual' | 'group'; // To distinguish chat types
  timestamp?: string; // Should be lastActivity or similar
  lastMessage: {
    content?: string;
    senderId?: string;
    timestamp?: string;
  } | null; // Allow null
  participantDetails?: {
    [uid: string]: {
      userName: string;
      profilePic?: string;
      email?: string;
      userType?: 'freelancer' | 'business';
    };
  };
  // Group specific fields
  groupName?: string;
  description?: string; // Added group description
  createdBy?: string;
  admins?: string[];
  createdAt?: string; // Keep original creation timestamp
  updatedAt?: string; // Explicitly for last update to conversation metadata or message
  labels?: string[];
}

interface ChatListProps {
  conversations: Conversation[];
  active: Conversation | null;
  setConversation: (activeConversation: Conversation) => void;
  onOpenProfileSidebar?: (id: string, type: 'user' | 'group') => void; // Added prop
  onOpenNewChatDialog: () => void; // Add this prop
}

export function ChatList({
  conversations,
  active,
  setConversation,
  onOpenProfileSidebar, // Destructure the new prop
  onOpenNewChatDialog, // Destructure this prop
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState(''); // State for group description
  const {
    users: allFetchedUsers,
    isLoading: isLoadingUsers,
    error: usersError,
    refetchUsers,
  } = useAllUsers();
  const currentUser = useSelector((state: RootState) => state.user);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CombinedUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<CombinedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Removed local ProfileSidebar state:
  // const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  // const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  // const [selectedProfileType, setSelectedProfileType] = useState<'user' | 'group' | null>(null);

  // Mock Users (replace with actual data source/API call in a real app)
  const MOCK_USERS = [
    {
      uid: 'user1_uid_alice',
      userName: 'Alice Wonderland',
      email: 'alice@example.com',
    },
    {
      uid: 'user2_uid_bob',
      userName: 'Bob The Builder',
      email: 'bob@example.com',
    },
    {
      uid: 'user3_uid_charlie',
      userName: 'Charlie Brown',
      email: 'charlie@example.com',
    },
    {
      uid: 'user4_uid_diana',
      userName: 'Diana Prince',
      email: 'diana@example.com',
    },
    {
      uid: 'user5_uid_edward',
      userName: 'Edward Scissorhands',
      email: 'edward@example.com',
    },
  ];

  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

  const handleProfileIconClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation(); // Prevent triggering setConversation if this is nested
    if (!onOpenProfileSidebar) return; // Guard if prop is not provided

    if (conv.type === 'group') {
      onOpenProfileSidebar(conv.id, 'group');
    } else {
      const otherParticipantUid = conv.participants.find(
        (p) => p !== currentUser.uid,
      );
      if (otherParticipantUid) {
        onOpenProfileSidebar(otherParticipantUid, 'user');
      } else {
        console.error(
          'Could not determine other participant for profile view in ChatList.',
        );
      }
    }
  };

  // Effect for filtering users based on search term
  useEffect(() => {
    const term = userSearchTerm.trim().toLowerCase();

    // Only search if term is at least 3 characters
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Filter users based on search term
      const filtered = allFetchedUsers.filter(
        (user) =>
          user.id !== currentUser.uid && // Exclude current user using Redux state
          !selectedUsers.find((selected) => selected.id === user.id) && // Exclude already selected users
          (user.displayName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.rawUserName?.toLowerCase().includes(term) ||
            user.rawName?.toLowerCase().includes(term)),
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error filtering users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to search users. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  }, [userSearchTerm, allFetchedUsers, selectedUsers, currentUser.uid]);

  const handleUserSearch = (term: string) => {
    setUserSearchTerm(term);
  };

  const handleSelectUser = (user: CombinedUser) => {
    if (!selectedUsers.find((selected) => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearchTerm('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  // Function to update the last updated time for each conversation
  const updateLastUpdated = useCallback(() => {
    const updatedTimes: Record<string, string> = {};
    conversations.forEach((conversation) => {
      if (conversation.timestamp) {
        try {
          updatedTimes[conversation.id] =
            formatDistanceToNow(new Date(conversation.timestamp)) + ' ago';
        } catch (e) {
          // console.error("Error formatting date for conversation:", conversation.id, conversation.timestamp, e);
          updatedTimes[conversation.id] = 'Invalid date';
        }
      }
    });
    setLastUpdatedTimes(updatedTimes);
  }, [conversations]);

  useEffect(() => {
    updateLastUpdated();
    const intervalId = setInterval(updateLastUpdated, 60000);
    return () => clearInterval(intervalId);
  }, [updateLastUpdated]);

  const filteredConversations = conversations.filter((conversation) => {
    const name = conversation.project_name || 'Unnamed Project';
    const lastMessageContent = conversation.lastMessage?.content || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateGroup = async () => {
    if (!currentUser || !currentUser.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a group.',
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one user to create a group.',
      });
      return;
    }

    if (!groupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a group name.',
      });
      return;
    }

    const currentUserUID = currentUser.uid;
    const participantUIDs = Array.from(
      new Set([currentUserUID, ...selectedUsers.map((su) => su.id)]),
    );

    const now = new Date().toISOString();
    const newGroup: Conversation = {
      id: `group_${Date.now()}`,
      type: 'group',
      groupName: groupName.trim(),
      description: groupDescription.trim(),
      participants: participantUIDs,
      createdAt: now,
      updatedAt: now,
      admins: [currentUserUID],
      lastMessage: {
        content: `${currentUser.displayName || currentUser.email || currentUserUID} created the group "${groupName.trim()}"`,
        senderId: 'system',
        timestamp: now,
      },
      participantDetails: {
        [currentUserUID]: {
          userName:
            currentUser.displayName || currentUser.email || 'Current User',
          profilePic: currentUser.photoURL || undefined,
          email: currentUser.email || undefined,
          userType: currentUser.type,
        },
        ...Object.fromEntries(
          selectedUsers.map((user) => [
            user.id,
            {
              userName: user.displayName,
              profilePic: user.profilePic,
              email: user.email,
              userType: user.userType,
            },
          ]),
        ),
      },
    };

    setConversation(newGroup);
    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
    setShowCreateGroupDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]">
      {/* New Chat Button and Search Bar Area */}
      <div className="p-3 border-b border-[hsl(var(--border))]">
        {/* New "Create Group Chat" Button - "New Chat" dropdown removed as it became empty */}
        <div className="flex space-x-2 mb-3">
          <Button
            variant="default" // Or "outline" depending on desired prominence
            className="flex-1 flex items-center justify-center text-sm px-4 py-2 rounded-full shadow-lg"
            onClick={() => setShowCreateGroupDialog(true)}
          >
            <Users className="h-4 w-4 mr-2" />{' '}
            {/* Icon color will be primary-foreground */}
            Create Group
          </Button>
          <Button
            variant="default" // Or "outline"
            className="flex-1 flex items-center justify-center text-sm px-4 py-2 rounded-full shadow-lg"
            onClick={onOpenNewChatDialog} // Use the prop here
          >
            <SquarePen className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Existing Search Bar Div */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]"
            aria-hidden="true"
          />
          <Input
            placeholder="Search or start new chat"
            aria-label="Search conversations"
            className="pl-10 w-full rounded-full bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:bg-[hsl(var(--background))] border-transparent focus:ring-1 focus:ring-[hsl(var(--ring))]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-grow">
        {' '}
        {/* ScrollArea will take remaining height */}
        <div
          className="p-2 space-y-1"
          role="listbox"
          aria-label="Conversations list"
        >
          {' '}
          {/* Container for conversation items */}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';
              const isActive = active?.id === conversation.id;
              const lastMessageText = stripHtml(
                conversation.lastMessage?.content || '',
              );
              const displayText = lastMessageText || 'No messages yet';

              return (
                <div
                  key={conversation.id}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={0} // Make it focusable
                  className={cn(
                    'flex items-start p-3 rounded-lg cursor-pointer space-x-3 focus:outline-none',
                    'hover:bg-[#d6dae2a8] dark:hover:bg-[#35383b9e]',
                    isActive &&
                      'bg-[#d6dae2a8] dark:bg-[#35383b9e] focus:ring-0 focus:outline-none',
                  )}
                  onClick={() => setConversation(conversation)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      setConversation(conversation);
                  }}
                >
                  <div
                    className="flex items-center space-x-3 flex-shrink-0"
                    onClick={(e) => handleProfileIconClick(e, conversation)}
                    role="button"
                    aria-label="View profile"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                      <AvatarImage
                        src={
                          conversation.type === 'group'
                            ? conversation.participantDetails?.[conversation.id]
                                ?.profilePic ||
                              `https://api.adorable.io/avatars/285/group-${conversation.id}.png`
                            : conversation.participantDetails?.[
                                conversation.participants.find(
                                  (p) => p !== currentUser.uid,
                                ) || ''
                              ]?.profilePic ||
                              `https://api.adorable.io/avatars/285/${conversation.participants.find((p) => p !== currentUser.uid)}.png`
                        }
                        alt={
                          conversation.type === 'group'
                            ? conversation.groupName
                            : conversation.participantDetails?.[
                                conversation.participants.find(
                                  (p) => p !== currentUser.uid,
                                ) || ''
                              ]?.userName
                        }
                      />
                      <AvatarFallback className="bg-[#d6dae2] dark:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]">
                        {(conversation.type === 'group'
                          ? conversation.groupName?.charAt(0)
                          : conversation.participantDetails?.[
                              conversation.participants.find(
                                (p) => p !== currentUser.uid,
                              ) || ''
                            ]?.userName?.charAt(0)
                        )?.toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    className="flex-grow overflow-hidden"
                    onClick={() => setConversation(conversation)}
                  >
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-medium truncate text-[hsl(var(--foreground))]">
                        {conversation.type === 'group'
                          ? conversation.groupName
                          : conversation.participantDetails?.[
                              conversation.participants.find(
                                (p) => p !== currentUser.uid,
                              ) || ''
                            ]?.userName || 'Chat User'}
                      </p>
                      <p className="text-xs flex-shrink-0 ml-2 text-[hsl(var(--muted-foreground))]">
                        {lastUpdated}
                      </p>
                    </div>
                    <p className="text-xs truncate text-[hsl(var(--muted-foreground))]">
                      {displayText.length > 40
                        ? displayText.substring(0, 40) + '...'
                        : displayText}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-[hsl(var(--muted-foreground))]">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium text-[hsl(var(--foreground))]">
                {searchTerm
                  ? 'No matching conversations'
                  : 'No conversations found'}
              </p>
              {!searchTerm && (
                <p className="text-sm">
                  Start a new chat or wait for others to connect!
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {showCreateGroupDialog && (
        <Dialog
          open={showCreateGroupDialog}
          onOpenChange={setShowCreateGroupDialog}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new group chat and add members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupName" className="text-right">
                  Group Name
                </Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter group name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupDescription" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter group description (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="searchUsers" className="text-right">
                  Add Members
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="searchUsers"
                    placeholder="Type at least 3 characters to search users..."
                    value={userSearchTerm}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full"
                  />
                  {isSearching ? (
                    <div className="flex items-center justify-center p-2">
                      <LoaderCircle className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
                    </div>
                  ) : userSearchTerm.length > 0 && userSearchTerm.length < 3 ? (
                    <div className="text-sm text-[hsl(var(--muted-foreground))] p-2">
                      Type at least 3 characters to search users
                    </div>
                  ) : userSearchTerm.length >= 3 && searchResults.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))]">
                      {searchResults.map((foundUser) => (
                        <div
                          key={foundUser.id}
                          className="p-2 hover:bg-[hsl(var(--accent))] cursor-pointer text-sm text-[hsl(var(--foreground))]"
                          onClick={() => handleSelectUser(foundUser)}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage
                                src={foundUser.profilePic}
                                alt={foundUser.displayName}
                              />
                              <AvatarFallback>
                                {foundUser.displayName
                                  ?.charAt(0)
                                  .toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {foundUser.displayName}
                              </p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                {foundUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userSearchTerm.length >= 3 &&
                    searchResults.length === 0 ? (
                    <div className="text-sm text-[hsl(var(--muted-foreground))] p-2">
                      No users found matching your search
                    </div>
                  ) : null}
                  {selectedUsers.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Selected Members:
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUsers.map((selected) => (
                          <span
                            key={selected.id}
                            className="flex items-center bg-[hsl(var(--primary)_/_0.2)] text-[hsl(var(--primary))] text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {selected.displayName}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveUser(selected.id);
                              }}
                              className="ml-1.5 text-[hsl(var(--primary)_/_0.7)] hover:text-[hsl(var(--primary))]"
                              aria-label={`Remove ${selected.displayName}`}
                            >
                              <LucideX className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setGroupName('');
                    setGroupDescription('');
                    setSelectedUsers([]);
                    setUserSearchTerm('');
                    setSearchResults([]);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="default"
                onClick={handleCreateGroup}
              >
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* The NewChatDialog is no longer rendered here */}

      {/* ProfileSidebar instance is removed from here, will be rendered in page.tsx */}
    </div>
  );
}
