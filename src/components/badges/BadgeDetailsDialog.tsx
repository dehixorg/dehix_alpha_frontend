'use client';

import Image from 'next/image';
import { Trophy } from 'lucide-react';

import { BadgeItem } from '@/types/gamification';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type BadgeDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: BadgeItem | null;
  isLoading?: boolean;
  error?: string | null;
};

export function BadgeDetailsDialog({
  open,
  onOpenChange,
  badge,
  isLoading = false,
  error = null,
}: BadgeDetailsDialogProps) {
  if (!badge) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      );
    }

    return (
      <>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                badge.isActive
                  ? 'bg-primary/10'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Trophy
                className={`w-10 h-10 ${
                  badge.isActive
                    ? 'text-primary'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {badge.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={badge.isActive ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {badge.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {badge.earnedAt && (
                  <span className="text-sm text-muted-foreground">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {badge.imageUrl && (
            <div className="flex justify-center py-4">
              <Image
                src={badge.imageUrl || '/images/placeholder-badge.svg'}
                alt={badge.name}
                width={128}
                height={128}
                className="h-32 w-32 object-contain"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Description</h4>
              <p className="text-sm text-muted-foreground">
                {badge.description || 'No description available.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">Badge</p>
              </div>
              {badge.priority !== undefined && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="text-sm font-medium">{badge.priority}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
