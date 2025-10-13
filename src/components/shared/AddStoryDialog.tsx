import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            Add New Story
          </DialogTitle>
        </DialogHeader>
        <div className="mb-2 flex items-center gap-4">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Provide a clear title, a concise summary, and any important links to
            help collaborators understand the story context.
          </p>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <div className="grid sm:grid-cols-[1fr,14rem] gap-3 items-end">
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
                <div>
                  <label
                    htmlFor="storyStatus"
                    className="block text-sm font-medium mb-1"
                  >
                    Story Status
                  </label>
                  <Select
                    value={storyData.storyStatus}
                    onValueChange={(value) =>
                      handleInputChange('storyStatus', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                      <SelectItem value="ONGOING">On Going</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.storyStatus && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.storyStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
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
            <div className="sm:col-span-2">
              <label
                htmlFor="storyUrls"
                className="block text-sm font-medium mb-2"
              >
                Important URLs
              </label>
              {storyData.importantUrls.map((url, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3"
                >
                  <div className="sm:col-span-5">
                    <Input
                      type="text"
                      placeholder="URL Name (e.g., Design Doc)"
                      value={url.urlName}
                      onChange={(e) =>
                        handleInputChange(
                          'importantUrls',
                          { ...url, urlName: e.target.value },
                          index,
                        )
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <Input
                      type="text"
                      placeholder="https://example.com/path"
                      value={url.url}
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
                  <div className="sm:col-span-1 flex sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveUrl(index)}
                      className="text-red-500 hover:bg-red-500/20 hover:text-red-600 rounded-full"
                      aria-label="Remove URL"
                      size="icon"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.importantUrls && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.importantUrls}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Tip: Use clear names and full links (including https://)
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddUrl}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add another URL
                </Button>
              </div>
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
