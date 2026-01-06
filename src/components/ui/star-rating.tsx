'use client';
import React from 'react';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  interactive = true,
}) => {
  return (
    <div
      className={cn('flex items-center gap-1', !interactive && 'opacity-90')}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            role="radio"
            aria-checked={selected}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => interactive && onRatingChange(star)}
            className={cn(
              'rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              interactive
                ? 'hover:bg-accent disabled:cursor-not-allowed'
                : 'cursor-default',
            )}
          >
            <Star
              size={size}
              className={cn(
                'transition-colors',
                selected
                  ? 'fill-primary text-primary'
                  : 'fill-muted text-muted-foreground/40',
                interactive && 'hover:fill-primary hover:text-primary',
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
