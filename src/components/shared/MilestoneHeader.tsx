import React, { useState } from 'react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusBadge } from '@/utils/statusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Milestone {
  title: string;
  status: string;
  description: string;
}

const MilestoneHeader = ({ milestone }: { milestone: Milestone }) => {
  const { text: MilestoneStatus, className: MilestoneStatusBadgeStyle } =
    getStatusBadge(milestone.status);
  const [isDescOpen, setIsDescOpen] = useState(false);

  const preview = (milestone.description || 'No description provided.').slice(
    0,
    120,
  );

  return (
    <CardHeader className="relative overflow-hidden">
      <CardTitle className="text-lg md:text-xl font-bold flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate">Milestone: {milestone.title}</p>
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer rounded-full flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsDescOpen(true);
              }}
              aria-label="View milestone description"
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
            </Button>
          </div>
          <Badge
            className={`${MilestoneStatusBadgeStyle} px-3 py-1 text-xs md:text-sm rounded-full`}
          >
            {MilestoneStatus}
          </Badge>
        </div>

        {/* Preview line */}
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <p className="truncate">
            {preview}
            {(milestone.description || '').length > 120 && '…'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsDescOpen(true);
            }}
          >
            Details
          </Button>
        </div>
      </CardTitle>

      {/* Description dialog with subtle illustration */}
      <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
        <DialogContent className="max-w-lg w-[90vw] md:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Milestone details</span>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm leading-relaxed mt-2">
                <div className="mb-3 opacity-90">
                  <svg
                    width="200"
                    height="60"
                    viewBox="0 0 200 60"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="mx-auto"
                  >
                    <defs>
                      <linearGradient
                        id="ms-grad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(var(--accent-foreground))"
                          stopOpacity="0.18"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 45 C 40 10, 120 10, 200 35"
                      fill="none"
                      stroke="url(#ms-grad)"
                      strokeWidth="3"
                    />
                    <circle cx="40" cy="30" r="4" fill="hsl(var(--primary))" />
                    <circle cx="130" cy="22" r="4" fill="hsl(var(--accent))" />
                  </svg>
                </div>
                <div className="whitespace-pre-wrap">
                  {milestone.description || 'No description provided.'}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </CardHeader>
  );
};

export default MilestoneHeader;
