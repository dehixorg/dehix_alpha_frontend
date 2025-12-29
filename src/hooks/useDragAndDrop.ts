// hooks/useDragAndDrop.ts
import type React from 'react';
import { useRef, useState } from 'react';

import { axiosInstance } from '@/lib/axiosinstance';
import { Note } from '@/utils/types/note';
import { notifyError } from '@/utils/toastMessage';

const useDragAndDrop = (notes: Note[], setNotes: (notes: Note[]) => void) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingOverIndex, setDraggingOverIndex] = useState<number | null>(
    null,
  );
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);

  const clampDropIndex = (index: number) => {
    if (index < 0) return 0;
    if (index > notes.length) return notes.length;
    return index;
  };

  const persistOrder = async (updatedNotesRender: Note[]) => {
    const updatedNoteOrder = updatedNotesRender.map((note) => note._id);
    const userId = updatedNotesRender[0]?.userId;

    if (!userId) {
      console.error('User ID is missing. Cannot update note order.');
      notifyError('Something went wrong. Please try again.', 'Error');
      return;
    }

    try {
      const response = await axiosInstance.patch('/notes/update-noteorder', {
        userId,
        noteOrder: updatedNoteOrder,
      });

      if (response.status != 200) {
        console.error('Failed to update note order:', response.statusText);
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    } catch (error: any) {
      console.error('Error updating note order:', error.message);
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  };

  const moveNote = (from: number, to: number) => {
    const safeFrom = Math.max(0, Math.min(from, notes.length - 1));
    const safeTo = clampDropIndex(to);
    if (safeFrom === safeTo || safeFrom + 1 === safeTo) return notes;

    const updated = [...notes];
    const [item] = updated.splice(safeFrom, 1);
    const insertionIndex = safeFrom < safeTo ? safeTo - 1 : safeTo;
    updated.splice(insertionIndex, 0, item);
    return updated;
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggingIndex !== index) {
      setDraggingOverIndex(index);
    }
  };

  const handleDrop = async () => {
    if (draggingIndex !== null && draggingOverIndex !== null) {
      const updatedNotesRender = moveNote(draggingIndex, draggingOverIndex);
      if (updatedNotesRender !== notes) {
        setNotes(updatedNotesRender);
        await persistOrder(updatedNotesRender);
      }
    }
    setDraggingIndex(null);
    setDraggingOverIndex(null);
  };

  const handleTouchStart = (index: number) => {
    setIsTouchDragging(false);
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      setDraggingIndex(index);
      setDraggingOverIndex(index);
      setIsTouchDragging(true);
    }, 250);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDragging || draggingIndex === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = el?.closest?.('[data-note-index]') as HTMLElement | null;
    if (!item) return;
    const idxStr = item.getAttribute('data-note-index');
    if (!idxStr) return;
    const idx = Number(idxStr);
    if (!Number.isNaN(idx) && idx !== draggingOverIndex) {
      setDraggingOverIndex(idx);
    }
  };

  const handleTouchEnd = async () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isTouchDragging) {
      await handleDrop();
    } else {
      setDraggingIndex(null);
      setDraggingOverIndex(null);
    }

    setIsTouchDragging(false);
  };

  return {
    draggingIndex,
    draggingOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isTouchDragging,
  };
};

export default useDragAndDrop;
