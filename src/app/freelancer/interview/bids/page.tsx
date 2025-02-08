'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
import { RootState } from '@/lib/store';
import ProjectInterviews from '@/components/freelancer/projectInterview/ProjectInterviews';
import Header from '@/components/header/header';
import Bids from '@/components/freelancer/bids/Bids';


export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <div className="flex min-h-screen w-full  bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Bids"
      />
      <div className="flex flex-col sm:pl-14 w-full">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Interview', link: '#' },
            { label: 'Bids', link: '#' },
          ]}
        />
        <div className="ml-10 mt-6">
          <h1 className="text-3xl font-bold">Interview Bid's</h1>
          <p className="text-gray-400 mt-2">
            Select your bids strategically and secure your interview
          </p>
        </div>
        <Bids />
      </div>

    </div>
  );
}
