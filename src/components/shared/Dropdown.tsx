import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownProps {
  items: {
    label: string;
    icon?: JSX.Element;
    onClick: () => void;
  }[];
}

const Dropdown: React.FC<DropdownProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    'bottom',
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (dropdownRef.current) {
          const dropdownRect = dropdownRef.current.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          if (dropdownRect.bottom + 150 > windowHeight) {
            setPosition('top');
          } else if (dropdownRect.right + 150 > windowWidth) {
            setPosition('left');
          } else if (dropdownRect.left - 150 < 0) {
            setPosition('right');
          } else {
            setPosition('bottom');
          }
        }
      }, 10);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className=" rounded-md text-black"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          className={`absolute w-24 rounded-md shadow-md bg-white dark:bg-black border border-gray-300 dark:border-gray-700 transition-all duration-200 ease-in-out overflow-visible ${
            position === 'top'
              ? 'bottom-full mb-2'
              : position === 'left'
                ? 'right-full mr-2'
                : position === 'right'
                  ? 'left-full ml-2'
                  : 'top-full mt-1'
          } z-[9999]`}
          style={{ transform: 'translateZ(0)' }} // Fix Rendering Issue
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-1 py-1 text-sm text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
