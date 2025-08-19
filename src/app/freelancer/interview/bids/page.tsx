'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import Bids from '@/components/freelancer/bids/Bids';

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex mb-8 flex-col sm:pl-14 w-full">
        <div className="ml-10 mt-6 mb-10">
          <h1 className="text-3xl font-bold">Interview Bid&apos;s</h1>
          <p className="text-gray-400 mt-2">
            Select your bids strategically and secure your interview
          </p>
        </div>
        <Bids userId={user.uid} />
      </div>
    </div>
  );
}
