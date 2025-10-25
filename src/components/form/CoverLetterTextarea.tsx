import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

import { Textarea } from '../ui/textarea';
import { FormControl, FormMessage } from '../ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface CoverLetterTextareaProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

const CoverLetterTextarea: React.FC<CoverLetterTextareaProps> = ({
  value = '',
  onChange,
  error,
}) => {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Count words
    const words = newValue
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // ✅ Allow typing only up to 500 words
    if (words.length <= 500) {
      onChange(newValue);
    }
  };

  // ✅ Valid only when between 200 and 500 (inclusive)
  const isWordCountValid = wordCount >= 200 && wordCount <= 500;

  const tooltipContent = (
    <div className="max-w-xs">
      <p className="font-medium mb-2">Cover Letter Tips:</p>
      <ul className="text-xs space-y-1">
        <li>• Introduce yourself and your relevant experience</li>
        <li>• Explain why you are interested in this type of work</li>
        <li>• Highlight your key skills and achievements</li>
        <li>
          • Mention specific technologies or tools you are proficient with
        </li>
        <li>• Describe your work style and communication approach</li>
        <li>• Write between 200–500 words for a complete cover letter</li>
      </ul>
    </div>
  );

  return (
    <div className="space-y-2">
      <FormControl>
        <div className="relative">
          <Textarea
            placeholder="Write your cover letter here... (optional - minimum 200 to maximum 500 words if provided)"
            value={value}
            onChange={handleChange}
            className={`min-h-[200px] resize-y pr-10 text-foreground placeholder:text-muted-foreground`}
            rows={10}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                {tooltipContent}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </FormControl>

      {value && value.trim().length > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span
            className={`${
              isWordCountValid
                ? 'text-green-600 dark:text-green-400'
                : 'text-orange-500 dark:text-orange-400'
            }`}
          >
            Words: {wordCount}/500 {isWordCountValid ? '✓' : ''}
          </span>

          {!isWordCountValid && wordCount > 0 && (
            <span className="text-muted-foreground text-xs">
              Cover letter should be between 200 and 500 words
            </span>
          )}
        </div>
      )}

      {(!value || value.trim().length === 0) && (
        <div className="text-sm text-muted-foreground">
          Cover letter is optional. Leave empty to skip, or write between
          200–500 words for a complete cover letter.
        </div>
      )}

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

export default CoverLetterTextarea;
