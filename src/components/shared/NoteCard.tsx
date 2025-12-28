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
  return luminance < 0.6;
};

const NOTE_THEME_BY_BG: Record<
  string,
  {
    titleClass: string;
    bodyClass: string;
    buttonClass: string;
  }
> = {
  '#ffffff': {
    titleClass: 'text-muted-foreground',
    bodyClass: 'text-muted-foreground',
    buttonClass:
      'text-muted-foreground hover:text-foreground hover:bg-muted/50',
  },
  '#f28b82': {
    titleClass: 'text-red-950',
    bodyClass: 'text-red-950/80',
    buttonClass: 'text-red-950/80 hover:text-red-950 hover:bg-black/5',
  },
  '#fbbc04': {
    titleClass: 'text-orange-950',
    bodyClass: 'text-orange-950/80',
    buttonClass: 'text-orange-950/80 hover:text-orange-950 hover:bg-black/5',
  },
  '#fff475': {
    titleClass: 'text-amber-950',
    bodyClass: 'text-amber-950/80',
    buttonClass: 'text-amber-950/80 hover:text-amber-950 hover:bg-black/5',
  },
  '#ccff90': {
    titleClass: 'text-lime-950',
    bodyClass: 'text-lime-950/80',
    buttonClass: 'text-lime-950/80 hover:text-lime-950 hover:bg-black/5',
  },
  '#a7ffeb': {
    titleClass: 'text-teal-950',
    bodyClass: 'text-teal-950/80',
    buttonClass: 'text-teal-950/80 hover:text-teal-950 hover:bg-black/5',
  },
  '#cbf0f8': {
    titleClass: 'text-sky-950',
    bodyClass: 'text-sky-950/80',
    buttonClass: 'text-sky-950/80 hover:text-sky-950 hover:bg-black/5',
  },
  '#aecbfa': {
    titleClass: 'text-blue-950',
    bodyClass: 'text-blue-950/80',
    buttonClass: 'text-blue-950/80 hover:text-blue-950 hover:bg-black/5',
  },
  '#d7aefb': {
    titleClass: 'text-purple-950',
    bodyClass: 'text-purple-950/80',
    buttonClass: 'text-purple-950/80 hover:text-purple-950 hover:bg-black/5',
  },
  '#fdcfe8': {
    titleClass: 'text-pink-950',
    bodyClass: 'text-pink-950/80',
    buttonClass: 'text-pink-950/80 hover:text-pink-950 hover:bg-black/5',
  },
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
  const baseBg = (note.bgColor || '#ffffff').toLowerCase();

  const hasBanner = Boolean(note.banner);

  const paletteTheme = !hasBanner ? NOTE_THEME_BY_BG[baseBg] : undefined;
  const darkBg = !hasBanner && !paletteTheme && isDarkColor(baseBg);

  const bannerTheme = {
    titleClass: 'text-white',
    bodyClass: 'text-white/85',
    buttonClass: 'text-white/85 hover:text-white hover:bg-white/10',
  };

  const resolvedTheme = hasBanner
    ? bannerTheme
    : paletteTheme
      ? paletteTheme
      : darkBg
        ? {
            titleClass: 'text-white',
            bodyClass: 'text-white/85',
            buttonClass: 'text-white/85 hover:text-white hover:bg-white/10',
          }
        : {
            titleClass: 'text-foreground',
            bodyClass: 'text-muted-foreground',
            buttonClass:
              'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          };

  const titleClass = resolvedTheme.titleClass;
  const bodyClass = resolvedTheme.bodyClass;
  const buttonClass = resolvedTheme.buttonClass;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative group w-full h-full"
    >
      <Card
        className="font-sans cursor-pointer w-full h-full min-h-[240px] relative overflow-hidden border border-border/60 bg-card/80 shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        style={
          hasBanner
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
        {hasBanner && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-black/45" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />
          </>
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
              className={`font-semibold text-base sm:text-lg mt-6 leading-tight line-clamp-2 ${titleClass} ${hasBanner ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : ''}`}
            >
              {note.title}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="max-h-[320px] overflow-hidden">
          <div
            className={`text-sm whitespace-pre-wrap break-words font-normal leading-relaxed ${bodyClass} ${hasBanner ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]' : ''}`}
          >
            {note.isHTML ? (
              <div
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: truncateHTMLContent(note.content, 30),
                }}
              />
            ) : (
              <div className="whitespace-pre-wrap break-words">
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
