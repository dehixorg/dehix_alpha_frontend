// components/NoteCard.tsx
import React from 'react';
import { ArchiveRestoreIcon, RotateCwIcon, Trash2Icon } from 'lucide-react';

import { Badge } from '../ui/badge';

import BannerChangerPopover from './BannerChangerPopUp';
import DropdownNavNotes from './DropdownNavNotes';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
      className="break-inside-avoid cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group w-[80vw] mb-3 md:w-[200px] relative"
      style={
        note.banner
          ? {
              backgroundImage: `url(${note.banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: note.bgColor || '#ffffff' }
      }
    >
      <div onClick={() => onEditNote(note)}>
        <CardHeader>
          {note.type && (
            <div className="absolute top-1 left-1">
              <Badge
                className={`text-xs py-0.5 ${badgeColors[note.type] || ' '}`}
              >
                {note.type.toLowerCase()}
              </Badge>
            </div>
          )}
          {note.title && (
            <CardTitle className="font-semibold text-lg text-black mt-6">
              {note.title}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="max-h-[320px] overflow-hidden">
          <CardDescription className="text-sm whitespace-pre-wrap truncate break-words">
            {note.isHTML ? (
              <div
                className="text-sm whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: truncateHTMLContent(note.content, 30),
                }}
              />
            ) : (
              <CardDescription className="text-sm font-bold truncate bg-opacity-100 whitespace-pre-wrap break-words text-black">
                {truncateText(note.content, 30)}
              </CardDescription>
            )}
          </CardDescription>
        </CardContent>
      </div>

      <div className="relative group">
        <div className="absolute bottom-2 right-2 hidden group-hover:flex items-center gap-4 justify-center">
          {isTrash ? (
            <>
              <RotateCwIcon
                size={15}
                className="text-black cursor-pointer"
                onClick={() => onUpdateNoteType(note._id, NoteType.NOTE)}
              />
              <Trash2Icon
                size={15}
                className="text-black cursor-pointer"
                onClick={() => onDeleteClick(note._id)}
              />
            </>
          ) : !isArchive ? (
            <ArchiveRestoreIcon
              size={15}
              className="text-black cursor-pointer"
              onClick={() => onUpdateNoteType(note._id, NoteType.ARCHIVE)}
            />
          ) : (
            <ArchiveRestoreIcon
              size={15}
              className="text-black cursor-pointer"
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
                icon: item.icon,
                onClick: () => item.onClick(note._id, notes, setNotes),
              }))}
            />
          )}
        </div>
      </div>
    </Card>
  </div>
);

export default NoteCard;
