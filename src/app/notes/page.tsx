'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import { notesMenu } from '@/config/menuItems/business/dashboardMenuItems';
import NotesRender from '@/components/shared/NotesRender';
import { axiosInstance } from '@/lib/axiosinstance';
import { LabelType, Note, NoteType } from '@/utils/types/note';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import useFetchNotes from '@/hooks/useFetchNotes';
import Header from '@/components/header/header';
import { menuItemsBottom } from '@/config/menuItems/freelancer/dashboardMenuItems';
import NotesHeader from '@/components/business/market/NotesHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { CreateNoteDialog } from '@/components/shared/CreateNoteDialog';
import EmptyState from '@/components/shared/EmptyState';

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
      notifyError(
        'Title and content are required to create a note.',
        'Missing required fields',
      );
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
        notifySuccess('Your note was successfully created.', 'Note Created');
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      notifyError('Failed to create the note.', 'Error');

      // Revert UI on error
      setNotes((prev) => prev.filter((n) => n !== tempNote));
    }
  };

  return (
    <section className="flex min-h-screen w-full flex-col">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Notes"
      />

      <div className="flex flex-col gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={notesMenu}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Notes"
          breadcrumbItems={[{ label: 'Notes', link: '/notes' }]}
        />
        {/* Main content area */}
        <div className="px-4 mb-5">
          <Card className="overflow-hidden border">
            <NotesHeader
              isTrash={false}
              setNotes={setNotes}
              notes={notes}
              onNoteCreate={handleCreateNote}
              title="Notes"
              description="Organize your thoughts and ideas"
            />
            <div className="p-4 sm:p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-24 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : notes?.length > 0 ? (
                <NotesRender
                  fetchNotes={fetchNotes}
                  notes={notes}
                  setNotes={setNotes}
                  isArchive={false}
                />
              ) : (
                <EmptyState
                  icon={
                    <div className="mb-6 opacity-90">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 200 120"
                        className="w-56 h-32 mx-auto"
                        aria-hidden
                      >
                        <rect
                          x="10"
                          y="20"
                          width="180"
                          height="80"
                          rx="12"
                          className="fill-muted"
                        />
                        <rect
                          x="26"
                          y="36"
                          width="60"
                          height="10"
                          rx="5"
                          className="fill-muted-foreground/40"
                        />
                        <rect
                          x="26"
                          y="54"
                          width="120"
                          height="10"
                          rx="5"
                          className="fill-muted-foreground/30"
                        />
                        <rect
                          x="26"
                          y="72"
                          width="90"
                          height="10"
                          rx="5"
                          className="fill-muted-foreground/20"
                        />
                        <circle
                          cx="160"
                          cy="60"
                          r="10"
                          className="fill-primary/30"
                        />
                      </svg>
                    </div>
                  }
                  title="No notes yet"
                  description="Start capturing your thoughts. Create your first note to keep ideas, todos, and inspirations organized."
                  actions={<CreateNoteDialog onNoteCreate={handleCreateNote} />}
                  className="p-8 sm:p-12 border-0 bg-transparent"
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Notes;
