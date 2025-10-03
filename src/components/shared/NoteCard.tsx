// components/NoteCard.tsx
import React from 'react';
import {
  ArchiveRestoreIcon,
  RotateCwIcon,
  Trash2Icon,
  Tag,
} from 'lucide-react';

import { Badge } from '../ui/badge';

import BannerChangerPopover from './BannerChangerPopUp';
import DropdownNavNotes from './DropdownNavNotes';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    className="relative group w-full h-full"
  >
    <Card
      className="font-sans border-none cursor-pointer bg-white/90 hover:bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full h-full min-h-[250px] relative"
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
          <div className="absolute top-2 left-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  className={`px-2.5 py-0.5 text-[10px] rounded-full tracking-wide flex items-center gap-1.5 shadow-sm border border-white/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${badgeColors[note.type] || ''}`}
                >
                  <Tag className="h-3 w-3 opacity-80" />
                  {note.type.toUpperCase()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Label for quick filtering</TooltipContent>
            </Tooltip>
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

      {/* Actions */}
      <TooltipProvider delayDuration={150}>
        <div className="absolute top-2 right-2 flex items-center gap-1.5 p-1.5 rounded-lg bg-white/60 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto transition-opacity">
          {isTrash ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted"
                    aria-label="Restore"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateNoteType(note._id, NoteType.NOTE);
                    }}
                  >
                    <RotateCwIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    aria-label="Delete permanently"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(note._id);
                    }}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete permanently</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted"
                  aria-label={isArchive ? 'Unarchive' : 'Archive'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateNoteType(
                      note._id,
                      isArchive ? NoteType.NOTE : NoteType.ARCHIVE,
                    );
                  }}
                >
                  <ArchiveRestoreIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isArchive ? 'Unarchive' : 'Archive'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Banner changer */}
          <div onClick={(e) => e.stopPropagation()}>
            <BannerChangerPopover
              handleChangeBanner={(banner) => onChangeBanner(note._id, banner)}
            />
          </div>

          {/* More actions */}
          {!isTrash && (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownNavNotes
                navItems={navItems.map((item) => ({
                  ...item,
                  onClick: () => item.onClick(note._id, notes, setNotes),
                }))}
              />
            </div>
          )}
        </div>
      </TooltipProvider>
    </Card>
  </div>
);

export default NoteCard;
