// hooks/useDragAndDrop.ts
import { useState } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import { Note } from '@/utils/types/note';
import { toast } from '@/components/ui/use-toast';

const useDragAndDrop = (notes: Note[], setNotes: (notes: Note[]) => void) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingOverIndex, setDraggingOverIndex] = useState<number | null>(
    null,
  );

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggingIndex !== index) {
      setDraggingOverIndex(index);
    }
  };

  const handleDrop = async () => {
    if (
      draggingIndex !== null &&
      draggingOverIndex !== null &&
      draggingIndex !== draggingOverIndex
    ) {
      // Update the local notes order
      const updatedNotesRender = [...notes];
      const draggedNote = updatedNotesRender[draggingIndex];
      const targetNote = updatedNotesRender[draggingOverIndex];

      updatedNotesRender[draggingIndex] = targetNote;
      updatedNotesRender[draggingOverIndex] = draggedNote;

      setNotes(updatedNotesRender);

      // Prepare data for API request
      const updatedNoteOrder = updatedNotesRender.map((note) => note._id);
      const userId = updatedNotesRender[0]?.userId;

      if (userId) {
        try {
          const response = await axiosInstance.patch(
            '/notes/update-noteorder',
            {
              userId,
              noteOrder: updatedNoteOrder,
            },
          );

          if (response.status != 200) {
            console.error('Failed to update note order:', response.statusText);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Something went wrong.Please try again.',
            }); // Error toast
          }
        } catch (error: any) {
          console.error('Error updating note order:', error.message);

          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong.Please try again.',
          }); // Error toast
        }
      } else {
        console.error('User ID is missing. Cannot update note order.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      }
    }

    setDraggingIndex(null);
    setDraggingOverIndex(null);
  };

  return {
    draggingIndex,
    draggingOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
};

export default useDragAndDrop;
