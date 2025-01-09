// import React from 'react';
// import { Smile } from 'lucide-react';

// import { Button } from '@/components/ui/button'; // Import Button from ShadCN UI
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from '@/components/ui/popover'; // Import Popover components

// const emojis = ['👍', '❤️', '😂', '🎉', '😢'];

// export const EmojiPicker = ({
//   onSelect,
// }: {
//   onSelect: (emoji: string) => void;
// }) => {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button className="my-auto" variant="link" size="sm">
//           <Smile className="h-4 w-4" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent align="start" className="grid grid-cols-5 gap-2 p-2">
//         {emojis.map((emoji) => (
//           <Button
//             key={emoji}
//             variant="ghost"
//             size="sm"
//             className="text-lg rounded-md"
//             onClick={() => onSelect(emoji)}
//           >
//             {emoji}
//           </Button>
//         ))}
//       </PopoverContent>
//     </Popover>
//   );
// };

import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { Picker } from 'emoji-mart'; // Import the Picker component from emoji-mart v3

import { Button } from '@/components/ui/button'; // Import Button from ShadCN UI
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'; // Import Popover components

// Options for emoji-mart (can customize this if needed)
import 'emoji-mart/css/emoji-mart.css'; // Import default emoji-mart styles

export const EmojiPicker = ({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Handle closing the Popover when an emoji is selected
  const handleEmojiSelect = (emoji: any) => {
    onSelect(emoji.native); // Pass the selected emoji to the parent component
    setIsPopoverOpen(false); // Close the Popover after selection
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button className="my-auto " variant="link" size="sm">
          <Smile className="h-4 w-4 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0 w-[320px] border border-gray-300 bg-white shadow-md rounded-lg"
      >
        <Picker
          set="apple" // Option for emoji set style ('apple', 'google', 'twitter', etc.)
          onSelect={handleEmojiSelect} // Pass the selected emoji to handleEmojiSelect
          title="Pick your emoji" // Title of the picker
          emoji="point_up" // Default emoji to show
          skin={1} // Default skin tone (1-6)
          style={{ width: '100%' }} // Ensure the picker is fully responsive
          theme="auto" // Auto theme to switch between light/dark mode
        />
      </PopoverContent>
    </Popover>
  );
};
