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
          className={`my-auto ${className}`} 
          variant="link" 
          size="sm"
          aria-label={ariaLabel}
        >
          <Smile className="h-4 w-4 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0 w-[320px] shadow-md rounded-lg"
      >
        <Picker onEmojiSelect={handleEmojiSelect} />
      </PopoverContent>
    </Popover>
  );
};
