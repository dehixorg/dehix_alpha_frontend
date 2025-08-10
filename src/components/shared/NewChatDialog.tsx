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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs
import { useAllUsers, type CombinedUser } from '@/hooks/useAllUsers';
import { toast } from '@/components/ui/use-toast';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: CombinedUser) => void;
  onCreateGroup: (users: CombinedUser[], groupName: string) => void; // Add new prop
  currentUserUid: string;
}

export function NewChatDialog({
  isOpen,
  onClose,
  onSelectUser,
  onCreateGroup, // Destructure new prop
  currentUserUid,
}: NewChatDialogProps) {
  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<CombinedUser[]>([]);

  const {
    users: allFetchedUsers,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useAllUsers();

  const filteredUsers = userSearchTerm.length > 0
    ? allFetchedUsers.filter(
        (user) =>
          user.id !== currentUserUid &&
          (user.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))
      )
    : allFetchedUsers.filter(user => user.id !== currentUserUid);

  // Function to add/remove a user from the group selection
  const handleToggleGroupMember = (user: CombinedUser) => {
    setSelectedGroupMembers((prev) => {
      const isAlreadySelected = prev.some((member) => member.id === user.id);
      if (isAlreadySelected) {
        return prev.filter((member) => member.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Function to handle the final "Create Group" button click
  const handleCreateGroup = () => {
    if (groupName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Group Name Required',
        description: 'Please enter a name for your group.',
      });
      return;
    }
    if (selectedGroupMembers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Members Selected',
        description: 'Please select at least one member to form a group.',
      });
      return;
    }
    onCreateGroup(selectedGroupMembers, groupName);
    onClose(); // Close the dialog after creation
  };

  // Reset all local state when the dialog is opened or closed
  useEffect(() => {
    if (isOpen) {
      setMode('individual');
      setUserSearchTerm('');
      setGroupName('');
      setSelectedGroupMembers([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
          <DialogDescription className="text-[hsl(var(--muted-foreground))] pt-1">
            Select a user for a one-on-one chat or create a new group.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'individual' | 'group')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>

          {/* INDIVIDUAL CHAT TAB */}
          <TabsContent value="individual" className="space-y-4 pt-4">
            <Input
              id="searchUserIndividual"
              placeholder="Search by name or email..."
              className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              disabled={isLoadingUsers}
            />
            <div className="min-h-[240px]">
              {isLoadingUsers ? <LoaderCircle className="w-8 h-8 mx-auto my-10 animate-spin text-[hsl(var(--primary))]" /> :
               (
                <ScrollArea className="h-60">
                  <div className="p-2 space-y-1">
                    {filteredUsers.map((foundUser) => (
                      <Button
                        variant="ghost"
                        key={foundUser.id}
                        onClick={() => onSelectUser(foundUser)}
                        className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto"
                      >
                        <Avatar className="w-8 h-8"><AvatarImage src={foundUser.profilePic} /><AvatarFallback>{foundUser.displayName?.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-sm font-medium">{foundUser.displayName}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{foundUser.email}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
               )}
            </div>
          </TabsContent>

          {/* GROUP CHAT TAB */}
          <TabsContent value="group" className="space-y-4 pt-4">
             <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                    id="groupName"
                    placeholder="Enter group name..."
                    className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
            </div>
            <Input
              id="searchUserGroup"
              placeholder="Search members to add..."
              className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))]"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              disabled={isLoadingUsers}
            />
            <div className="min-h-[200px]">
             {isLoadingUsers ? <LoaderCircle className="w-8 h-8 mx-auto my-10 animate-spin text-[hsl(var(--primary))]" /> :
              (
                <ScrollArea className="h-48">
                  {/* Display selected members as pills */}
                  {selectedGroupMembers.length > 0 && (
                     <div className="p-2 border-b">
                        <p className="text-xs font-semibold mb-2 text-[hsl(var(--muted-foreground))]">SELECTED</p>
                        <div className="flex flex-wrap gap-1.5">
                            {selectedGroupMembers.map(member => (
                                <span key={member.id} className="flex items-center gap-1.5 bg-[hsl(var(--accent))] text-xs font-medium px-2 py-1 rounded-full">
                                    {member.displayName}
                                    <button onClick={() => handleToggleGroupMember(member)}><LucideX className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                     </div>
                  )}
                  <div className="p-2 space-y-1">
                    {filteredUsers.map((foundUser) => {
                      const isSelected = selectedGroupMembers.some(m => m.id === foundUser.id);
                      return (
                        <div
                          key={foundUser.id}
                          onClick={() => handleToggleGroupMember(foundUser)}
                          className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto rounded-md cursor-pointer hover:bg-[hsl(var(--accent))]"
                        >
                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-400'}`}>
                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <Avatar className="w-8 h-8"><AvatarImage src={foundUser.profilePic} /><AvatarFallback>{foundUser.displayName?.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-grow">
                              <p className="text-sm font-medium">{foundUser.displayName}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">{foundUser.email}</p>
                            </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-[hsl(var(--border))] pt-4">
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
          {mode === 'group' && (
            <Button type="button" onClick={handleCreateGroup}>Create Group</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}