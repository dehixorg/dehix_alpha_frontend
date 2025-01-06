import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';

interface DropdownNavNotesProps {
  navItems: {
    label: string;
    icon?: JSX.Element;
    onClick: (noteId: string | undefined) => void;
  }[];
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
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-center p-1 rounded hover:bg-gray-700 transition-all duration-200"
          aria-label="Options"
        >
          <MoreVertical size={18} className="text-white" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className=" shadow-md rounded-md  w-14 p-1 bg-white dark:bg-black">
        <ul className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <li key={index} className="flex justify-center">
              <button
                onClick={() => item.onClick(noteId)}
                className="flex justify-center items-center p-2 text-white rounded-full transition-all transform hover:scale-105 hover:bg-gray-800"
              >
                {item.icon}
              </button>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DropdownNavNotes;
