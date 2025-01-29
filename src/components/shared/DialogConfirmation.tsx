import React from 'react';

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
  onDelete: (noteId: string | null) => void; // Pass `noteId` for deletion
};

const DialogConfirmation = ({
  note,
  onClose,
  onDelete,
}: DialogConfirmationProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-semibold">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete the note titled{' '}
            <strong>{note?.title}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(note?._id || null)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogConfirmation;
