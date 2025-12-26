import React, { useState } from 'react';
import { ClipboardPlus, Plus } from 'lucide-react';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import StoryAccordionItem from './StoryAccordionItem';
import AddTaskDialog from './AddTaskDialog';
import AddStoryDialog from './AddStoryDialog';

import { Accordion } from '@/components/ui/accordion';
import { useMilestoneDialog } from '@/hooks/useMilestoneDialog';
import { Milestone, Story } from '@/utils/types/Milestone';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const StoriesAccordion = ({
  milestone,
  fetchMilestones,
  handleStorySubmit,
  isFreelancer = false,
  freelancerId,
}: {
  milestone: Milestone;
  fetchMilestones: any;
  handleStorySubmit: any;
  isFreelancer: boolean;
  freelancerId?: string;
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    title: '',
    taskStatus: 'NOT_STARTED',
    freelancers: [{ freelancerId: '', freelancerName: '', cost: 0 }],
  });
  const [storyData, setStoryData] = useState<Story>({
    title: '',
    summary: '',
    storyStatus: '',
    tasks: [],
    importantUrls: [{ urlName: '', url: '' }],
  });

  const { handleRemoveUrl, handleAddUrl, handleStoryInputChange } =
    useMilestoneDialog({ setStoryData });

  const resetFields = () => {
    setStoryData({
      title: '',
      summary: '',
      storyStatus: '',
      tasks: [],
      importantUrls: [{ urlName: '', url: '' }],
    });
  };

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } },
  ) => {
    const { name, value } =
      'target' in event ? event.target : { name: 'taskStatus', value: event };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFreelancerSelect = (freelancer: {
    _id: string;
    userName: string;
    perHourPrice: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      freelancers: [
        {
          freelancerId: freelancer._id,
          freelancerName: freelancer.userName,
          cost: Number(freelancer.perHourPrice),
        },
      ],
    }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedFormData = { formData, storyId: openAccordion };

    if (milestone.stories) {
      const story = milestone.stories.find(
        (story: Story) => story._id === openAccordion,
      );
      if (story) {
        handleStorySubmit(e, story, milestone, true, updatedFormData);
      }
    }

    setFormData({
      summary: '',
      title: '',
      taskStatus: 'NOT_STARTED',
      freelancers: [{ freelancerId: '', freelancerName: '', cost: 0 }],
    });
    setIsTaskDialogOpen(false);
  };

  return (
    <div className="w-full px-0 md:px-0 lg:px-0 py-3 md:py-6 max-w-5xl mx-auto rounded-lg">
      <div
        className={`${openAccordion ? 'mx-0' : 'mx-4'} md:mx-6 card border rounded-lg`}
      >
        {(milestone.stories ?? []).length > 0 && (
          <div className="flex p-4 justify-between items-center border-b bg-gradient">
            <div className="flex items-center gap-3">
              <h3 className="text-lg md:text-xl font-semibold">Stories</h3>
              <Badge variant="secondary" className="rounded-full">
                {(milestone.stories ?? []).length} total
              </Badge>
            </div>
            {!isFreelancer && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setIsStoryDialogOpen(true)}
                      aria-label="Add a new story"
                    >
                      <Plus size={13} /> Add Story
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Create a new story
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <Accordion
          type="single"
          collapsible
          value={openAccordion}
          onValueChange={(value) => setOpenAccordion(value)}
        >
          {(milestone.stories ?? []).length > 0 ? (
            (milestone.stories ?? []).map((story: Story, idx: number) => (
              <StoryAccordionItem
                fetchMilestones={fetchMilestones}
                isFreelancer={isFreelancer}
                freelancerId={freelancerId}
                milestoneId={milestone._id}
                key={idx}
                story={story}
                idx={idx}
                milestoneStoriesLength={(milestone.stories ?? []).length}
                setIsTaskDialogOpen={setIsTaskDialogOpen}
              />
            ))
          ) : (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-full md:w-auto order-2 md:order-1 text-center md:text-left">
                  {isFreelancer ? (
                    <>
                      <h4 className="text-lg font-semibold">No stories yet</h4>
                      <p className="text-sm text-muted-foreground">
                        This &ldquo;{milestone.title}&rdquo; milestone
                        doesn&apos;t have any stories yet. The business will add
                        them soon.
                      </p>
                    </>
                  ) : (
                    <div className="mx-auto">
                      <h4 className="text-lg font-semibold">
                        Start by adding a story
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This &ldquo;{milestone.title}&rdquo; milestone currently
                        has no stories. Create one to track tasks and progress.
                      </p>
                    </div>
                  )}
                </div>
                <div className="order-1 md:order-2 sm:ml-auto">
                  {!isFreelancer && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            className="rounded-full h-24 w-24 border-2 border-dashed flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/60 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => setIsStoryDialogOpen(true)}
                            aria-label="Create the first story"
                          >
                            <ClipboardPlus className="h-8 w-8" />
                            <span>Add Story</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Create the first story
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          )}
        </Accordion>
      </div>

      {isTaskDialogOpen && (
        <AddTaskDialog
          isDialogOpen={isTaskDialogOpen}
          setIsDialogOpen={setIsTaskDialogOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handelSubmit={handleFormSubmit}
          handleFreelancerSelect={handleFreelancerSelect}
        />
      )}

      {isStoryDialogOpen && (
        <AddStoryDialog
          isDialogOpen={isStoryDialogOpen}
          setIsDialogOpen={setIsStoryDialogOpen}
          handleInputChange={handleStoryInputChange}
          handleCloseDialog={() => setIsStoryDialogOpen(false)}
          storyData={storyData}
          resetFields={resetFields}
          handleRemoveUrl={handleRemoveUrl}
          handleAddUrl={handleAddUrl}
          milestones={milestone}
          handleStorySubmit={handleStorySubmit}
        />
      )}
    </div>
  );
};

export default StoriesAccordion;
