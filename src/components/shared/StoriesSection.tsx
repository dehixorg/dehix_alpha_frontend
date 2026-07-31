'use client';

import type React from 'react';

import StoriesAccordion from './StoriesAccodian';

import type { Milestone } from '@/utils/types/Milestone';

interface StoriesSectionProps {
  milestone: Milestone | null;
  fetchMilestones: any;
  handleStorySubmit: any;
  isFreelancer?: boolean;
  freelancerId?: string;
  /** Optional local-mode edit/delete callbacks (used in pre-launch planner) */
  onEditStory?: (storyId: string, title: string, summary: string) => void;
  onDeleteStory?: (storyId: string) => void;
  onEditTask?: (
    storyId: string,
    taskIndex: number,
    title: string,
    summary: string,
  ) => void;
  onDeleteTask?: (storyId: string, taskIndex: number) => void;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({
  milestone,
  fetchMilestones,
  handleStorySubmit,
  isFreelancer = false,
  freelancerId,
  onEditStory,
  onDeleteStory,
  onEditTask,
  onDeleteTask,
}) => {
  if (!milestone) {
    return (
      <div className="flex justify-center items-center h-[50vh] overflow-hidden">
        <p className="text-gray-500">Select a milestone to view stories</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-visible">
      {/* ensure no clipping; allow expanded accordion to flow */}
      <StoriesAccordion
        milestone={milestone}
        fetchMilestones={fetchMilestones}
        handleStorySubmit={handleStorySubmit}
        isFreelancer={isFreelancer}
        freelancerId={freelancerId}
        onEditStory={onEditStory}
        onDeleteStory={onDeleteStory}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};

export default StoriesSection;
