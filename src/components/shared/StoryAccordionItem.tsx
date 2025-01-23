import React, { useState } from 'react';
import { Copy, ChevronsUpDown, Plus, Milestone, X, Check } from 'lucide-react';

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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Task } from '@/utils/types/Milestone';

interface Story {
  _id?: string;
  title: string;
  summary: string;
  storyStatus: string;
  importantUrls: { urlName: string; url: string }[];
  tasks: { _id: string; title: string; summary: string; taskStatus: string }[];
}

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

interface StoryAccordionItemProps {
  milestoneId: string | undefined;
  story: Story;
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
  const { text: projectStatus, className: statusBadgeStyle } = getStatusBadge(
    story.storyStatus,
  );
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ description: 'URL copied!!', duration: 900 });
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
      className={`py-2  ${idx === milestoneStoriesLength - 1 ? 'border-b-0 ' : 'border-b-2'} `}
    >
      <AccordionTrigger
        className={`flex hover:no-underline items-center under px-4 w-full `}
      >
        <div className="flex justify-between items-center w-full px-4 py-1 rounded-lg duration-300">
          <h3 className="text-lg md:text-xl font-semibold">{story.title}</h3>
          <Badge
            className={`${statusBadgeStyle} px-3 py-1 hidden md:flex text-xs md:text-sm rounded-full`}
          >
            {projectStatus}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="w-full px-4 py-4 sm:px-6 sm:py-4 md:px-8 md:py-6 lg:px-10 lg:py-8">
        <div className="space-y-4">
          <Badge
            className={`${statusBadgeStyle} px-2 py-1 block md:hidden text-xs md:text-sm rounded-full`}
            style={{ width: 'fit-content' }}
          >
            {projectStatus}
          </Badge>
          <p className="leading-relaxed text-sm md:text-base">
            {story.summary}
          </p>
          <div className="space-y-4 hidden md:flex justify-start items-center gap-4">
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
                  {truncateDescription(value, 23) || 'Select or search URL...'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search URL..." className="h-9" />
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
        <Card className="px-2  mt-5 py-3">
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
                  {story.tasks.map((task) => {
                    const { text: taskStatusText, className: taskBadgeStyle } =
                      getStatusBadge(task.taskStatus);

                    return (
                      <CarouselItem
                        key={task._id}
                        className="min-w-0 mt-2 w-full md:basis-1/2 sm:w-full md:w-1/2 lg:w-1/3"
                      >
                        <div className=" p-0 md:p-2 mt-5">
                          <Card
                            className="w-full cursor-pointer  border relative rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                            onClick={() => setSelectedTask(task)}
                          >
                            <CardHeader className="p-2 md:p-4 ">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm md:text-lg font-medium">
                                  {truncateDescription(task.title, 20)}
                                </CardTitle>
                                <Badge
                                  className={`${taskBadgeStyle} px-2 py-0.5 text-xs md:text-sm rounded-md`}
                                >
                                  {task.taskStatus}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4">
                              <p className="text-sm leading-relaxed">
                                {truncateDescription(task.summary, 30)}
                              </p>
                            </CardContent>
                            <div onClick={(e) => e.stopPropagation()}>
                              <TaskDropdown
                                fetchMilestones={fetchMilestones}
                                milestoneId={milestoneId}
                                storyId={story._id}
                                task={task}
                              />
                            </div>
                          </Card>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <div
                  className={`${story?.tasks?.length > (window.innerWidth > 768 ? 2 : 1) ? 'block' : 'hidden'}`}
                >
                  {story?.tasks?.length >
                    (window.innerWidth >= 768 ? 2 : 1) && (
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
                  This {story.title} currently has no tasks. Add tasks to ensure
                  smooth progress and better tracking.
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
        </Card>
      </AccordionContent>
      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </AccordionItem>
  );
};

export default StoryAccordionItem;

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
                      freelancer.acceptanceBusiness ? (
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
