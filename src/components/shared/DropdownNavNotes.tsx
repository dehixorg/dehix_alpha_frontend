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
      <HoverCardContent
        className="shadow-md rounded-md w-auto p-2 bg-white dark:bg-black"
        style={{ display: isDropdownOpen ? 'block' : 'none' }}
      >
        <ul className="flex flex-row gap-2 md:flex-col">
          {navItems.map((item, index) => (
            <li key={index} className="flex items-center justify-center">
              <button
                onClick={() => item.onClick(noteId)}
                className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto p-2 text-black dark:text-white rounded-full transition-all transform hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label={item.label}
              >
                {item.icon}
                <span className="hidden md:inline-block ml-2 text-sm">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DropdownNavNotes;
