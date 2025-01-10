'use client';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import NotesRender from '@/components/shared/NotesRender';
import NotesHeader from '@/components/business/market/NotesHeader';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
  notesMenu,
} from '@/config/menuItems/business/dashboardMenuItems';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import useFetchNotes from '@/hooks/useFetchNotes';

const TrashPage = () => {
  const userId = useSelector((state: any) => state.user?.uid);
  const { trash, setTrash, isLoading, fetchNotes } = useFetchNotes(userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId, fetchNotes]);

  const handleCreateNote = () => {};

  return (
    <section className="p-3 relative sm:pl-6">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Trash"
      />
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Trash"
      />
      {/* Main content area */}
      <div className="ml-12">
        <NotesHeader
          isTrash={true}
          setNotes={setTrash}
          notes={trash}
          onNoteCreate={handleCreateNote}
        />
        <div className="p-6">
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-[40vh]">
                <Loader2 className="my-4 h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div>
                {trash?.length > 0 ? (
                  <NotesRender
                    fetchNotes={fetchNotes}
                    isTrash={true}
                    notes={trash}
                    setNotes={setTrash}
                    isArchive={true}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[40vh] w-full">
                    <p>No trash here! Add some to get started!</p>
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

export default TrashPage;
