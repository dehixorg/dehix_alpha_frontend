'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import StoriesSection from '@/components/shared/StoriesSection';
import FreelancerList from '@/components/freelancer/FreelancerList';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import type { Milestone, Story } from '@/utils/types/Milestone';
import type { RootState } from '@/lib/store';

const CreateMilestoneDialog = dynamic(
  () =>
    import('@/components/shared/CreateMilestoneDialog').then((m) => ({
      default: m.CreateMilestoneDialog,
    })),
  {
    loading: () => <Skeleton className="h-10 w-full" />,
  },
);

const CreateProjectGroupDialog = dynamic(
  () =>
    import('@/components/shared/CreateProjectGroupDialog').then((m) => ({
      default: m.CreateProjectGroupDialog,
    })),
  {
    loading: () => <Skeleton className="h-10 w-full" />,
  },
);

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
        notifyError('You must be logged in to start a chat.', 'Error');
        return;
      }

      try {
        const sessionKey = crypto.randomUUID();

        let freelancerData;

        try {
          const response = await axiosInstance.get(
            `/public/freelancer/${freelancerId}`,
          );

          freelancerData = response.data?.data?.data || response.data?.data;
        } catch (error) {
          console.error('Failed to fetch freelancer details:', error);
          notifyError('Failed to fetch freelancer details.', 'Error');
          return;
        }

        const chatData = {
          newChat: true,
          userId: freelancerId,
          userName: freelancerName,
          userEmail: freelancerData?.email || '',
          userPhoto: freelancerData?.profilePic || null,
          userType: 'freelancer',
        };

        localStorage.setItem(sessionKey, JSON.stringify(chatData));

        window.open(`/chat?session=${sessionKey}`, '_blank');

        notifySuccess(`Opening chat with ${freelancerName}...`, 'Chat');
      } catch (error) {
        console.error('Error opening chat:', error);
        notifyError('Failed to open chat. Please try again.', 'Error');
      }
    },
    [user],
  );

  const handleGroupCreated = () => {
    notifySuccess(
      'Your group has been created successfully. It will appear in the team members list.',
      'Group Created',
    );
  };

  const fetchProject = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/project/${project_id}`);

      const projectData = response?.data?.data?.data || response?.data?.data;

      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      notifyError('Failed to fetch project data.', 'Error');
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
    <BusinessDashboardLayout
      active="Projects"
      activeMenu="Projects"
      breadcrumbItems={[
        { label: 'Project', link: '/business/projects' },
        {
          label: project ? project.projectName : project_id,
          link: `/business/project/${project_id}`,
        },
        { label: 'Milestone', link: '#' },
      ]}
      contentClassName="flex flex-col sm:gap-4 sm:py-0 mb-8 sm:pl-14"
      mainClassName="px-2 md:px-4 w-full max-w-full overflow-hidden"
    >
      <div className="flex justify-between items-center mt-4 md:mt-0">
        <h1 className="text-xl md:text-2xl font-bold">
          {project?.projectName} Milestones
        </h1>

        <div className="flex gap-2">
          <CreateMilestoneDialog
            projectId={project_id}
            fetchMilestones={fetchMilestones}
          />
        </div>
      </div>

      <div className="mt-4 w-full max-w-full">
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
            <div className="w-full md:w-[260px] flex-shrink-0 min-w-0 max-w-full">
              <FreelancerList
                projectId={project_id}
                onChatClick={handleChatClick}
                className="w-full max-w-full"
              />
            </div>

            <div className="flex-1 flex flex-col gap-3 min-w-0 w-full max-w-full overflow-x-hidden">
              <MilestoneTimeline
                fetchMilestones={fetchMilestones}
                milestones={milestones}
                handleStorySubmit={handleStorySubmit}
                selectedIndex={selectedMilestoneIndex}
                onMilestoneSelect={(index) => setSelectedMilestoneIndex(index)}
              />

              {selectedMilestoneIndex !== null && (
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
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            className="h-[40vh] border-0 bg-transparent py-0"
            title="No milestones created"
            description="Start by creating your first milestone for this project."
          />
        )}
      </div>

      <CreateProjectGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        onGroupCreated={handleGroupCreated}
        projectId={project_id}
        currentUserUid={user?.uid || ''}
      />
    </BusinessDashboardLayout>
  );
};

export default Page;
