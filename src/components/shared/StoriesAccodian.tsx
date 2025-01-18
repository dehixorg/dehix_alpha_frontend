import React, { useState } from 'react';
import { Plus, ChevronsUpDown, Copy } from 'lucide-react';

import { Badge } from '../ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

import AddTaskDialog from './AddTaskDialog';
import AddStoryDialog from './AddStoryDialog';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { getStatusBadge } from '@/utils/statusBadge';
import { useMilestones } from '@/hooks/useMilestones';
import { useMilestoneDialog } from '@/hooks/useMilestoneDialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { importantUrl, Milestone, Story } from '@/utils/types/Milestone';

const StoriesAccordion = ({
  milestone,
  milestoneId,
}: {
  milestone: Milestone;
  milestoneId: string;
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    title: '',
    taskStatus: 'NOT_STARTED',
  });
  const [storyData, setStoryData] = useState<Story>({
    title: '',
    summary: '',
    storyStatus: '',
    tasks: [],
    importantUrls: [{ urlName: '', url: '' }],
  });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ description: 'URL copied!!', duration: 900 });
    setOpen(false);
    setValue('');
  };

  const { handleStorySubmit } = useMilestones();
  const { handleRemoveUrl, handleAddUrl, handleStoryInputChange } =
    useMilestoneDialog({ setStoryData });

  const resetFields = () => {
    setStoryData({
      title: '',
      summary: '',
      storyStatus: '',
      tasks: [],
      importantUrls: [{ urlName: '', url: '' }],
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
  ) => {
    if (typeof e === 'string') {
      const name = 'taskStatus';
      console.log({ name, value: e });

      setFormData((prev) => ({ ...prev, [name]: e }));
    } else {
      const { name, value } = e.target;
      console.log({ name, value });

      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = { formData, storyId: openAccordion };

    if (milestone.stories) {
      const story = milestone.stories.find(
        (story) => story._id === openAccordion,
      );
      if (story) {
        handleStorySubmit(e, story, milestone, true, updatedFormData);
      }
    }

    setFormData({
      summary: '',
      title: '',
      taskStatus: 'NOT_STARTED',
    });
    setIsTaskDialogOpen(false);
  };

  const { text: MilestoneStatus, className: MilestoneStatusBadgeStyle } =
    getStatusBadge(milestone.status);

  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text?.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className="w-full px-4 md:px-0 lg:px-0 py-6 max-w-5xl mx-auto rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-bold flex justify-between items-center">
            <p>Milestone: {milestone.title}</p>
            <p>
              <Badge
                className={`${MilestoneStatusBadgeStyle} px-3 py-1 hidden md:flex text-xs md:text-sm rounded-full`}
              >
                {MilestoneStatus}
              </Badge>
            </p>
          </CardTitle>
          <CardDescription className="mt-1 text-sm md:text-base">
            {milestone.description}
          </CardDescription>
        </CardHeader>

        {(milestone.stories ?? []).length > 0 && (
          <div className="flex p-4 justify-between items-center mt-4">
            <h3 className="text-lg md:text-xl font-semibold">Stories:</h3>
            <Button
              className="px-3 py-1 text-sm sm:text-base"
              onClick={() => setIsStoryDialogOpen(true)}
            >
              <Plus size={15} /> Add Story
            </Button>
          </div>
        )}

        <Accordion
          type="single"
          collapsible
          value={openAccordion}
          onValueChange={(value) => setOpenAccordion(value)}
          className="pt-4 px-0"
        >
          {(milestone.stories ?? []).length > 0 ? (
            (milestone.stories ?? []).map((story: Story, idx: number) => {
              const { text: projectStatus, className: statusBadgeStyle } =
                getStatusBadge(story.storyStatus);

              return (
                <AccordionItem
                  key={story._id}
                  value={story._id ?? ''}
                  className="py-2"
                >
                  <AccordionTrigger
                    className={`flex hover:no-underline items-center px-4 w-full ${idx === (milestone.stories ?? []).length - 1 ? 'border-b-0 pb-3' : ''}`}
                  >
                    <div className="flex justify-between items-center w-full px-4 py-1 rounded-lg duration-300">
                      <h3 className="text-lg md:text-xl font-semibold">
                        {story.title}
                      </h3>
                      <Badge
                        className={`${statusBadgeStyle} px-3 py-1 hidden md:flex text-xs md:text-sm rounded-full`}
                      >
                        {projectStatus}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="w-full   px-4 py-4 sm:px-6 sm:py-4 md:px-8 md:py-6 lg:px-10 lg:py-8">
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
                                    (url: importantUrl) => (
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
                                              {truncateDescription(
                                                url.urlName,
                                                20,
                                              )}
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
                    {story?.tasks?.length > 0 ? (
                      <div>
                        <div className="flex justify-between items-center mt-4">
                          <h4 className="text-lg md:text-xl font-semibold">
                            Tasks:
                          </h4>
                          <Button
                            className="px-3 py-1 text-sm sm:text-base"
                            onClick={() => setIsTaskDialogOpen(true)}
                          >
                            <Plus size={15} /> Add Task
                          </Button>
                        </div>
                        <Carousel className=" w-[80vw] md:w-full relative mt-4">
                          <CarouselContent className="flex flex-nowrap gap-2">
                            {story.tasks.map((task: any) => {
                              const {
                                text: taskStatusText,
                                className: taskBadgeStyle,
                              } = getStatusBadge(task.taskStatus);

                              return (
                                <CarouselItem
                                  key={task._id}
                                  className="min-w-0 w-full  md:basis-1/2 sm:w-full md:w-1/2 lg:w-1/3"
                                >
                                  <div className="p-2 mt-5">
                                    <Card className="w-full border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                      <CardHeader className="p-2 md:p-4">
                                        <div className="flex justify-between items-center">
                                          <CardTitle className="text-sm md:text-lg font-medium">
                                            {task.title}
                                          </CardTitle>
                                          <Badge
                                            className={`${taskBadgeStyle} px-2 py-0.5 text-xs md:text-sm rounded-md`}
                                          >
                                            {task.taskStatus}
                                          </Badge>
                                        </div>
                                        <p className="mt-1 text-xs md:text-sm">
                                          {task._id}
                                        </p>
                                      </CardHeader>
                                      <CardContent className="p-4">
                                        <p className="text-sm leading-relaxed">
                                          {task.summary}
                                        </p>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </CarouselItem>
                              );
                            })}
                          </CarouselContent>
                          <div
                            className={` ${story?.tasks?.length > (window.innerWidth > 768 ? 2 : 1) ? 'block' : 'hidden'}`}
                          >
                            {story?.tasks?.length >
                              (window.innerWidth >= 768 ? 2 : 1) && (
                              <>
                                <CarouselPrevious className="absolute top-2 left-2 transform -translate-y-1/2 shadow rounded-full p-2" />
                                <CarouselNext className="absolute top-2 right-2 transform -translate-y-1/2 shadow rounded-full p-2" />
                              </>
                            )}
                          </div>
                        </Carousel>
                      </div>
                    ) : (
                      <div className="text-center mt-12 p-4 rounded-md ">
                        <p>
                          This {story.title} currently has no tasks. Add tasks
                          to ensure smooth progress and better tracking.
                        </p>
                        <Button
                          className="mt-2 px-3 py-1 text-sm sm:text-base"
                          onClick={() => setIsTaskDialogOpen(true)}
                        >
                          <Plus size={15} /> Add Task
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })
          ) : (
            <div className="text-center mt-4 p-4 rounded-md">
              <p>
                This {milestone.title} currently has no associated stories.
                Please add a story to ensure smooth progress and effective
                tracking.
              </p>
              <Button
                className="mt-2 px-3 py-1 text-sm sm:text-base"
                onClick={() => setIsStoryDialogOpen(true)}
              >
                <Plus size={15} /> Add Story
              </Button>
            </div>
          )}
        </Accordion>
      </Card>

      {isTaskDialogOpen && (
        <AddTaskDialog
          isDialogOpen={isTaskDialogOpen}
          setIsDialogOpen={setIsTaskDialogOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handelSubmit={handleFormSubmit}
        />
      )}

      {isStoryDialogOpen && (
        <AddStoryDialog
          isDialogOpen={isStoryDialogOpen}
          setIsDialogOpen={setIsStoryDialogOpen}
          handleInputChange={handleStoryInputChange}
          handleCloseDialog={() => setIsStoryDialogOpen(false)}
          storyData={storyData}
          resetFields={resetFields}
          handleRemoveUrl={handleRemoveUrl}
          handleAddUrl={handleAddUrl}
          milestones={milestone}
          handleStorySubmit={handleStorySubmit}
        />
      )}
    </div>
  );
};

export default StoriesAccordion;
