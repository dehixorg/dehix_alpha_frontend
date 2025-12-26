import React, { useState, useEffect } from 'react';
import { Plus, Info, FileText } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

import TaskDetailsDialog from './TaskDetailsDialog';
import TaskCard from './TaskCard';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { getStatusBadge } from '@/utils/statusBadge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Task } from '@/utils/types/Milestone';
import { axiosInstance } from '@/lib/axiosinstance';
import { profileTypeOutlineClasses } from '@/utils/common/getBadgeStatus';

interface StoryAccordionItemProps {
  milestoneId: string | undefined;
  story: any;
  idx: number;
  milestoneStoriesLength: number;
  setIsTaskDialogOpen: (open: boolean) => void;
  isFreelancer: boolean;
  freelancerId?: string;
  fetchMilestones: () => void;
}

const StoryAccordionItem: React.FC<StoryAccordionItemProps> = ({
  milestoneId,
  story,
  idx,
  milestoneStoriesLength,
  setIsTaskDialogOpen,
  isFreelancer = false,
  freelancerId,
  fetchMilestones,
}) => {
  const { text: projectStatus } = getStatusBadge(story.storyStatus);

  const taskCount = story?.tasks?.length || 0;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actedUponTasks, setActedUponTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newActedUponTasks = new Set<string>();
    story.tasks?.forEach((task: any) => {
      const freelancerData = task.freelancers?.[0];
      // Check if this task is assigned to the current freelancer and has been acted upon
      if (
        freelancerData &&
        freelancerId &&
        freelancerData.freelancerId === freelancerId &&
        (freelancerData.acceptanceFreelancer ||
          freelancerData.rejectionFreelancer)
      ) {
        newActedUponTasks.add(task._id);
      }
    });
    setActedUponTasks(newActedUponTasks);
  }, [story.tasks, freelancerId]);

  // Helper function to determine if a task should show accept/reject buttons
  const shouldShowAcceptRejectButtons = (task: any) => {
    if (actedUponTasks.has(task._id)) {
      return false;
    }

    if (!freelancerId) {
      return false;
    }

    const freelancerData = task.freelancers?.[0];

    if (!freelancerData) {
      return false;
    }

    if (freelancerData.freelancerId !== freelancerId) {
      return false;
    }

    if (
      freelancerData.acceptanceFreelancer ||
      freelancerData.rejectionFreelancer
    ) {
      return false;
    }
    return true;
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      if (!milestoneId || !story._id) {
        console.warn('Missing milestone or story ID in handleAcceptTask');
        notifyError('Missing milestone or story ID', 'Error');
        return;
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        {
          acceptanceFreelancer: true,
          rejectionFreelancer: false,
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
        },
      );

      // Add to acted upon tasks to hide buttons immediately
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.add(taskId);
        return newSet;
      });

      notifySuccess('Task accepted!');
      fetchMilestones(); // Refresh milestones
      window.dispatchEvent(new CustomEvent('taskAssignmentUpdated'));
    } catch (error) {
      console.error('Error accepting task:', error);
      notifyError('Failed to accept task.', 'Error');
      // Remove from acted upon tasks if the request failed
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      if (!milestoneId || !story._id) {
        console.warn('Missing milestone or story ID in handleRejectTask');
        notifyError('Missing milestone or story ID', 'Error');
        return;
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        {
          acceptanceFreelancer: false,
          rejectionFreelancer: true,
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
        },
      );

      // Add to acted upon tasks to hide buttons immediately
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.add(taskId);
        return newSet;
      });

      notifySuccess('Task rejected and update requests removed!');
      fetchMilestones(); // Refresh milestones
      window.dispatchEvent(new CustomEvent('taskAssignmentUpdated'));
    } catch (error) {
      console.error('Error rejecting task:', error);
      notifyError('Failed to reject task.', 'Error');
      // Remove from acted upon tasks if the request failed
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleApproveUpdatePermission = async (
    taskId: string,
  ): Promise<boolean> => {
    try {
      if (!milestoneId || !story._id) {
        console.warn(
          'Missing milestone or story ID in handleApproveUpdatePermission',
        );
        notifyError('Missing milestone or story ID', 'Error');
        return false;
      }

      // Determine the payload based on user type
      let payload;
      if (isFreelancer) {
        payload = {
          updatePermissionFreelancer: true,
          updatePermissionBusiness: true,
          rejectionFreelancer: true,
          acceptanceFreelancer: false,
        };
      } else {
        payload = {
          updatePermissionFreelancer: true,
          updatePermissionBusiness: true,
          rejectionFreelancer: false,
        };
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        payload,
      );
      notifySuccess('Update permission approved!');
      fetchMilestones(); // Refresh milestones
      return true;
    } catch (error) {
      console.error('Error approving update permission:', error);
      notifyError('Failed to approve update permission.', 'Error');
      return false;
    }
  };

  const handleRejectUpdatePermission = async (
    taskId: string,
  ): Promise<boolean> => {
    try {
      if (!milestoneId || !story._id) {
        console.warn(
          'Missing milestone or story ID in handleRejectUpdatePermission',
        );
        notifyError('Missing milestone or story ID', 'Error');
        return false;
      }

      // Determine the payload based on user type
      let payload;
      if (isFreelancer) {
        payload = {
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
          rejectionFreelancer: true,
          acceptanceFreelancer: false,
        };
      } else {
        payload = {
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
          rejectionFreelancer: false,
        };
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        payload,
      );
      notifySuccess('Update permission rejected!');
      fetchMilestones(); // Refresh milestones
      return true;
    } catch (error) {
      console.error('Error rejecting update permission:', error);
      notifyError('Failed to reject update permission.', 'Error');
      return false;
    }
  };

  return (
    <AccordionItem
      key={story._id}
      value={story._id ?? ''}
      className={`${idx === milestoneStoriesLength - 1 ? 'border-b-0' : 'border-b'} transition-colors`}
    >
      <AccordionTrigger
        className={`flex hover:no-underline items-center px-2 md:px-4 w-full`}
      >
        <div className="flex justify-between items-center w-full px-3 md:px-5 py-2 md:py-3 rounded-xl transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className="text-base md:text-lg font-semibold truncate"
              title={story.title}
            >
              {story.title}
            </h3>
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-xs"
            >
              {taskCount} tasks
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto ml-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label="View story summary"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm whitespace-pre-wrap leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-semibold">{story.title}</h4>
                  <p>{story.summary || 'No summary provided.'}</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Badge
            className={`${profileTypeOutlineClasses(projectStatus)} hidden md:flex rounded-full`}
          >
            {projectStatus}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
            <div className="space-y-1">
              <Badge
                className={`${profileTypeOutlineClasses(projectStatus)} block md:hidden text-xs md:text-sm rounded-full`}
                style={{ width: 'fit-content' }}
              >
                {projectStatus}
              </Badge>
            </div>
            {story?.tasks?.length > 0 ? (
              <div className="bg-transparent">
                <Carousel className="w-[85vw] md:w-full relative mt-2">
                  <CarouselContent className="flex flex-nowrap gap-2 md:gap-0">
                    {story.tasks.map((task: any) => {
                      const { className: taskBadgeStyle } = getStatusBadge(
                        task.taskStatus,
                      );

                      return (
                        <CarouselItem
                          key={task._id}
                          className="min-w-0 w-full md:basis-1/2 sm:w-full md:w-1/2 lg:w-1/3"
                        >
                          <TaskCard
                            task={task}
                            isFreelancer={isFreelancer}
                            onTaskClick={setSelectedTask}
                            onAcceptTask={handleAcceptTask}
                            onRejectTask={handleRejectTask}
                            onApproveUpdatePermission={
                              handleApproveUpdatePermission
                            }
                            onRejectUpdatePermission={
                              handleRejectUpdatePermission
                            }
                            shouldShowAcceptRejectButtons={
                              shouldShowAcceptRejectButtons
                            }
                            fetchMilestones={fetchMilestones}
                            milestoneId={milestoneId}
                            storyId={story._id}
                            taskBadgeStyle={taskBadgeStyle}
                          />
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <div
                    className={`${story?.tasks?.length > (typeof window !== 'undefined' && window.innerWidth > 768 ? 2 : 1) ? 'block' : 'hidden'}`}
                  >
                    {story?.tasks?.length >
                      (typeof window !== 'undefined' && window.innerWidth >= 768
                        ? 2
                        : 1) && (
                      <>
                        <CarouselPrevious className="absolute top-1 md:top-2 left-2 transform -translate-y-1/2 shadow rounded-full p-2" />
                        <CarouselNext className="absolute top-1 md:top-2  right-2 transform -translate-y-1/2 shadow rounded-full p-2" />
                      </>
                    )}
                  </div>
                </Carousel>
                            <Button
                              variant="secondary"
                              className="rounded-full w-full"
                              onClick={() => setIsTaskDialogOpen(true)}
                            >
                              <Plus size={15} className="mr-1" /> Add Task
                            </Button>
              </div>
            ) : (
              <div className="mt-8 p-6 rounded-xl border bg-muted/20 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                {!isFreelancer ? (
                  <>
                    <h4 className="text-base md:text-lg font-semibold">
                      No tasks yet
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      This “{story.title}” currently has no tasks. Create tasks
                      to track progress.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-base md:text-lg font-semibold">
                      No tasks assigned
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      This “{story.title}” currently has no tasks assigned.
                      Please check back later.
                    </p>
                  </>
                )}
                {!isFreelancer && (
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 rounded-full"
                      onClick={() => setIsTaskDialogOpen(true)}
                    >
                      <Plus size={15} className="mr-1" /> Add Task
                    </Button>
                  </div>
                )}
              </div>
            )}
      </AccordionContent>
      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        isFreelancer={isFreelancer}
        onApproveUpdatePermission={(taskId: string) =>
          handleApproveUpdatePermission(taskId)
        }
        onRejectUpdatePermission={(taskId: string) =>
          handleRejectUpdatePermission(taskId)
        }
      />
    </AccordionItem>
  );
};

export default StoryAccordionItem;
