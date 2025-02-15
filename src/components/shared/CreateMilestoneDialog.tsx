import React from 'react';
import { Plus } from 'lucide-react';

import MilestoneForm from './MilestoneForm';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreateMilestoneDialogProps {
  projectId: string;
  fetchMilestones: () => void;
}

export function CreateMilestoneDialog({
  projectId,
  fetchMilestones,
}: CreateMilestoneDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="hover:bg-transparent">
          <Plus className="mr-2" />
          Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-[80vw] md:w-1/3 p-4 no-scrollbar overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Milestone</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new milestone.
          </DialogDescription>
        </DialogHeader>
        <MilestoneForm
          projectId={projectId}
          fetchMilestones={fetchMilestones}
          closeDialog={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
