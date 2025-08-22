// hooks/useNotes.ts
import { useState } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { Note, NoteType, LabelType } from '@/utils/types/note';

const useNotes = (fetchNotes: () => Promise<void>, notes: Note[]) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDeleteNote, setSelectedDeleteNote] = useState<Note | null>(
    null,
  );
  const [selectedTypeNote, setSelectedTypeNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        entityType: note.entityType || '',
        noteType: note?.noteType || NoteType.NOTE,
        type: note?.type || LabelType.PERSONAL,
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }
    setIsDeleting(false);
  };

  const handleChangeBanner = async (
    noteId: string | undefined,
    banner: string,
  ) => {
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }
  };

  const handleUpdateNoteType = async (
    noteId: string | undefined,
    type: string,
  ) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      showError('Note not found.');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        noteType: type,
      });

      if (response?.status == 200) {
        showSuccess(`Note moved to ${type.toLowerCase()}`);
      }
      await fetchNotes();
    } catch (error) {
      showError(`Failed to update the note label.`);
    }
  };

  const handleUpdateNoteLabel = async (
    noteId: string | undefined,
    type: string,
  ) => {
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
    }
  };

  return {
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
  };
};

export default useNotes;
