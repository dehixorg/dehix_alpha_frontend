import { useState, useCallback } from 'react';

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

  const handleSaveEditNote = useCallback(
    async (note: Note) => {
      if (!note._id) {
        notifyError('Missing required fields for updating the note.', 'Error');
        return;
      }

      // Find original note for selective rollback
      const originalNote = notes.find((n) => n._id === note._id);

      // Optimistic update
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
          type: note?.type,
        });

        if (response?.status === 200) {
          notifySuccess('Note updated successfully.', 'Success');
          setSelectedNote(null);
        } else if (setNotes && originalNote) {
          // Selective rollback
          setNotes((prev) =>
            prev.map((n) => (n._id === note._id ? originalNote : n)),
          );
        }
      } catch (error: any) {
        // Selective rollback on error
        if (setNotes && originalNote) {
          setNotes((prev) =>
            prev.map((n) => (n._id === note._id ? originalNote : n)),
          );
        }
        notifyError(
          error?.response?.data?.message || 'Failed to update the note.',
          'Error',
        );
      }
    },
    [notes, setNotes],
  );

  const handleDialogClose = useCallback(() => {
    // Reset all related states when closing the dialog
    setSelectedNote(null);
    setSelectedDeleteNote(null);
    setSelectedTypeNote(null);
    setIsDeleting(false);
  }, []);

  const handleDeletePermanently = useCallback(
    async (noteId: string | null) => {
      if (!noteId) {
        notifyError('Invalid note ID.', 'Error');
        setIsDeleting(false);
        return;
      }

      // Capture original note and its index to restore order if delete fails
      const originalIndex = notes.findIndex((n) => n._id === noteId);
      const originalNote =
        originalIndex >= 0 ? notes[originalIndex] : undefined;

      // Optimistic removal
      if (setNotes) {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }

      try {
        await axiosInstance.delete(`/notes/${noteId}`);
        notifySuccess('Note deleted permanently.', 'Success');
      } catch (error) {
        // Restore note to its original position on failure
        if (setNotes && originalNote && originalIndex >= 0) {
          setNotes((prev) => {
            const next = [...prev];
            next.splice(Math.min(originalIndex, next.length), 0, originalNote);
            return next;
          });
        }
        notifyError('Failed to delete the note.', 'Error');
      }
      setIsDeleting(false);
    },
    [notes, setNotes],
  );

  const handleChangeBanner = useCallback(
    async (noteId: string | undefined, banner: string) => {
      const noteToUpdate = notes.find((note) => note._id === noteId);

      if (!noteToUpdate) {
        notifyError('Note not found.', 'Error');
        return;
      }

      // Optimistic update
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

        if (response?.status === 200) {
          notifySuccess('Note banner updated.', 'Success');
        } else if (setNotes) {
          // Revert banner
          setNotes((prev) =>
            prev.map((n) =>
              n._id === noteId ? { ...n, banner: noteToUpdate.banner } : n,
            ),
          );
        }
      } catch (error) {
        if (setNotes) {
          setNotes((prev) =>
            prev.map((n) =>
              n._id === noteId ? { ...n, banner: noteToUpdate.banner } : n,
            ),
          );
        }
        notifyError('Failed to update the note banner.', 'Error');
      }
    },
    [notes, setNotes],
  );

  const handleUpdateNoteType = useCallback(
    async (noteId: string | undefined, type: NoteType) => {
      const noteToUpdate = notes.find((note) => note._id === noteId);

      if (!noteToUpdate) {
        notifyError('Note not found.', 'Error');
        return;
      }

      // Capture index to restore order if move fails
      const originalIndex = notes.findIndex((n) => n._id === noteId);

      // Optimistic removal from current list
      if (setNotes) {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }

      try {
        const response = await axiosInstance.put(`/notes/${noteToUpdate._id}`, {
          ...noteToUpdate,
          noteType: type,
        });

        if (response?.status === 200) {
          notifySuccess(`Note moved to ${type.toLowerCase()}.`, 'Success');
        } else if (setNotes && originalIndex >= 0) {
          // Restore to exact original position if failed
          setNotes((prev) => {
            const next = [...prev];
            next.splice(Math.min(originalIndex, next.length), 0, noteToUpdate);
            return next;
          });
        }
      } catch (error) {
        if (setNotes && originalIndex >= 0) {
          setNotes((prev) => {
            const next = [...prev];
            next.splice(Math.min(originalIndex, next.length), 0, noteToUpdate);
            return next;
          });
        }
        notifyError(`Failed to move the note to ${type.toLowerCase()}.`, 'Error');
      }
    },
    [notes, setNotes],
  );

  const handleUpdateNoteLabel = useCallback(
    async (noteId: string | undefined, type: LabelType | undefined) => {
      const noteToUpdate = notes.find((note) => note._id === noteId);

      if (!noteToUpdate) {
        notifyError('Note not found.', 'Error');
        return;
      }

      // Optimistic label update
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

        if (response?.status === 200) {
          notifySuccess('Note label updated.', 'Success');
        } else if (setNotes) {
          // Revert label
          setNotes((prev) =>
            prev.map((n) =>
              n._id === noteId ? { ...n, type: noteToUpdate.type } : n,
            ),
          );
        }
      } catch (error) {
        if (setNotes) {
          setNotes((prev) =>
            prev.map((n) =>
              n._id === noteId ? { ...n, type: noteToUpdate.type } : n,
            ),
          );
        }
        notifyError('Failed to update the note label.', 'Error');
      }
    },
    [notes, setNotes],
  );

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
