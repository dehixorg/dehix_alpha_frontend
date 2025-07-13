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
import { useAllUsers, type CombinedUser } from '@/hooks/useAllUsers'; // Import hook and type
import { LoaderCircle } from 'lucide-react'; // For loading state

// Local User type and MOCK_USERS_LIST are no longer needed.

interface AddMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (selectedUsers: CombinedUser[]) => void; // Changed to CombinedUser[]
  currentMemberIds: string[];
  groupId: string;
}

export function AddMembersDialog({
  isOpen,
  onClose,
  onAddMembers,
  currentMemberIds,
  groupId,
}: AddMembersDialogProps) {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const { users: allFetchedUsers, isLoading: isLoadingUsers, error: usersError, refetchUsers } = useAllUsers();
  const [searchResults, setSearchResults] = useState<CombinedUser[]>([]);
  const [selectedUsersState, setSelectedUsersState] = useState<CombinedUser[]>([]); // Changed state name and type

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setUserSearchTerm('');
      setSelectedUsersState([]); // Reset to empty array of CombinedUser
      // Optionally trigger a refetch if data might be stale, though useAllUsers fetches on mount.
      // refetchUsers();
    }
  }, [isOpen]);

  // Perform search based on allFetchedUsers, userSearchTerm, and currentMemberIds
  useEffect(() => {
    if (!isOpen || isLoadingUsers || !allFetchedUsers) {
      setSearchResults([]);
      return;
    }

    let filtered = allFetchedUsers;
    const term = userSearchTerm.toLowerCase().trim();

    if (term !== '') {
      filtered = filtered.filter(user =>
        (user.displayName.toLowerCase().includes(term)) ||
        (user.email.toLowerCase().includes(term)) ||
        (user.rawUserName?.toLowerCase().includes(term)) ||
        (user.rawName?.toLowerCase().includes(term))
      );
    }

    // Filter out users already in currentMemberIds
    if (currentMemberIds && currentMemberIds.length > 0) {
      const currentMemberIdSet = new Set(currentMemberIds);
      filtered = filtered.filter(user => !currentMemberIdSet.has(user.id));
    }

    setSearchResults(filtered);
  }, [allFetchedUsers, userSearchTerm, currentMemberIds, isOpen, isLoadingUsers]);


  const handleUserSelection = (user: CombinedUser, isChecked: boolean) => { // Takes CombinedUser object
    setSelectedUsersState((prevSelected) => {
      if (isChecked) {
        // Add user if not already present
        if (!prevSelected.find(u => u.id === user.id)) {
          return [...prevSelected, user];
        }
        return prevSelected;
      } else {
        // Remove user by id
        return prevSelected.filter((u) => u.id !== user.id);
      }
    });
  };

  const handleAddClick = () => {
    onAddMembers(selectedUsersState); // Pass array of CombinedUser objects
    onClose(); // Close the dialog after adding
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl"
        aria-labelledby="add-members-title"
        aria-describedby="add-members-description"
      >
        <DialogHeader>
          <DialogTitle id="add-members-title" className="text-[hsl(var(--card-foreground))]">Add New Members</DialogTitle>
          <DialogDescription id="add-members-description" className="text-[hsl(var(--muted-foreground))] pt-1">
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
            disabled={isLoadingUsers}
          />

          <div className="min-h-[240px]"> {/* Ensures ScrollArea or messages have space */}
            {isLoadingUsers ? (
              <div className="flex items-center justify-center h-full">
                <LoaderCircle className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
              </div>
            ) : usersError ? (
              <div className="text-center text-sm text-red-500 dark:text-red-400 p-4">
                Error loading users: {usersError}
                <Button variant="link" onClick={() => refetchUsers()} className="ml-2">Retry</Button>
              </div>
            ) : searchResults.length > 0 ? (
              <ScrollArea className="max-h-60 overflow-y-auto border border-[hsl(var(--border))] rounded-md p-2 bg-[hsl(var(--background))]">
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <Label
                      key={user.id} // Use user.id from CombinedUser
                      htmlFor={user.id} // Use user.id
                      className="flex items-center space-x-3 p-2.5 hover:bg-[hsl(var(--accent))] cursor-pointer rounded-md transition-colors"
                    >
                      <Checkbox
                        id={user.id} // Use user.id
                        checked={selectedUsersState.some(su => su.id === user.id)} // Check if user object is in state
                        onCheckedChange={(checked) => {
                          handleUserSelection(user, !!checked); // Pass CombinedUser object
                        }}
                        className="border-[hsl(var(--border))]"
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profilePic} alt={user.displayName} />
                        <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{user.displayName}</p>
                        {user.email && <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>}
                      </div>
                    </Label>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
                {userSearchTerm ? "No users found matching your search." : "Type to search for users to add."}
              </div>
            )}
          </div>
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
            disabled={selectedUsersState.length === 0} // Check length of selectedUsersState
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))]"
          >
            Add Selected ({selectedUsersState.length}) {/* Show length of selectedUsersState */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddMembersDialog;
