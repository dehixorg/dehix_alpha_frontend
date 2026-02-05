import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';

import { Button } from '@/components/ui/button'; // Import Button from ShadCN UI
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'; // Import Popover components

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  'aria-label'?: string;
  className?: string;
}

export const EmojiPicker = ({
  onSelect,
  'aria-label': ariaLabel = 'Select emoji',
  className = '',
}: EmojiPickerProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Handle closing the Popover when an emoji is selected
  const handleEmojiSelect = (emoji: any) => {
    onSelect(emoji.native); // Pass the selected emoji to the parent component
    setIsPopoverOpen(false); // Close the Popover after selection
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className={`h-7 w-7 rounded-full text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] dark:text-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--accent))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 ${className}`}
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
        >
          <Smile className="h-4 w-4" strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0 w-[272px] max-w-[calc(100vw-2rem)] shadow-md rounded-lg overflow-hidden"
      >
        <Picker
          onEmojiSelect={handleEmojiSelect}
          perLine={8}
          emojiButtonSize={32}
        />
      </PopoverContent>
    </Popover>
  );
};
