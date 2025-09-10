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
}

const StoriesSection: React.FC<StoriesSectionProps> = ({
  milestone,
  fetchMilestones,
  handleStorySubmit,
  isFreelancer = false,
  freelancerId,
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
      />
    </div>
  );
};

export default StoriesSection;
