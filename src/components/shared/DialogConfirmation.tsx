import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Note } from '@/utils/types/note';

type DialogConfirmationProps = {
  note: Note | null;
  onClose: () => void;
  onDelete: (noteId: string | null) => Promise<void> | void;
};

const DialogConfirmation = ({
  note,
  onClose,
  onDelete,
}: DialogConfirmationProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!note?._id) return;

    try {
      setIsDeleting(true);
      await onDelete(note._id);
      // onClose will be called by the parent after successful deletion
    } catch (error) {
      console.error('Error deleting note:', error);
      setIsDeleting(false);
    }
  };

  if (!note) return null;

  return (
    <Dialog open={!!note} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[425px] p-6 rounded-lg shadow-lg"
        onInteractOutside={(e) => {
          if (isDeleting) e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-600">
            <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center text-xl font-medium">
            Delete Note
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Delete{' '}
            <span className="font-medium text-gray-600">
              &quot;{note.title}&quot;
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:col-start-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="mt-3 w-full sm:col-start-1 sm:mt-0"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogConfirmation;
