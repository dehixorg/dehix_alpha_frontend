'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Save, Clock, X } from 'lucide-react';

import { Note } from '@/utils/types/note';
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

type DialogSelectedNoteProps = {
  note: Note;
  onClose: () => void;
  onSave: (updatedNote: Note) => void;
};

const DialogSelectedNote = ({
  note,
  onClose,
  onSave,
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

  // Check if background is white
  const isWhiteBackground =
    note.bgColor &&
    (note.bgColor.toLowerCase() === '#ffffff' ||
      note.bgColor.toLowerCase() === '#fff' ||
      note.bgColor.toLowerCase() === 'white');

  return (
    <Dialog open={!!note}>
      <DialogContent
        className={cn(
          'p-0 max-w-2xl max-h-[90vh] mx-4 sm:mx-0 overflow-hidden',
          'bg-white dark:bg-gray-800',
          note.banner
            ? 'text-white'
            : isWhiteBackground
              ? 'text-black'
              : 'text-gray-900 dark:text-gray-100',
          'border-0 shadow-2xl',
          'transition-all duration-200 ease-in-out',
          '[&>button]:hidden', // This hides the default close button
          {
            'text-black [&_*]:text-black [&_input]:text-black [&_textarea]:text-black [&_button]:text-gray-500 [&_button:hover]:text-gray-700 [&_svg]:!text-white [&_button:hover_svg]:!text-white dark:[&_button]:text-gray-400 dark:[&_button:hover]:text-gray-200 dark:[&_svg]:!text-white dark:[&_button:hover_svg]:!text-white':
              isWhiteBackground,
          },
        )}
        style={{
          backgroundColor: note.bgColor || undefined,
          backgroundImage: note.bgColor
            ? undefined
            : note.banner
              ? `url(${note.banner})`
              : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onInteractOutside={onClose}
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
      >
        {note.banner && !note.bgColor && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        )}

        <div className="relative z-10 flex flex-col h-full">
          <DialogHeader className="p-4 border-b border-gray-200/30 dark:border-gray-700/50">
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
                <>
                  <DialogTitle
                    className="m-0 cursor-pointer"
                    onClick={() => setIsEditMode(true)}
                  >
                    {title || 'Note'}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-200/50 hover:dark:bg-gray-700/50 transition-colors border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:ring-0 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] min-h-[200px]">
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
                    'min-h-[200px] p-0 border-0 shadow-none',
                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'resize-none text-base leading-relaxed',
                    'text-inherit bg-transparent',
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {content && (
                  <div className="prose dark:prose-invert max-w-none">
                    {content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {paragraph || <br />}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-gray-200/30 dark:border-gray-700/50">
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
                )}
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSelectedNote;
