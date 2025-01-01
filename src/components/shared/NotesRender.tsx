import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArchiveRestoreIcon, RotateCwIcon, Trash2Icon } from 'lucide-react';

import { Badge } from '../ui/badge';

import BannerChangerPopover from './BannerChangerPopUp';
import DropdownNavNotes from './DropdownNavNotes';
import DialogSelectedNote from './DialogSelectedNote';
import DialogConfirmation from './DialogConfirmation';
import DialogUpdateType from './DialogUpdateType';

import { badgeColors, Note } from '@/utils/types/note';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { truncateHTMLContent, truncateText } from '@/utils/notes/notesHelpers';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

interface NotesRenderProps {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  isArchive: boolean;
  isTrash?: boolean;
  fetchNotes: () => Promise<void>;
}

const NotesRender = ({
  notes,
  setNotes,
  isArchive,
  isTrash,
  fetchNotes,
}: NotesRenderProps) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingOverIndex, setDraggingOverIndex] = useState<number | null>(
    null,
  );
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDeleteNote, setSelectedDeleteNote] = useState<Note | null>(
    null,
  );
  const [selectedTypeNote, setSelectedTypeNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useSelector((state: any) => state.user);

  const showError = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
      duration: 5000,
    });
  };

  const showSuccess = (message: string) => {
    toast({
      description: message,
      duration: 5000,
    });
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleSaveEditNote = async (note: Note) => {
    if (!note._id) {
      showError('Missing required fields for updating the note.');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${note._id}`, {
        title: note.title,
        content: note.content,
        bgColor: note.bgColor || '#FFFFFF',
        banner: note.banner || '',
        isHTML: note.isHTML || false,
        entityID: note.entityID || '',
        entityType: user?.type || '',
        noteType: note.noteType || 'note',
        type: note?.type || 'personal',
      });

      if (response?.status === 200) {
        showSuccess('Note updated successfully.');
      }
    } catch (error) {
      showError('Failed to update the note.');
    } finally {
      await fetchNotes(); // Refresh notes
      setSelectedNote(null); // Clear selection
    }
  };

  const handleDialogClose = () => {
    setSelectedNote(null);
    setIsDeleting(false);
  };

  const handelDeletClick = (noteId: string) => {
    setIsDeleting(true);
    setSelectedDeleteNote(notes.find((note) => note._id === noteId) || null);
  };

  const navItems = [
    {
      label: 'Delete permanently',
      onClick: (
        noteId: string,
        notes: Note[],
        setNotes: (notes: Note[]) => void,
      ) => {
        handelDeletClick(noteId);
      },
    },
    {
      label: 'Move To Trash',
      onClick: (
        noteId: string,
        notes: Note[],
        setNotes: (notes: Note[]) => void,
      ) => {
        handleNoteUpdate(noteId, 'trash');
      },
    },
    {
      label: 'Add Label',
      onClick: (noteId: string) => {
        setSelectedTypeNote(notes.find((note) => note._id === noteId) || null);
      },
    },
  ];

  // this is used for handel start drag event
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  // this is used for handel drag over event
  const handleDragOver = (index: number) => {
    if (draggingIndex !== index) {
      setDraggingOverIndex(index);
    }
  };

  // this is used for handel drop event
  const handleDrop = () => {
    if (
      draggingIndex !== null &&
      draggingOverIndex !== null &&
      draggingIndex !== draggingOverIndex
    ) {
      const updatedNotesRender = [...notes];
      const draggedNote = updatedNotesRender[draggingIndex];
      const targetNote = updatedNotesRender[draggingOverIndex];

      updatedNotesRender[draggingIndex] = targetNote;
      updatedNotesRender[draggingOverIndex] = draggedNote;

      setNotes(updatedNotesRender);
    }
    setDraggingIndex(null);
    setDraggingOverIndex(null);
  };

  // this is used to update the note data
  const handleNoteUpdate = async (noteId: string, noteType: string) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      showError('Note not found.');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        noteType,
      });

      if (response?.status == 200) {
        showSuccess(`Note moved to ${noteType}.`);
      }
      await fetchNotes();
    } catch (error) {
      showError(`Failed to update the note to ${noteType}.`);
      console.log(error);
    }
  };

  // this is used to Delte the note
  const handleDeletePermanently = async (noteId: string | null) => {
    if (!noteId) {
      showError('Invalid note ID.');
      return;
    }
    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      showSuccess('Note deleted permanently.');
      fetchNotes();
    } catch (error) {
      showError('Failed to delete the note.');
    }
    setIsDeleting(false);
  };

  // this is used to update the note Banner
  const handleChangeBanner = async (noteId: string, banner: string) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      showError('Note not found.');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        banner,
      });

      if (response?.status == 200) {
        showSuccess(`Note Banner updated`);
      }
      await fetchNotes();
    } catch (error) {
      showError(`Failed to update the note banner.`);
      console.log(error);
    }
  };

  // this is used to update the note label (type)
  const handleUpdateNoteType = async (noteId: string, type: string) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      showError('Note not found.');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        type,
      });

      if (response?.status == 200) {
        showSuccess(`Note Label updated`);
      }
      await fetchNotes();
    } catch (error) {
      showError(`Failed to update the note label.`);
      console.log(error);
    }
  };

  const handleNavClick = (
    action: (
      noteId: string,
      notes: Note[],
      setNotes: (notes: Note[]) => void,
    ) => void,
    noteId: string,
  ) => {
    action(noteId, notes, setNotes);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="columns-1 mt-3 sm:columns-2 md:columns-3 lg:columns-5 gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            draggable
            onDragStart={() => handleDragStart(notes.indexOf(note))}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(notes.indexOf(note));
            }}
            onDrop={handleDrop}
            className="relative group"
          >
            <Card
              className="break-inside-avoid cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group w-[80vw] mb-3 md:w-[200px] relative"
              style={
                note.banner
                  ? {
                      backgroundImage: `url(${note.banner})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: note.bgColor || '#ffffff' }
              }
            >
              <div onClick={() => handleEditNote(note)}>
                <CardHeader>
                  {note.type && (
                    <div className="absolute top-1 left-1">
                      <Badge
                        className={`text-xs py-0.5 ${badgeColors[note.type] || ' '}`}
                      >
                        {note.type}
                      </Badge>
                    </div>
                  )}
                  {note.title && (
                    <CardTitle className="font-semibold text-lg text-black mt-6">
                      {note.title}
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent className="max-h-[320px] overflow-hidden">
                  <CardDescription className="text-sm whitespace-pre-wrap truncate break-words">
                    {note.isHTML ? (
                      <div
                        className="text-sm whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{
                          __html: truncateHTMLContent(note.content, 30),
                        }}
                      />
                    ) : (
                      <CardDescription className="text-sm font-bold truncate bg-opacity-100 whitespace-pre-wrap break-words text-black">
                        {truncateText(note.content, 30)}
                      </CardDescription>
                    )}
                  </CardDescription>
                </CardContent>
              </div>

              <div className="relative">
                <div className="absolute bottom-2 right-2 hidden group-hover:flex items-center gap-4 justify-center">
                  {isTrash ? (
                    <>
                      <RotateCwIcon
                        size={15}
                        className="text-black cursor-pointer"
                        onClick={() => handleNoteUpdate(note._id, 'note')}
                      />
                      <Trash2Icon
                        size={15}
                        className="text-black cursor-pointer"
                        onClick={() => handelDeletClick(note._id)}
                      />
                    </>
                  ) : !isArchive ? (
                    <ArchiveRestoreIcon
                      size={15}
                      className="text-black"
                      onClick={() => handleNoteUpdate(note._id, 'archive')}
                    />
                  ) : (
                    <ArchiveRestoreIcon
                      size={15}
                      className="text-black"
                      onClick={() => handleNoteUpdate(note._id, 'note')}
                    />
                  )}
                  <BannerChangerPopover
                    handleChangeBanner={(banner) =>
                      handleChangeBanner(note._id, banner)
                    }
                  />
                  {!isTrash && (
                    <DropdownNavNotes
                      noteId={note._id}
                      navItems={navItems.map((item) => ({
                        ...item,
                        onClick: () => handleNavClick(item.onClick, note._id),
                      }))}
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
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
          onUpdate={handleUpdateNoteType}
        />
      )}
    </div>
  );
};

export default NotesRender;
