'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import StoriesSection from '@/components/shared/StoriesSection';
import FreelancerList from '@/components/freelancer/FreelancerList';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Button } from '@/components/ui/button';
import { CreateMilestoneDialog } from '@/components/shared/CreateMilestoneDialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';
import type { Milestone, Story } from '@/utils/types/Milestone';
import type { RootState } from '@/lib/store';
import { CreateProjectGroupDialog } from '@/components/shared/CreateProjectGroupDialog';

interface Project {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyId: string;
  email: string;
  url?: { value: string }[];
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date | null;
  skillsRequired: string[];
  experience?: string;
  role?: string;
  projectType?: string;
  status?: string;
  team?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const Page = () => {
  const { project_id } = useParams<{ project_id: string }>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
    number | null
  >(0);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);

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

  const handleGroupCreated = () => {
    toast({
      title: 'Group Created',
      description:
        'Your group has been created successfully. It will appear in the team members list.',
    });
  };

  const fetchProject = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/project/${project_id}`);
      const projectData = response?.data?.data?.data || response?.data?.data;
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch project data.',
      });
    }
  }, [project_id]);

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
      });
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
    fetchProject();
    fetchMilestones();
  }, [fetchProject, fetchMilestones]);

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
      <div className="flex flex-col sm:gap-4 sm:py-0 mb-8 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/business' },
            { label: 'Project', link: '/dashboard/business' },
            {
              label: project ? project.projectName : project_id,
              link: `/business/project/${project_id}`,
            },
            { label: 'Milestone', link: '#' },
          ]}
        />
        <div className="py-4 px-2 md:px-4 w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold">
              Project Milestones
            </h1>

            <div className="flex gap-2">
              <Button className="px-3 py-1 ">
                <CreateMilestoneDialog
                  projectId={project_id}
                  fetchMilestones={fetchMilestones}
                />
              </Button>
            </div>
          </div>

          {/* Main content area */}
          <div className="mt-4 w-full max-w-full">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <p>Loading milestones...</p>
              </div>
            ) : milestones.length > 0 ? (
              <>
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
                    <div className="min-w-0 w-full max-w-full md:h-[280px]">
                      <div className="w-full max-w-full">
                        <MilestoneTimeline
                          fetchMilestones={fetchMilestones}
                          milestones={milestones}
                          handleStorySubmit={handleStorySubmit}
                          selectedIndex={selectedMilestoneIndex}
                          onMilestoneSelect={(index) =>
                            setSelectedMilestoneIndex(index)
                          }
                        />
                      </div>
                    </div>

                    {/* Bottom: StoriesSection (milestone cards) */}
                    {selectedMilestoneIndex !== null && (
                      <div className="min-w-0 w-full max-w-full">
                        <StoriesSection
                          key={
                            milestones[selectedMilestoneIndex]?._id ??
                            selectedMilestoneIndex
                          }
                          milestone={milestones[selectedMilestoneIndex]}
                          fetchMilestones={fetchMilestones}
                          handleStorySubmit={handleStorySubmit}
                          isFreelancer={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-[40vh]">
                No milestones found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Group Dialog */}
      <CreateProjectGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        onGroupCreated={handleGroupCreated}
        projectId={project_id}
        currentUserUid={user?.uid || ''}
      />
    </div>
  );
};

export default Page;
