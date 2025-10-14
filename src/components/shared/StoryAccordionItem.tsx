import React, { useState, useEffect } from 'react';
import {
  Copy,
  ChevronsUpDown,
  Plus,
  X,
  Check,
  Info,
  FileText,
} from 'lucide-react';
import Image from 'next/image';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import TaskDropdown from './TaskDropdown';
import FreelancerTaskStatus from './FreelancerTaskStatus';

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

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  isFreelancer: boolean;
  onApproveUpdatePermission?: (taskId: string) => Promise<boolean>;
  onRejectUpdatePermission?: (taskId: string) => Promise<boolean>;
}

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
  const { text: projectStatus, className: statusBadgeStyle } = getStatusBadge(
    story.storyStatus,
  );

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
      // Add to actedUponTasks to ensure consistency
      setActedUponTasks((prev) => {
        const newSet = new Set(prev);
        newSet.add(task._id);
        return newSet;
      });
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
          acceptanceBusiness: true,
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
          acceptanceBusiness: false,
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
      className={`py-2 ${idx === milestoneStoriesLength - 1 ? 'border-b-0' : 'border-b'} transition-colors`}
    >
      <AccordionTrigger
        className={`flex hover:no-underline items-center px-2 md:px-4 w-full`}
      >
        <div className="flex justify-between items-center w-full px-2 md:px-4 py-1 md:py-2 rounded-lg hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className="text-base md:text-lg font-semibold truncate"
              title={story.title}
            >
              {story.title}
            </h3>
            <Badge
              variant="secondary"
              className="rounded-full hidden sm:inline"
            >
              {taskCount} tasks
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask({
                        _id: 'summary',
                        title: story.title,
                        summary: story.summary,
                        taskStatus: 'SUMMARY',
                        freelancers: [],
                      } as any);
                    }}
                    aria-label="View story summary"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View story summary</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm flex items-center gap-2">
            {story?.tasks?.[0]?.freelancers?.[0] && isFreelancer
              ? !story?.tasks[0]?.freelancers[0]?.acceptanceFreelancer &&
                story?.tasks[0]?.freelancers[0]?.updatePermissionBusiness &&
                !story?.tasks[0]?.freelancers[0]?.updatePermissionFreelancer &&
                story?.tasks[0]?.freelancers[0]?.acceptanceBusiness && (
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
              : !story?.tasks?.[0]?.freelancers?.[0]?.acceptanceBusiness &&
                story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionFreelancer &&
                !story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionBusiness &&
                story?.tasks?.[0]?.freelancers?.[0]?.acceptanceFreelancer && (
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
                story?.tasks[0]?.freelancers[0]?.updatePermissionFreelancer &&
                !story?.tasks[0]?.freelancers[0]?.acceptanceBusiness && (
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
                story?.tasks?.[0]?.freelancers?.[0]?.updatePermissionBusiness &&
                !story?.tasks?.[0]?.freelancers?.[0]?.acceptanceFreelancer && (
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
            className={`${statusBadgeStyle} px-3 py-1 hidden md:flex text-xs md:text-sm rounded-full`}
          >
            {projectStatus}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="w-full px-4 py-4 sm:px-6 sm:py-4 md:px-8 md:py-6 lg:px-10 lg:py-8">
        <div
          className="px-2 mt-5 py-3 bg-card text-card-foreground rounded-lg border"
          style={{ borderColor: '#09090b' }}
        >
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <Badge
                className={`${statusBadgeStyle} px-2 py-1 block md:hidden text-xs md:text-sm rounded-full`}
                style={{ width: 'fit-content' }}
              >
                {projectStatus}
              </Badge>
              <div className="space-y-4 hidden md:flex justify-start items-center gap-4 ">
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
                              <div key={url.urlName}>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <CommandItem
                                      value={url.urlName}
                                      className="cursor-pointer"
                                      onSelect={() => {
                                        setValue(url.urlName);
                                        setOpen(false);
                                      }}
                                    >
                                      {truncateDescription(url.urlName, 20)}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(url.url);
                                        }}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    </CommandItem>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-auto py-1">
                                    {url.url}
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            ),
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div
              className="px-2 mt-5 py-3 bg-card text-card-foreground rounded-lg border"
              style={{ borderColor: '#09090b' }}
            >
              {story?.tasks?.length > 0 ? (
                <div className="bg-transparent">
                  <div className="flex justify-between items-center px-3 mt-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg md:text-xl font-semibold">
                        Tasks
                      </h4>
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
                            <div className=" p-0 md:p-2 mt-5">
                              <div
                                className="w-full cursor-pointer border relative rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground"
                                onClick={() => setSelectedTask(task)}
                              >
                                <div className="p-2 md:p-4">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <h4 className="text-sm md:text-lg font-medium">
                                        {truncateDescription(task.title, 20)}
                                      </h4>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="p-1 h-auto ml-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTask(task);
                                              }}
                                              aria-label="View task details"
                                            >
                                              <Info className="w-4 h-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            View task details
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <Badge
                                      className={`${taskBadgeStyle} px-2 py-0.5 text-xs md:text-sm rounded-md`}
                                    >
                                      {task.taskStatus}
                                    </Badge>
                                  </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <TaskDropdown
                                    fetchMilestones={fetchMilestones}
                                    milestoneId={milestoneId}
                                    storyId={story._id}
                                    task={task}
                                  />
                                  {isFreelancer && (
                                    <div
                                      className="flex flex-col gap-2 sm:pb-2 mt-2 px-4"
                                      style={{ minHeight: '2.5rem' }}
                                    >
                                      {/* Show accept/reject buttons only for tasks that haven't been acted upon */}
                                      {shouldShowAcceptRejectButtons(task) && (
                                        <div className="flex justify-between items-center">
                                          <Button
                                            onClick={() =>
                                              handleAcceptTask(task._id)
                                            }
                                            className="w-20 md:w-16 h-7"
                                          >
                                            Accept
                                          </Button>
                                          <div className="flex-1 flex justify-center">
                                            <Button
                                              onClick={() =>
                                                handleRejectTask(task._id)
                                              }
                                              className="w-20 md:w-16 h-7"
                                            >
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      {/* Approve/Reject Update Permission buttons for freelancers */}
                                      {!task.freelancers?.[0]
                                        ?.updatePermissionFreelancer &&
                                        task.freelancers?.[0]
                                          ?.updatePermissionBusiness &&
                                        !task.freelancers?.[0]
                                          ?.acceptanceFreelancer && (
                                          <div className="flex flex-col gap-2 mt-2">
                                            <Button
                                              onClick={() =>
                                                handleApproveUpdatePermission(
                                                  task._id,
                                                )
                                              }
                                              className="w-full h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                              Approve Update Permission
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleRejectUpdatePermission(
                                                  task._id,
                                                )
                                              }
                                              className="w-full h-7 bg-red-500 hover:bg-red-600 text-white"
                                            >
                                              Reject Update Permission
                                            </Button>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                  {!isFreelancer && task.freelancers?.[0] && (
                                    <div className="mt-2 mr-7 mb-1">
                                      <FreelancerTaskStatus task={task} />
                                      {/* Approve/Reject Update Permission buttons for business */}
                                      {!task.freelancers?.[0]
                                        ?.updatePermissionBusiness &&
                                        task.freelancers?.[0]
                                          ?.updatePermissionFreelancer &&
                                        !task.freelancers?.[0]
                                          ?.acceptanceBusiness && (
                                          <div className="flex flex-col gap-2 mt-2">
                                            <Button
                                              onClick={() =>
                                                handleApproveUpdatePermission(
                                                  task._id,
                                                )
                                              }
                                              className="w-full h-7 bg-gray-500 hover:bg-green-500 text-white"
                                            >
                                              Approve Update Permission
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleRejectUpdatePermission(
                                                  task._id,
                                                )
                                              }
                                              className="w-full h-7 bg-gray-500 hover:bg-red-600 text-white"
                                            >
                                              Reject Update Permission
                                            </Button>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <div
                      className={`${story?.tasks?.length > (typeof window !== 'undefined' && window.innerWidth > 768 ? 2 : 1) ? 'block' : 'hidden'}`}
                    >
                      {story?.tasks?.length >
                        (typeof window !== 'undefined' &&
                        window.innerWidth >= 768
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
                <div className="text-center mt-10 p-6 rounded-md border bg-muted/20">
                  <div className="flex flex-col items-center gap-3">
                    <Image
                      src="/banner1.svg"
                      alt="Empty tasks"
                      width={200}
                      height={90}
                      className="opacity-90 select-none pointer-events-none"
                    />
                    {!isFreelancer ? (
                      <p>
                        This {story.title} currently has no tasks. Add tasks to
                        ensure smooth progress and better tracking.
                      </p>
                    ) : (
                      <p>
                        This {story.title} currently has no tasks. Wait until
                        the business assigns you to any task.
                      </p>
                    )}
                    {!isFreelancer && (
                      <Button
                        className="mt-2 px-3 py-1 text-sm sm:text-base rounded-full"
                        onClick={() => setIsTaskDialogOpen(true)}
                      >
                        <Plus size={15} className="mr-1" /> Add Task
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
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

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onClose,
  isFreelancer,
  onApproveUpdatePermission,
  onRejectUpdatePermission,
}) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg mx-auto w-[86vw] sm:max-w-xl shadow-lg ">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {task.title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm mt-2 leading-relaxed">
          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">
            <div className="sm:col-span-3 order-2 sm:order-1">
              <h4 className="font-semibold mb-1">Description</h4>
              <p className="mb-3 whitespace-pre-wrap">
                {task.summary || 'No description provided.'}
              </p>
            </div>
            <div className="sm:col-span-2 order-1 sm:order-2">
              <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28">
                <Image
                  src="/banner1.svg"
                  alt="Task details illustration"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 96px, 112px"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Key fields (hidden for story SUMMARY popover) */}
          {task.taskStatus !== 'SUMMARY' && (
            <>
              <p className="mt-2 text-sm">
                Task status:{' '}
                <span className="font-medium ">{task?.taskStatus}</span>
              </p>
              <p className="mt-2 text-sm">
                Freelancer Name:{' '}
                <span className="font-medium ">
                  {task?.freelancers[0]?.freelancerName || '—'}
                </span>
              </p>
              <p className="mt-2 text-sm">
                Payment Status:{' '}
                <span className="font-medium ">
                  {task?.freelancers[0]?.paymentStatus || '—'}
                </span>
              </p>
            </>
          )}

          {/* Update task request - only visible to business and not for SUMMARY */}
          {!isFreelancer && task.taskStatus !== 'SUMMARY' && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Update Task Request</h4>
              {task.freelancers.some(
                (f: any) =>
                  f.updatePermissionFreelancer && !f.updatePermissionBusiness,
              ) ? (
                <Table className="border border-border bg-card rounded-md">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-left">
                        Freelancer
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.freelancers
                      .filter(
                        (f: any) =>
                          f.updatePermissionFreelancer &&
                          !f.updatePermissionBusiness,
                      )
                      .map((freelancer: any, index: number) => (
                        <TableRow
                          key={index}
                          className="border-b last:border-0"
                        >
                          <TableCell className="py-2 px-4">
                            {freelancer.freelancerName || 'Freelancer'}
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                aria-label="Approve update permission"
                                onClick={async () => {
                                  if (onApproveUpdatePermission) {
                                    const ok = await onApproveUpdatePermission(
                                      task._id,
                                    );
                                    if (ok) {
                                      (task as any).freelancers = (
                                        task.freelancers || []
                                      ).filter(
                                        (f: any) => f._id !== freelancer._id,
                                      );
                                    }
                                  }
                                }}
                                className="rounded p-1 hover:bg-emerald-950/40"
                              >
                                <Check className="text-green-500 w-5 h-5" />
                              </button>
                              <button
                                aria-label="Reject update permission"
                                onClick={async () => {
                                  if (onRejectUpdatePermission) {
                                    const ok = await onRejectUpdatePermission(
                                      task._id,
                                    );
                                    if (ok) {
                                      (task as any).freelancers = (
                                        task.freelancers || []
                                      ).filter(
                                        (f: any) => f._id !== freelancer._id,
                                      );
                                    }
                                  }
                                }}
                                className="rounded p-1 hover:bg-red-950/40"
                              >
                                <X className="text-red-500 w-5 h-5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No update permission requests.
                </p>
              )}
            </div>
          )}
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryAccordionItem;
