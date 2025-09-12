'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import Bids from '@/components/freelancer/bids/Bids';

export default function BidsTab() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <>
      <div className="ml-5 md:ml-10">
        <h1 className="text-3xl font-bold">Interview Bids</h1>
        <p className="text-gray-400 mt-2">
          Select your bids strategically and secure your interview
        </p>
      </div>
      <Bids userId={user.uid} />
    </>
  );
}