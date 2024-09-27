'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Adjust the import path as necessary
import { Card } from '@/components/ui/card';

const FreelancerCardSkeleton: React.FC = () => {
  return (
    <div className="w-full mb-4 max-w-4xl">
      <Card className="flex justify-between mt-5 shadow-2xl shadow-gray-500/20">
        <div className="flex flex-col justify-between p-4">
          <div className="flex gap-4">
            {/* Avatar Skeleton */}
            <Skeleton className="rounded-full w-20 h-20" />
            {/* Name Section Skeleton */}
            <Skeleton className="h-6 w-1/2 mt-8" />
          </div>

          <div className="mt-6">
            {/* Experience Skeleton */}
            <Skeleton className="h-4 w-1/3" />
          </div>

          {/* Skills Section Skeleton */}
          <div className="mt-2">
            <p className="font-medium">Skills:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-16 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Domains Section Skeleton */}
          {/* <div className="mt-2">
            <p className="font-medium">Domains:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-24 rounded-xl" />
              ))}
            </div>
          </div> */}
        </div>
      </Card>
    </div>
  );
};

export default FreelancerCardSkeleton;
