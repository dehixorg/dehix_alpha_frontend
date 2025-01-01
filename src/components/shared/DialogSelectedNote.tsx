import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/utils/types/note';

type DialogSelectedNoteProps = {
  note: Note;
  onClose: () => void;
  onSave: (updatedNote: Note) => void;
};

const DialogSelectedNote = ({
  note,
  onClose,
  onSave,
}: DialogSelectedNoteProps) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [entityID, setEntityID] = useState(note.entityID || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setError('');
    const updatedNote = { ...note, title, content, entityID };
    onSave(updatedNote);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-semibold">
            Edit Note
          </DialogTitle>
        </DialogHeader>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {/* Inputs for title, content, and entityID */}
        <div className="mt-6">
          {/* Title Input */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-semibold">
              Title
            </label>
            <Input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              className="mt-2 p-2 border rounded-md w-full text-sm"
            />
          </div>

          {/* Content Input */}
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-semibold">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content"
              className="mt-2 p-2 border rounded-md w-full text-sm"
              rows={5}
            />
          </div>

          {/* Entity ID Input */}
          <div className="mb-4">
            <label htmlFor="entityID" className="block text-sm font-semibold">
              Entity ID
            </label>
            <Input
              id="entityID"
              type="text"
              value={entityID}
              onChange={(e) => setEntityID(e.target.value)}
              placeholder="Enter related entity ID"
              className="mt-2 p-2 border rounded-md w-full text-sm"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSelectedNote;
