import React, { useState, useEffect } from 'react';

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
import { cn } from '@/lib/utils';

interface ChangeGroupInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string, newAvatarUrl: string) => void;
  currentName: string;
  currentAvatarUrl?: string;
  groupId: string; // Keep for context, though not directly used in this basic UI
}

export function ChangeGroupInfoDialog({
  isOpen,
  onClose,
  onSave,
  currentName,
  currentAvatarUrl,
}: ChangeGroupInfoDialogProps) {
  const [groupName, setGroupName] = useState(currentName);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');
  const [nameError, setNameError] = useState<string | null>(null);

  // Effect to reset form state when dialog opens or current props change
  useEffect(() => {
    if (isOpen) {
      setGroupName(currentName);
      setAvatarUrl(currentAvatarUrl || '');
      setNameError(null);
    }
  }, [isOpen, currentName, currentAvatarUrl]);

  const handleSave = () => {
    if (groupName.trim() === '') {
      setNameError('Group name cannot be empty.');
      return;
    }
    setNameError(null); // Clear error if validation passes
    onSave(groupName.trim(), avatarUrl.trim());
    onClose();
  };

  // Fallback character for avatar if groupName is empty or undefined
  const fallbackChar = groupName?.charAt(0)?.toUpperCase() || 'G';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl"
        aria-labelledby="change-group-info-title"
        aria-describedby="change-group-info-description"
      >
        <DialogHeader>
          <DialogTitle
            id="change-group-info-title"
            className="text-[hsl(var(--card-foreground))]"
          >
            Change Group Information
          </DialogTitle>
          <DialogDescription
            id="change-group-info-description"
            className="text-[hsl(var(--muted-foreground))] pt-1"
          >
            Update the group&#39;s name and avatar URL.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="groupName"
              className="text-[hsl(var(--foreground))]"
            >
              Group Name
            </Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (nameError && e.target.value.trim() !== '') {
                  setNameError(null); // Clear error once user starts typing valid name
                }
              }}
              className={cn(
                'bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]',
                nameError &&
                  'border-red-500 dark:border-red-400 focus:ring-red-500',
              )}
            />
            {nameError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="avatarUrl"
              className="text-[hsl(var(--foreground))]"
            >
              Avatar URL (Optional)
            </Label>
            <Input
              id="avatarUrl"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[hsl(var(--foreground))]">
              Avatar Preview
            </Label>
            <Avatar className="w-20 h-20 mt-1 border border-[hsl(var(--border))]">
              <AvatarImage src={avatarUrl} alt="Avatar Preview" />
              <AvatarFallback className="text-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                {fallbackChar}
              </AvatarFallback>
            </Avatar>
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
            onClick={handleSave}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))]"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChangeGroupInfoDialog;
