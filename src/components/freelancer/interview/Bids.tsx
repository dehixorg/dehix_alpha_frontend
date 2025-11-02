'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import Bids from '@/components/freelancer/bids/Bids';

export default function BidsComponent() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <>
      <div className="ml-5 md:ml-10 mr-5 md:mr-10">
        <div className="w-full rounded-xl p-5 md:p-6 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Interview Bids
          </h1>
          <p className="mt-2 text-slate-200">
            Select your bids strategically and secure your interview
          </p>
        </div>
      </div>
      <Bids userId={user.uid} />
    </>
  );
}
