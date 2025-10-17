import React from 'react';
import { Info } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusBadge } from '@/utils/statusBadge';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Milestone {
  title: string;
  status: string;
  description: string;
}

const MilestoneHeader = ({ milestone }: { milestone: Milestone }) => {
  const { text: MilestoneStatus } = getStatusBadge(milestone.status);

  return (
    <CardHeader className="relative overflow-hidden bg-gradient border-b mb-4">
      <CardTitle className="text-lg md:text-xl font-bold flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate">Milestone: {milestone.title}</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer rounded-full flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View milestone description"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm whitespace-pre-wrap leading-relaxed">
                <div className="flex items-start gap-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{milestone.title}</h3>
                    <p>{milestone.description || 'No description provided.'}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Badge
            className={`${statusOutlineClasses(milestone.status)} flex items-center gap-1`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
            {MilestoneStatus}
          </Badge>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default MilestoneHeader;
