import React, { useState, useEffect } from 'react';
import { Copy, ChevronsUpDown, Plus, X, Check } from 'lucide-react';

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
import { toast } from '../ui/use-toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
}

interface StoryAccordionItemProps {
  milestoneId: string | undefined;
  story: any;
  idx: number;
  milestoneStoriesLength: number;
  setIsTaskDialogOpen: (open: boolean) => void;
  isFreelancer: boolean;
  fetchMilestones: () => void;
}

const StoryAccordionItem: React.FC<StoryAccordionItemProps> = ({
  milestoneId,
  story,
  idx,
  milestoneStoriesLength,
  setIsTaskDialogOpen,
  isFreelancer = false,
  fetchMilestones,
}) => {
  console.log('StoryAccordionItem rendered with props:', {
    milestoneId,
    storyId: story._id,
    storyTitle: story.title,
    idx,
    milestoneStoriesLength,
    isFreelancer,
  });

  const { text: projectStatus, className: statusBadgeStyle } = getStatusBadge(
    story.storyStatus,
  );

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actedUponTasks, setActedUponTasks] = useState<Set<string>>(new Set());

  // Initialize actedUponTasks with tasks that have already been accepted/rejected
  useEffect(() => {
    const actedTasks = new Set<string>();
    story.tasks?.forEach((task: any) => {
      if (
        task.freelancers?.[0]?.acceptanceFreelancer ||
        task.freelancers?.[0]?.rejectionFreelancer
      ) {
        actedTasks.add(task._id);
      }
    });
    setActedUponTasks(actedTasks);
  }, [story.tasks]);

  const handleAcceptTask = async (taskId: string) => {
    console.log('handleAcceptTask called with taskId:', taskId);
    // Immediately add to acted upon tasks to hide buttons
    setActedUponTasks((prev) => new Set(prev).add(taskId));

    try {
      if (!milestoneId || !story._id) {
        console.warn('Missing milestone or story ID in handleAcceptTask');
        toast({
          description: 'Missing milestone or story ID',
          variant: 'destructive',
        });
        return;
      }

      console.log('Accepting task with payload:', {
        milestoneId,
        storyId: story._id,
        taskId,
        acceptanceFreelancer: true,
        rejectionFreelancer: false,
        updatePermissionFreelancer: false,
        updatePermissionBusiness: false,
      });

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        {
          acceptanceFreelancer: true,
          rejectionFreelancer: false,
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
        },
      );
      console.log('Task accepted successfully');
      toast({ description: 'Task accepted!', duration: 3000 });
      fetchMilestones(); // Refresh milestones
    } catch (error) {
      console.error('Error accepting task:', error);
      toast({ description: 'Failed to accept task.', variant: 'destructive' });
    }
  };

  const handleRejectTask = async (taskId: string) => {
    console.log('handleRejectTask called with taskId:', taskId);
    // Immediately add to acted upon tasks to hide buttons
    setActedUponTasks((prev) => new Set(prev).add(taskId));

    try {
      if (!milestoneId || !story._id) {
        console.warn('Missing milestone or story ID in handleRejectTask');
        toast({
          description: 'Missing milestone or story ID',
          variant: 'destructive',
        });
        return;
      }

      // Find the task to check current update permission state
      const taskToReject = story.tasks.find((task: any) => task._id === taskId);
      const currentUpdatePermissionFreelancer =
        taskToReject?.freelancers?.[0]?.updatePermissionFreelancer;
      const currentUpdatePermissionBusiness =
        taskToReject?.freelancers?.[0]?.updatePermissionBusiness;

      console.log('Current update permission state before rejection:', {
        updatePermissionFreelancer: currentUpdatePermissionFreelancer,
        updatePermissionBusiness: currentUpdatePermissionBusiness,
      });

      console.log('Rejecting task and removing update requests with payload:', {
        milestoneId,
        storyId: story._id,
        taskId,
        acceptanceFreelancer: false,
        rejectionFreelancer: true,
        updatePermissionFreelancer: false, // Remove freelancer update permission
        updatePermissionBusiness: false, // Remove business update permission
      });

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        {
          acceptanceFreelancer: false,
          rejectionFreelancer: true,
          updatePermissionFreelancer: false, // Clear any update permission requests
          updatePermissionBusiness: false, // Clear any update permission requests
        },
      );
      console.log('Task rejected successfully - all update requests removed');
      toast({
        description: 'Task rejected and update requests removed!',
        duration: 3000,
      });
      fetchMilestones(); // Refresh milestones
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({ description: 'Failed to reject task.', variant: 'destructive' });
    }
  };

  const handleApproveUpdatePermission = async (taskId: string) => {
    console.log('handleApproveUpdatePermission called with taskId:', taskId);

    try {
      if (!milestoneId || !story._id) {
        console.warn(
          'Missing milestone or story ID in handleApproveUpdatePermission',
        );
        toast({
          description: 'Missing milestone or story ID',
          variant: 'destructive',
        });
        return;
      }

      // Determine the payload based on user type
      let payload;
      if (isFreelancer) {
        // Freelancer approving business's update request
        payload = {
          updatePermissionFreelancer: true,
          updatePermissionBusiness: true,
          rejectionFreelancer: true,
          acceptanceFreelancer: false,
        };
      } else {
        // Business approving freelancer's update request
        payload = {
          updatePermissionFreelancer: true,
          updatePermissionBusiness: true,
          rejectionFreelancer: false,
          acceptanceBusiness: true,
        };
      }

      console.log('Approving update permission with payload:', {
        milestoneId,
        storyId: story._id,
        taskId,
        ...payload,
      });

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        payload,
      );
      console.log('Update permission approved successfully');
      toast({ description: 'Update permission approved!', duration: 3000 });
      fetchMilestones(); // Refresh milestones
    } catch (error) {
      console.error('Error approving update permission:', error);
      toast({
        description: 'Failed to approve update permission.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectUpdatePermission = async (taskId: string) => {
    console.log('handleRejectUpdatePermission called with taskId:', taskId);

    try {
      if (!milestoneId || !story._id) {
        console.warn(
          'Missing milestone or story ID in handleRejectUpdatePermission',
        );
        toast({
          description: 'Missing milestone or story ID',
          variant: 'destructive',
        });
        return;
      }

      // Determine the payload based on user type
      let payload;
      if (isFreelancer) {
        // Freelancer rejecting business's update request
        payload = {
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
          rejectionFreelancer: true,
          acceptanceFreelancer: false,
        };
      } else {
        // Business rejecting freelancer's update request
        payload = {
          updatePermissionFreelancer: false,
          updatePermissionBusiness: false,
          rejectionFreelancer: false,
          acceptanceBusiness: false,
        };
      }

      console.log('Rejecting update permission with payload:', {
        milestoneId,
        storyId: story._id,
        taskId,
        ...payload,
      });

      await axiosInstance.patch(
        `/milestones/${milestoneId}/story/${story._id}/task/${taskId}`,
        payload,
      );
      console.log('Update permission rejected successfully');
      toast({ description: 'Update permission rejected!', duration: 3000 });
      fetchMilestones(); // Refresh milestones
    } catch (error) {
      console.error('Error rejecting update permission:', error);
      toast({
        description: 'Failed to reject update permission.',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ description: 'URL copied!!', duration: 900 });
    setOpen(false);
    setValue('');
  };

  const truncateDescription = (text: string, maxLength = 50) => {
    console.log('truncateDescription called with:', { text, maxLength });
    if (text?.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <AccordionItem
      key={story._id}
      value={story._id ?? ''}
      className={`py-2  ${idx === milestoneStoriesLength - 1 ? 'border-b-0 ' : 'border-b-2'} `}
    >
      <AccordionTrigger
        className={`flex hover:no-underline items-center under px-4 w-full `}
      >
        <div className="flex justify-between items-center w-full px-4 py-1 rounded-lg duration-300">
          <div className="flex items-center">
            <h3 className="text-lg md:text-xl font-semibold">{story.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto ml-2"
              onClick={(e) => {
                e.stopPropagation();
                const modal = document.createElement('div');
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                  <div class="bg-[#151518] rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                                                <h3 class="text-lg font-semibold text-white">Summary</h3>
                                                <button class="text-red-500 hover:text-red-700" onclick="this.closest('.fixed').remove()">
                                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                  </svg>
                                                </button>
                                              </div>
                    <div class="text-sm text-white whitespace-pre-wrap">
                      ${story.summary}
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                  if (e.target === modal) modal.remove();
                });
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Button>
          </div>
          <span className="text-sm">
            {story?.tasks?.[0]?.freelancers?.[0] && isFreelancer
              ? !story?.tasks[0]?.freelancers[0]?.acceptanceFreelancer &&
                story?.tasks[0]?.freelancers[0]?.updatePermissionBusiness &&
                !story?.tasks[0]?.freelancers[0]?.updatePermissionFreelancer &&
                story?.tasks[0]?.freelancers[0]?.acceptanceBusiness && (
                  <>
                    {/* <span className="text-yellow-500 ml-5 hidden md:flex">
                      Update Req
                    </span> */}
                    <span className="text-yellow-500 ml-5 rounded-full flex md:hidden w-2 h-2 bg-yellow-500"></span>
                  </>
                )
              : !story?.tasks?.[0]?.freelancers?.[0]?.acceptanceBusiness &&
                story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionFreelancer &&
                !story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionBusiness &&
                story?.tasks?.[0]?.freelancers?.[0]?.acceptanceFreelancer && (
                  <>
                    {/* <span className="text-yellow-500 ml-5 hidden md:flex">
                      Update Req
                    </span> */}
                    <span className="text-yellow-500 ml-5 rounded-full flex md:hidden w-2 h-2 bg-yellow-500"></span>
                  </>
                )}
            {story?.tasks?.[0]?.freelancers?.[0] && isFreelancer
              ? story?.tasks[0]?.freelancers[0]?.updatePermissionBusiness &&
                story?.tasks[0]?.freelancers[0]?.updatePermissionFreelancer &&
                !story?.tasks[0]?.freelancers[0]?.acceptanceBusiness && (
                  <>
                    <span className="text-green-500 ml-5 hidden md:flex">
                      Req Approve
                    </span>
                    <span className="text-green-500 ml-5 rounded-full flex md:hidden w-2 h-2 bg-green-500"></span>
                  </>
                )
              : story?.tasks?.[0]?.freelancers?.[0]
                  ?.updatePermissionFreelancer &&
                story?.tasks?.[0]?.freelancers?.[0]?.updatePermissionBusiness &&
                !story?.tasks?.[0]?.freelancers?.[0]?.acceptanceFreelancer && (
                  <>
                    <span className="text-green-500 ml-5 hidden md:flex">
                      Req Approve
                    </span>
                    <span className="text-green-500 ml-5 rounded-full flex md:hidden w-2 h-2 bg-green-500"></span>
                  </>
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
          {/* <div className="px-6 py-4"> */}
          {/* <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-semibold">
                {story.title}
              </h3> 
              </div>  <Badge className={`${statusBadgeStyle} px-3 py-1 text-sm rounded-full`}>
                {projectStatus}
              </Badge>
            </div> */}
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
                    <h4 className="text-lg md:text-xl font-semibold">Tasks:</h4>
                    {!isFreelancer && (
                      <Button
                        className="md:px-3 px-2 py-0 md:py-1 text-sm sm:text-base"
                        onClick={() => setIsTaskDialogOpen(true)}
                      >
                        <Plus size={15} /> Add Task
                      </Button>
                    )}
                  </div>
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
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto ml-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const modal =
                                            document.createElement('div');
                                          modal.className =
                                            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                                          modal.innerHTML = `
                                            <div class="bg-[#151518] rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                                              <div class="flex justify-between items-center mb-4">
                                                <h3 class="text-lg font-semibold text-white">Task Summary</h3>
                                                <button class="text-red-500 hover:text-red-700" onclick="this.closest('.fixed').remove()">
                                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                  </svg>
                                                </button>
                                              </div>
                                              <div class="text-sm text-white whitespace-pre-wrap">
                                                ${task.summary}
                                              </div>
                                            </div>
                                          `;
                                          document.body.appendChild(modal);
                                          modal.addEventListener(
                                            'click',
                                            (e) => {
                                              if (e.target === modal)
                                                modal.remove();
                                            },
                                          );
                                        }}
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                      </Button>
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
                                      {!actedUponTasks.has(task._id) &&
                                        !task.freelancers?.[0]
                                          ?.acceptanceFreelancer &&
                                        !task.freelancers?.[0]
                                          ?.rejectionFreelancer && (
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
                <div className="text-center mt-12 p-4 rounded-md">
                  {!isFreelancer ? (
                    <p>
                      This {story.title} currently has no tasks. Add tasks to
                      ensure smooth progress and better tracking.
                    </p>
                  ) : (
                    <p>
                      This {story.title} currently has no tasks. Wait until the
                      business assigns you to any task.
                    </p>
                  )}
                  {!isFreelancer && (
                    <Button
                      className="mt-2 px-3 py-1 text-sm sm:text-base"
                      onClick={() => setIsTaskDialogOpen(true)}
                    >
                      <Plus size={15} /> Add Task
                    </Button>
                  )}
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
      />
    </AccordionItem>
  );
};

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onClose,
}) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-lg mx-auto w-[90vw] md:w-auto shadow-lg ">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm mt-4 leading-relaxed">
          <p className="mt-2 text-sm">
            Task status:{' '}
            <span className="font-medium ">{task?.taskStatus}</span>
          </p>
          <p className="mt-2 text-sm">
            Freelancer Name:{' '}
            <span className="font-medium ">
              {task?.freelancers[0]?.freelancerName}
            </span>
          </p>
          <p className="mt-2 text-sm">
            Payment Status:{' '}
            <span className="font-medium ">
              {task?.freelancers[0]?.paymentStatus}
            </span>
          </p>
          <Table className="mt-4 border border-gray-300">
            <TableHeader>
              <TableRow className="">
                <TableHead className="font-semibold text-left">User</TableHead>
                <TableHead className="font-semibold text-left">
                  Freelancer{' '}
                </TableHead>
                <TableHead className="font-semibold text-left">
                  Business{' '}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {task.freelancers.map((freelancer: any, index: number) => (
                <TableRow key={index} className="border-b border-gray-200">
                  <TableCell className="py-2 px-4 font-medium">
                    Update Permission
                  </TableCell>
                  <TableCell className="py-2 px-4 text-center">
                    <div className="flex justify-center items-center">
                      {freelancer.updatePermissionFreelancer &&
                      freelancer.updatePermissionFreelancer &&
                      freelancer.acceptanceFreelancer ? (
                        <Check className="text-green-600 w-5 h-5" />
                      ) : (
                        <X className="text-red-600 w-5 h-5" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-4 text-center">
                    <div className="flex justify-center items-center">
                      {freelancer.updatePermissionBusiness &&
                      freelancer.updatePermissionFreelancer &&
                      freelancer.rejectionFreelsncer ? (
                        <Check className="text-green-600 w-5 h-5" />
                      ) : (
                        <X className="text-red-600 w-5 h-5" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3">{task.summary}</p>
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
