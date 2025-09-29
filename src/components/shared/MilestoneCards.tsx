import React, { useState } from 'react';
import { Info } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [isOpen, setIsOpen] = useState(false);
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
          <div className="flex flex-row items-center justify-between w-1/2">
            <h3
              className={`font-semibold truncate ${isMobile ? 'text-lg' : 'text-sm'}`}
              title={title}
            >
              {truncateDescription(title, 20)}
            </h3>
            {summary && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                      }}
                      aria-label="View description"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View description</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
      {/* Dialog for description */}
      {/* Lazy import to avoid circular deps */}
      {isOpen && (
        <DescriptionDialog
          title="Description"
          content={summary || ''}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </div>
  );
};

export default MilestoneCards;

function DescriptionDialog({
  title,
  content,
  open,
  onOpenChange,
}: {
  title: string;
  content: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm whitespace-pre-wrap leading-relaxed mt-2">
              {content}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
