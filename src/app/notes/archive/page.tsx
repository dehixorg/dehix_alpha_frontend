'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Note } from '@/utils/types/note';
import NotesRender from '@/components/shared/NotesRender';
import NotesHeader from '@/components/business/market/NotesHeader';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
  notesMenu,
} from '@/config/menuItems/business/dashboardMenuItems';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import useFetchNotes from '@/hooks/useFetchNotes';
import { toast } from '@/components/ui/use-toast';

const Page = () => {
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const userId: string | undefined = useSelector(
    (state: any) => state.user?.uid,
  );

  const { archive, isLoading, fetchNotes, setArchive } = useFetchNotes(userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId, fetchNotes]); // Fixed the missing dependency warning

  const handleCreateNote = async (note: Partial<Note>) => {
    if (!note.title || !note.content || !userId) {
      console.error('Missing required fields.');
      return;
    }

    const newNote = {
      ...note,
      userId,
      bgColor: note.bgColor || '#FFFFFF',
      banner: note.banner || '',
      noteType: note.noteType || 'archive',
    } as Note;

    setIsCreating(true);
    try {
      const response = await axiosInstance.post('/notes/create', newNote);
      const updatedNotes = [response.data, ...archive];
      console.log(updatedNotes);

      setArchive(updatedNotes);
      toast({
        title: 'Note Created',
        description: 'Your note was successfully created.',
      });

      fetchNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
      fetchNotes();
    }
  };

  return (
    <section className="p-3 relative sm:pl-6">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Archive"
      />
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Archive"
      />

      {/* Main content area */}
      <div className="ml-12">
        <NotesHeader
          isTrash={false}
          setNotes={setArchive}
          notes={archive}
          onNoteCreate={handleCreateNote}
        />
        <div className="p-6">
          {isLoading || isCreating ? ( // Added isCreating for loading indicator
            <div className="flex justify-center items-center h-[40vh] w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : archive?.length > 0 ? (
            <NotesRender
              notes={archive}
              setNotes={setArchive}
              isArchive={true}
              fetchNotes={fetchNotes}
            />
          ) : (
            <div className="flex justify-center items-center h-[40vh]">
              <p>No archive available. Start adding some!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Page;
