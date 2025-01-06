import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';

interface DropdownNavNotesProps {
  navItems: { label: string; onClick: (noteId: string | undefined) => void }[];
  noteId: string | undefined;
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
      <HoverCardContent className=" shadow-md rounded-md  w-40 p-1">
        <ul className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.onClick(noteId)}
              className="block whitespace-nowrap  px-4 py-2 text-xs"
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
