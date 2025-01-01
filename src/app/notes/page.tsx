'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { menuItemsBottom, menuItemsTop, notesMenu } from '@/config/menuItems/business/dashboardMenuItems';
import NotesHeader from '@/components/business/market/NotesHeader';
import NotesRender from '@/components/shared/NotesRender';
import { axiosInstance } from '@/lib/axiosinstance'; // Adjust the import as per your project structure
import { Note } from '@/utils/types/note';
import { toast } from '@/components/ui/use-toast';
import useFetchNotes from '@/hooks/useFetchNotes';

const Notes = () => {
  const [isCreating, setIsCreating] = useState(false);

  // Get userId from Redux
  const userId = useSelector((state: any) => state.user?.uid);

  const { notes, archive, isLoading, fetchNotes , setNotes } = useFetchNotes(userId);

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [fetchNotes, userId]); 

  const handleCreateNote = async (note: Partial<Note>) => {
    // Field validation
    if (!note.title || !note.content || !userId) {
      console.error('Missing required fields.');
      return;
    }

    const newNote = {
      ...note,
      userId,
      bgColor: note.bgColor || '#FFFFFF',
      banner: note.banner || '',
      noteType: note.noteType || 'note',
      type:'personal',
    } as Note;

    setIsCreating(true);
    try {
      const response = await axiosInstance.post('/notes/create', newNote);
      if (response?.data) {
        const updatedNotes = [response.data, ...notes];
        setNotes(updatedNotes);
        toast({
          title: 'Note Created',
          description: 'Your note was successfully created.',
        });
  
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="p-3 relative sm:pl-6">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Notes"
      />
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Notes"
      />
      {/* Main content area */}
      <div className="ml-12">
        <NotesHeader isTrash={false} setNotes={setNotes} notes={notes} onNoteCreate={handleCreateNote} />
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-[40vh] w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {notes?.length > 0 ? (
                <NotesRender fetchNotes={fetchNotes}  notes={notes} setNotes={setNotes} isArchive={false} />
              ) : (
                <div className="flex justify-center items-center h-[40vh] w-full">
                  <p>No notes available. Start adding some!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Notes;
