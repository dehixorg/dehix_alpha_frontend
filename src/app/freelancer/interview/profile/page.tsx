'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import InterviewProfile from '@/components/freelancer/interviewProfile/interviewProfile';
import { RootState } from '@/lib/store';

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-col sm:py-2 sm:pl-14 mb-8 w-full">
        <InterviewProfile freelancerId={user?.uid} />
      </div>
    </div>
  );
}
