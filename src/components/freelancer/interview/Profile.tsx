'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import InterviewProfile from '@/components/freelancer/interviewProfile/interviewProfile';
import { RootState } from '@/lib/store';

export default function ProfileTab() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <>
      <div className="ml-5 md:ml-10">
        <h1 className="text-3xl font-bold">Interview Profile</h1>
        <p className="text-gray-400 mt-2">
          Manage and track your skills and domains. Add new skills or domains
          and provide your experience levels.
        </p>
      </div>
      <InterviewProfile freelancerId={user?.uid} />
    </>
  );
}
