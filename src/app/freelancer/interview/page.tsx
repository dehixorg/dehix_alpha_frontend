'use client';
import * as React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileTab from '@/components/freelancer/interview/Profile';
import CurrentTab from '@/components/freelancer/interview/Current';
import BidsTab from '@/components/freelancer/interview/BidsTab';
import HistoryTab from '@/components/freelancer/interview/History';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

export default function InterviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="bg-background border-r">
        <SidebarMenu
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          active="Interviews"
        />
      </div>
      <div className="flex flex-col w-full sm:ml-14">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <Tabs defaultValue="profile" className="mt-5">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>
            <TabsContent value="current">
              <CurrentTab />
            </TabsContent>
            <TabsContent value="bids">
              <BidsTab />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
