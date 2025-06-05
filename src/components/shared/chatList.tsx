//chatlist.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare, Search, SquarePen, Users, X as LucideX } from 'lucide-react'; // Added X
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { useSelector } from 'react-redux'; // Added
import { RootState } from '@/lib/store'; // Added
import { getFirestore, addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { toast } from '@/hooks/use-toast';
import { NewChatDialog } from './NewChatDialog'; // User as NewChatUser removed, CombinedUser will be inferred
import type { CombinedUser as NewChatUser } from '@/hooks/useAllUsers'; // Import CombinedUser for type hint
// ProfileSidebar is no longer imported or rendered here
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Utility class names

export interface Conversation extends DocumentData {
  id: string;
  participants: string[];
  project_name?: string; // Used for groups
  type?: 'individual' | 'group'; // To distinguish chat types
  timestamp?: string; // Should be lastActivity or similar
  lastMessage?: { content?: string; senderId?: string; timestamp?: string };
  participantDetails?: { [uid: string]: { userName: string; profilePic?: string; email?: string; userType?: 'freelancer' | 'business' } };
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
}

export function ChatList({
  conversations,
  active,
  setConversation,
  onOpenProfileSidebar, // Destructure the new prop
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState(''); // State for group description
  const user = useSelector((state: RootState) => state.user);

  // Removed local ProfileSidebar state:
  // const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  // const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  // const [selectedProfileType, setSelectedProfileType] = useState<'user' | 'group' | null>(null);

  // Mock Users (replace with actual data source/API call in a real app)
  const MOCK_USERS = [
    { uid: 'user1_uid_alice', userName: 'Alice Wonderland', email: 'alice@example.com' },
    { uid: 'user2_uid_bob', userName: 'Bob The Builder', email: 'bob@example.com' },
    { uid: 'user3_uid_charlie', userName: 'Charlie Brown', email: 'charlie@example.com' },
    { uid: 'user4_uid_diana', userName: 'Diana Prince', email: 'diana@example.com' },
    { uid: 'user5_uid_edward', userName: 'Edward Scissorhands', email: 'edward@example.com' },
  ];

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof MOCK_USERS>([]);
  const [selectedUsers, setSelectedUsers] = useState<typeof MOCK_USERS>([]);

  const handleProfileIconClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation(); // Prevent triggering setConversation if this is nested
    if (!onOpenProfileSidebar) return; // Guard if prop is not provided

    if (conv.type === 'group') {
      onOpenProfileSidebar(conv.id, 'group');
    } else {
      const otherParticipantUid = conv.participants.find(p => p !== user.uid);
      if (otherParticipantUid) {
        onOpenProfileSidebar(otherParticipantUid, 'user');
      } else {
        console.error("Could not determine other participant for profile view in ChatList.");
      }
    }
  };

  const handleUserSearch = (term: string) => {
    setUserSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = MOCK_USERS.filter(
      (mockUser) =>
        (mockUser.userName.toLowerCase().includes(term.toLowerCase()) ||
          mockUser.email.toLowerCase().includes(term.toLowerCase())) &&
        !selectedUsers.find((su) => su.uid === mockUser.uid) && // Not already selected
        mockUser.uid !== user.uid // Not the current user
    );
    setSearchResults(filtered);
  };

  const handleSelectUser = (userToAdd: typeof MOCK_USERS[0]) => {
    setSelectedUsers((prev) => [...prev, userToAdd]);
    setUserSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveSelectedUser = (uidToRemove: string) => {
    setSelectedUsers((prev) => prev.filter((su) => su.uid !== uidToRemove));
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

  const filteredConversations = conversations.filter(conversation => {
    const name = conversation.project_name || 'Unnamed Project';
    const lastMessageContent = conversation.lastMessage?.content || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleStartNewChat = async (selectedUser: NewChatUser) => {
    if (!user || !user.uid) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to start a new chat." });
      return;
    }

    // Check for existing individual conversation
    const existingConversation = conversations.find(conv =>
      conv.type === 'individual' &&
      conv.participants.length === 2 &&
      arraysHaveSameElements(conv.participants, [user.uid, selectedUser.uid])
    );

    if (existingConversation) {
      setConversation(existingConversation);
      setIsNewChatDialogOpen(false);
      toast({ title: "Info", description: "Conversation already exists, switching to it." });
      return;
    }

    // Create new conversation
    const now = new Date().toISOString();
    const newConversationData: Partial<Conversation> = { // Use Partial as ID will be generated by Firestore
      participants: [user.uid, selectedUser.uid].sort(),
      type: 'individual',
      createdAt: now,
      updatedAt: now, // Represents last activity timestamp for the conversation
      lastMessage: null, // No messages yet
      participantDetails: {
        [user.uid]: {
          userName: user.displayName || user.email || 'Current User',
          profilePic: user.photoURL || undefined,
          email: user.email || undefined,
          // userType for currentUser might need to be sourced from Redux state if available/needed
          // userType: user.userType // Assuming user from Redux might have this
        },
        [selectedUser.id]: { // Use .id from CombinedUser
          userName: selectedUser.displayName,
          profilePic: selectedUser.profilePic,
          email: selectedUser.email,
          userType: selectedUser.userType
        },
      }
    };

    try {
      const docRef = await addDoc(collection(db, 'conversations'), newConversationData);
      setIsNewChatDialogOpen(false);
      toast({ title: "Success", description: `New chat started with ${selectedUser.userName}.` });

      // Fetch the newly created document to pass to setConversation
      // This ensures the local state `active` is correctly set with the full conversation object including ID
      const newDocSnap = await getDoc(doc(db, "conversations", docRef.id));
      if (newDocSnap.exists()) {
        setConversation({ id: newDocSnap.id, ...newDocSnap.data() } as Conversation);
      } else {
        // Fallback or error - should ideally not happen if addDoc succeeded
        console.warn("Newly created conversation document not found immediately after creation.");
        // Potentially trigger a refresh of conversations list if direct setting fails
      }

    } catch (error) {
      console.error("Error starting new chat: ", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to start new chat." });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]">
      {/* New Chat Button and Search Bar Area */}
      <div className="p-3 border-b border-[hsl(var(--border))]">
        {/* New "Create Group Chat" Button - "New Chat" dropdown removed as it became empty */}
        <div className="flex space-x-2 mb-3">
          <Button
            variant="default" // Or "outline" depending on desired prominence
            className="flex-1 flex items-center justify-center text-sm px-4 py-2 rounded-full shadow-sm"
            onClick={() => setShowCreateGroupDialog(true)}
          >
            <Users className="h-4 w-4 mr-2" /> {/* Icon color will be primary-foreground */}
            Create Group
          </Button>
          <Button
            variant="default" // Or "outline"
            className="flex-1 flex items-center justify-center text-sm px-4 py-2 rounded-full shadow-sm"
            onClick={() => setIsNewChatDialogOpen(true)} // Corrected this line
          >
            <SquarePen className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Existing Search Bar Div */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
          <Input
            placeholder="Search or start new chat"
            aria-label="Search conversations"
            className="pl-10 w-full rounded-full bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:bg-[hsl(var(--background))] border-transparent focus:ring-1 focus:ring-[hsl(var(--ring))]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-grow"> {/* ScrollArea will take remaining height */}
        <div className="p-2 space-y-1" role="listbox" aria-label="Conversations list"> {/* Container for conversation items */}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const lastUpdated = lastUpdatedTimes[conversation.id] || 'N/A';
              const isActive = active?.id === conversation.id;
              const lastMessageText = conversation.lastMessage?.content || 'No messages yet';

              return (
                <div
                  key={conversation.id}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={0} // Make it focusable
                  className={cn(
                    'flex items-start p-3 rounded-lg cursor-pointer hover:bg-[hsl(var(--accent))] space-x-3 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]',
                    isActive && 'bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.25)]',
                  )}
                  onClick={() => setConversation(conversation)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setConversation(conversation); }}
                >
                  <div className="flex items-center space-x-3 flex-shrink-0" onClick={(e) => handleProfileIconClick(e, conversation)} role="button" aria-label="View profile">
                    <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                      <AvatarImage
                        src={
                          conversation.type === 'group'
                            ? conversation.participantDetails?.[conversation.id]?.profilePic || `https://api.adorable.io/avatars/285/group-${conversation.id}.png` // Group avatar
                            : conversation.participantDetails?.[conversation.participants.find(p => p !== user.uid) || '']?.profilePic || `https://api.adorable.io/avatars/285/${conversation.participants.find(p => p !== user.uid)}.png` // User avatar
                        }
                        alt={conversation.type === 'group' ? conversation.groupName : conversation.participantDetails?.[conversation.participants.find(p => p !== user.uid) || '']?.userName}
                      />
                      <AvatarFallback>
                        {
                          (conversation.type === 'group'
                            ? conversation.groupName?.charAt(0)
                            : conversation.participantDetails?.[conversation.participants.find(p => p !== user.uid) || '']?.userName?.charAt(0)
                          )?.toUpperCase() || 'P'
                        }
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow overflow-hidden" onClick={() => setConversation(conversation)}> {/* Make text area also set active conversation */}
                    <div className="flex justify-between items-baseline">
                      <p className={cn("text-sm font-medium truncate", isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]")}>
                        {conversation.type === 'group' ? conversation.groupName : conversation.participantDetails?.[conversation.participants.find(p => p !== user.uid) || '']?.userName || 'Chat User'}
                      </p>
                      <p className={cn("text-xs flex-shrink-0 ml-2", isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]")}>
                        {lastUpdated}
                      </p>
                    </div>
                    <p className={cn("text-xs truncate", isActive ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]")}>
                      {lastMessageText.length > 40 ? lastMessageText.substring(0, 40) + '...' : lastMessageText}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center text-[hsl(var(--muted-foreground))]">
              <MessageSquare className="w-10 h-10 mb-2" />
              <p className="text-lg font-medium text-[hsl(var(--foreground))]">
                {searchTerm ? 'No matching conversations' : 'No conversations found'}
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
        <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
          <DialogContent className="sm:max-w-[450px] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl"> {/* Added shadow-xl */}
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--card-foreground))]">Create a group chat</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))] pt-1">
                Fill in the details below to start a new group conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 p-4"> {/* Changed from grid to space-y and added padding */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupName" className="text-right col-span-1 text-[hsl(var(--foreground))]">
                  Group Name
                </Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  className="col-span-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              {/* Group Description Textarea */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="groupDescription" className="text-right col-span-1 pt-2 text-[hsl(var(--foreground))]"> {/* items-start applied to parent div */}
                  Description
                </Label>
                <Textarea
                  id="groupDescription"
                  placeholder="What's this group about? (Optional)"
                  className="col-span-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))] min-h-[80px]"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4"> {/* This items-center is fine for single-line input */}
                <Label htmlFor="addPeople" className="text-right col-span-1 text-[hsl(var(--foreground))]">
                  Add People
                </Label>
                <Input
                  id="addPeople"
                  placeholder="Search by name or email"
                  className="col-span-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]"
                  value={userSearchTerm}
                  onChange={(e) => handleUserSearch(e.target.value)}
                />
              </div>

              {/* Search Results */}
              {userSearchTerm && searchResults.length > 0 && (
                <div className="col-start-2 col-span-3 mt-2 max-h-32 overflow-y-auto border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))]"> {/* Changed mt-1 to mt-2 */}
                  {searchResults.map(foundUser => (
                    <div
                      key={foundUser.uid}
                      className="p-2 hover:bg-[hsl(var(--accent))] cursor-pointer text-sm text-[hsl(var(--foreground))]"
                      onClick={() => handleSelectUser(foundUser)}
                    >
                      {foundUser.userName} <span className="text-xs text-[hsl(var(--muted-foreground))]">({foundUser.email})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="col-start-2 col-span-3 mt-2 space-y-1.5"> {/* Increased space-y slightly */}
                  <Label className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Selected:</Label> {/* Added mb-1 for spacing to tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUsers.map(selected => (
                      <span
                        key={selected.uid}
                        className="flex items-center bg-[hsl(var(--primary)_/_0.2)] text-[hsl(var(--primary))] text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {selected.userName}
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedUser(selected.uid)}
                          className="ml-1.5 text-[hsl(var(--primary)_/_0.7)] hover:text-[hsl(var(--primary))]"
                          aria-label={`Remove ${selected.userName}`}
                        >
                          <LucideX className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUsers.length === 0 && !userSearchTerm && (
                 <div className="col-start-2 col-span-3 text-xs text-[hsl(var(--muted-foreground))] pl-2 mt-2"> {/* Added mt-2 */}
                    Search by name or email to add members.
                 </div>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-2 pt-4 border-t border-[hsl(var(--border))]"> {/* Applied flex, justify-end, space-x-2 and adjusted padding */}
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => {
                  setGroupName('');
                  setGroupDescription(''); // Reset description
                  setSelectedUsers([]);
                  setUserSearchTerm('');
                  setSearchResults([]);
                }}>Cancel</Button>
              </DialogClose>
              <Button
                type="button"
                variant="default"
                onClick={async () => {
                  if (!user || !user.uid) {
                    toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a group." });
                    return;
                  }
                  if (groupName.trim() === '') {
                    toast({ variant: "destructive", title: "Error", description: "Group name cannot be empty." });
                    return;
                  }
                  if (selectedUsers.length === 0) {
                    toast({ variant: "destructive", title: "Error", description: "Please select at least one other member for the group." });
                    return;
                  }

                  const currentUserUID = user.uid;
                  const participantUIDs = Array.from(new Set([currentUserUID, ...selectedUsers.map(su => su.uid)]));

                  if (participantUIDs.length < 2) {
                     toast({ variant: "destructive", title: "Error", description: "A group must have at least two distinct members." });
                     return;
                  }

                  const now = new Date().toISOString();
                  const newGroupConversation = {
                    participants: participantUIDs,
                    type: 'group',
                    groupName: groupName.trim(),
                    project_name: groupName.trim(), // For display in chatList
                    createdAt: now,
                    updatedAt: now,
                    createdBy: currentUserUID,
                    admins: [currentUserUID],
                    lastMessage: {
                      content: `${user.displayName || user.email || currentUserUID} created the group "${groupName.trim()}"`,
                      senderId: 'system',
                      timestamp: now,
                    },
                    // participantDetails will be populated by a cloud function or when participants send messages
                  };

                  if (groupDescription.trim()) {
                    (newGroupConversation as any).description = groupDescription.trim();
                  }

                  try {
                    const docRef = await addDoc(collection(db, 'conversations'), newGroupConversation);
                    console.log("Group conversation created with ID: ", docRef.id);
                    toast({ title: "Success", description: "Group chat created successfully." });
                    setGroupName('');
                    setGroupDescription(''); // Reset description
                    setSelectedUsers([]); // Reset selected users
                    setUserSearchTerm(''); // Reset search term for users
                    setSearchResults([]); // Reset search results for users
                    setShowCreateGroupDialog(false);
                  } catch (error) {
                    console.error("Error creating group conversation: ", error);
                    toast({ variant: "destructive", title: "Error", description: "Failed to create group chat." });
                  }
                }}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {user && ( // Ensure user object is available before rendering NewChatDialog
        <NewChatDialog
          isOpen={isNewChatDialogOpen}
          onClose={() => setIsNewChatDialogOpen(false)}
          onSelectUser={handleStartNewChat}
          currentUserUid={user.uid}
        />
      )}

      {/* ProfileSidebar instance is removed from here, will be rendered in page.tsx */}
    </div>
  );
}

// Helper function to check if two arrays contain the same elements, regardless of order
const arraysHaveSameElements = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};
