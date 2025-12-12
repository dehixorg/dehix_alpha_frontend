import React, { useState, useEffect } from 'react';
import {
  Copy,
  ChevronsUpDown,
  Plus,
  Info,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getStatusBadge } from '@/utils/statusBadge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
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

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    notifySuccess('URL copied!!');
    setOpen(false);
    setValue('');
  };

  const truncateDescription = (text: string, maxLength = 50) => {
    if (text?.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
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
          <span className="text-sm flex items-center gap-3">
            {story?.tasks?.[0]?.freelancers?.[0] && isFreelancer
              ? story?.tasks[0]?.freelancers[0]?.updatePermissionBusiness &&
                !story?.tasks[0]?.freelancers[0]
                  ?.updatePermissionFreelancer && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-yellow-500 rounded-full flex w-2 h-2 bg-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Update requested</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              : !story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionBusiness &&
                story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionFreelancer && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-yellow-500 rounded-full flex w-2 h-2 bg-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Update requested</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            {story?.tasks?.[0]?.freelancers?.[0] && isFreelancer
              ? story?.tasks[0]?.freelancers[0]?.updatePermissionBusiness &&
                story?.tasks[0]?.freelancers[0]?.updatePermissionFreelancer && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-green-500 rounded-full flex w-2 h-2 bg-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Request approved</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              : story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionFreelancer &&
                story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionBusiness && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-green-500 rounded-full flex w-2 h-2 bg-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Request approved</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
          </span>
          <Badge
            className={`${profileTypeOutlineClasses(projectStatus)} hidden md:flex rounded-full`}
          >
            {projectStatus}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="w-full px-4 py-4 sm:px-6 sm:py-4 md:px-8 md:py-6 lg:px-10 lg:py-8">
        <div className="px-2 mt-5 py-3 bg-card text-card-foreground rounded-lg border border-border">
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <Badge
                className={`${profileTypeOutlineClasses(projectStatus)} block md:hidden text-xs md:text-sm rounded-full`}
                style={{ width: 'fit-content' }}
              >
                {projectStatus}
              </Badge>
              <div className="space-y-4 hidden md:flex justify-start items-center gap-4">
                <h4 className="text-lg md:text-xl font-semibold mt-2">
                  Important URLs:
                </h4>
                <Separator orientation="vertical" className="h-8" />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[300px] justify-between"
                    >
                      {truncateDescription(value, 23) ||
                        'Select or search URL...'}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search URL..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No URL found.</CommandEmpty>
                        <CommandGroup>
                          {story.importantUrls.map(
                            (url: { urlName: string; url: string }) => (
                              <CommandItem
                                key={url.urlName}
                                value={url.urlName}
                                className="cursor-pointer"
                                onSelect={() => {
                                  setValue(url.urlName);
                                  setOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <LinkIcon className="w-4 h-4 opacity-70" />
                                  <span className="truncate">
                                    {truncateDescription(url.urlName, 28)}
                                  </span>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(
                                              url.url,
                                              '_blank',
                                              'noopener,noreferrer',
                                            );
                                          }}
                                          aria-label="Open link"
                                        >
                                          <FileText className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Open link</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(url.url);
                                          }}
                                          aria-label="Copy URL"
                                        >
                                          <Copy className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Copy URL</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {story?.tasks?.length > 0 ? (
              <div className="bg-transparent">
                <div className="flex justify-between items-center px-3 mt-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg md:text-xl font-semibold">Tasks</h4>
                    <Badge variant="secondary" className="rounded-full">
                      {taskCount}
                    </Badge>
                  </div>
                  {!isFreelancer && (
                    <Button
                      className="md:px-3 px-2 py-0 md:py-1 text-sm sm:text-base rounded-full"
                      onClick={() => setIsTaskDialogOpen(true)}
                    >
                      <Plus size={15} /> Add Task
                    </Button>
                  )}
                </div>
                <Separator className="my-3" />
                <Carousel className="w-[85vw] md:w-full relative mt-4">
                  <CarouselContent className="flex flex-nowrap gap-2 md:gap-0">
                    {story.tasks.map((task: any) => {
                      const { className: taskBadgeStyle } = getStatusBadge(
                        task.taskStatus,
                      );

                      return (
                        <CarouselItem
                          key={task._id}
                          className="min-w-0 mt-2 w-full md:basis-1/2 sm:w-full md:w-1/2 lg:w-1/3"
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
          </div>
        </div>
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
