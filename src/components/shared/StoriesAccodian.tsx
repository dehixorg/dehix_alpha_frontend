import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

import MilestoneHeader from './MilestoneHeader';
import StoryAccordionItem from './StoryAccordionItem';
import AddTaskDialog from './AddTaskDialog';
import AddStoryDialog from './AddStoryDialog';

import { Accordion } from '@/components/ui/accordion';
import { useMilestoneDialog } from '@/hooks/useMilestoneDialog';
import { Milestone, Story } from '@/utils/types/Milestone';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
  ) => {
    const { name, value } =
      typeof e === 'string' ? { name: 'taskStatus', value: e } : e.target;
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
      <Card className="pb-5 mx-3 bg-muted/10 dark:bg-muted/20 border shadow-sm">
        <MilestoneHeader milestone={milestone} />

        <Card className={`${openAccordion ? 'mx-0' : 'mx-4'} md:mx-6`}>
          {(milestone.stories ?? []).length > 0 && (
            <div className="flex p-4 justify-between items-center mt-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg md:text-xl font-semibold">Stories</h3>
                <Badge variant="secondary" className="rounded-full">
                  {(milestone.stories ?? []).length} total
                </Badge>
              </div>
              {!isFreelancer && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsStoryDialogOpen(true)}
                >
                  <Plus size={13} className="mr-1" /> Add Story
                </Button>
              )}
            </div>
          )}
          <Accordion
            type="single"
            collapsible
            value={openAccordion}
            onValueChange={(value) => setOpenAccordion(value)}
            className="pt-4 px-0"
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
              <div className="mt-4 p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 rounded-lg border bg-card text-card-foreground p-6">
                  <div className="w-full md:w-auto order-2 md:order-1 text-center md:text-left">
                    {isFreelancer ? (
                      <>
                        <h4 className="text-lg font-semibold">
                          No stories yet
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          This &ldquo;{milestone.title}&rdquo; milestone
                          doesn&apos;t have any stories yet. The business will
                          add them soon.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-lg font-semibold">
                          Start by adding a story
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          This &ldquo;{milestone.title}&rdquo; milestone
                          currently has no stories. Create one to track tasks
                          and progress.
                        </p>
                      </>
                    )}

                    {!isFreelancer && (
                      <Button
                        className="mt-3 px-3 py-1 text-sm sm:text-base rounded-full"
                        onClick={() => setIsStoryDialogOpen(true)}
                      >
                        <Plus size={15} className="mr-1" /> Add Story
                      </Button>
                    )}
                  </div>
                  <div className="order-1 md:order-2">
                    <Image
                      src="/banner4.svg"
                      alt="Empty state illustration"
                      width={220}
                      height={120}
                      className="opacity-90 select-none pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </Accordion>
        </Card>
      </Card>

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
