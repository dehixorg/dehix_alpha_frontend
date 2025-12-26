'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import Bids from '@/components/freelancer/bids/Bids';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function BidsComponent() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl sm:text-2xl">Interview Bids</CardTitle>
          <CardDescription>
            Select your bids strategically and secure your interview.
          </CardDescription>
        </CardHeader>
      </Card>
      <Bids userId={user.uid} />
    </>
  );
}
