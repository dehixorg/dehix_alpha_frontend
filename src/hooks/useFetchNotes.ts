import { useCallback, useState } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import { Note } from '@/utils/types/note';
import { notifyError } from '@/utils/toastMessage';

// this is hook to fetch notes from the server
const useFetchNotes = (userId: string | undefined) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archive, setArchive] = useState<Note[]>([]);
  const [trash, setTrash] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/notes', {
        params: { userId },
      });
      if (response?.data?.data) {
        setNotes(response.data.data.notes);
        setArchive(response.data.data.archive || []);
        setTrash(response.data.data.trash || []);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      notifyError('Something went wrong. Please try again.', 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    notes,
    archive,
    isLoading,
    fetchNotes,
    setNotes,
    setArchive,
    trash,
    setTrash,
  };
};

export default useFetchNotes;
