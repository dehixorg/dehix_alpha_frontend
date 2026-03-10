import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Check,
  RotateCwIcon,
  Tag,
  Trash2Icon,
  X,
  Palette,
  Archive,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LabelType, Note, NoteType, badgeColors } from '@/utils/types/note';
import { truncateHTMLContent, truncateText } from '@/utils/notes/notesHelpers';

// Constants
const BADGE_COLORS: Record<string, string> = {
  [LabelType.PERSONAL]:
    'bg-blue-500 text-white hover:bg-blue-600 dark:text-white',
  [LabelType.WORK]:
    'bg-green-500 text-white hover:bg-green-600 dark:text-white',
  [LabelType.REMINDER]:
    'bg-yellow-500 text-white hover:bg-yellow-600 dark:text-white !text-white',
  [LabelType.TASK]: 'bg-red-500 text-white hover:bg-red-600 dark:text-white',
} as const;

const AVAILABLE_LABELS = [
  {
    id: LabelType.PERSONAL,
    name: 'Personal',
    color: BADGE_COLORS[LabelType.PERSONAL],
  },
  { id: LabelType.WORK, name: 'Work', color: BADGE_COLORS[LabelType.WORK] },
  {
    id: LabelType.REMINDER,
    name: 'Reminder',
    color: BADGE_COLORS[LabelType.REMINDER],
  },
  { id: LabelType.TASK, name: 'Task', color: BADGE_COLORS[LabelType.TASK] },
] as const;

// Utility functions
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

  return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)
    ? null
    : { r, g, b };
};

const isDarkColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.6;
};

// Theme configuration for different background colors
type ThemeConfig = {
  titleClass: string;
  bodyClass: string;
  buttonClass: string;
};

const NOTE_THEME_BY_BG: Record<string, ThemeConfig> = {
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

// Available color palette
const COLOR_PALETTE = [
  { color: '#ffffff', name: 'Default' },
  { color: '#f28b82', name: 'Red' },
  { color: '#fbbc04', name: 'Orange' },
  { color: '#fff475', name: 'Yellow' },
  { color: '#ccff90', name: 'Green' },
  { color: '#a7ffeb', name: 'Teal' },
  { color: '#cbf0f8', name: 'Cyan' },
  { color: '#aecbfa', name: 'Blue' },
  { color: '#d7aefb', name: 'Purple' },
  { color: '#fdcfe8', name: 'Pink' },
];

// Available banner images
const BANNER_IMAGES = [
  'https://www.gstatic.com/keep/backgrounds/notes_light_0609.svg',
  'https://www.gstatic.com/keep/backgrounds/food_light_0609.svg',
  'https://www.gstatic.com/keep/backgrounds/music_light_0609.svg',
  'https://www.gstatic.com/keep/backgrounds/recipe_light_0609.svg',
  'https://www.gstatic.com/keep/backgrounds/notes_dark_0609.svg',
  'https://www.gstatic.com/keep/backgrounds/places_light_0609.svg',
];

interface NoteCardProps {
  note: Note;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isTrash: boolean;
  isArchive: boolean;
  onEditNote: (note: Note) => Promise<void>;
  onUpdateNoteType: (
    noteId: string | undefined,
    noteType: NoteType,
  ) => Promise<void>;
  onDeleteClick: (noteId: string | undefined) => void;
  onUpdateNoteLabel?: (noteId: string | undefined, label: string) => void;
}

const NoteCard = ({
  note,
  onDragStart,
  onDragOver,
  onDrop,
  isTrash,
  isArchive,
  onEditNote,
  onUpdateNoteType,
  onDeleteClick,
  onUpdateNoteLabel,
}: NoteCardProps) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title || '');
  const [editedContent, setEditedContent] = useState(note.content || '');
  const [currentBgColor, setCurrentBgColor] = useState(
    note.bgColor || '#ffffff',
  );
  const [currentBanner, setCurrentBanner] = useState(note.banner || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<LabelType | undefined>(
    note.type && AVAILABLE_LABELS.some((l) => l.id === note.type)
      ? note.type
      : undefined,
  );

  // Refs
  const expandedRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Derived state
  const baseBg = (currentBgColor || '#ffffff').toLowerCase();
  const hasBanner = Boolean(currentBanner);

  // Set current label from note prop
  useEffect(() => {
    const validLabel =
      note.type && AVAILABLE_LABELS.some((l) => l.id === note.type)
        ? note.type
        : undefined;
    setCurrentLabel(validLabel);
  }, [note.type]);

  const handleLabelSelect = useCallback(
    (label: LabelType) => {
      setCurrentLabel(label);
      setShowLabelDropdown(false);
      onUpdateNoteLabel?.(note._id, label);
    },
    [note._id, onUpdateNoteLabel],
  );

  const handleSave = useCallback(async () => {
    if (
      isExpanded &&
      (editedTitle !== note.title ||
        editedContent !== note.content ||
        currentBgColor !== note.bgColor ||
        currentBanner !== note.banner ||
        currentLabel !== note.type)
    ) {
      try {
        await onEditNote({
          ...note,
          title: editedTitle,
          content: editedContent,
          bgColor: currentBgColor,
          banner: currentBanner,
          type: currentLabel,
        });
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
    setIsExpanded(false);
    setShowColorPicker(false);
  }, [
    isExpanded,
    editedTitle,
    editedContent,
    currentBgColor,
    currentBanner,
    currentLabel,
    note,
    onEditNote,
  ]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && expandedRef.current) {
        const target = event.target as Node;
        // Check if click is outside both the card and color picker
        const isOutsideCard = !expandedRef.current.contains(target);
        const isOutsideColorPicker =
          !colorPickerRef.current || !colorPickerRef.current.contains(target);

        if (isOutsideCard && isOutsideColorPicker) {
          handleSave();
        }
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded, handleSave]);

  const handleCardClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
      setEditedTitle(note.title || '');
      setEditedContent(note.content || '');
      setCurrentBgColor(note.bgColor || '#ffffff');
      setCurrentBanner(note.banner || '');
      setCurrentLabel(note.type || undefined);
    }
  }, [isExpanded, note]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSave();
      }
    },
    [handleSave],
  );

  const handleColorChange = (color: string) => {
    setCurrentBgColor(color);
    setCurrentBanner(''); // Clear banner when changing color
    setShowColorPicker(false);
  };

  const handleBannerChange = (banner: string) => {
    setCurrentBanner(banner);
    setShowColorPicker(false);
  };

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

  const { titleClass, bodyClass, buttonClass } = resolvedTheme;

  return (
    <>
      {/* Card in grid view */}
      <div
        draggable={!isExpanded}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="relative group w-full h-full"
      >
        <Card
          className={`font-sans w-full h-full min-h-[240px] relative overflow-hidden border border-border/60 bg-card/80 shadow-sm transition-all hover:shadow-md cursor-pointer`}
          style={{
            ...(hasBanner
              ? {
                  backgroundImage: `url(${currentBanner})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.95,
                }
              : { backgroundColor: baseBg, opacity: 0.95 }),
          }}
          onClick={handleCardClick}
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
                  className={`px-2 py-0.5 text-[9px] rounded-full tracking-wide flex items-center gap-1 shadow-sm border border-white/30 backdrop-blur-sm ${BADGE_COLORS[note.type as keyof typeof BADGE_COLORS] || ''}`}
                >
                  <Tag className="h-2.5 w-2.5 opacity-70" />
                  {note.type}
                </Badge>
              )}
            </div>

            <div className="mt-6">
              {note.title ? (
                <CardTitle
                  className={`font-semibold text-base sm:text-lg leading-tight line-clamp-2 ${titleClass} ${hasBanner ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : ''}`}
                >
                  {note.title}
                </CardTitle>
              ) : null}
            </div>
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

      {/* Expanded modal view */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            ref={expandedRef}
            className="relative w-full max-w-[680px] rounded-2xl bg-card shadow-2xl border border-border animate-keep-grow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Card
              className={`font-sans w-full relative overflow-hidden border shadow-2xl rounded-lg`}
              style={{
                ...(hasBanner
                  ? {
                      backgroundImage: `url(${currentBanner})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: baseBg }),
              }}
            >
              {hasBanner && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-black/45" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />
                </>
              )}

              <CardHeader className="relative pb-2">
                {/* Title Input */}
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full bg-transparent font-semibold text-lg leading-tight focus:outline-none placeholder:text-current placeholder:opacity-50 ${titleClass} ${hasBanner ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : ''}`}
                  placeholder="Title"
                />
              </CardHeader>

              <CardContent className="relative space-y-3 pb-2">
                {/* Content Textarea */}
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full min-h-[200px] max-h-[400px] bg-transparent focus:outline-none resize-none text-sm whitespace-pre-wrap break-words font-normal leading-relaxed placeholder:text-current placeholder:opacity-50 ${bodyClass} ${hasBanner ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]' : ''}`}
                  placeholder="Take a note..."
                />

                {/* Label Input and Display */}
                <div className="flex flex-wrap items-center gap-2 pb-2">
                  {/* Current Label Badge */}
                  {currentLabel && (
                    <Badge
                      className={`px-2.5 py-0.5 text-[11px] rounded-full tracking-wide flex items-center gap-1.5 shadow-sm border border-white/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
                        currentLabel
                          ? badgeColors[currentLabel] ||
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          : ''
                      }`}
                    >
                      <Tag className="h-3 w-3 opacity-80" />
                      {AVAILABLE_LABELS.find((l) => l.id === currentLabel)
                        ?.name || currentLabel}
                      <button
                        onClick={() => {
                          setCurrentLabel(undefined);
                          if (onUpdateNoteLabel) {
                            onUpdateNoteLabel(note._id, '');
                          }
                        }}
                        className="ml-1 hover:bg-black/10 dark:hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}

                  {/* Add/Change Label Button */}
                  <button
                    onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {currentLabel ? 'Change' : 'Add label'}
                  </button>

                  {/* Label Dropdown */}
                  {showLabelDropdown && (
                    <div
                      className="absolute left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2">
                        <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                          Labels
                        </div>
                        {AVAILABLE_LABELS.map((label) => (
                          <div
                            key={label.id}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 ${
                              currentLabel === label.id ? 'bg-muted' : ''
                            }`}
                            onClick={() => handleLabelSelect(label.id)}
                          >
                            <div
                              className={`h-3 w-3 rounded-full ${label.color}`}
                            ></div>
                            <span className="text-sm">{label.name}</span>
                            {currentLabel === label.id && (
                              <Check className="ml-auto h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  {/* Left side - Tools */}
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 ${buttonClass}`}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Background options"
                      >
                        <Palette className="h-4 w-4" />
                      </Button>

                      {/* Color Picker Panel */}
                      {showColorPicker && (
                        <div
                          ref={colorPickerRef}
                          className="absolute bottom-full left-0 mb-2 w-[280px] bg-popover border border-border rounded-lg shadow-lg p-3 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium mb-2 text-muted-foreground">
                                COLOR
                              </p>
                              <div className="grid grid-cols-5 gap-2">
                                {COLOR_PALETTE.map(({ color, name }) => (
                                  <button
                                    key={color}
                                    className={`group relative w-11 h-11 rounded-full border-2 transition-all hover:scale-105 ${
                                      currentBgColor === color && !currentBanner
                                        ? 'border-primary ring-2 ring-primary/30'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorChange(color)}
                                    title={name}
                                  >
                                    {currentBgColor === color &&
                                      !currentBanner && (
                                        <Check className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                                      )}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-2 text-muted-foreground">
                                BACKGROUNDS
                              </p>
                              <div className="grid grid-cols-4 gap-2">
                                {BANNER_IMAGES.map((banner, idx) => (
                                  <button
                                    key={idx}
                                    className={`relative w-full h-14 rounded border-2 transition-all hover:scale-105 overflow-hidden ${
                                      currentBanner === banner
                                        ? 'border-primary ring-2 ring-primary/30'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    style={{
                                      backgroundImage: `url(${banner})`,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                    }}
                                    onClick={() => handleBannerChange(banner)}
                                  >
                                    {currentBanner === banner && (
                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <Check className="h-5 w-5 text-white drop-shadow" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Archive Button */}
                    {!isTrash && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 ${buttonClass}`}
                        onClick={() => {
                          onUpdateNoteType(
                            note._id,
                            isArchive ? NoteType.NOTE : NoteType.ARCHIVE,
                          );
                          setIsExpanded(false);
                        }}
                        title={isArchive ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Delete/Restore Buttons */}
                    {!isTrash ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 ${buttonClass} hover:text-destructive`}
                        title="Move to trash"
                        onClick={async (e) => {
                          e.stopPropagation();
                          console.log('Moving to trash:', note._id);
                          try {
                            await onUpdateNoteType(note._id, NoteType.TRASH);
                            setIsExpanded(false);
                          } catch (error) {
                            console.error('Error moving to trash:', error);
                          }
                        }}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-9 w-9 ${buttonClass} text-green-600 hover:text-green-700`}
                          title="Restore"
                          onClick={async (e) => {
                            e.stopPropagation();
                            console.log('Restoring note:', note._id);
                            try {
                              await onUpdateNoteType(note._id, NoteType.NOTE);
                              setIsExpanded(false);
                            } catch (error) {
                              console.error('Error restoring note:', error);
                            }
                          }}
                        >
                          <RotateCwIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-9 w-9 ${buttonClass} text-destructive hover:text-destructive/80`}
                          title="Delete permanently"
                          onClick={async (e) => {
                            e.stopPropagation();
                            console.log('Permanently deleting note:', note._id);
                            try {
                              onDeleteClick(note._id);
                              setIsExpanded(false);
                            } catch (error) {
                              console.error(
                                'Error deleting note permanently:',
                                error,
                              );
                            }
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className={`h-9 px-4 font-medium ${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setShowColorPicker(false);
                      }}
                      className={`h-9 px-4 font-medium ${buttonClass}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export { NoteCard };
