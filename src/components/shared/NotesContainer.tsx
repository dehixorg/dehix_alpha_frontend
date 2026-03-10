import React from 'react';

import { NoteCard } from './NoteCard';

import useDragAndDrop from '@/hooks/useDragAndDrop';
import useNotes from '@/hooks/useNotes';
import type { Note } from '@/utils/types/note';

interface NotesContainerProps {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  isArchive: boolean;
  isTrash?: boolean;
  fetchNotes: () => Promise<void>;
}

const NotesContainer = ({
  notes,
  setNotes,
  isArchive,
  isTrash,
  fetchNotes,
}: NotesContainerProps) => {
  const { handleSaveEditNote, handleDeletePermanently, handleUpdateNoteType } =
    useNotes(fetchNotes, notes);

  const { handleDragStart, handleDragOver, handleDrop } = useDragAndDrop(
    notes,
    setNotes,
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <div
          className="col-span-full h-2"
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(0);
          }}
          onDrop={handleDrop}
        />

        {notes.map((note, index) => (
          <div key={note._id} data-note-index={index} className="touch-none">
            <NoteCard
              key={note._id}
              note={note}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index + 1);
              }}
              onDrop={handleDrop}
              isTrash={!!isTrash}
              isArchive={isArchive}
              onEditNote={handleSaveEditNote}
              onUpdateNoteType={handleUpdateNoteType}
              onDeleteClick={(noteId: string | undefined) => {
                if (noteId) handleDeletePermanently(noteId);
              }}
            />
          </div>
        ))}

        <div
          className="col-span-full h-2"
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(notes.length);
          }}
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
};

export default NotesContainer;
