'use client';

import { HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  onThisPageTour: () => void;
  onFullPlatformTour: () => void;
};

export default function PlatformTourMenu({
  onThisPageTour,
  onFullPlatformTour,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Tour
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onFullPlatformTour}>
          Platform Tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onThisPageTour}>Page tour</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
