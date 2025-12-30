import React, { useState, useEffect } from 'react';
import { Plus, Info, FileText } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

import TaskDetailsDialog from './TaskDetailsDialog';
import TaskCard from './TaskCard';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { getStatusBadge } from '@/utils/statusBadge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Task } from '@/utils/types/Milestone';
import { axiosInstance } from '@/lib/axiosinstance';
import { profileTypeOutlineClasses } from '@/utils/common/getBadgeStatus';
import { ScrollBar } from '@/components/ui/scroll-area';

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
  const HorizontalScrollArea: React.FC<{
    className?: string;
    children: React.ReactNode;
  }> = ({ className, children }) => (
    <ScrollAreaPrimitive.Root className={className}>
      <ScrollAreaPrimitive.Viewport className="w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );

  const { text: projectStatus } = getStatusBadge(story.storyStatus);
  const taskCount = story?.tasks?.length ?? 0;
  const normalizedTaskStatuses: string[] = (story?.tasks ?? [])
    .map((task: any) => (task?.taskStatus ?? '').toString().toUpperCase())
    .filter((status: string) => Boolean(status));

  const taskStatusSet: Set<string> = new Set(normalizedTaskStatuses);

  const taskColumns: Array<{ key: string; title: string }> = [
    { key: 'NOT_STARTED', title: 'Not started' },
    { key: 'ONGOING', title: 'Ongoing' },
    { key: 'COMPLETED', title: 'Completed' },
    ...Array.from(taskStatusSet)
      .filter(
        (status: string) =>
          status !== 'NOT_STARTED' &&
          status !== 'ONGOING' &&
          status !== 'COMPLETED',
      )
      .map((status: string) => ({
        key: status,
        title: status.replaceAll('_', ' ').toLowerCase(),
      })),
  ];

  const getKanbanAccentClasses = (statusKey: string) => {
    switch (statusKey) {
      case 'NOT_STARTED':
        return {
          border: 'border-amber-500/40',
          headerBg: 'bg-amber-50/70 dark:bg-amber-900/10',
        };
      case 'ONGOING':
        return {
          border: 'border-blue-500/40',
          headerBg: 'bg-blue-50/70 dark:bg-blue-900/10',
        };
      case 'COMPLETED':
        return {
          border: 'border-emerald-500/40',
          headerBg: 'bg-emerald-50/70 dark:bg-emerald-900/10',
        };
      default:
        return {
          border: 'border-violet-500/40',
          headerBg: 'bg-violet-50/70 dark:bg-violet-900/10',
        };
    }
  };

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
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}/permission`,
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
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}/permission`,
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
        className={`flex hover:no-underline items-center px-3 w-full`}
      >
        <div className="flex justify-between items-center w-full px-2 rounded-xl transition-colors">
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

      <AccordionContent className="w-full px-4">
        {story?.tasks?.length > 0 ? (
          <HorizontalScrollArea className="relative -mx-2 overflow-hidden">
            <div className="flex gap-3 min-w-max px-2 pb-1">
              {taskColumns.map((column) => {
                const tasksInColumn = (story?.tasks ?? []).filter(
                  (task: any) =>
                    (task?.taskStatus ?? '').toString().toUpperCase() ===
                    column.key,
                );
                const accent = getKanbanAccentClasses(column.key);

                return (
                  <div
                    key={column.key}
                    className="w-[280px] shrink-0 sm:w-[320px] lg:w-[340px]"
                  >
                    <div
                      className={`rounded-xl border border-border/60 pb-1 ${accent.border} ${accent.headerBg}`}
                    >
                      <div
                        className={`flex items-center justify-between gap-2 px-3 py-2`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm truncate capitalize">
                              {column.title.toUpperCase()}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="rounded-full px-2 py-0.5 text-xs"
                            >
                              {tasksInColumn.length}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="px-1 pb-2">
                        {tasksInColumn.length > 0 ? (
                          tasksInColumn.map((task: any) => {
                            const { className: taskBadgeStyle } =
                              getStatusBadge(task.taskStatus);

                            return (
                              <TaskCard
                                key={task._id}
                                task={task}
                                isFreelancer={isFreelancer}
                                onTaskClick={(t) => setSelectedTask(t)}
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
                            );
                          })
                        ) : (
                          <div className="px-3 pb-2 text-xs text-muted-foreground">
                            No tasks
                          </div>
                        )}

                        {!isFreelancer && (
                          <div className="px-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="w-full justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsTaskDialogOpen(true);
                              }}
                            >
                              <Plus className="mr-1 h-4 w-4" /> Add
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </HorizontalScrollArea>
        ) : (
          <div className="p-6 rounded-xl border bg-muted/20 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" />
            </div>
            {!isFreelancer ? (
              <>
                <h4 className="text-base md:text-lg font-semibold">
                  No tasks yet
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create tasks for “{story.title}” to track progress.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-base md:text-lg font-semibold">
                  No tasks assigned
                </h4>
                <p className="text-sm text-muted-foreground">
                  There are no tasks assigned to you in “{story.title}”.
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
                  <Plus className="mr-1 h-4 w-4" /> Add Task
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
