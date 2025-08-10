/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { X as LucideX, LoaderCircle, Check } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAllUsers, type CombinedUser } from '@/hooks/useAllUsers';
import { toast } from '@/components/ui/use-toast';
import { Description } from '@radix-ui/react-toast';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: CombinedUser) => void;
  onCreateGroup: (users: CombinedUser[], groupName: string, description: string) => void;
  currentUserUid: string;
}

export function NewChatDialog({
  isOpen,
  onClose,
  onSelectUser,
  onCreateGroup,
  currentUserUid,
}: NewChatDialogProps) {
  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<CombinedUser[]>([]);

  // Use the hook you provided. It fetches all users on mount.
  const { users: allFetchedUsers, isLoading: isLoadingUsers, error: usersError, refetchUsers } = useAllUsers();

  // Perform client-side filtering based on the search term
  const searchResults = userSearchTerm.length >= 3
    ? allFetchedUsers.filter(
        (user) =>
          user.id !== currentUserUid &&
          (user.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))
      )
    : [];

  const handleToggleGroupMember = (user: CombinedUser) => {
    setSelectedGroupMembers((prev) =>
      prev.some((member) => member.id === user.id)
        ? prev.filter((member) => member.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === '') {
      toast({ variant: 'destructive', title: 'Group Name Required' });
      return;
    }
    onCreateGroup(selectedGroupMembers, groupName, groupDescription);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setMode('individual');
      setUserSearchTerm('');
      setGroupName('');
      setGroupDescription('');
      setSelectedGroupMembers([]);
    }
  }, [isOpen]);

  // Helper to render the search results or status messages
  const renderUserList = (forGroup: boolean) => {
    if (isLoadingUsers) {
      return <div className="flex justify-center items-center h-48"><LoaderCircle className="w-8 h-8 animate-spin" /></div>;
    }
    if (usersError) {
      return <div className="text-center text-red-500 p-4">Error: {usersError}</div>;
    }
    if (userSearchTerm.length > 0 && userSearchTerm.length < 3) {
        return <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">Type 3+ characters to search.</div>;
    }
    if (userSearchTerm.length >= 3 && searchResults.length === 0) {
      return <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">No users found.</div>;
    }
     if (userSearchTerm.length < 3) {
      return <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">Search for users above.</div>;
    }

    return searchResults
      .map((foundUser) => {
        const isSelected = selectedGroupMembers.some(m => m.id === foundUser.id);
        const userContent = (
            <>
                <Avatar className="w-8 h-8"><AvatarImage src={foundUser.profilePic} /><AvatarFallback>{foundUser.displayName?.charAt(0)}</AvatarFallback></Avatar>
                <div><p className="text-sm font-medium">{foundUser.displayName}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">{foundUser.email}</p></div>
            </>
        );

        return forGroup ? (
          <div key={foundUser.id} onClick={() => handleToggleGroupMember(foundUser)} className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto rounded-md cursor-pointer hover:bg-[hsl(var(--accent))]">
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-400'}`}>
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            {userContent}
          </div>
        ) : (
          <Button variant="ghost" key={foundUser.id} onClick={() => onSelectUser(foundUser)} className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto">
            {userContent}
          </Button>
        );
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
          <DialogDescription>Select a user or create a group.</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'individual' | 'group')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4 pt-4">
            <Input placeholder="Search by name or email..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
            <ScrollArea className="h-60">{renderUserList(false)}</ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="space-y-4 pt-4">
            <div className="space-y-2"><Label htmlFor="groupName">Group Name</Label><Input id="groupName" placeholder="Enter group name..." value={groupName} onChange={(e) => setGroupName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="groupDescription">Description (Optional)</Label><Textarea id="groupDescription" placeholder="What is this group about?" value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} className="resize-none" /></div>
            <Input placeholder="Search members to add..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
            {selectedGroupMembers.length > 0 && <div className="p-2 border-b"><p className="text-xs font-semibold mb-2 text-[hsl(var(--muted-foreground))]">SELECTED</p><div className="flex flex-wrap gap-1.5">{selectedGroupMembers.map(member => (<span key={member.id} className="flex items-center gap-1.5 bg-[hsl(var(--accent))] text-xs font-medium px-2 py-1 rounded-full">{member.displayName}<button onClick={() => handleToggleGroupMember(member)}><LucideX className="w-3 h-3" /></button></span>))}</div></div>}
            <ScrollArea className="h-48">{renderUserList(true)}</ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
          {mode === 'group' && <Button type="button" onClick={handleCreateGroup}>Create Group</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}