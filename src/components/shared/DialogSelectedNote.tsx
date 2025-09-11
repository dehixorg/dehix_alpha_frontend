'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Save, Clock } from 'lucide-react';

import { Note } from '@/utils/types/note';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'p-0 max-w-2xl max-h-[90vh] mx-4 sm:mx-0 overflow-hidden',
          'bg-white dark:bg-gray-800',
          note.banner ? 'text-white' : 'text-gray-900 dark:text-gray-100',
          'border-0 shadow-2xl',
          'transition-all duration-200 ease-in-out',
        )}
        style={{
          backgroundColor: note.bgColor || undefined,
          backgroundImage: note.banner ? `url(${note.banner})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {note.banner && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <DialogHeader className="p-4 border-b border-gray-200/30 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between">
                <div className="flex-1">
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
                        'h-auto px-0',
                      )}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <DialogTitle
                        className="text-sm font-medium cursor-text"
                        onClick={() => setIsEditMode(true)}
                      >
                        {title || 'Note'}
                      </DialogTitle>
                      {note.type && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal capitalize border-gray-300 dark:border-gray-600"
                        >
                          {note.type}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
