import React, { useState } from 'react';
import Image from 'next/image';

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
  const [entityID] = useState(note.entityID || '');
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setError('');
    const updatedNote = { ...note, title, content };
    onSave(updatedNote);
    setIsEditMode(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px] p-6 rounded-lg shadow-lg text-black"
        style={{ backgroundColor:  `${note.bgColor}B3` || '#ffffff' }}
      >
        {/* banner as background */}
        {note.banner && (
          <div className="absolute inset-0 z-0">
            <Image
              src={note.banner}
              alt="Note Banner"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        )}

        <DialogHeader className="border-b pb-4 relative z-10">
          <DialogTitle className="text-2xl font-semibold">
            {isEditMode ? 'Edit Note' : 'Note Details'}
          </DialogTitle>
        </DialogHeader>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        {isEditMode ? (
          <div className="mt-6 relative z-10">
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
                className="mt-2 p-2 border bg-opacity-50 bg-white rounded-md w-full text-sm text-opacity-100"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-semibold">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content"
                className="mt-2 p-2 bg-opacity-50 bg-white border  no-scrollbar rounded-md w-full text-sm text-opacity-100  resize-none"
                rows={5}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="entityID" className="block text-sm font-semibold">
                Entity ID
              </label>
              <Input
                id="entityID"
                type="text"
                disabled={true}
                value={entityID}
                placeholder="Entity ID"
                className="mt-2 p-2 border bg-opacity-50 bg-white rounded-md w-full text-sm text-opacity-100"
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 relative z-10 w-full max-w-2xl">
            <div className="mb-4">
              <p className="text-sm font-bold">Title:</p>
              <p className="text-black-300 mt-1">{note.title}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold">Content:</p>
              <div
                className={`text-black-300 mt-1 no-scrollbar p-2 ${note.content.length > 300 ? 'max-h-52 overflow-y-auto' : ''
                  }`}
              >
                {note.content}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold">Entity ID:</p>
              <p className="text-black-300 mt-1">{entityID}</p>
            </div>
          </div>

        )}

        <DialogFooter className="mt-6 relative z-10 text-white">
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditMode(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} className="mr-2 text-black dark:text-white">
                Close
              </Button>
              <Button onClick={() => setIsEditMode(true)}>Edit</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSelectedNote;
