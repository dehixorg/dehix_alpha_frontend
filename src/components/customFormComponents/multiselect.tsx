import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (selectedValues: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (selectedValue: string) => {
    const newValues = value.includes(selectedValue)
      ? value.filter((val) => val !== selectedValue)
      : [...value, selectedValue];

    onChange(newValues);
  };

  const handleRemove = (removedValue: string) => {
    const newValues = value.filter((val) => val !== removedValue);
    onChange(newValues);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="border rounded-md p-2 cursor-pointer min-h-[42px] flex items-center flex-wrap gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 && (
          <span className="text-muted-foreground">Select skills</span>
        )}
        {value.map((val) => (
          <span
            key={val}
            className="inline-block bg-primary text-primary-foreground rounded-full px-2 py-1 text-sm"
          >
            {options.find((option) => option.value === val)?.label}
            <button
              type="button"
              className="ml-1 hover:bg-primary/80 rounded-full p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(val);
              }}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      {isOpen && (
        <div className="absolute z-10 bottom-full mb-2 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center p-3 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleSelect(option.value)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                readOnly
                className="mr-3"
              />
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
