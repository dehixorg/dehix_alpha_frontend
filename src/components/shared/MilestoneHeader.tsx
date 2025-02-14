import React, { useState } from 'react';

import { Badge } from '../ui/badge';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { getStatusBadge } from '@/utils/statusBadge';

interface Milestone {
  title: string;
  status: string;
  description: string;
}

const MilestoneHeader = ({ milestone }: { milestone: Milestone }) => {
  const { text: MilestoneStatus, className: MilestoneStatusBadgeStyle } =
    getStatusBadge(milestone.status);

  // State to handle description expansion
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to toggle description expansion
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Split the description into words and check length
  const descriptionWords = milestone.description.split(' ');

  // Display the first 30 words or the full description based on expansion state
  const truncatedDescription =
    descriptionWords.length > 30
      ? descriptionWords.slice(0, 30).join(' ') + '...'
      : milestone.description;

  return (
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
        <p>{isExpanded ? milestone.description : truncatedDescription}</p>
        {descriptionWords.length > 30 && (
          <button
            onClick={toggleDescription}
            className="text-blue-500 text-xs mt-2"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </CardDescription>
    </CardHeader>
  );
};

export default MilestoneHeader;
