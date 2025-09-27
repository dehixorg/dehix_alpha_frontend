// hooks/useNotes.ts
import { useState } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Note, NoteType, LabelType } from '@/utils/types/note';

const useNotes = (fetchNotes: () => Promise<void>, notes: Note[]) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDeleteNote, setSelectedDeleteNote] = useState<Note | null>(
    null,
  );
  const [selectedTypeNote, setSelectedTypeNote] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveEditNote = async (note: Note) => {
    if (!note._id) {
      notifyError('Missing required fields for updating the note.', 'Error');
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
        noteType: note?.noteType || NoteType.NOTE,
        type: note?.type || LabelType.PERSONAL,
      });

      if (response?.status === 200) {
        notifySuccess('Note updated successfully.', 'Success');
        await fetchNotes();
        setSelectedNote(null);
      }
    } catch (error: any) {
      notifyError(
        error?.response?.data?.message || 'Failed to update the note.',
        'Error',
      );
    }
  };

  const handleDialogClose = () => {
    setSelectedNote(null);
    setSelectedDeleteNote(null);
    setSelectedTypeNote(null);
    setIsDeleting(false);
  };

  const handleDeletePermanently = async (noteId: string | null) => {
    if (!noteId) {
      notifyError('Invalid note ID.', 'Error');
      return;
    }
    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      notifySuccess('Note deleted permanently.', 'Success');
      await fetchNotes();
    } catch (error) {
      notifyError('Failed to delete the note.', 'Error');
    }
    setIsDeleting(false);
  };

  const handleChangeBanner = async (
    noteId: string | undefined,
    banner: string,
  ) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      notifyError('Note not found.', 'Error');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        banner,
      });

      if (response?.status == 200) {
        notifySuccess('Note banner updated.', 'Success');
      }
      await fetchNotes();
    } catch (error) {
      notifyError('Failed to update the note banner.', 'Error');
    }
  };

  const handleUpdateNoteType = async (
    noteId: string | undefined,
    type: string,
  ) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      notifyError('Note not found.', 'Error');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        noteType: type,
      });

      if (response?.status == 200) {
        notifySuccess(`Note moved to ${type.toLowerCase()}.`, 'Success');
      }
      await fetchNotes();
    } catch (error) {
      notifyError('Failed to update the note label.', 'Error');
    }
  };

  const handleUpdateNoteLabel = async (
    noteId: string | undefined,
    type: string,
  ) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      notifyError('Note not found.', 'Error');
      return;
    }
    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        type,
      });

      if (response?.status == 200) {
        notifySuccess('Note label updated.', 'Success');
      }
      await fetchNotes();
    } catch (error) {
      notifyError('Failed to update the note label.', 'Error');
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
