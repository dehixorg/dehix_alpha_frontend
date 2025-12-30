import React from 'react';

import FreelancerCard from '@/components/opportunities/freelancer/freelancerCard';
import EmptyState from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FreelancerListProps {
  freelancers: any[];
  isLoading?: boolean;
}

const FreelancerList: React.FC<FreelancerListProps> = ({
  freelancers,
  isLoading = false,
}) => {
  return (
    <div className="mx-auto space-y-4 w-full">
      {isLoading ? (
        // Skeleton Loader using shadcn/ui Skeleton
        [...Array(5)].map((_, index) => (
          <Card
            key={`skeleton-${index}`}
            className="mx-auto max-w-[1000px] group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl bg-muted-foreground/20 dark:bg-muted/20"
          >
            <div className="md:flex md:gap-6">
              {/* Left Side - Profile Skeleton */}
              <div className="p-6 md:p-8 flex flex-col items-center md:items-start md:border-r md:border-border pt-4 md:w-80 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <div className="relative mb-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>

                <div className="text-center md:text-left w-full space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-24 mx-auto md:mx-0" />
                </div>

                <div className="mt-4 w-full">
                  <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>

              {/* Right Side - Details Skeleton */}
              <div className="flex-1 md:p-8 pt-4 flex flex-col">
                <div className="mb-6">
                  <Skeleton className="h-4 w-16 mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-7 w-20 rounded-md" />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-7 w-24 rounded-full" />
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 border-t border-border">
                  <Skeleton className="h-10 w-full sm:min-w-[140px]" />
                  <Skeleton className="h-10 w-full sm:min-w-[140px]" />
                  <Skeleton className="h-10 w-full sm:min-w-[140px]" />
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : freelancers.length === 0 ? (
        <EmptyState title="No talent found" className="h-[55vh]" />
      ) : (
        freelancers.map((freelancer: any, index: number) => {
          // Extract active dehixTalent profile id (supports object, Map, or array shapes)
          const getActiveDehixTalentId = (f: any) => {
            if (!f?.dehixTalent) return undefined;
            let entries: any[] = [];
            if (Array.isArray(f.dehixTalent)) entries = f.dehixTalent;
            else if (f.dehixTalent instanceof Map)
              entries = Array.from(f.dehixTalent.values());
            else entries = Object.values(f.dehixTalent || {});
            const active = entries.find(
              (entry: any) => entry?.activeStatus === true,
            );
            return active?._id;
          };

          const profId = getActiveDehixTalentId(freelancer);

          return (
            <FreelancerCard
              key={index}
              name={freelancer.firstName + ' ' + freelancer.lastName}
              attributes={freelancer.attributes || []}
              experience={freelancer.workExperience}
              profile={freelancer.profilePic}
              userName={freelancer.userName}
              monthlyPay={freelancer.monthlyPay}
              githubUrl={freelancer.github || freelancer.githubLink}
              linkedInUrl={freelancer.linkedin}
              websiteUrl={freelancer.personalWebsite}
              freelancer_id={freelancer._id}
              freelancer_professional_profile_id={profId}
            />
          );
        })
      )}
    </div>
  );
};

export default FreelancerList;
