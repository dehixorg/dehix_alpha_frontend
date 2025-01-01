'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { LabelType, Note, NoteType } from '@/utils/types/note';
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
  const user = useSelector((state: any) => state.user);
  const userId = user.uid;

  const { archive, isLoading, fetchNotes, setArchive } = useFetchNotes(userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId]);

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
      noteType:  NoteType.ARCHIVE,
      type: LabelType.PERSONAL,
      entityType: user?.type?.toUpperCase() || 'BUSINESS',
    } as Note;

    try {
      const response = await axiosInstance.post('/notes', newNote);
      const updatedNotes = [response.data, ...archive];

      setArchive(updatedNotes);
      toast({
        title: 'Note Created',
        description: 'Your note was successfully created.',
        duration: 5000,
      });

      fetchNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
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
          {isLoading ? (
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
