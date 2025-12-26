'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, PackageOpen } from 'lucide-react';
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
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Milestone, Story } from '@/utils/types/Milestone';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';

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
        notifyError('You must be logged in to start a chat.', 'Error');
        return;
      }

      try {
        try {
          await axiosInstance.get(`/public/freelancer/${freelancerId}`);
        } catch (error) {
          console.error('Failed to fetch freelancer details:', error);
        }

        router.push('/chat');

        notifySuccess(`Opening chat with ${freelancerName}...`, 'Chat');
      } catch (error) {
        console.error('Error opening chat:', error);
        notifyError('Failed to open chat. Please try again.', 'Error');
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
      notifyError('Something went wrong. Please try again.', 'Error');
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

      notifySuccess(
        isTask ? 'Task added successfully!' : 'Story added successfully!',
        'Success',
      );

      fetchMilestones();
    } catch (error) {
      console.error(
        'Error updating milestone:',
        (error as any).response?.data || (error as any).message,
      );
      notifyError('Failed to update milestone.', 'Error');
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // Keep selected index within bounds after data changes
  useEffect(() => {
    if (milestones.length === 0) return;
    if (
      selectedMilestoneIndex == null ||
      selectedMilestoneIndex >= milestones.length
    ) {
      setSelectedMilestoneIndex(0);
    }
  }, [milestones]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 min-w-0">
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
        <div className="pb-4 px-2 md:px-4 w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold">
              Project Milestones
            </h1>
          </div>

          {loading ? (
            <div className="w-full max-w-full">
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading milestones...</span>
              </div>

              <div className="flex flex-col md:flex-row gap-3 w-full max-w-full">
                <div className="w-full md:w-[260px] flex-shrink-0 min-w-0 max-w-full space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>

                <div className="flex-1 flex flex-col gap-3 min-w-0 w-full max-w-full overflow-x-hidden">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-[320px] w-full" />
                </div>
              </div>
            </div>
          ) : milestones.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-3 w-full max-w-full">
              {/* Left Part: FreelancerList */}
              <div className="w-full md:w-[260px] flex-shrink-0 min-w-0 max-w-full">
                <FreelancerList
                  projectId={project_id}
                  onChatClick={handleChatClick}
                  className="w-full max-w-full"
                />
              </div>

              {/* Right Part */}
              <div className="flex-1 flex flex-col gap-3 min-w-0 w-full max-w-full overflow-x-hidden">
                {/* Top: MilestoneTimeline */}
                <MilestoneTimeline
                  fetchMilestones={fetchMilestones}
                  milestones={milestones}
                  handleStorySubmit={handleStorySubmit}
                  selectedIndex={selectedMilestoneIndex}
                  onMilestoneSelect={(index) =>
                    setSelectedMilestoneIndex(index)
                  }
                />

                {/* Bottom: StoriesSection (milestone cards) */}
                {selectedMilestoneIndex !== null && (
                  <StoriesSection
                    key={
                      milestones[selectedMilestoneIndex]?._id ??
                      selectedMilestoneIndex
                    }
                    milestone={milestones[selectedMilestoneIndex]}
                    fetchMilestones={fetchMilestones}
                    handleStorySubmit={handleStorySubmit}
                    isFreelancer={true}
                    freelancerId={user?.uid}
                  />
                )}
              </div>
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
