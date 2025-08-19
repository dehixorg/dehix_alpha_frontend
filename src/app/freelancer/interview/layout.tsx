'use client';
import { ListVideo, Users2, History, Briefcase } from 'lucide-react';
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
const InterviewLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const activeTab = pathname.includes('/freelancer/interview/current')
    ? 'Current'
    : pathname.includes('/freelancer/interview/bids')
      ? 'bids'
      : pathname.includes('/freelancer/interview/history')
        ? 'history'
        : 'profile';
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
      <div className="flex mb-8 flex-col sm:pl-14 w-full">
        {/* Main Content */}
        <div className="flex-1">
          <div className="w-full p-4">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/interview/profile">
                    <Users2 className="h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="Current"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/interview/current">
                    <ListVideo className="h-4 w-4" />
                    <span>Current</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="bids"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/interview/bids">
                    <Briefcase className="h-4 w-4" />
                    <span>Bids</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/interview/history">
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </a>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="w-full flex-1 items-start px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLayout;
