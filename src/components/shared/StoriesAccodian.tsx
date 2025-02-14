import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '../ui/button';
import { Card } from '../ui/card';

import MilestoneHeader from './MilestoneHeader';
import StoryAccordionItem from './StoryAccordionItem';
import AddTaskDialog from './AddTaskDialog';
import AddStoryDialog from './AddStoryDialog';

import { Accordion } from '@/components/ui/accordion';
import { useMilestoneDialog } from '@/hooks/useMilestoneDialog';
import { Milestone, Story } from '@/utils/types/Milestone';

const StoriesAccordion = ({
  milestone,
  milestoneId,
  fetchMilestones,
  handleStorySubmit,
  isFreelancer = false,
}: {
  milestone: Milestone;
  milestoneId: string;
  fetchMilestones: any;
  handleStorySubmit: any;
  isFreelancer: boolean;
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
      <Card className="pb-5 mx-3">
        <MilestoneHeader milestone={milestone} />
        <Card
          className={` px-0 md:px-10  ${openAccordion ? 'mx-0' : 'mx-4'} md:mx-3 my-2`}
        >
          {(milestone.stories ?? []).length > 0 && (
            <div className="flex p-4 justify-between items-center mt-4">
              <h3 className="text-lg md:text-xl font-semibold">Stories:</h3>
              {!isFreelancer && (
                <Button
                  className="px-3 py-1 text-sm sm:text-base"
                  onClick={() => setIsStoryDialogOpen(true)}
                >
                  <Plus size={15} /> Add Story
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
                  milestoneId={milestone._id}
                  key={idx}
                  story={story}
                  idx={idx}
                  milestoneStoriesLength={(milestone.stories ?? []).length}
                  setIsTaskDialogOpen={setIsTaskDialogOpen}
                />
              ))
            ) : (
              <div className="text-center mt-4 p-4 rounded-md">
                {isFreelancer ? (
                  <p>
                    This {milestone.title} currently has no associated stories.
                    Please wait until the business adds a story.
                  </p>
                ) : (
                  <p>
                    This {milestone.title} currently has no associated stories.
                    Please add a story to ensure smooth progress and effective
                    tracking.
                  </p>
                )}

                {!isFreelancer && (
                  <Button
                    className="mt-2 px-3 py-1 text-sm sm:text-base"
                    onClick={() => setIsStoryDialogOpen(true)}
                  >
                    <Plus size={15} /> Add Story
                  </Button>
                )}
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
