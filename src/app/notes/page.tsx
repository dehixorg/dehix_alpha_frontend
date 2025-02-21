'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
  notesMenu,
} from '@/config/menuItems/business/dashboardMenuItems';
import NotesHeader from '@/components/business/market/NotesHeader';
import NotesRender from '@/components/shared/NotesRender';
import { axiosInstance } from '@/lib/axiosinstance';
import { LabelType, Note, NoteType } from '@/utils/types/note';
import { toast } from '@/components/ui/use-toast';
import useFetchNotes from '@/hooks/useFetchNotes';
import Header from '@/components/header/header';

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
    if (!note.title || !note.content || !userId) {
      toast({
        title: 'Missing required fields',
        description: 'Title and content are required to create a note.',
        duration: 3000,
      });
      return;
    }

    const tempNote = {
      ...note,
      userId,
      bgColor: note.bgColor || '#FFFFFF',
      banner: note.banner || '',
      noteType: NoteType.NOTE,
      type: LabelType.PERSONAL,
      entityType: user?.type?.toUpperCase(),
    } as Note;

    // Optimistically update the UI
    setNotes((prev) => [tempNote, ...prev]);

    try {
      const response = await axiosInstance.post('/notes', tempNote);
      if (response?.data) {
        toast({
          title: 'Note Created',
          description: 'Your note was successfully created.',
          duration: 3000,
        });
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the note.',
        duration: 3000,
      });

      // Revert UI on error
      setNotes((prev) => prev.filter((n) => n !== tempNote));
    }
  };

  return (
    <section className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Notes"
      />

      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <div>
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu="Notes"
            breadcrumbItems={[{ label: 'Notes', link: '/notes' }]}
          />
        </div>
        {/* Main content area */}
        <div>
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
      </div>
    </section>
  );
};

export default Notes;
