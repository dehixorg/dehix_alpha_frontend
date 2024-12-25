import React from 'react';
import { Smile } from 'lucide-react';

import { Button } from '@/components/ui/button'; // Import Button from ShadCN UI
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'; // Import Popover components

const emojis = ['👍', '❤️', '😂', '🎉', '😢'];

export const EmojiPicker = ({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="my-auto" variant="link" size="sm">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid grid-cols-5 gap-2 p-2">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="text-lg rounded-md"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
