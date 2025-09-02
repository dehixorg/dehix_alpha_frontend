'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      setError('Title or content cannot be empty.');
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
        className="sm:max-w-[500px] p-0 rounded-lg shadow-xl dark:bg-gray-800 bg-white no-close-button"
        style={{
          backgroundColor: note.bgColor || undefined,
          backgroundImage: note.banner ? `url(${note.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: note.banner ? 'white' : '#000',
        }}
      >
        {/* Semi-transparent overlay for better text visibility */}
        {note.banner && (
          <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
        )}

        <div className="p-4 flex flex-col gap-2 relative z-10">
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

          {isEditMode ? (
            <div className="w-full">
              <input // Using native input element
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <textarea // Using native textarea element
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Take a note..."
                className="w-full min-h-[100px] resize-none bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          ) : (
            <div className="w-full">
              <div className="text-lg font-semibold mb-1">{note.title}</div>
              <div className="text-sm">{note.content}</div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-2 border-t border-gray-200 dark:border-gray-700 relative z-10">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {note.createdAt && `Edited ${new Date(note.createdAt).toLocaleString()}`}
          </div>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button onClick={onClose} variant="ghost" className="text-sm">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="ghost" className="text-sm">
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose} variant="ghost" className="text-sm">
                  Close
                </Button>
                <Button onClick={() => setIsEditMode(true)} variant="ghost" className="text-sm">
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSelectedNote;