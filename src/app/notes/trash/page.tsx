'use client';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import NotesRender from '@/components/shared/NotesRender';
import NotesHeader from '@/components/business/market/NotesHeader';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { notesMenu } from '@/config/menuItems/business/dashboardMenuItems';
import useFetchNotes from '@/hooks/useFetchNotes';
import Header from '@/components/header/header';
import { menuItemsBottom } from '@/config/menuItems/freelancer/dashboardMenuItems';

const TrashPage = () => {
  const userId = useSelector((state: any) => state.user?.uid);
  const { trash, setTrash, isLoading, fetchNotes } = useFetchNotes(userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId, fetchNotes]);

  return (
    <section className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Trash"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <div>
          <Header
            menuItemsTop={notesMenu}
            menuItemsBottom={menuItemsBottom}
            activeMenu="Trash"
            breadcrumbItems={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Notes', link: '/notes' },
              { label: 'Trash', link: '/trash' },
            ]}
          />
        </div>
        {/* Main content area */}
        <div>
          <NotesHeader isTrash={true} setNotes={setTrash} notes={trash} />
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
      </div>
    </section>
  );
};

export default TrashPage;
