import React, { useState } from 'react';

import { Badge } from '../ui/badge';

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

  return (
    <CardHeader>
      <CardTitle className="text-lg md:text-xl font-bold flex justify-between items-center">
        <div className="flex items-center">
          <p>Milestone: {milestone.title}</p>
          <button
            className="p-1 h-auto flex-shrink-0 bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsDescOpen(true);
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
        <p>
          <Badge
            className={`${MilestoneStatusBadgeStyle} px-3 py-1 hidden md:flex text-xs md:text-sm rounded-full`}
          >
            {MilestoneStatus}
          </Badge>
        </p>
      </CardTitle>
      <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
        <DialogContent className="max-w-lg w-[90vw] md:w-auto">
          <DialogHeader>
            <DialogTitle>Description</DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm whitespace-pre-wrap leading-relaxed mt-2">
                {milestone.description || 'No description provided.'}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </CardHeader>
  );
};

export default MilestoneHeader;
