'use client';

import React, { useState, useEffect } from 'react';
import { X as LucideX, LoaderCircle, Check, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';

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
import { Textarea } from '@/components/ui/textarea';
import { useAllUsers, type CombinedUser } from '@/hooks/useAllUsers';
import { toast } from '@/components/ui/use-toast';
import { RootState } from '@/lib/store';
import { db } from '@/config/firebaseConfig';

interface CreateProjectGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  projectId: string;
  currentUserUid: string;
}

export function CreateProjectGroupDialog({
  isOpen,
  onClose,
  onGroupCreated,
  projectId,
  currentUserUid,
}: CreateProjectGroupDialogProps) {
  const user = useSelector((state: RootState) => state.user);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<
    CombinedUser[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  // Use the hook to fetch all users
  const {
    users: allFetchedUsers,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useAllUsers();

  const searchResults =
    userSearchTerm.length >= 3
      ? allFetchedUsers.filter((user) => {
          // Filter out current user and already selected members
          if (user.id === currentUserUid) return false;
          if (selectedGroupMembers.some((member) => member.id === user.id))
            return false;

          // Only show freelancers for project groups
          if (user.userType !== 'freelancer') return false;

          // Search in multiple fields (case insensitive)
          const searchTerm = userSearchTerm.toLowerCase();
          return (
            user.displayName?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.rawUserName?.toLowerCase().includes(searchTerm) ||
            user.rawFirstName?.toLowerCase().includes(searchTerm) ||
            user.rawLastName?.toLowerCase().includes(searchTerm)
          );
        })
      : [];

  const handleToggleGroupMember = (user: CombinedUser) => {
    setSelectedGroupMembers((prev) =>
      prev.some((member) => member.id === user.id)
        ? prev.filter((member) => member.id !== user.id)
        : [...prev, user],
    );
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Group Name Required',
        description: 'Please enter a group name.',
      });
      return;
    }

    if (selectedGroupMembers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Members Required',
        description: 'Please select at least one freelancer for the group.',
      });
      return;
    }

    if (!user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a group.',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Prepare participant data
      const allParticipantIds = [
        user.uid,
        ...selectedGroupMembers.map((member) => member.id),
      ];
      const participantDetails: Record<string, any> = {
        [user.uid]: {
          userName: user.displayName || user.email || 'Business User',
          profilePic: user.photoURL || null,
          email: user.email || null,
          userType: user.type || 'business',
        },
      };

      // Add selected members to participant details
      selectedGroupMembers.forEach((member) => {
        participantDetails[member.id] = {
          userName: member.displayName,
          profilePic: member.profilePic || null,
          email: member.email || null,
          userType: member.userType,
        };
      });

      const currentTimestamp = new Date().toISOString();

      // Create group data
      const newGroupData = {
        groupName: groupName.trim(),
        description: groupDescription.trim() || '',
        avatar: null,
        participants: allParticipantIds,
        participantDetails: participantDetails,
        type: 'group' as const,
        admins: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        timestamp: currentTimestamp, // For reliable ordering
        lastMessage: null,
        project_id: projectId, // Link to the project
      };

      // Actually create the group in Firestore
      await addDoc(collection(db, 'conversations'), newGroupData);

      toast({
        title: 'Success',
        description: `Group "${groupName}" created successfully!`,
      });

      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedGroupMembers([]);
      setUserSearchTerm('');

      onGroupCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error?.message || 'Failed to create group. Please try again.',
      });
      // Don't call onGroupCreated() or onClose() if there was an error
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUserSearchTerm('');
      setGroupName('');
      setGroupDescription('');
      setSelectedGroupMembers([]);
    }
  }, [isOpen]);

  // Helper to render the search results or status messages
  const renderUserList = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex justify-center items-center h-48">
          <LoaderCircle className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (usersError) {
      return (
        <div className="text-center text-red-500 p-4">Error: {usersError}</div>
      );
    }

    if (userSearchTerm.length > 0 && userSearchTerm.length < 3) {
      return (
        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
          Type 3+ characters to search for freelancers.
        </div>
      );
    }

    if (userSearchTerm.length >= 3 && searchResults.length === 0) {
      return (
        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
          {allFetchedUsers.length > 0
            ? 'No freelancers found matching your search. Try different keywords.'
            : 'No freelancers available in the system.'}
        </div>
      );
    }

    if (userSearchTerm.length < 3) {
      return (
        <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4">
          Start typing to search for freelancers by name, email, or username...
        </div>
      );
    }

    return (
      <>
        {searchResults.length > 0 && (
          <div className="text-xs text-[hsl(var(--muted-foreground))] px-2 py-1 border-b">
            {searchResults.length} freelancer
            {searchResults.length !== 1 ? 's' : ''} found
          </div>
        )}
        {searchResults.map((foundUser) => {
          const isSelected = selectedGroupMembers.some(
            (m) => m.id === foundUser.id,
          );

          return (
            <div
              key={foundUser.id}
              onClick={() => handleToggleGroupMember(foundUser)}
              className="w-full flex items-center justify-start space-x-3 p-2 text-left h-auto rounded-md cursor-pointer hover:bg-[hsl(var(--accent))]"
            >
              <div
                className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-400'}`}
              >
                {isSelected && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={foundUser.profilePic} />
                <AvatarFallback>
                  {foundUser.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{foundUser.displayName}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {foundUser.email}
                </p>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-[hsl(var(--card))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Project Group
          </DialogTitle>
          <DialogDescription>
            Create a group to collaborate with freelancers on this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Textarea
              id="groupDescription"
              placeholder="What is this group about?"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Search Members */}
          <div className="space-y-2">
            <Label htmlFor="memberSearch">Add Freelancers</Label>
            <Input
              id="memberSearch"
              placeholder="Search freelancers to add..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
          </div>

          {/* Selected Members Display */}
          {selectedGroupMembers.length > 0 && (
            <div className="p-2 border-b">
              <p className="text-xs font-semibold mb-2 text-[hsl(var(--muted-foreground))]">
                SELECTED FREELANCERS ({selectedGroupMembers.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedGroupMembers.map((member) => (
                  <span
                    key={member.id}
                    className="flex items-center gap-1.5 bg-[hsl(var(--accent))] text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {member.displayName}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleGroupMember(member);
                      }}
                    >
                      <LucideX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User List */}
          <ScrollArea className="h-48 border rounded-md p-2">
            {renderUserList()}
          </ScrollArea>
        </div>

        <DialogFooter className="border-t pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCreateGroup}
            disabled={
              isCreating ||
              !groupName.trim() ||
              selectedGroupMembers.length === 0
            }
          >
            {isCreating ? (
              <>
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
