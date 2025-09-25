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

const Page = () => {
  const user = useSelector((state: any) => state.user);
  const userId = user.uid;

  const { archive, isLoading, fetchNotes, setArchive } = useFetchNotes(userId);

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
        active="Archive"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={notesMenu}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Archive"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Notes', link: '/notes' },
            { label: 'Archive', link: '/archive' },
          ]}
        />
        {/* Main content area */}
        <div className="">
          <NotesHeader isTrash={true} setNotes={setArchive} notes={archive} />
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-[40vh]">
                <Loader2 className="my-4 h-8 w-8 animate-spin" />
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
      </div>
    </section>
  );
};

export default Page;
