'use client';

import React, { useState } from 'react';

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
  onNoteCreate?: (note: Note) => void;
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
    <div className="px-6 pt-4 pb-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notes</h1>
          <p className="text-gray-400 mt-1 text-sm sm:hidden">
            Organize your thoughts and ideas
          </p>
        </div>
        {!isTrash && (
          <div className="flex items-center gap-3">
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
            <CreateNoteDialog onNoteCreate={onNoteCreate} />
          </div>
        )}
      </div>
      <p className="text-gray-400 mt-2 hidden sm:block">
        Organize your thoughts and ideas. Add, view, and manage your personal
        notes with ease.
      </p>
    </div>
  );
};

export default NotesHeader;
