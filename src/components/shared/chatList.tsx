//chatlist.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentData } from 'firebase/firestore';
import { MessageSquare, Search, SquarePen, Users, X as LucideX } from 'lucide-react'; // Added X
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux'; // Added
import { RootState } from '@/lib/store'; // Added
import { getFirestore, addDoc, collection } from 'firebase/firestore'; // Added
import { db } from '@/config/firebaseConfig'; // Added - Adjust path if necessary
import { toast } from '@/hooks/use-toast'; // Added
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
  project_name?: string;
  timestamp?: string;
  lastMessage?: { content?: string; senderId?: string }; // Added lastMessage structure
  labels?: string[];
}

interface ChatListProps {
  conversations: Conversation[];
  active: Conversation | null; // active can be null
  setConversation: (activeConversation: Conversation) => void;
}

export function ChatList({
  conversations,
  active,
  setConversation,
}: ChatListProps) {
  const [lastUpdatedTimes, setLastUpdatedTimes] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const user = useSelector((state: RootState) => state.user);

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

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))]"> {/* Use card color for sidebar bg */}
      {/* New Chat Button and Search Bar Area */}
      <div className="p-3 border-b border-[hsl(var(--border))]">
        <div className="mb-3"> {/* Spacing below New Chat button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="w-full sm:w-auto flex items-center justify-center text-sm px-4 py-2 rounded-full shadow-sm">
                <SquarePen className="h-4 w-4 mr-2" />
                New chat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start"> {/* Adjust width and alignment as needed */}
              <DropdownMenuItem onSelect={() => setShowCreateGroupDialog(true)}>
                <Users className="h-4 w-4 mr-2 text-[hsl(var(--muted-foreground))]" />
                <span>Create a group chat</span>
              </DropdownMenuItem>
              {/* Potential other items:
              <DropdownMenuItem onSelect={() => console.log("Trigger New Direct Message UI")}>
                <UserPlus className="h-4 w-4 mr-2 text-[hsl(var(--muted-foreground))]" />
                <span>Start a new chat</span>
              </DropdownMenuItem>
              */}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setConversation(conversation); }} // Allow selection with Enter/Space
                >
                  <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                    <AvatarImage
                      src={`https://api.adorable.io/avatars/285/${conversation.participants[0]}.png`} // Placeholder
                      alt={conversation.participants[0]}
                    />
                    <AvatarFallback>
                      {conversation.participants[0]?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <p className={cn("text-sm font-medium truncate", isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]")}>
                        {conversation.project_name || 'Unnamed Project'}
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
          <DialogContent className="sm:max-w-[450px] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))]">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--card-foreground))]">Create a group chat</DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                Fill in the details below to start a new group conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4"> {/* Increased gap for better spacing */}
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
              <div className="grid grid-cols-4 items-center gap-4">
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
                <div className="col-start-2 col-span-3 mt-1 max-h-32 overflow-y-auto border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))]">
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
                <div className="col-start-2 col-span-3 mt-2 space-y-1">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Selected:</Label>
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
                 <div className="col-start-2 col-span-3 text-xs text-[hsl(var(--muted-foreground))] pl-2">
                    Search by name or email to add members.
                 </div>
              )}
            </div>
            <DialogFooter className="border-t border-[hsl(var(--border))] pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => {
                  setGroupName('');
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
                    // Add any other necessary fields from your Conversation interface
                  };

                  try {
                    const docRef = await addDoc(collection(db, 'conversations'), newGroupConversation);
                    console.log("Group conversation created with ID: ", docRef.id);
                    toast({ title: "Success", description: "Group chat created successfully." });
                    setGroupName('');
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
    </div>
  );
}
