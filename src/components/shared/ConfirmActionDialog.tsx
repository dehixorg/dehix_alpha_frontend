import React, { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Keep DialogClose for explicit cancel button behavior
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmButtonText?: string; // Optional: Default to "Confirm"
  confirmButtonVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined; // Optional: Default to "destructive"
  isLoading?: boolean;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'destructive',
  isLoading = false,
}: ConfirmActionDialogProps) {
  const [localBusy, setLocalBusy] = useState(false);
  const busy = isLoading || localBusy;

  // Reset local loading state when dialog opens
  useEffect(() => {
    if (isOpen) setLocalBusy(false);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    try {
      setLocalBusy(true);
      await onConfirm();
      // Dialog is typically closed by the caller after onConfirm promise resolves
    } catch (error) {
      logger.error('ConfirmActionDialog.onConfirm failed', error);
      // Close dialog on error so user isn't stuck
      onClose();
    } finally {
      setLocalBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border-[hsl(var(--border))] shadow-xl"
        aria-labelledby="confirm-action-title"
        aria-describedby={
          description ? 'confirm-action-description' : undefined
        }
      >
        <DialogHeader>
          <DialogTitle
            id="confirm-action-title"
            className="text-[hsl(var(--card-foreground))]"
          >
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription
              id="confirm-action-description"
              className="text-[hsl(var(--muted-foreground))] pt-2"
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="pt-4">
          {/* DialogClose can be used for the cancel button if preferred,
              otherwise, a regular button calling onClose works too.
              Using DialogClose for consistency with other dialogs. */}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={busy}
            className={cn(
              confirmButtonVariant === 'destructive' &&
                'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)_/_0.9)]',
              confirmButtonVariant === 'default' &&
                'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-hover))]',
            )}
          >
            {busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              confirmButtonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmActionDialog;
