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

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isTouchDragging,
  } = useDragAndDrop(notes, setNotes);

  const navItems = [
    {
      label: 'Edit',
      icon: <EditIcon size={15} className="text-muted-foreground" />,
      onClick: (noteId: string | undefined, notes: Note[]) => {
        setSelectedNote(notes.find((note) => note._id === noteId) || null);
      },
    },
    {
      label: 'Delete',
      icon: <Trash2Icon size={15} className="text-muted-foreground" />,
      onClick: (noteId: string | undefined, notes: Note[]) => {
        setIsDeleting(true);
        setSelectedDeleteNote(
          notes.find((note) => note._id === noteId) || null,
        );
      },
    },
    {
      label: 'Recycle',
      icon: <RecycleIcon size={15} className="text-muted-foreground" />,
      onClick: (noteId: string | undefined) => {
        handleUpdateNoteType(noteId, NoteType.TRASH);
      },
    },
    {
      label: 'Label',
      icon: <TagIcon size={15} className="text-muted-foreground" />,
      onClick: (noteId: string | undefined, notes: Note[]) => {
        setSelectedTypeNote(notes.find((note) => note._id === noteId) || null);
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Drop zone for moving to first */}
        <div
          className="col-span-full h-2"
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(0);
          }}
          onDrop={handleDrop}
        />

        {notes.map((note, index) => (
          <div
            key={note._id}
            data-note-index={index}
            onTouchStart={() => handleTouchStart(index)}
            onTouchMove={(e) => {
              if (!isTouchDragging) return;
              e.preventDefault();
              handleTouchMove(e);
            }}
            onTouchEnd={handleTouchEnd}
            className="touch-none"
          >
            <NoteCard
              note={note}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index + 1);
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
          </div>
        ))}

        {/* Drop zone for moving to last */}
        <div
          className="col-span-full h-2"
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(notes.length);
          }}
          onDrop={handleDrop}
        />
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
          onArchive={(noteId, toType) => handleUpdateNoteType(noteId, toType)}
          onDelete={(noteId) => {
            handleDialogClose();
            const noteToDelete = notes.find((n) => n._id === noteId);
            if (noteToDelete) {
              setSelectedDeleteNote(noteToDelete);
              setIsDeleting(true);
            }
          }}
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
