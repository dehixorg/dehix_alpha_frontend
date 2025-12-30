import React from 'react';
import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MilestoneProps {
  date: string;
  title: string;
  summary?: string;
  position: 'top' | 'bottom' | 'center';
  isMobile?: boolean; // Add isMobile prop
  isSelected: boolean;
}

const MilestoneCards: React.FC<MilestoneProps> = ({
  date,
  title,
  summary,
  position,
  isMobile,
  isSelected,
}) => {
  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center',
        isMobile ? 'w-64' : 'w-48',
        position === 'top' ? 'mt-32' : position === 'bottom' ? '-mt-28' : '',
      )}
      style={{
        visibility: title === 'dummy' ? 'hidden' : 'visible',
      }}
    >
      <Card
        className={cn(
          'group relative w-full rounded-xl border bg-card/80 p-3 backdrop-blur-sm transition-all',
          'hover:-translate-y-[1px] hover:shadow-md',
          isSelected
            ? 'border-primary/40 ring-2 ring-primary/30 shadow-md'
            : 'border-border/60',
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'min-w-0 font-semibold leading-snug truncate',
                isMobile ? 'text-base md:text-lg' : 'text-sm',
              )}
              title={title}
            >
              {truncateDescription(title, 10)}
            </h3>
            {summary && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="View description"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 text-sm whitespace-pre-wrap leading-relaxed">
                  <div className="space-y-1">
                    <h2 className="font-semibold">{title}</h2>
                    <p>{summary}</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-[10px] md:text-xs text-muted-foreground">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default MilestoneCards;
