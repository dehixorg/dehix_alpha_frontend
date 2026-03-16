'use client';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

import FreelancerSettingsLayout from '../../../../components/layout/FreelancerSettingsLayout';

import { RootState } from '@/lib/store';

import React, { Fragment } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const KYCForm = dynamic(() => import('@/components/form/kycFreelancerForm'), {
  ssr: false,
  loading: () => (
    <Card className="p-6 md:p-8 shadow-lg relative rounded-xl w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <Skeleton className="h-8 md:h-10 w-64 md:w-80 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* KycStatusAlert skeleton */}
      <Skeleton className="h-16 w-full rounded-md mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Mobile Horizontal Stepper Skeleton */}
        <div className="md:hidden col-span-full -mt-1 flex items-center justify-between px-2">
          {[1, 2, 3].map((i) => (
            <Fragment key={i}>
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              {i < 3 && <Skeleton className="h-px w-full mx-2" />}
            </Fragment>
          ))}
        </div>

        {/* Sidebar Stepper Skeleton */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3">
          <div className="space-y-6 pe-6 border-r border-muted/20">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton (Step 1) */}
        <section className="md:col-span-8 lg:col-span-9 space-y-6">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-[160px] w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-[160px] w-full rounded-xl" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Skeleton className="h-10 w-full sm:w-24 rounded-md" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </section>
      </div>
    </Card>
  ),
});

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <FreelancerSettingsLayout
      active="KYC"
      activeMenu="KYC"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'KYC', link: '#' },
      ]}
      isKycCheck={true}
      contentClassName="flex flex-col sm:pl-14"
      mainClassName="flex-1 p-4 sm:p-8 md:p-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <KYCForm user_id={user.uid} />
      </div>
    </FreelancerSettingsLayout>
  );
}
