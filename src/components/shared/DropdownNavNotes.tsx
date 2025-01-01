import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';

interface DropdownNavNotesProps {
  navItems: { label: string; onClick: (noteId: string) => void }[];
  noteId: string;
}

const DropdownNavNotes = ({ navItems, noteId }: DropdownNavNotesProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button onClick={toggleDropdown}>
          <MoreVertical
            size={15}
            className=" transition-all text-black duration-200"
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className=" shadow-md rounded-md p-1">
        <ul className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.onClick(noteId)}
              className="block px-4 py-2 text-sm"
            >
              {item.label}
            </button>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DropdownNavNotes;
