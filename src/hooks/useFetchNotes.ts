import { useCallback, useState } from 'react';
import { axiosInstance } from '@/lib/axiosinstance';
import { Note } from '@/utils/types/note';


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
            const response = await axiosInstance.get('/notes/get-notes', {
                params: { userId },
            });
            if (response?.data?.notes) {
                setNotes(response.data.notes.notes);
                setArchive(response.data.notes.archive || []);
                setTrash(response.data.notes.trash || []);

            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    return { notes, archive, isLoading, fetchNotes, setNotes, setArchive, trash, setTrash };
};

export default useFetchNotes;
