import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Assuming User type is similar to the one in NewChatDialog or a shared one
// For now, defining locally.
export type User = {
  uid: string; // Changed from id to uid to match MOCK_USERS
  userName: string;
  email?: string;
  profilePic?: string;
};

// MOCK_USERS - In a real app, this would come from a prop, context, or API call.
// Using the same MOCK_USERS as NewChatDialog for consistency in placeholder data.
const MOCK_USERS_LIST: User[] = [
  { uid: 'user1_uid_alice', userName: 'Alice Wonderland', email: 'alice@example.com', profilePic: 'https://api.adorable.io/avatars/285/alice.png' },
  { uid: 'user2_uid_bob', userName: 'Bob The Builder', email: 'bob@example.com', profilePic: 'https://api.adorable.io/avatars/285/bob.png' },
  { uid: 'user3_uid_charlie', userName: 'Charlie Brown', email: 'charlie@example.com', profilePic: 'https://api.adorable.io/avatars/285/charlie.png' },
  { uid: 'user4_uid_diana', userName: 'Diana Prince', email: 'diana@example.com', profilePic: 'https://api.adorable.io/avatars/285/diana.png' },
  { uid: 'user5_uid_edward', userName: 'Edward Scissorhands', email: 'edward@example.com', profilePic: 'https://api.adorable.io/avatars/285/edward.png' },
  { uid: 'user6_uid_current', userName: 'Current User', email: 'current@example.com', profilePic: 'https://api.adorable.io/avatars/285/current.png' },
  { uid: 'user7_uid_frank', userName: 'Frank N. Stein', email: 'frank@example.com', profilePic: 'https://api.adorable.io/avatars/285/frank.png' },
  { uid: 'user8_uid_grace', userName: 'Grace Hopper', email: 'grace@example.com', profilePic: 'https://api.adorable.io/avatars/285/grace.png' },
];

interface AddMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (selectedUserIds: string[]) => void;
  currentMemberIds: string[]; // Renamed from currentMembers for clarity
  groupId: string; // Keep groupId for context, though not used in this basic setup
}

export function AddMembersDialog({
  isOpen,
  onClose,
  onAddMembers,
  currentMemberIds,
  groupId,
}: AddMembersDialogProps) {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserSearchTerm('');
      setSelectedUserIds([]);
      // Initial search results can be set here if needed (e.g., all non-members)
    }
  }, [isOpen]);

  // Perform search when userSearchTerm or currentMemberIds change
  useEffect(() => {
    if (!isOpen) return; // Don't search if dialog is closed

    const term = userSearchTerm.toLowerCase().trim();
    if (term === '') {
      // Optionally, show all non-members if search is empty, or require search
      const nonMembers = MOCK_USERS_LIST.filter(user => !currentMemberIds.includes(user.uid));
      setSearchResults(nonMembers);
      // setSearchResults([]); // Or clear results if search term is empty
      return;
    }

    const filtered = MOCK_USERS_LIST.filter(
      (user) =>
        !currentMemberIds.includes(user.uid) &&
        (user.userName.toLowerCase().includes(term) ||
          (user.email && user.email.toLowerCase().includes(term)))
    );
    setSearchResults(filtered);
  }, [userSearchTerm, currentMemberIds, isOpen]);


  const handleUserSelection = (userId: string, isChecked: boolean) => {
    setSelectedUserIds((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, userId];
      } else {
        return prevSelected.filter((id) => id !== userId);
      }
    });
  };

  const handleAddClick = () => {
    onAddMembers(selectedUserIds);
    onClose(); // Close the dialog after adding
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--card-foreground))]">Add New Members</DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))] pt-1">
            Search for users by name or email to add them to the group.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Input
            placeholder="Search by name or email..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]"
            aria-label="Search for users to add"
          />

          {searchResults.length > 0 ? (
            <ScrollArea className="max-h-60 overflow-y-auto border border-[hsl(var(--border))] rounded-md p-2 bg-[hsl(var(--background))]">
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <Label
                    key={user.uid}
                    htmlFor={user.uid}
                    className="flex items-center space-x-3 p-2.5 hover:bg-[hsl(var(--accent))] cursor-pointer rounded-md transition-colors"
                  >
                    <Checkbox
                      id={user.uid}
                      checked={selectedUserIds.includes(user.uid)}
                      onCheckedChange={(checked) => {
                        handleUserSelection(user.uid, !!checked);
                      }}
                      className="border-[hsl(var(--border))]"
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profilePic} alt={user.userName} />
                      <AvatarFallback>{user.userName ? user.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{user.userName}</p>
                      {user.email && <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>}
                    </div>
                  </Label>
                ))}
              </div>
            </ScrollArea>
          ) : (
            userSearchTerm && ( // Only show "no results" if a search has been attempted
              <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
                No users found matching your search.
              </div>
            )
          )}
        </div>

        <DialogFooter className="border-t border-[hsl(var(--border))] pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleAddClick}
            disabled={selectedUserIds.length === 0}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))]"
          >
            Add Selected ({selectedUserIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddMembersDialog;
