import React from 'react';
import { Info, Calendar } from 'lucide-react';

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
        'relative flex flex-col items-center transition-all w-full',
        isMobile ? 'max-w-[280px]' : 'min-w-[220px] max-w-[300px] h-[130px]',
      )}
      style={{
        visibility: title === 'dummy' ? 'hidden' : 'visible',
      }}
    >
      <Card
        className={cn(
          'group relative w-full h-full rounded-xl border bg-card/95 p-3.5 backdrop-blur-md transition-all cursor-pointer shadow-sm flex flex-col justify-between',
          'hover:-translate-y-[1px] hover:shadow-md',
          isSelected
            ? 'border-primary ring-2 ring-primary/40 shadow-md bg-card'
            : 'border-border/60 hover:border-primary/40',
        )}
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <h3
            className={cn(
              'font-bold leading-snug text-foreground whitespace-normal break-words line-clamp-2',
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
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {summary}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {formattedDate ? (
          <div className="pt-1 mt-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[10px] md:text-[11px] font-semibold tracking-tight shrink-0 shadow-2xs">
              <Calendar className="w-3 h-3 text-primary shrink-0" />
              <span>{formattedDate}</span>
            </span>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default MilestoneCards;
