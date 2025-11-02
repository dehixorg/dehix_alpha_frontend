'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import InterviewProfile from '@/components/freelancer/interviewProfile/interviewProfile';
import { RootState } from '@/lib/store';

export default function ProfileComponent() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <>
      <div className="ml-5 md:ml-10 mr-5 md:mr-10">
        <div className="w-full rounded-xl p-5 md:p-6 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Interview Profile</h1>
          <p className="mt-2 text-slate-200">
            Manage and track your skills or domains. Add new skills or domains and provide your
            experience levels.
        </p>
      </div>
      </div>
      <InterviewProfile freelancerId={user?.uid} />
    </>
  );
}
