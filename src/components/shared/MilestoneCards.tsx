import React from 'react';
import { Info } from 'lucide-react';

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
      className={`flex flex-col group-hover:bg-card rounded-md items-center gap-2 relative ${
        isMobile ? 'w-64' : 'w-48'
      } ${position === 'top' ? 'mt-[132px]' : position === 'bottom' ? '-mt-32' : ''} 
          ${isSelected ? 'bg-card shadow-md' : 'dynamic-card'}
        `}
      style={{
        width: '200px',
        visibility: title === 'dummy' ? 'hidden' : 'visible',
      }}
    >
      {/* Milestone Content */}
      <Card
        className={`relative w-full h-full rounded-md p-3 md:p-4 hover:shadow-md ${isSelected ? 'border' : ''}`}
      >
        {/* Date chip + Title + Action */}
        <div className="flex flex-col items-center justify-between gap-2 mb-2">
          <div className="flex flex-row items-center justify-between w-full px-2">
            <h3
              className={`font-semibold truncate ${isMobile ? 'text-lg' : 'text-sm'}`}
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
                    className="rounded-full"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="View description"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 text-sm whitespace-pre-wrap leading-relaxed">
                  <h2 className="font-semibold">{title}</h2>
                  <p>{summary}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] md:text-xs text-muted-foreground">
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
