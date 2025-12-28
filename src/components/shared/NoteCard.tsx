// components/NoteCard.tsx
import React from 'react';
import {
  ArchiveRestoreIcon,
  MoreVertical,
  Pencil,
  RotateCwIcon,
  Tag,
  Trash2Icon,
} from 'lucide-react';

import { Badge } from '../ui/badge';

import BannerChangerPopover from './BannerChangerPopUp';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { badgeColors, Note, NoteType } from '@/utils/types/note';
import { truncateHTMLContent, truncateText } from '@/utils/notes/notesHelpers';

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '').trim();
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  if (full.length !== 6) return null;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
};

const isDarkColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5;
};

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
}: NoteCardProps) => {
  const baseBg = note.bgColor || '#ffffff';
  const darkBg = !note.banner && isDarkColor(baseBg);

  const titleClass = darkBg ? 'text-white' : 'text-foreground';
  const bodyClass = darkBg ? 'text-white/85' : 'text-muted-foreground';
  const buttonClass = darkBg
    ? 'text-white/85 hover:text-white hover:bg-white/10'
    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative group w-full h-full"
    >
      <Card
        className="font-sans cursor-pointer w-full h-full min-h-[240px] relative overflow-hidden border bg-card/80 shadow-sm hover:shadow-md transition-shadow"
        style={
          note.banner
            ? {
                backgroundImage: `url(${note.banner})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.95,
              }
            : { backgroundColor: baseBg, opacity: 0.95 }
        }
        onClick={() => onEditNote(note)}
      >
        {note.banner && (
          <div className="pointer-events-none absolute inset-0 bg-background/70" />
        )}
        <CardHeader>
          <div className="absolute top-2 left-2 flex items-center gap-2">
            {note.type && (
              <Badge
                className={`px-2.5 py-0.5 text-[10px] rounded-full tracking-wide flex items-center gap-1.5 shadow-sm border border-white/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${badgeColors[note.type] || ''}`}
              >
                <Tag className="h-3 w-3 opacity-80" />
                {note.type.toUpperCase()}
              </Badge>
            )}
          </div>

          <div
            className="absolute top-2 right-2 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {!isTrash && (
              <BannerChangerPopover
                handleChangeBanner={(banner) =>
                  onChangeBanner(note._id, banner)
                }
                buttonClassName={buttonClass}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${buttonClass}`}
                  aria-label="Note actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => onEditNote(note)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                {!isTrash && (
                  <>
                    {navItems
                      .filter((i) => i.label !== 'Edit')
                      .map((item) => (
                        <DropdownMenuItem
                          key={item.label}
                          onClick={() =>
                            item.onClick(note._id, notes, setNotes)
                          }
                          className="cursor-pointer flex items-center gap-2"
                        >
                          {item.icon}
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        onUpdateNoteType(
                          note._id,
                          isArchive ? NoteType.NOTE : NoteType.ARCHIVE,
                        )
                      }
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <ArchiveRestoreIcon className="h-4 w-4" />
                      {isArchive ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                  </>
                )}

                {isTrash && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateNoteType(note._id, NoteType.NOTE)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <RotateCwIcon className="h-4 w-4" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteClick(note._id)}
                      className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {note.title && (
            <CardTitle
              className={`font-semibold text-base sm:text-lg mt-6 leading-tight line-clamp-2 ${titleClass}`}
            >
              {note.title}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="max-h-[320px] overflow-hidden">
          <div
            className={`text-sm whitespace-pre-wrap break-words font-normal leading-relaxed ${bodyClass}`}
          >
            {note.isHTML ? (
              <div
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: truncateHTMLContent(note.content, 30),
                }}
              />
            ) : (
              <div className={darkBg ? 'text-white/90' : 'text-foreground/90'}>
                {truncateText(note.content, 30)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteCard;
