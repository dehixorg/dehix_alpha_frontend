import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const FreelancerProfileSkeleton = () => {
  return (
    <div className="p-3 relative sm:pl-6">
      <Skeleton className="h-10 w-40 mb-4" />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Skeleton className="h-14 w-full rounded-lg" />
        <main className="mt-8">
          <section className="flex flex-col md:flex-row items-center gap-6 rounded-2xl p-6">
            <Skeleton className="w-36 h-36 rounded-full border-4" />
            <div className="text-center md:text-left">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="flex mt-2 justify-center md:justify-around items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </section>
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </section>
          <section className="mt-8">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-52 w-full rounded-lg" />
              <Skeleton className="h-52 w-full rounded-lg" />
              <Skeleton className="h-52 w-full rounded-lg" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FreelancerProfileSkeleton;
