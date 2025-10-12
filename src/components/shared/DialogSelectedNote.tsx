'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Save, Clock, ArchiveRestore, Trash2 } from 'lucide-react';

import { Note, NoteType } from '@/utils/types/note';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

type DialogSelectedNoteProps = {
  note: Note;
  onClose: () => void;
  onSave: (updatedNote: Note) => void;
  onArchive?: (noteId: string | undefined, toType: string) => void;
  onDelete?: (noteId: string | undefined) => void;
};

const DialogSelectedNote = ({
  note,
  onClose,
  onSave,
  onArchive,
  onDelete,
}: DialogSelectedNoteProps) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      setError('Please add a title or content');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const updatedNote = {
        ...note,
        title: title.trim(),
        content: content.trim(),
      };
      await onSave(updatedNote);
      setIsEditMode(false);
    } catch (err) {
      setError('Failed to save note. Please try again.');
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleString('en-US', {
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Dialog
      open={!!note}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ScrollArea className="h-60">
        <DialogContent
          className={cn(
            'p-0 max-w-2xl max-h-[90vh] mx-4 sm:mx-0',
            'shadow-2xl rounded-xl border-2 border-border',
            'bg-card text-card-foreground',
            'transition-all duration-200 ease-in-out',
          )}
          onInteractOutside={onClose}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
        >
          {note.banner && !note.bgColor && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          )}
          <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gradient">
            <div className="flex items-center justify-between w-full">
              {isEditMode ? (
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className={cn(
                    'text-sm font-medium p-0 border-0 shadow-none',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'text-inherit bg-transparent',
                    'h-auto px-0 flex-1',
                  )}
                />
              ) : (
                <div className="flex items-center justify-between w-full">
                  <DialogTitle
                    className="m-0 cursor-pointer"
                    onClick={() => setIsEditMode(true)}
                  >
                    {title || 'Note'}
                  </DialogTitle>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <ScrollArea className="min-h-[200px] max-h-[60vh] px-6 py-4">
            {error && (
              <div className="mb-4 p-3 text-sm bg-red-500/10 text-red-600 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            {isEditMode ? (
              <div className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your note..."
                  className={cn(
                    'h-full min-h-[200px] p-0 border-0 shadow-none',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'resize-none text-base leading-relaxed',
                    'text-inherit bg-transparent',
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {content ? (
                  note.isHTML ? (
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      {content.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-4 last:mb-0">
                          {paragraph || <br />}
                        </p>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center rounded-md bg-background/60 border">
                    <div className="mb-4 opacity-90">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 200 120"
                        className="w-40 h-24 mx-auto"
                        aria-hidden
                      >
                        <rect
                          x="10"
                          y="20"
                          width="180"
                          height="80"
                          rx="12"
                          className="fill-muted"
                        />
                        <rect
                          x="26"
                          y="36"
                          width="60"
                          height="10"
                          rx="5"
                          className="fill-muted-foreground/40"
                        />
                        <rect
                          x="26"
                          y="54"
                          width="120"
                          height="10"
                          rx="5"
                          className="fill-muted-foreground/30"
                        />
                        <rect
                          x="26"
                          y="72"
                          width="90"
                          height="10"
                          rx="5"
                          className="fill-muted-foreground/20"
                        />
                        <circle
                          cx="160"
                          cy="60"
                          r="10"
                          className="fill-primary/30"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold mb-1">
                      No content yet
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Click Edit to start writing your note. You can also change
                      the banner or color from the card actions.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-4 border-t border-gray-300/60 dark:border-gray-700/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white">
                {formattedDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Edited {formattedDate}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditMode ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {typeof onArchive === 'function' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          onArchive(
                            note._id,
                            note.noteType === NoteType.ARCHIVE
                              ? NoteType.NOTE
                              : NoteType.ARCHIVE,
                          )
                        }
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        {note.noteType === NoteType.ARCHIVE
                          ? 'Unarchive'
                          : 'Archive'}
                      </Button>
                    )}

                    {typeof onDelete === 'function' && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onDelete(note._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                      className="gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </ScrollArea>
    </Dialog>
  );
};

export default DialogSelectedNote;
