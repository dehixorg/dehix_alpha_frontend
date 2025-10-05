import React, { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Note } from '@/utils/types/note';

interface DialogUpdateTypeProps {
  note: Note;
  onClose: () => void;
  onUpdate: (noteId: string | undefined, type: string) => void;
}

const DialogUpdateType = ({
  note,
  onClose,
  onUpdate,
}: DialogUpdateTypeProps) => {
  const [selectedType, setSelectedType] = useState(note.type || '');

  const preview = useMemo(() => {
    const title = note?.title?.trim() || 'Untitled note';
    const content = (note?.content || '').toString();
    const plain = content.replace(/<[^>]+>/g, '');
    const snippet = plain.length > 120 ? `${plain.slice(0, 120)}…` : plain;
    return { title, snippet };
  }, [note]);

  const handleUpdate = () => {
    if (selectedType) {
      onUpdate(note._id, selectedType.toUpperCase());
    }
  };

  return (
    <Dialog open={!!note} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Update note label</DialogTitle>
          <DialogDescription>
            Choose a label that best fits this note. Labels help you filter and
            manage notes later.
          </DialogDescription>
        </DialogHeader>

        {/* Note preview */}
        <div className="rounded-md border p-3 bg-muted/30">
          <div className="text-sm font-medium line-clamp-1">
            {preview.title}
          </div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {preview.snippet || 'No content yet.'}
          </div>
        </div>

        {/* Type selection */}
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium">Select a label</p>
          <Select
            onValueChange={(value) => setSelectedType(value)}
            value={selectedType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="WORK">Work</SelectItem>
              <SelectItem value="REMINDER">Reminder</SelectItem>
              <SelectItem value="TASK">Task</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            • Personal: Private thoughts and ideas
            <br />• Work: Job or project-related notes
            <br />• Reminder: Time-sensitive or to-do items
            <br />• Task: Actionable items you plan to complete
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!selectedType}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogUpdateType;
