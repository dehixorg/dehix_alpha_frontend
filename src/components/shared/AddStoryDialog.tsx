import React, { useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '../ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Story } from '@/utils/types/Milestone';

interface AddStoryDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  handleInputChange: (
    field: string,
    value: string | { urlName: string; url: string },
    index?: number,
  ) => void;
  handleCloseDialog: () => void;
  handleStorySubmit: (
    e: React.FormEvent,
    storyData: Story,
    milestone: string,
  ) => void;
  storyData: Story;
  handleRemoveUrl: (index: number) => void;
  handleAddUrl: () => void;
  milestones: any;
  resetFields: () => void;
}

const AddStoryDialog: React.FC<AddStoryDialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  handleInputChange,
  handleCloseDialog,
  handleStorySubmit,
  storyData,
  handleRemoveUrl,
  handleAddUrl,
  milestones,
  resetFields,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!storyData.title.trim()) {
      newErrors.title = 'Story title is required.';
    }

    if (!storyData.summary.trim()) {
      newErrors.summary = 'Summary is required.';
    }

    if (
      storyData.importantUrls.some(
        (url) => !url.urlName.trim() || !url.url.trim(),
      )
    ) {
      newErrors.importantUrls = 'All URL fields are required.';
    }

    if (!storyData.storyStatus) {
      newErrors.storyStatus = 'Story status is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFields()) {
      handleStorySubmit(e, storyData, milestones);
      resetFields();
      handleCloseDialog();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-6">
            {/* Story Title */}
            <div>
              <label
                htmlFor="storyTitle"
                className="block text-sm font-medium mb-1"
              >
                Story Title
              </label>
              <Input
                placeholder="Enter story title"
                value={storyData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="storySummary"
                className="block text-sm font-medium mb-1"
              >
                Summary
              </label>
              <Textarea
                placeholder="Enter summary"
                value={storyData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                required
              />
              {errors.summary && (
                <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
              )}
            </div>

            {/* Important URLs */}
            <div>
              <label
                htmlFor="storyUrls"
                className="block text-sm font-medium mb-2"
              >
                Important URLs
              </label>
              {storyData.importantUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-3 mb-2">
                  <div className="flex w-full items-center gap-2">
                    <Input
                      type="text"
                      placeholder="URL Name"
                      value={url.urlName}
                      // className={`transition-all duration-300 ${focusedInput === `urlName-${index}` ? 'w-4/5' : 'w-1/5'}`}
                      className="w-1/2"
                      onChange={(e) =>
                        handleInputChange(
                          'importantUrls',
                          { ...url, urlName: e.target.value },
                          index,
                        )
                      }
                      required
                    />
                    <Input
                      type="text"
                      placeholder="URL"
                      value={url.url}
                      className="w-1/2"
                      onChange={(e) =>
                        handleInputChange(
                          'importantUrls',
                          { ...url, url: e.target.value },
                          index,
                        )
                      }
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveUrl(index)}
                    className="text-red-500 px-1"
                  >
                    <X />
                  </Button>
                </div>
              ))}
              {errors.importantUrls && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.importantUrls}
                </p>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddUrl}
                className="mt-2"
              >
                Add URL
              </Button>
            </div>

            {/* Story Status */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="storyStatus"
                className="text-sm flex justify-center items-center font-medium mb-2 w-1/4"
              >
                Story Status
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-3/4" variant="outline">
                    {storyData.storyStatus
                      ? {
                          NOT_STARTED: 'Not Started',
                          ONGOING: 'On Going',
                          COMPLETED: 'Completed',
                        }[storyData.storyStatus]
                      : 'Select Status'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      handleInputChange('storyStatus', 'NOT_STARTED')
                    }
                  >
                    Not Started
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleInputChange('storyStatus', 'ONGOING')}
                  >
                    On Going
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleInputChange('storyStatus', 'COMPLETED')
                    }
                  >
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.storyStatus && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.storyStatus}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStoryDialog;
