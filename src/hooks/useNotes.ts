// hooks/useNotes.ts
import { useState } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Note, NoteType, LabelType } from '@/utils/types/note';

const useNotes = (
  fetchNotes: () => Promise<void>,
  notes: Note[],
  setNotes?: (notes: Note[] | ((prev: Note[]) => Note[])) => void,
) => {
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

    // Optimistic update
    const previousNotes = [...notes];
    if (setNotes) {
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? { ...n, ...note } : n)),
      );
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
        setSelectedNote(null);
      } else {
        // Rollback if status is not 200
        if (setNotes) setNotes(previousNotes);
      }
    } catch (error: any) {
      // Rollback on error
      if (setNotes) setNotes(previousNotes);
      notifyError(
        error?.response?.data?.message || 'Failed to update the note.',
        'Error',
      );
    }
  };

  const handleDialogClose = () => {
    // Reset all related states when closing the dialog
    setSelectedNote(null);
    setSelectedDeleteNote(null);
    setSelectedTypeNote(null);
    setIsDeleting(false);
  };

  const handleDeletePermanently = async (noteId: string | null) => {
    if (!noteId) {
      notifyError('Invalid note ID.', 'Error');
      setIsDeleting(false);
      return;
    }

    const previousNotes = [...notes];
    if (setNotes) {
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    }

    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      notifySuccess('Note deleted permanently.', 'Success');
    } catch (error) {
      if (setNotes) setNotes(previousNotes);
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

    const previousNotes = [...notes];
    if (setNotes) {
      setNotes((prev) =>
        prev.map((n) => (n._id === noteId ? { ...n, banner } : n)),
      );
    }

    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        banner,
      });

      if (response?.status == 200) {
        notifySuccess('Note banner updated.', 'Success');
      } else {
        if (setNotes) setNotes(previousNotes);
      }
    } catch (error) {
      if (setNotes) setNotes(previousNotes);
      notifyError('Failed to update the note banner.', 'Error');
    }
  };

  const handleUpdateNoteType = async (
    noteId: string | undefined,
    type: NoteType,
  ) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      notifyError('Note not found.', 'Error');
      return;
    }

    const previousNotes = [...notes];
    if (setNotes) {
      // When type changes, it moves out of the current list
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    }

    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        noteType: type,
      });

      if (response?.status == 200) {
        notifySuccess(`Note moved to ${type.toLowerCase()}.`, 'Success');
      } else {
        if (setNotes) setNotes(previousNotes);
      }
    } catch (error) {
      if (setNotes) setNotes(previousNotes);
      notifyError('Failed to update the note label.', 'Error');
    }
  };

  const handleUpdateNoteLabel = async (
    noteId: string | undefined,
    type: LabelType | undefined,
  ) => {
    const noteToUpdate = notes.find((note) => note._id === noteId);

    if (!noteToUpdate) {
      notifyError('Note not found.', 'Error');
      return;
    }

    const previousNotes = [...notes];
    if (setNotes) {
      setNotes((prev) =>
        prev.map((n) => (n._id === noteId ? { ...n, type } : n)),
      );
    }

    try {
      const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
        ...noteToUpdate,
        type,
      });

      if (response?.status == 200) {
        notifySuccess('Note label updated.', 'Success');
      } else {
        if (setNotes) setNotes(previousNotes);
      }
    } catch (error) {
      if (setNotes) setNotes(previousNotes);
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
