import React from 'react';

interface TextFormatProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const TextFormat: React.FC<TextFormatProps> = ({ input, setInput }) => {
  const formatText = (formatType: string) => {
    let formattedText = '';
    switch (formatType) {
      case 'bold':
        formattedText = `**${input.trim()}**`;
        break;
      case 'italic':
        formattedText = `*${input.trim()}*`;
        break;
      case 'link':
        formattedText = `[${input.trim()}](https://example.com)`;
        break;
      default:
        formattedText = input;
    }
    setInput(formattedText);
  };

  return (
    <div className="flex space-x-2 mb-2">
      <button
        onClick={() => formatText('bold')}
        className="btn-format text-xl font-bold"
      >
        B
      </button>
      <button
        onClick={() => formatText('italic')}
        className="btn-format text-xl italic"
      >
        I
      </button>
      <button onClick={() => formatText('link')} className="btn-format text-xl">
        Link
      </button>
    </div>
  );
};

export default TextFormat;
