import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DropdownProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange }) => {
  const currentOption = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="border rounded p-2 w-full text-left"
      >
        {currentOption?.label || 'Select an option'}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-1 w-full border rounded shadow-md">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="p-2 w-full cursor-pointer"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
