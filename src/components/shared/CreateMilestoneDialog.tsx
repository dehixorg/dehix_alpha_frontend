import React from 'react';
import { Plus } from 'lucide-react';

import { ScrollArea } from '../ui/scroll-area';

import MilestoneForm from './MilestoneForm';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateMilestoneDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          {' '}
          <Plus className="mr-2" />
          Milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ScrollArea className="flex justify-center items-center max-h-[90vh] p-4 custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Create Milestone</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new milestone.
            </DialogDescription>
          </DialogHeader>
          <MilestoneForm />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
