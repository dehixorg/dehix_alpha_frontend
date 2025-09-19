import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ProjectTypeDialogProps {
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ProjectTypeDialog({
  trigger,
  onOpenChange,
}: ProjectTypeDialogProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button size="sm" className="h-8 gap-1">
      <Plus className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        New Project
      </span>
    </Button>
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Choose Project Type</h2>
        <div className="flex gap-4 items-center justify-around">
          <Link href="/business/add-project?mode=single" className="w-full">
            <Button className="w-full">Single Profile</Button>
          </Link>
          <Link href="/business/add-project?mode=multiple" className="w-full">
            <Button className="w-full">Multiple Profiles</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
