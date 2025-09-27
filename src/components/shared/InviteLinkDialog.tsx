import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, LoaderCircle } from 'lucide-react';

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
// Label might not be strictly needed if input has an id and is self-descriptive, but can be added for accessibility.
// import { Label } from '@/components/ui/label';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

interface InviteLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateLink: () => Promise<string | null>;
  currentInviteLink: string | null | undefined;
  groupName: string;
}

export function InviteLinkDialog({
  isOpen,
  onClose,
  onGenerateLink,
  currentInviteLink,
  groupName,
}: InviteLinkDialogProps) {
  const [displayedLink, setDisplayedLink] = useState(currentInviteLink || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayedLink(currentInviteLink || '');
      setIsCopied(false); // Reset copied state when dialog opens
    }
  }, [isOpen, currentInviteLink]);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setIsCopied(false); // Reset copied state
    try {
      const newLink = await onGenerateLink();
      if (newLink) {
        setDisplayedLink(newLink);
        notifySuccess('New invite link generated.', 'Success');
      } else {
        notifyError(
          'Failed to generate new invite link. Please try again.',
          'Error',
        );
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      notifyError('An unexpected error occurred. Please try again.', 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!displayedLink) {
      notifyError('No link to copy.', 'Error');
      return;
    }
    try {
      await navigator.clipboard.writeText(displayedLink);
      setIsCopied(true);
      notifySuccess('Invite link copied to clipboard.', 'Copied!');
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('Failed to copy link: ', err);
      notifyError('Failed to copy link. Please try again.', 'Error');
    }
  };

  const dialogTitle = `Invite Link for "${groupName}"`;
  const dialogDescription = `Share this link to invite others to join the group. The link will grant access to join "${groupName}".`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl"
        aria-labelledby="invite-link-title"
        aria-describedby="invite-link-description"
      >
        <DialogHeader>
          <DialogTitle
            id="invite-link-title"
            className="text-[hsl(var(--card-foreground))]"
          >
            {dialogTitle}
          </DialogTitle>
          <DialogDescription
            id="invite-link-description"
            className="text-[hsl(var(--muted-foreground))] pt-1"
          >
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              id="inviteLink"
              value={
                displayedLink ||
                'No link generated yet. Click "Generate Link" to create one.'
              }
              readOnly
              className="flex-1 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              aria-label="Group Invite Link"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              disabled={!displayedLink || isGenerating || isCopied}
              aria-label="Copy invite link"
              className="border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Button
            onClick={handleGenerateLink}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))]"
          >
            {isGenerating ? (
              <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {displayedLink ? 'Regenerate Link' : 'Generate Link'}
          </Button>
        </div>

        <DialogFooter className="border-t border-[hsl(var(--border))] pt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteLinkDialog;
