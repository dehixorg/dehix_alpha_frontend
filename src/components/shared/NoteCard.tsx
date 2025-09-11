// components/NoteCard.tsx
import React from 'react';
import { ArchiveRestoreIcon, RotateCwIcon, Trash2Icon } from 'lucide-react';

import { Badge } from '../ui/badge';

import BannerChangerPopover from './BannerChangerPopUp';
import DropdownNavNotes from './DropdownNavNotes';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { badgeColors, Note, NoteType } from '@/utils/types/note';
import { truncateHTMLContent, truncateText } from '@/utils/notes/notesHelpers';

interface NoteCardProps {
  note: Note;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isTrash: boolean;
  isArchive: boolean;
  onEditNote: (note: Note) => void;
  onUpdateNoteType: (noteId: string | undefined, noteType: string) => void;
  onDeleteClick: (noteId: string | undefined) => void;
  onChangeBanner: (noteId: string | undefined, banner: string) => void;
  navItems: Array<{
    label: string;
    icon: any;
    onClick: (
      noteId: string | undefined,
      notes: Note[],
      setNotes: (notes: Note[]) => void,
    ) => void;
  }>;
}

const NoteCard = ({
  note,
  notes,
  setNotes,
  onDragStart,
  onDragOver,
  onDrop,
  isTrash,
  isArchive,
  onEditNote,
  onUpdateNoteType,
  onDeleteClick,
  onChangeBanner,
  navItems,
}: NoteCardProps) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    className="relative group"
  >
    <Card
      className="font-sans border-none break-inside-avoid cursor-pointer bg-white/90 hover:bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group w-[80vw] mb-3 md:w-[300px] min-h-[250px] relative"
      style={
        note.banner
          ? {
              backgroundImage: `url(${note.banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.9,
            }
          : { backgroundColor: note.bgColor || '#ffffff', opacity: 0.8 }
      }
      onClick={() => onEditNote(note)}
    >
      <CardHeader>
        {note.type && (
          <div className="absolute top-1 left-1">
            <Badge
              className={`text-xs py-0.5 ${badgeColors[note.type] || ' '}`}
            >
              {note.type.toUpperCase()}
            </Badge>
          </div>
        )}
        {note.title && (
          <CardTitle className="font-semibold text-lg text-gray-900 mt-6 leading-tight">
            {note.title}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="max-h-[320px] overflow-hidden">
        <div className="text-sm text-gray-600 whitespace-pre-wrap break-words font-normal leading-relaxed">
          {note.isHTML ? (
            <div
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{
                __html: truncateHTMLContent(note.content, 30),
              }}
            />
          ) : (
            <div className="text-gray-800">
              {truncateText(note.content, 30)}
            </div>
          )}
        </div>
      </CardContent>

      {/* This is the new, corrected button menu section */}
      <div className="absolute bottom-2 right-2 hidden group-hover:flex items-center gap-2 p-2 rounded-lg bg-white/50 backdrop-blur-sm shadow-md">
        {isTrash ? (
          <>
            <RotateCwIcon
              size={18}
              className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => onUpdateNoteType(note._id, NoteType.NOTE)}
            />
            <Trash2Icon
              size={18}
              className="text-gray-700 cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => onDeleteClick(note._id)}
            />
          </>
        ) : !isArchive ? (
          <ArchiveRestoreIcon
            size={18}
            className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => onUpdateNoteType(note._id, NoteType.ARCHIVE)}
          />
        ) : (
          <ArchiveRestoreIcon
            size={18}
            className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => onUpdateNoteType(note._id, NoteType.NOTE)}
          />
        )}

        <BannerChangerPopover
          handleChangeBanner={(banner) => onChangeBanner(note._id, banner)}
        />

        {!isTrash && (
          <DropdownNavNotes
            navItems={navItems.map((item) => ({
              ...item,
              onClick: () => item.onClick(note._id, notes, setNotes),
            }))}
          />
        )}
      </div>
    </Card>
  </div>
);

export default NoteCard;
