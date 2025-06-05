import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X as LucideX } from 'lucide-react'; // Using X for potential close icon in header, though DialogClose handles footer
import { cn } from '@/lib/utils';

// Define User type locally for now. Ideally, this would be a shared type.
export type User = {
  uid: string;
  userName: string;
  email: string;
  profilePic?: string; // Optional profile picture
};

// MOCK_USERS - In a real app, this would come from a prop, context, or API call
// For now, to make the component self-contained for creation, let's define it here.
// It should ideally be passed from chatList.tsx or a shared constants file.
const MOCK_USERS: User[] = [
  { uid: 'user1_uid_alice', userName: 'Alice Wonderland', email: 'alice@example.com', profilePic: 'https://api.adorable.io/avatars/285/alice.png' },
  { uid: 'user2_uid_bob', userName: 'Bob The Builder', email: 'bob@example.com', profilePic: 'https://api.adorable.io/avatars/285/bob.png' },
  { uid: 'user3_uid_charlie', userName: 'Charlie Brown', email: 'charlie@example.com', profilePic: 'https://api.adorable.io/avatars/285/charlie.png' },
  { uid: 'user4_uid_diana', userName: 'Diana Prince', email: 'diana@example.com', profilePic: 'https://api.adorable.io/avatars/285/diana.png' },
  { uid: 'user5_uid_edward', userName: 'Edward Scissorhands', email: 'edward@example.com', profilePic: 'https://api.adorable.io/avatars/285/edward.png' },
  { uid: 'user6_uid_current', userName: 'Current User', email: 'current@example.com', profilePic: 'https://api.adorable.io/avatars/285/current.png' }, // Example current user
];


interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUserUid: string; // Changed from currentUser: User to just UID for simpler filtering
}

export function NewChatDialog({ isOpen, onClose, onSelectUser, currentUserUid }: NewChatDialogProps) {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleUserSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setUserSearchTerm(term);

    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = MOCK_USERS.filter(
      (user) =>
        (user.userName.toLowerCase().includes(term.toLowerCase()) ||
          user.email.toLowerCase().includes(term.toLowerCase())) &&
        user.uid !== currentUserUid // Exclude current user
    );
    setSearchResults(filtered);
  };

  // Reset search term when dialog is closed/opened
  useEffect(() => {
    if (isOpen) {
      setUserSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--card-foreground))]">Start a new chat</DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))] pt-1">
            Search for a user by name or email to begin a one-on-one conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="searchUser" className="text-right col-span-1 text-[hsl(var(--foreground))]">
              Search
            </Label>
            <Input
              id="searchUser"
              placeholder="Enter name or email..."
              className="col-span-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]"
              value={userSearchTerm}
              onChange={handleUserSearch}
              aria-label="Search for a user"
            />
          </div>

          {userSearchTerm && searchResults.length > 0 && (
            <ScrollArea className="col-span-4 mt-2 max-h-48 overflow-y-auto border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))]">
              <div className="p-2 space-y-1">
                {searchResults.map((foundUser) => (
                  <Button
                    variant="ghost"
                    key={foundUser.uid}
                    onClick={() => {
                      onSelectUser(foundUser);
                      onClose(); // Close dialog after selection
                    }}
                    className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto hover:bg-[hsl(var(--accent))]"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={foundUser.profilePic} alt={foundUser.userName} />
                      <AvatarFallback>{foundUser.userName ? foundUser.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{foundUser.userName}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{foundUser.email}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}

          {userSearchTerm && searchResults.length === 0 && (
            <div className="col-span-4 mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No users found matching your search.
            </div>
          )}
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
