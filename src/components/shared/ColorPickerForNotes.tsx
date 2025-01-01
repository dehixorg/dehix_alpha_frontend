"use client";

import { cn } from "@/lib/utils";

const colors = [
  "#ffffff",
  "#f28b82",
  "#fbbc04",
  "#fff475",
  "#ccff90",
  "#a7ffeb",
  "#cbf0f8",
  "#aecbfa",
  "#d7aefb",
  "#fdcfe8",
];

type Props = {
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

export function ColorPicker({ selectedColor, onColorSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={cn(
            "w-6 h-6 rounded-full border transition-all",
            selectedColor === color && "ring-2 ring-offset-2 ring-black"
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}