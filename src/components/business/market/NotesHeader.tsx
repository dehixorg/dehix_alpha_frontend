'use client';

import React, { useState } from 'react';
import { ListFilter, Palette, Clock, History } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
    <>
      <div className="bg-gradient px-4 py-4 rounded-t-lg border-b">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notes</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:hidden">
              Organize your thoughts and ideas
            </p>

            <p className="text-muted-foreground mt-2 hidden sm:block">
              Organize your thoughts and ideas. Add, view, and manage your
              personal notes with ease.
            </p>
          </div>
          {!isTrash && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2" size="sm">
                    <ListFilter className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 shadow-md rounded-md border">
                  <DropdownMenuLabel className="">Sort Notes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedSortOption}
                    onValueChange={(val) => {
                      setSelectedSortOption(val);
                      if (val === 'color') return sortByColor();
                      if (val === 'latest') return sortByLatest();
                      if (val === 'oldest') return sortByOldest();
                    }}
                  >
                    <DropdownMenuRadioItem value="color">
                      <span className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Sort by color
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="latest">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Sort by latest
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">
                      <span className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Sort by oldest
                      </span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <CreateNoteDialog onNoteCreate={onNoteCreate} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotesHeader;
