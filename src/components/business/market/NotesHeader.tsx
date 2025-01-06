'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Note } from '@/utils/types/note';
import { CreateNoteDialog } from '@/components/shared/CreateNoteDialog';

const NotesHeader = ({
  onNoteCreate,
  notes,
  setNotes,
  isTrash,
}: {
  onNoteCreate: (note: Note) => void;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isTrash: boolean;
}) => {
  const [selectedSortOption, setSelectedSortOption] = useState<string>('');

  const sortByColor = () => {
    const sortedNotes = [...notes].sort((a, b) =>
      (a.bgColor || '').localeCompare(b.bgColor || ''),
    );
    setNotes(sortedNotes);
  };

  const sortByLatest = () => {
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    setNotes(sortedNotes);
  };

  const sortByOldest = () => {
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
    setNotes(sortedNotes);
  };

  return (
    <div>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Breadcrumb items={[{ label: 'Notes', link: '#' }]} />
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes by title..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
        <DropdownProfile />
      </header>
      <div className="mb-8 ml-6 mt-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-gray-400 mt-2 hidden md:block ">
            Organize your thoughts and ideas. Add, view, and manage your
            personal notes with ease.
          </p>
        </div>
        {!isTrash && (
          <div className="mt-4">
            <div className="flex justify-center gap-5 items-center flex-wrap mt-4 sm:mt-0">
              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="sm:text-sm md:text-base">
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56  shadow-md rounded-md border">
                  <DropdownMenuLabel className="">Sort Notes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedSortOption === 'color'}
                    onCheckedChange={() => {
                      setSelectedSortOption('color');
                      sortByColor();
                    }}
                  >
                    Sort by color
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSortOption === 'latest'}
                    onCheckedChange={() => {
                      setSelectedSortOption('latest');
                      sortByLatest();
                    }}
                  >
                    Sort by latest
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedSortOption === 'oldest'}
                    onCheckedChange={() => {
                      setSelectedSortOption('oldest');
                      sortByOldest();
                    }}
                  >
                    Sort by oldest
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Create Dialog */}
              <CreateNoteDialog onNoteCreate={onNoteCreate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesHeader;
