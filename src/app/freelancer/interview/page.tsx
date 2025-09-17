'use client';
import React from 'react';
import { ListVideo, Users2, History, Briefcase } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileComponent from '@/components/freelancer/interview/Profile';
import BidsComponent from '@/components/freelancer/interview/Bids';
import CurrentComponent from '@/components/freelancer/interview/Current';
import HistoryComponent from '@/components/freelancer/interview/History';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

export default function InterviewPage() {
  return (
    <div className="flex min-h-screen bg-muted/40 w-full flex-col pb-10">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Interviews"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Interviews"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Interview', link: '/freelancer/interview' },
          ]}
        />
        <main className="flex-1 p-4 md:p-6">
          <div className="w-full p-4">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <Users2 className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="current"
                  className="flex items-center gap-2"
                >
                  <ListVideo className="h-4 w-4" />
                  <span>Current</span>
                </TabsTrigger>
                <TabsTrigger value="bids" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Bids</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileComponent />
              </TabsContent>
              <TabsContent value="current">
                <CurrentComponent />
              </TabsContent>
              <TabsContent value="bids">
                <BidsComponent />
              </TabsContent>
              <TabsContent value="history">
                <HistoryComponent />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
