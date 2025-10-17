import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';

interface DeleteIconButtonProps {
  onDelete: () => Promise<void> | void;
  ariaLabel?: string;
  className?: string;
  stopPropagation?: boolean;
  iconOnly?: boolean; // when false, renders a labeled destructive button
  label?: string; // used when iconOnly is false
  disabled?: boolean;
  // Confirmation dialog content
  confirmTitle?: string;
  confirmDescription?: string;
  confirmText?: string;
  cancelText?: string;
  requireConfirm?: boolean; // when false, executes delete immediately
}

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({
  onDelete,
  ariaLabel = 'Delete',
  className,
  stopPropagation = true,
  iconOnly = true,
  label = 'Delete',
  disabled,
  confirmTitle = 'Delete',
  confirmDescription = 'Are you sure you want to delete? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  requireConfirm = true,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (loading || disabled) return;
    if (requireConfirm) {
      setOpen(true);
      return;
    }
    try {
      setLoading(true);
      await onDelete();
    } finally {
      setLoading(false);
    }
  };

  if (!iconOnly) {
    return (
      <>
        <Button
          aria-label={ariaLabel}
          onClick={handleClick}
          disabled={loading || disabled}
          variant="destructive"
          className={cn(className)}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {label}
            </span>
          ) : (
            label
          )}
        </Button>
        <DeleteConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title={confirmTitle}
          description={confirmDescription}
          confirmText={confirmText}
          cancelText={cancelText}
          onConfirm={async () => {
            try {
              setLoading(true);
              await onDelete();
              setOpen(false);
            } finally {
              setLoading(false);
            }
          }}
          confirmLoading={loading}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 bg-red-400/10 hover:bg-red-400/20 rounded-full',
          className,
        )}
        aria-label={ariaLabel}
        onClick={handleClick}
        disabled={loading || disabled}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-red-500" />
        )}
      </Button>
      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={async () => {
          try {
            setLoading(true);
            await onDelete();
            setOpen(false);
          } finally {
            setLoading(false);
          }
        }}
        confirmLoading={loading}
      />
    </>
  );
};

export default DeleteIconButton;
