'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import StoriesSection from '@/components/shared/StoriesSection';
import FreelancerList from '@/components/freelancer/FreelancerList';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { toast } from '@/components/ui/use-toast';
import { Milestone, Story } from '@/utils/types/Milestone';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

const Page = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [projectName, setProjectName] = useState<string>('');

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
    number | null
  >(0);

  // Handle chat with other freelancers
  const handleChatClick = useCallback(
    async (freelancerId: string, freelancerName: string) => {
      if (!user?.uid) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You must be logged in to start a chat.',
        });
        return;
      }

      try {
        try {
          await axiosInstance.get(`/public/freelancer/${freelancerId}`);
        } catch (error) {
          console.error('Failed to fetch freelancer details:', error);
        }

        router.push('/chat');

        toast({
          title: 'Chat',
          description: `Opening chat with ${freelancerName}...`,
        });
      } catch (error) {
        console.error('Error opening chat:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to open chat. Please try again.',
        });
      }
    },
    [router, user],
  );

  const fetchMilestones = useCallback(async () => {
    try {
      const [milestonesResponse, projectResponse] = await Promise.all([
        axiosInstance.get(`/milestones`, {
          params: { projectId: project_id },
        }),
        axiosInstance.get(`/project/${project_id}`),
      ]);

      // Fetch project name
      const projectData =
        projectResponse?.data?.data?.data || projectResponse?.data?.data;
      if (projectData) {
        setProjectName(projectData.projectName);
      }

      const allStories: { [key: string]: Story[] | null } = {};
      const fetchedMilestones = milestonesResponse.data?.data.map(
        (milestone: Milestone) => {
          const storiesForMilestone = milestone.stories?.length
            ? milestone.stories
            : null;

          if (milestone._id) {
            allStories[milestone._id] = storiesForMilestone;
          }

          return {
            ...milestone,
            stories: storiesForMilestone || [],
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
    <div className="flex h-auto w-full flex-col bg-muted/40 overflow-x-hidden">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 md:py-0 sm:py-4 sm:pl-14 min-w-0">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'Project', link: '/dashboard/freelancer' },
            {
              label: projectName || project_id,
              link: `/project/${project_id}`,
            },
            { label: 'Milestone', link: '#' },
          ]}
        />
        <div className="py-4 px-2 md:px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold">
              Project Milestones
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-4">
              <p>Loading milestones...</p>
            </div>
          ) : milestones.length > 0 ? (
            <div className="space-y-4">
              {/* First Row: Timeline - Full Width */}
              <div className="w-full">
                <MilestoneTimeline
                  milestones={milestones}
                  handleStorySubmit={handleStorySubmit}
                  fetchMilestones={fetchMilestones}
                  isFreelancer={true}
                  selectedIndex={selectedMilestoneIndex}
                  onMilestoneSelect={(index) =>
                    setSelectedMilestoneIndex(index)
                  }
                />
              </div>

              {/* Second Row: Two Columns */}
              {selectedMilestoneIndex !== null && (
                <div className="flex flex-col xl:flex-row gap-4 min-h-0">
                  {/* Left Column: Freelancer List */}
                  <div className="w-full xl:w-80 xl:flex-shrink-0">
                    <FreelancerList
                      projectId={project_id}
                      onChatClick={handleChatClick}
                      className="sticky top-4 h-[300px] xl:h-[400px] max-w-none xl:max-w-md"
                    />
                  </div>

                  {/* Right Column: Stories */}
                  <div className="flex-1 min-w-0">
                    <StoriesSection
                      milestone={milestones[selectedMilestoneIndex]}
                      fetchMilestones={fetchMilestones}
                      handleStorySubmit={handleStorySubmit}
                      isFreelancer={true}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-[40vh] w-full">
              <div className="text-center">
                <PackageOpen className="mx-auto text-gray-500" size="100" />
                <p className="text-gray-500">No Milestone created</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
