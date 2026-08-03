import React, { useState } from 'react';
import { ClipboardPlus, Edit2, Plus, Trash2 } from 'lucide-react';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

import StoryAccordionItem from './StoryAccordionItem';
import AddTaskDialog from './AddTaskDialog';
import AddStoryDialog from './AddStoryDialog';

import { Accordion } from '@/components/ui/accordion';
import { useMilestoneDialog } from '@/hooks/useMilestoneDialog';
import { Milestone, Story } from '@/utils/types/Milestone';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MAX_TASKS = 5;

interface StoriesAccordionProps {
  milestone: Milestone;
  fetchMilestones: any;
  handleStorySubmit: any;
  isFreelancer: boolean;
  freelancerId?: string;
  isLiveRoomPreview?: boolean;
  /** Optional local-mode callbacks */
  onEditStory?: (storyId: string, title: string, summary: string) => void;
  onDeleteStory?: (storyId: string) => void;
  onEditTask?: (
    storyId: string,
    taskIndex: number,
    title: string,
    summary: string,
  ) => void;
  onDeleteTask?: (storyId: string, taskIndex: number) => void;
  onRefineTask?: (
    storyId: string,
    taskIndex: number,
    instruction: string,
  ) => void;
}

const StoriesAccordion: React.FC<StoriesAccordionProps> = (props) => {
  const {
    milestone,
    fetchMilestones,
    handleStorySubmit,
    isFreelancer = false,
    freelancerId,
    isLiveRoomPreview = false,
    onEditStory,
    onDeleteStory,
    onEditTask,
    onDeleteTask,
    onRefineTask,
  } = props;
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);

  // Edit-story dialog state
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editStoryTitle, setEditStoryTitle] = useState('');
  const [editStorySummary, setEditStorySummary] = useState('');

  const [formData, setFormData] = useState({
    summary: '',
    title: '',
    taskStatus: 'NOT_STARTED',
    freelancers: [{ freelancerId: '', freelancerName: '', cost: 0 }],
  });
  const [storyData, setStoryData] = useState<Story>({
    title: '',
    summary: '',
    storyStatus: '',
    tasks: [],
    importantUrls: [{ urlName: '', url: '' }],
  });

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
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } },
  ) => {
    const { name, value } =
      'target' in event ? event.target : { name: 'taskStatus', value: event };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFreelancerSelect = (freelancer: {
    _id: string;
    userName: string;
    perHourPrice: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      freelancers: [
        {
          freelancerId: freelancer._id,
          freelancerName: freelancer.userName,
          cost: Number(freelancer.perHourPrice),
        },
      ],
    }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedFormData = { formData, storyId: openAccordion };

    if (milestone.stories) {
      const story = milestone.stories.find(
        (story: Story) => story._id === openAccordion,
      );
      if (story) {
        // Max 5 tasks guard
        if ((story.tasks ?? []).length >= MAX_TASKS) {
          setIsTaskDialogOpen(false);
          return;
        }
        handleStorySubmit(e, story, milestone, true, updatedFormData);
      }
    }

    setFormData({
      summary: '',
      title: '',
      taskStatus: 'NOT_STARTED',
      freelancers: [{ freelancerId: '', freelancerName: '', cost: 0 }],
    });
    setIsTaskDialogOpen(false);
  };

  // ── Edit story handlers ──

  const openEditStory = (story: Story) => {
    setEditingStory(story);
    setEditStoryTitle(story.title ?? '');
    setEditStorySummary(story.summary ?? '');
  };

  const handleEditStorySave = () => {
    if (!editingStory) return;
    onEditStory?.(editingStory._id!, editStoryTitle, editStorySummary);
    setEditingStory(null);
  };

  const handleDeleteStoryClick = (storyId: string) => {
    if (
      !window.confirm(
        'Delete this story and all its tasks? This cannot be undone.',
      )
    )
      return;
    onDeleteStory?.(storyId);
  };

  const localMode = Boolean(onEditStory || onDeleteStory);

  return (
    <div className="w-full px-0 md:px-0 lg:px-0 rounded-lg">
      <div className="card border rounded-lg">
        {(milestone.stories ?? []).length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <h3
                className="text-base md:text-lg font-bold tracking-tight text-foreground truncate min-w-0"
                title={`Stories for ${milestone.title}`}
              >
                Stories for <span className="text-primary font-semibold">{milestone.title}</span>
              </h3>
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground shrink-0"
              >
                {(milestone.stories ?? []).length} total
              </Badge>
            </div>
            {!isFreelancer && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setIsStoryDialogOpen(true)}
                      aria-label="Add a new story"
                      className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-lg bg-background text-foreground border border-border/80 hover:bg-accent hover:border-primary/40 shadow-xs transition-all shrink-0"
                    >
                      <Plus size={14} className="text-primary" /> Add Story
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Create a new story
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        <Accordion
          type="single"
          collapsible
          value={openAccordion}
          onValueChange={(value) => setOpenAccordion(value)}
        >
          {(milestone.stories ?? []).length > 0 ? (
            (milestone.stories ?? []).map((story: Story, idx: number) => (
              <StoryAccordionItem
                key={story._id ?? idx}
                fetchMilestones={fetchMilestones}
                isFreelancer={isFreelancer}
                freelancerId={freelancerId}
                milestoneId={milestone._id}
                story={story}
                idx={idx}
                milestoneStoriesLength={(milestone.stories ?? []).length}
                setIsTaskDialogOpen={setIsTaskDialogOpen}
                isLiveRoomPreview={isLiveRoomPreview}
                // Pass story edit/delete callbacks for inline header display
                onEditStory={
                  onEditStory ? () => openEditStory(story) : undefined
                }
                onDeleteStory={
                  onDeleteStory && story._id
                    ? () => handleDeleteStoryClick(story._id!)
                    : undefined
                }
                // Pass per-story task callbacks
                onEditTask={
                  onEditTask
                    ? (taskIndex, title, summary) =>
                        onEditTask(story._id!, taskIndex, title, summary)
                    : undefined
                }
                onDeleteTask={
                  onDeleteTask
                    ? (taskIndex) => onDeleteTask(story._id!, taskIndex)
                    : undefined
                }
                onRefineTask={
                  onRefineTask
                    ? (taskIndex, instruction) =>
                        onRefineTask(story._id!, taskIndex, instruction)
                    : undefined
                }
              />
            ))
          ) : (
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-full md:w-auto order-2 md:order-1 text-center md:text-left">
                  {isFreelancer ? (
                    <>
                      <h4 className="text-lg font-semibold">No stories yet</h4>
                      <p className="text-sm text-muted-foreground">
                        This &ldquo;{milestone.title}&rdquo; milestone
                        doesn&apos;t have any stories yet. The business will add
                        them soon.
                      </p>
                    </>
                  ) : (
                    <div className="mx-auto">
                      <h4 className="text-lg font-semibold">
                        Start by adding a story
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This &ldquo;{milestone.title}&rdquo; milestone currently
                        has no stories. Create one to track tasks and progress.
                      </p>
                    </div>
                  )}
                </div>
                <div className="order-1 md:order-2 sm:ml-auto">
                  {!isFreelancer && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            className="rounded-full h-24 w-24 border-2 border-dashed flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/60 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                            onClick={() => setIsStoryDialogOpen(true)}
                            aria-label="Create the first story"
                          >
                            <ClipboardPlus className="h-8 w-8" />
                            <span>Add Story</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          Create the first story
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          )}
        </Accordion>
      </div>

      {isTaskDialogOpen && (
        <AddTaskDialog
          isDialogOpen={isTaskDialogOpen}
          setIsDialogOpen={setIsTaskDialogOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handelSubmit={handleFormSubmit}
          handleFreelancerSelect={handleFreelancerSelect}
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

      {/* Edit Story Dialog */}
      {editingStory && (
        <Dialog open onOpenChange={() => setEditingStory(null)}>
          <DialogContent className="max-w-md bg-card border-border rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Edit Story
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </label>
                <input
                  value={editStoryTitle}
                  onChange={(e) => setEditStoryTitle(e.target.value)}
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Summary
                </label>
                <textarea
                  value={editStorySummary}
                  onChange={(e) => setEditStorySummary(e.target.value)}
                  rows={3}
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingStory(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditStorySave}
                disabled={!editStoryTitle.trim()}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StoriesAccordion;
