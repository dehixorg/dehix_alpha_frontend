import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Note, LabelType } from '@/utils/types/note';

interface DialogUpdateTypeProps {
  note: Note;
  onClose: () => void;
  onUpdate: (noteId: string, type: string) => void;
}

const DialogUpdateType = ({
  note,
  onClose,
  onUpdate,
}: DialogUpdateTypeProps) => {
  const [selectedType, setSelectedType] = useState(note.type || '');

  const handleUpdate = () => {
    if (selectedType) {
      onUpdate(note._id, selectedType);
    }
  };

  return (
    <Dialog open={!!note} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Note Type</DialogTitle>
        </DialogHeader>
        <Select
          onValueChange={(value) => setSelectedType(value)}
          value={selectedType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="reminder">reminder</SelectItem>
            <SelectItem value="task">task</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogUpdateType;
