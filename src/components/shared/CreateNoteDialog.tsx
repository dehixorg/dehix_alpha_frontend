'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';

import { ColorPicker } from './ColorPickerForNotes';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Note, NoteType } from '@/utils/types/note';

type Props = {
  onNoteCreate: (note: Note) => void;
};

const banners = [
  '/banner1.svg',
  '/banner2.svg',
  '/banner3.svg',
  '/banner4.svg',
  '/banner5.svg',
  '/banner6.svg',
  '/banner7.svg',
];

export function CreateNoteDialog({ onNoteCreate }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isHTML, setIsHTML] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return;

    const newNote: Note = {
      title: title.trim(),
      content: content.trim(),
      bgColor: selectedBanner ? undefined : selectedColor,
      banner: selectedBanner || undefined,
      createdAt: new Date(),
      noteType: NoteType.NOTE,
      isHTML,
    };

    onNoteCreate(newNote);
    setTitle('');
    setContent('');
    setSelectedColor('#ffffff');
    setSelectedBanner(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Create New Note</DialogTitle>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isHTML}
              onChange={(e) => setIsHTML(e.target.checked)}
              className="cursor-pointer size-3 text-xs"
            />
            <span className="text-xs">Render content as HTML</span>
          </label>
          <div>
            <p className="text-sm font-medium mb-2">
              Select a color or banner:
            </p>
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={(color) => {
                setSelectedColor(color);
                setSelectedBanner(null); // Clear banner when color is selected
              }}
            />
            <div className="grid grid-cols-8 gap-2 mt-4">
              {banners.map((banner, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedBanner(banner);
                    setSelectedColor('#ffffff'); // Clear color when banner is selected
                  }}
                  className={`cursor-pointer border rounded-full p-1 flex items-center justify-center ${
                    selectedBanner === banner
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={banner}
                    alt={`Banner ${index + 1}`}
                    width={32} // Adjust width for your design
                    height={32} // Adjust height for your design
                    className="object-cover rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
