'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Archive } from 'lucide-react';

import NotesRender from '@/components/shared/NotesRender';
import NotesHeader from '@/components/business/market/NotesHeader';
import useFetchNotes from '@/hooks/useFetchNotes';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import EmptyState from '@/components/shared/EmptyState';
import NotesLayout from '@/components/layout/NotesLayout';

const Page = () => {
  const user = useSelector((state: any) => state.user);
  const userId = user.uid;

  const { archive, isLoading, fetchNotes, setArchive } = useFetchNotes(userId);

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId, fetchNotes]);

  return (
    <NotesLayout
      active="Archive"
      activeMenu="Archive"
      breadcrumbItems={[
        { label: 'Notes', link: '/notes' },
        { label: 'Archive', link: '#' },
      ]}
    >
      <Card className="overflow-hidden border">
        <NotesHeader
          isTrash={false}
          setNotes={setArchive}
          notes={archive}
          title="Archive"
          description="Your archived notes live here"
          icon={<Archive className="h-5 w-5 text-muted-foreground" />}
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
              title="No archive yet"
              description="Your archived notes will appear here."
              className="p-8 sm:p-12 border-0 bg-transparent"
            />
          )}
        </div>
      </Card>
    </NotesLayout>
  );
};

export default Page;
