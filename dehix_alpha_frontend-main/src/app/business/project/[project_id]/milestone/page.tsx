'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Button } from '@/components/ui/button';
import { CreateMilestoneDialog } from '@/components/shared/CreateMilestoneDialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import { Milestone, Story } from '@/utils/types/Milestone';

const Page = () => {
  const { project_id } = useParams<{ project_id: string }>();

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/milestones`, {
        params: { projectId: project_id },
      });

      const allStories: { [key: string]: Story[] | null } = {};
      const fetchedMilestones = response.data?.data.map(
        (milestone: Milestone) => {
          const storiesForMilestone = milestone.stories?.length
            ? milestone.stories
            : null;

          if (milestone._id) {
            allStories[milestone._id] = storiesForMilestone;
          }

          return {
            ...milestone,
            stories: storiesForMilestone || [], // Use empty array if no stories
          };
        },
      );

      setMilestones(fetchedMilestones);
      setLoading(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
      console.error('Error fetching milestones:', error);
      setLoading(false);
    }
  }, [project_id]);

  const handleStorySubmit = async (
    e: React.FormEvent,
    storyData: Story,
    updateMilestone: Milestone,
    isTask = false,
    newTask: any = null,
  ) => {
    e.preventDefault();

    if (!updateMilestone) {
      console.error('Milestone ID is undefined.');
      return;
    }

    const updatedStories =
      isTask && newTask
        ? (updateMilestone.stories ?? []).map((story) => {
            if (story._id === newTask.storyId) {
              return {
                ...story,
                tasks: [...(story.tasks || []), newTask.formData],
              };
            }
            return story;
          })
        : [...(updateMilestone.stories || []), storyData];

    const milestoneData = {
      ...updateMilestone,
      stories: updatedStories,
    };

    try {
      await axiosInstance.put(
        `/milestones/${updateMilestone._id}`,
        milestoneData,
      );

      toast({
        title: 'Success',
        description: isTask
          ? 'Task added successfully!'
          : 'Story added successfully!',
        duration: 3000,
      });

      fetchMilestones();
    } catch (error) {
      console.error(
        'Error updating milestone:',
        (error as any).response?.data || (error as any).message,
      );
      toast({
        title: 'Error',
        description: 'Failed to update milestone.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return (
    <div className="flex min-h-screen h-auto w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/business' },
            { label: 'Project', link: '/dashboard/business' },
            { label: project_id, link: `/business/project/${project_id}` },
            { label: 'Milestone', link: '#' },
          ]}
        />
        <div className="py-8 px-2 md:px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">
              Project Milestones
            </h1>

            <Button className="px-3 py-1 ">
              <CreateMilestoneDialog
                projectId={project_id}
                fetchMilestones={fetchMilestones}
              />
            </Button>
          </div>
          <div className="w-full flex justify-center items-center">
            {loading ? (
              <p>Loading milestones...</p>
            ) : milestones.length > 0 ? (
              <MilestoneTimeline
                fetchMilestones={fetchMilestones}
                milestones={milestones}
                handleStorySubmit={handleStorySubmit}
              />
            ) : (
              <div className="flex justify-center items-center h-[50vh]">
                No milestones found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
