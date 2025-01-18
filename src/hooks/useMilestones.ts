import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { useMilestoneDialog } from './useMilestoneDialog';

import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { Milestone, Story } from '@/utils/types/Milestone';

export const useMilestones = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stories, setStories] = useState<Array<Story | null>>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { handleCloseDialog } = useMilestoneDialog();

  const fetchMilestones = async () => {
    try {
      const response = await axiosInstance.get(`/milestones`, {
        params: { projectId: project_id },
      });
      const allStories: (Story[] | null)[] = [];

      const fetchedMilestones = response.data?.data.map(
        (milestone: Milestone, index: number) => {
          if (milestone.stories && milestone.stories.length > 0) {
            const milestoneStories = milestone.stories.map((story: Story) => {
              return story;
            });

            allStories[index] = milestoneStories;
          } else {
            allStories[index] = null;
          }

          return {
            ...milestone,
            stories: milestone.stories ? milestone.stories : [],
          };
        },
      );
      setMilestones(fetchedMilestones);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setLoading(false);
    }
  };

  const handleStorySubmit = async (
    e: React.FormEvent,
    storyData: Story,
    updateMilestone: any,
    isTask: boolean = false,
    newTask: any = null,
  ) => {
    e.preventDefault();

    if (!updateMilestone) {
      console.error('Milestone ID is undefined.');
      return;
    }
    const newStory = { ...storyData };
    const updatedMilestone = updateMilestone;
    console.log(newStory);
    console.log(updatedMilestone);

    if (!updatedMilestone) {
      console.error('Milestone not found.');
      return;
    }

    let updatedStories;

    if (isTask && newTask) {
      console.log('CHECK');

      console.log(newTask);

      const storyId = newTask.storyId;
      updatedStories = updatedMilestone.stories.map((story: any) => {
        if (story._id === storyId) {
          return {
            ...story,
            tasks: [...(story.tasks || []), newTask.formData],
          };
        }
        return story;
      });
    } else {
      updatedStories = [...updatedMilestone.stories, newStory];
    }

    const milestoneData = {
      ...updatedMilestone,
      stories: updatedStories,
    };

    try {
      console.log(milestoneData);

      const response = await axiosInstance.put(
        `/milestones/${updateMilestone._id}`,
        milestoneData,
      );
      toast({
        title: 'Success',
        description: isTask
          ? 'Task added successfully!'
          : 'Story added successfully!',
      });
      const updatedMilestones = milestones.map((milestone) =>
        milestone._id === updateMilestone._id
          ? { ...milestone, stories: updatedStories }
          : milestone,
      );
      console.log(response);

      setMilestones(updatedMilestones);
      console.log(response.data.newMilestone.stories);

      setStories(response.data.newMilestone.stories);
      fetchMilestones();
    } catch (error: any) {
      console.error(
        'Error updating milestone:',
        error.response?.data || error.message,
      );
      toast({
        title: 'Error',
        description: 'Failed to update milestone.',
        variant: 'destructive',
      });
    } finally {
      handleCloseDialog();
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  return {
    milestones,
    stories,
    tasks,
    loading,
    handleStorySubmit,
    fetchMilestones,
  };
};
