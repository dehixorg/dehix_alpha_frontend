import React, { useState } from 'react';
import { Info, FileText } from 'lucide-react';
import Image from 'next/image';

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
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Milestone {
  title: string;
  status: string;
  description: string;
}

const MilestoneHeader = ({ milestone }: { milestone: Milestone }) => {
  const { text: MilestoneStatus } = getStatusBadge(milestone.status);
  const [isDescOpen, setIsDescOpen] = useState(false);

  return (
    <CardHeader className="relative overflow-hidden bg-gradient border-b mb-4">
      <CardTitle className="text-lg md:text-xl font-bold flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate">Milestone: {milestone.title}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">View details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge
            className={`${statusOutlineClasses(milestone.status)} flex items-center gap-1`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
            {MilestoneStatus}
          </Badge>
        </div>
      </CardTitle>

      {/* Description dialog with subtle illustration */}
      <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Milestone details
            </DialogTitle>
            <DialogDescription asChild>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-5">
                <div className="order-2 sm:order-1 sm:col-span-3 text-sm leading-relaxed">
                  <div className="whitespace-pre-wrap">
                    {milestone.description || 'No description provided.'}
                  </div>
                </div>
                <div className="order-1 sm:order-2 sm:col-span-2">
                  <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28">
                    <Image
                      src="/banner1.svg"
                      alt="Milestone illustration"
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 96px, 112px"
                      loading="lazy"
                    />
                  </div>
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
