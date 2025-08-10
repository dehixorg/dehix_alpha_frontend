import React, { useState, useEffect } from 'react';
import { X as LucideX, LoaderCircle } from 'lucide-react'; // Using X & LoaderCircle

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
import { cn } from '@/lib/utils';
import { useAllUsers, type CombinedUser } from '@/hooks/useAllUsers'; // Import hook and CombinedUser type
import { toast } from '@/components/ui/use-toast';

// Local User type and MOCK_USERS are no longer needed.

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: CombinedUser) => void; // Updated to use CombinedUser
  currentUserUid: string;
}

export function NewChatDialog({
  isOpen,
  onClose,
  onSelectUser,
  currentUserUid,
}: NewChatDialogProps) {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const {
    users: allFetchedUsers,
    isLoading: isLoadingUsers,
    error: usersError,
    refetchUsers,
  } = useAllUsers();
  const [searchResults, setSearchResults] = useState<CombinedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleUserSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUserSearchTerm(event.target.value);
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
          user.id !== currentUserUid && // Exclude current user
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
  }, [userSearchTerm, allFetchedUsers, currentUserUid]);

  // Reset search term and results when dialog is closed/opened
  useEffect(() => {
    if (isOpen) {
      setUserSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[450px] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl"
        // Add ARIA attributes if not already present in ui/dialog
        // aria-labelledby="new-chat-dialog-title"
        // aria-describedby="new-chat-dialog-description"
      >
        <DialogHeader>
          <DialogTitle
            id="new-chat-dialog-title"
            className="text-[hsl(var(--card-foreground))]"
          >
            Start a new chat
          </DialogTitle>
          <DialogDescription
            id="new-chat-dialog-description"
            className="text-[hsl(var(--muted-foreground))] pt-1"
          >
            Search for a user by name or email to begin a one-on-one
            conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="searchUser"
              className="text-right col-span-1 text-[hsl(var(--foreground))]"
            >
              Search
            </Label>
            <Input
              id="searchUser"
              placeholder="Enter name or email..."
              className="col-span-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]"
              value={userSearchTerm}
              onChange={handleUserSearchChange}
              aria-label="Search for a user"
              disabled={isLoadingUsers}
            />
          </div>

          <div className="min-h-[200px]">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center h-full">
                <LoaderCircle className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
              </div>
            ) : usersError ? (
              <div className="text-center text-sm text-red-500 dark:text-red-400 p-4">
                Error loading users: {usersError}
                <Button
                  variant="link"
                  onClick={() => refetchUsers()}
                  className="ml-2"
                >
                  Retry
                </Button>
              </div>
            ) : userSearchTerm.length > 0 && userSearchTerm.length < 3 ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))] p-4">
                Type at least 3 characters to search users
              </div>
            ) : searchResults.length > 0 ? (
              <ScrollArea className="max-h-48 overflow-y-auto border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))]">
                <div className="p-2 space-y-1">
                  {searchResults.map((foundUser) => (
                    <Button
                      variant="ghost"
                      key={foundUser.id}
                      onClick={() => {
                        onSelectUser(foundUser);
                        onClose();
                      }}
                      className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto hover:bg-[hsl(var(--accent))]"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={foundUser.profilePic}
                          alt={foundUser.displayName}
                        />
                        <AvatarFallback>
                          {foundUser.displayName
                            ? foundUser.displayName.charAt(0).toUpperCase()
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {foundUser.displayName}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {foundUser.email}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
                {userSearchTerm
                  ? 'No users found matching your search.'
                  : 'Type to search for users.'}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewChatDialog;