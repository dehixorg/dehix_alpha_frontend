import React, { useState, useEffect } from 'react';
import { Plus, Info, FileText, Edit2, Trash2, Sparkles } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

import TaskDetailsDialog from './TaskDetailsDialog';
import TaskCard from './TaskCard';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  isLiveRoomPreview?: boolean;
  /** Optional local-mode story edit/delete callbacks */
  onEditStory?: () => void;
  onDeleteStory?: () => void;
  /** Optional local-mode task edit/delete/refine callbacks */
  onEditTask?: (taskIndex: number, title: string, summary: string) => void;
  onDeleteTask?: (taskIndex: number) => void;
  onRefineTask?: (taskIndex: number, instruction: string) => void;
}

const MAX_TASKS_PER_STORY = 5;

const StoryAccordionItem: React.FC<StoryAccordionItemProps> = (props) => {
  const {
    milestoneId,
    story,
    idx,
    milestoneStoriesLength,
    setIsTaskDialogOpen,
    isFreelancer = false,
    freelancerId,
    fetchMilestones,
    isLiveRoomPreview = false,
    onEditStory,
    onDeleteStory,
    onEditTask,
    onDeleteTask,
    onRefineTask,
  } = props;
  // Edit-task modal state
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskSummary, setEditTaskSummary] = useState('');

  // Refine-task modal state
  const [refiningTaskIndex, setRefiningTaskIndex] = useState<number | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);

  const openEditTask = (originalIdx: number, task: any) => {
    setEditingTaskIndex(originalIdx);
    setEditTaskTitle(task.title ?? '');
    setEditTaskSummary(task.summary ?? task.description ?? '');
  };

  const handleEditTaskSave = () => {
    if (editingTaskIndex === null) return;
    onEditTask?.(editingTaskIndex, editTaskTitle, editTaskSummary);
    setEditingTaskIndex(null);
  };

  const handleDeleteTaskClick = (originalIdx: number) => {
    if (!window.confirm('Delete this task?')) return;
    onDeleteTask?.(originalIdx);
  };

  const taskCount = story?.tasks?.length ?? 0;
  const localTaskMode = !isLiveRoomPreview && Boolean(onEditTask || onDeleteTask);

  const { text: projectStatus } = getStatusBadge(story.storyStatus);
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
        notifyError('Missing milestone or story ID', 'Error');
        return false;
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}/accept`,
      );

      // Add to acted upon tasks to hide buttons immediately
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.add(taskId);
        return newSet;
      });

      notifySuccess('Task accepted successfully!');
      fetchMilestones(); // Refresh milestones
      return true;
    } catch (error) {
      console.error('Error accepting task:', error);
      notifyError('Failed to accept task.', 'Error');
      return false;
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      if (!milestoneId || !story._id) {
        notifyError('Missing milestone or story ID', 'Error');
        return false;
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}/reject`,
      );

      // Add to acted upon tasks to hide buttons immediately
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.add(taskId);
        return newSet;
      });

      notifySuccess('Task rejected successfully!');
      fetchMilestones(); // Refresh milestones
      return true;
    } catch (error) {
      console.error('Error rejecting task:', error);
      notifyError('Failed to reject task.', 'Error');
      return false;
    }
  };

  const handleApproveUpdatePermission = async (
    taskId: string,
  ): Promise<boolean> => {
    try {
      if (!milestoneId || !story._id) {
        notifyError('Missing milestone or story ID', 'Error');
        return false;
      }

      // Determine the payload based on user type
      let payload;
      if (isFreelancer) {
        payload = {
          updatePermissionFreelancer: true,
          updatePermissionBusiness: true,
          acceptanceFreelancer: true,
        };
      } else {
        payload = {
          updatePermissionFreelancer: true,
          updatePermissionBusiness: true,
          rejectionFreelancer: false,
        };
      }

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}/permission`,
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
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}/permission`,
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
        className={`flex hover:no-underline items-center px-4 py-3.5 w-full border-b border-border/20 hover:bg-muted/15 transition-all`}
      >
        <div className="flex justify-between items-center w-full min-w-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <h3
              className="text-sm md:text-base font-bold tracking-tight text-foreground truncate min-w-0"
              title={story.title}
            >
              {story.title}
            </h3>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 whitespace-nowrap bg-muted text-muted-foreground border border-border/40"
            >
              {taskCount} tasks
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label="View story summary"
                >
                  <Info className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm whitespace-pre-wrap leading-relaxed p-4 bg-card border border-border shadow-xl rounded-xl">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{story.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {story.summary || 'No summary provided.'}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {onEditStory && !isFreelancer && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all shadow-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStory();
                }}
                title="Edit Story"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </Button>
            )}
            {onDeleteStory && !isFreelancer && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-all shadow-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStory();
                }}
                title="Delete Story"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </Button>
            )}
            <Badge
              className={`${profileTypeOutlineClasses(projectStatus)} hidden sm:flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider shrink-0`}
            >
              {projectStatus}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="w-full px-4">
        {story?.tasks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2 w-full">
            {taskColumns.map((column) => {
              const tasksInColumn = (story?.tasks ?? []).filter(
                (task: any) =>
                  (task?.taskStatus ?? '').toString().toUpperCase() ===
                  column.key,
              );
              const accent = getKanbanAccentClasses(column.key);

              return (
                <div key={column.key} className="w-full">
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
                          const { className: taskBadgeStyle } = getStatusBadge(
                            task.taskStatus,
                          );
                          // Find original index for edit/delete callbacks
                          const originalIdx = (story.tasks ?? []).findIndex(
                            (t: any) =>
                              t === task ||
                              (task._id && t._id === task._id) ||
                              (t.title === task.title &&
                                t.summary === task.summary),
                          );

                          return (
                            <div
                              key={task._id ?? originalIdx}
                              className="relative group/task"
                            >
                              <TaskCard
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
                              {/* Refine / Delete task overlay */}
                              {!isFreelancer &&
                                originalIdx >= 0 &&
                                (onRefineTask || onDeleteTask) && (
                                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover/task:opacity-100 transition-opacity z-10">
                                    {onRefineTask && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRefiningTaskIndex(originalIdx);
                                          setRefineInstruction('');
                                        }}
                                        className="p-1 rounded-md bg-background/90 border border-primary/40 text-primary hover:bg-primary/10 transition-colors shadow-xs"
                                        title="Refine task with AI"
                                      >
                                        <Sparkles className="h-3 w-3" />
                                      </button>
                                    )}
                                    {onDeleteTask && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTaskClick(originalIdx);
                                        }}
                                        className="p-1 rounded-md bg-background/90 border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors shadow-xs"
                                        title="Delete task"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 pb-2 text-xs text-muted-foreground">
                          No tasks
                        </div>
                      )}

                      {!isFreelancer && taskCount < MAX_TASKS_PER_STORY && (
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
                      {!isFreelancer && taskCount >= MAX_TASKS_PER_STORY && (
                        <div className="px-2 pt-1">
                          <p className="text-center text-[10px] text-muted-foreground py-1">
                            Max {MAX_TASKS_PER_STORY} tasks reached
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
            {!isFreelancer && taskCount < MAX_TASKS_PER_STORY && (
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

      {/* Edit Task Dialog */}
      {editingTaskIndex !== null && (
        <Dialog open onOpenChange={() => setEditingTaskIndex(null)}>
          <DialogContent className="max-w-md bg-card border-border rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </label>
                <input
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Summary
                </label>
                <textarea
                  value={editTaskSummary}
                  onChange={(e) => setEditTaskSummary(e.target.value)}
                  rows={3}
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Brief description of what needs to be done"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTaskIndex(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditTaskSave}
                disabled={!editTaskTitle.trim()}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Refine task with AI modal */}
      <Dialog
        open={refiningTaskIndex !== null}
        onOpenChange={(open) => {
          if (!open) setRefiningTaskIndex(null);
        }}
      >
        <DialogContent className="max-w-md bg-card border-border shadow-xl rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-base font-bold">
              <Sparkles className="h-4 w-4 text-primary" /> Refine Task with AI
            </DialogTitle>
          </DialogHeader>

          {refiningTaskIndex !== null && (story.tasks ?? [])[refiningTaskIndex] && (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1">
                <div className="font-semibold text-foreground">
                  Task: {(story.tasks ?? [])[refiningTaskIndex].title}
                </div>
                <div className="text-muted-foreground">
                  {(story.tasks ?? [])[refiningTaskIndex].summary || 'No summary'}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90">
                  AI Refinement Instructions
                </label>
                <textarea
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  placeholder="Describe how to refine this task (e.g. 'Use OAuth2 and Google login', 'Add backend validation details')..."
                  className="w-full min-h-[90px] bg-background text-foreground text-xs p-3 rounded-lg border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRefiningTaskIndex(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!refineInstruction.trim() || refineLoading}
                  onClick={async () => {
                    if (refiningTaskIndex === null) return;
                    setRefineLoading(true);
                    try {
                      await onRefineTask?.(refiningTaskIndex, refineInstruction);
                      setRefiningTaskIndex(null);
                    } finally {
                      setRefineLoading(false);
                    }
                  }}
                  className="bg-primary text-primary-foreground font-bold flex items-center gap-1.5"
                >
                  {refineLoading ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-spin" /> Refining…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Refine Task
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
};

export default StoryAccordionItem;
