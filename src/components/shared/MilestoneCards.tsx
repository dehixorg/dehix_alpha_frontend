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

const formatDateDisplay = (val: string) => {
  if (!val) return '';
  if (val.includes('-') || val.includes(',')) {
    return val;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MilestoneCards: React.FC<MilestoneProps> = ({
  date,
  title,
  summary,
  position,
  isMobile,
  isSelected,
}) => {
  const formattedDate = formatDateDisplay(date);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center transition-all',
        isMobile
          ? 'w-full max-w-[280px]'
          : 'min-w-[200px] max-w-[320px] w-auto h-auto',
        position === 'top' ? 'mt-32' : position === 'bottom' ? '-mt-28' : '',
      )}
      style={{
        visibility: title === 'dummy' ? 'hidden' : 'visible',
      }}
    >
      <Card
        className={cn(
          'group relative w-full h-auto rounded-xl border bg-card/90 p-4 backdrop-blur-md transition-all cursor-pointer shadow-sm',
          'hover:-translate-y-[2px] hover:shadow-lg',
          isSelected
            ? 'border-primary ring-2 ring-primary/40 shadow-md bg-card'
            : 'border-border/60 hover:border-primary/40',
        )}
      >
        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex items-start justify-between gap-2.5 w-full">
            <h3
              className={cn(
                'font-bold leading-snug text-foreground whitespace-normal break-words',
                isMobile ? 'text-base' : 'text-xs md:text-sm',
              )}
              title={title}
            >
              {title}
            </h3>
            {summary && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="View description"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm whitespace-pre-wrap leading-relaxed p-4 bg-card border border-border shadow-xl rounded-xl">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground">{title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {formattedDate ? (
            <span className="inline-flex w-fit items-center rounded-full bg-muted/80 px-2.5 py-0.5 text-[10px] md:text-xs text-muted-foreground font-medium border border-border/40 shrink-0">
              {formattedDate}
            </span>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default MilestoneCards;
