import React from 'react';

const emojis = ['👍', '❤️', '😂', '🎉', '😢'];

export const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  return (
    <div className="grid grid-cols-5 gap-2 p-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-lg hover:bg-gray-200 rounded-md p-1"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
