import React, { useState } from 'react';

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
      className={`flex flex-col group-hover:bg-[#40b3ff] rounded-md   items-center gap-2 relative ${
        isMobile ? 'w-64' : 'w-48 h-20'
      } ${position === 'top' ? 'mt-[132px]' : position === 'bottom' ? '-mt-[106px]' : ''} 
          ${isSelected ? 'bg-[#11a0ff]' : 'dynamic-card'}
        `}
      style={{
        width: '200px',
        maxWidth: '100%',
        visibility: title === 'dummy' ? 'hidden' : 'visible',
      }}
    >
      {/* Milestone Content */}
      <div
        className={`text-center  border-line-bg w-full h-full rounded-md  p-4 ${
          isMobile ? 'text-base' : 'text-sm'
        }  border`}
      >
        <p className="text-xs">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h3 className={`font-bold  ${isMobile ? 'text-lg' : 'text-sm'}`}>
          {truncateDescription(title, 20)}
        </h3>
        {summary && (
          <div className="flex items-center justify-center mt-1">
            <button
              className="p-0.5 h-auto bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
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

// Lightweight in-file dialog to avoid many imports in parent
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      <DialogContent className="max-w-md w-[90vw] md:w-auto">
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
