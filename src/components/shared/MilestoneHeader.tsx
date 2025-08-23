import React from 'react';

import { Badge } from '../ui/badge';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusBadge } from '@/utils/statusBadge';

interface Milestone {
  title: string;
  status: string;
  description: string;
}

const MilestoneHeader = ({ milestone }: { milestone: Milestone }) => {
  const { text: MilestoneStatus, className: MilestoneStatusBadgeStyle } =
    getStatusBadge(milestone.status);

  return (
    <CardHeader>
      <CardTitle className="text-lg md:text-xl font-bold flex justify-between items-center">
        <div className="flex items-center">
          <p>Milestone: {milestone.title}</p>
          <button
            className="p-1 h-auto flex-shrink-0 bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded ml-2"
            onClick={(e) => {
              e.stopPropagation();
              const modal = document.createElement('div');
              modal.className =
                'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
              modal.innerHTML = `
                <div class="bg-[#151518] rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                 <div class="flex justify-between items-center mb-4">
                                                <h3 class="text-lg font-semibold text-white">Description</h3>
                                                <button class="text-red-500 hover:text-red-700" onclick="this.closest('.fixed').remove()">
                                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                  </svg>
                                                </button>
                                              </div>
                  <div class="text-sm text-white whitespace-pre-wrap mt-10">
                    ${milestone.description}
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
          </button>
        </div>
        <p>
          <Badge
            className={`${MilestoneStatusBadgeStyle} px-3 py-1 hidden md:flex text-xs md:text-sm rounded-full`}
          >
            {MilestoneStatus}
          </Badge>
        </p>
      </CardTitle>
    </CardHeader>
  );
};

export default MilestoneHeader;
