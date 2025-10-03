'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import NotesRender from '@/components/shared/NotesRender';
import NotesHeader from '@/components/business/market/NotesHeader';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { notesMenu } from '@/config/menuItems/business/dashboardMenuItems';
import useFetchNotes from '@/hooks/useFetchNotes';
import Header from '@/components/header/header';
import { menuItemsBottom } from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const Page = () => {
  const user = useSelector((state: any) => state.user);
  const userId = user.uid;

  const { archive, isLoading, fetchNotes, setArchive } = useFetchNotes(userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId, fetchNotes]);

  return (
    <section className="flex min-h-screen w-full flex-col">
      {/* Sidebar menus */}
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={menuItemsBottom}
        active="Archive"
      />
      <div className="flex flex-col gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={notesMenu}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Archive"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Notes', link: '/notes' },
            { label: 'Archive', link: '#' },
          ]}
        />
        {/* Main content area */}
        <div className="px-4">
          <Card className="overflow-hidden border pb-16">
            <NotesHeader
              isTrash={false}
              setNotes={setArchive}
              notes={archive}
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
              ) : archive?.length > 0 ? (
                <NotesRender
                  fetchNotes={fetchNotes}
                  notes={archive}
                  setNotes={setArchive}
                  isArchive={true}
                />
              ) : (
                <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
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
                  <h3 className="text-xl font-semibold mb-2">No archive yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Your archived notes will appear here.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Page;
