// components/NotesContainer.tsx
import React from 'react';
import { TagIcon, Trash2Icon, RecycleIcon, EditIcon } from 'lucide-react';

import NoteCard from './NoteCard';
import DialogConfirmation from './DialogConfirmation';
import DialogSelectedNote from './DialogSelectedNote';
import DialogUpdateType from './DialogUpdateType';

import { Note, NoteType } from '@/utils/types/note';
import useNotes from '@/hooks/useNotes';
import useDragAndDrop from '@/hooks/useDragAndDrop';

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
  const {
    selectedNote,
    setSelectedNote,
    selectedDeleteNote,
    setSelectedDeleteNote,
    selectedTypeNote,
    setSelectedTypeNote,
    isDeleting,
    setIsDeleting,
    handleSaveEditNote,
    handleDialogClose,
    handleDeletePermanently,
    handleChangeBanner,
    handleUpdateNoteType,
    handleUpdateNoteLabel,
  } = useNotes(fetchNotes, notes);

  const { handleDragStart, handleDragOver, handleDrop } = useDragAndDrop(
    notes,
    setNotes,
  );

  const navItems = [
    {
      label: 'Edit',
      icon: <EditIcon size={15} className="text-white-500" />,
      onClick: (noteId: string | undefined, notes: Note[]) => {
        setSelectedNote(notes.find((note) => note._id === noteId) || null);
      },
    },
    {
      label: 'Delete',
      icon: <Trash2Icon size={15} className="text-white-500" />,
      onClick: (noteId: string | undefined, notes: Note[]) => {
        setIsDeleting(true);
        setSelectedDeleteNote(
          notes.find((note) => note._id === noteId) || null,
        );
      },
    },
    {
      label: 'Recycle',
      icon: <RecycleIcon size={15} className="text-white-500" />,
      onClick: (noteId: string | undefined) => {
        handleUpdateNoteType(noteId, NoteType.TRASH);
      },
    },
    {
      label: 'Label',
      icon: <TagIcon size={15} className="text-white-500" />,
      onClick: (noteId: string | undefined, notes: Note[]) => {
        setSelectedTypeNote(notes.find((note) => note._id === noteId) || null);
      },
    },
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-full columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {notes.map((note, index) => (
          <NoteCard
            key={note._id}
            note={note}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(index);
            }}
            onDrop={handleDrop}
            notes={notes}
            setNotes={setNotes}
            isTrash={!!isTrash}
            isArchive={isArchive}
            onEditNote={setSelectedNote}
            onUpdateNoteType={handleUpdateNoteType}
            onDeleteClick={(noteId: string | undefined) => {
              setIsDeleting(true);
              setSelectedDeleteNote(
                notes.find((note) => note._id === noteId) || null,
              );
            }}
            onChangeBanner={handleChangeBanner}
            navItems={navItems}
          />
        ))}
      </div>
      {isDeleting && (
        <DialogConfirmation
          onClose={handleDialogClose}
          note={selectedDeleteNote}
          onDelete={handleDeletePermanently}
        />
      )}
      {selectedNote && (
        <DialogSelectedNote
          onSave={handleSaveEditNote}
          note={selectedNote}
          onClose={handleDialogClose}
        />
      )}
      {selectedTypeNote && (
        <DialogUpdateType
          note={selectedTypeNote}
          onClose={() => setSelectedTypeNote(null)}
          onUpdate={handleUpdateNoteLabel}
        />
      )}
    </div>
  );
};

export default NotesContainer;
