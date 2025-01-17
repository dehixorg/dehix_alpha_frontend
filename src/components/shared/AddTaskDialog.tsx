import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface AddTaskDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  formData: {
    title: string;
    summary: string;
    taskStatus: string;
  };
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
  ) => void;
  handelSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  formData,
  handleInputChange,
  handelSubmit,
}) => {
  const [errors, setErrors] = useState({
    title: false,
    summary: false,
    taskStatus: false,
  });

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim(),
      summary: !formData.summary.trim(),
      taskStatus: !formData.taskStatus,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      handelSubmit(e);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4 p-4">
            {/* Task Title */}
            <label htmlFor="title" className="block text-sm font-medium">
              Task Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={`${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                Task title is required.
              </p>
            )}

            {/* Task Summary */}
            <label htmlFor="summary" className="block text-sm font-medium">
              Task Summary
            </label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="Task Summary"
              value={formData.summary}
              onChange={handleInputChange}
              required
              className={`${errors.summary ? 'border-red-500' : ''}`}
            />
            {errors.summary && (
              <p className="text-red-500 text-xs mt-1">
                Task summary is required.
              </p>
            )}

            {/* Task Status */}
            <label htmlFor="taskStatus" className="block text-sm font-medium">
              Task Status
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`w-full p-2 border rounded-md text-left ${errors.taskStatus ? 'border-red-500' : ''}`}
                  type="button"
                >
                  {formData.taskStatus
                    ? {
                        NOT_STARTED: 'Not Started',
                        ONGOING: 'On Going',
                        COMPLETED: 'Completed',
                      }[formData.taskStatus]
                    : 'Select Status'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => handleInputChange('NOT_STARTED')}
                >
                  Not Started
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleInputChange('ONGOING')}>
                  On Going
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleInputChange('COMPLETED')}
                >
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.taskStatus && (
              <p className="text-red-500 text-xs mt-1">
                Task status is required.
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="submit">Add Task</Button>
            <Button
              type="button"
              variant="secondary"
              className="mb-3"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
