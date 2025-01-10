'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
  notesMenu,
} from '@/config/menuItems/business/dashboardMenuItems';
import NotesHeader from '@/components/business/market/NotesHeader';
import NotesRender from '@/components/shared/NotesRender';
import { axiosInstance } from '@/lib/axiosinstance'; // Adjust the import as per your project structure
import { LabelType, Note, NoteType } from '@/utils/types/note';
import { toast } from '@/components/ui/use-toast';
import useFetchNotes from '@/hooks/useFetchNotes';

const Notes = () => {
  // Get userId from Redux
  const user = useSelector((state: any) => state.user);
  const userId = user.uid;
  const { notes, isLoading, fetchNotes, setNotes } = useFetchNotes(userId);

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
      noteType: NoteType.NOTE,
      type: LabelType.PERSONAL,
      entityType: user?.type?.toUpperCase(),
    } as Note;

    try {
      const response = await axiosInstance.post('/notes', newNote);
      if (response?.data) {
        const updatedNotes = [response.data, ...notes];
        setNotes(updatedNotes);
        toast({
          title: 'Note Created',
          description: 'Your note was successfully created.',
          duration: 5000,
        });

        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      toast({
        title: 'Failed to create note',
        duration: 5000,
      });
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
        <NotesHeader
          isTrash={false}
          setNotes={setNotes}
          notes={notes}
          onNoteCreate={handleCreateNote}
        />
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-[40vh]">
              <Loader2 className="my-4 h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div>
              {notes?.length > 0 ? (
                <NotesRender
                  fetchNotes={fetchNotes}
                  notes={notes}
                  setNotes={setNotes}
                  isArchive={false}
                />
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
