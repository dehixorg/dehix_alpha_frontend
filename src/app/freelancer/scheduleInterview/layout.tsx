'use client';

import { ListVideo, History, Briefcase } from 'lucide-react';
import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { createScheduleInterviewMenuItems } from '@/config/menuItems/freelancer/scheduleInterviewMenuItems';

const ScheduleInterviewLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // figure out which tab is active
  const activeTab = pathname.includes('/freelancer/scheduleInterview/bids')
    ? 'bids'
    : pathname.includes('/freelancer/scheduleInterview/history')
      ? 'history'
      : 'current';

  // handle tab switching
  const handleTabChange = (value: string) => {
    router.push(`/freelancer/scheduleInterview/${value}`);
  };

  // get menu items dynamically (factory fn)
  const { menuItemsTop, menuItemsBottom } = createScheduleInterviewMenuItems((tab) => {
    router.push(`/freelancer/scheduleInterview/${tab}`);
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="bg-background border-r">
        <SidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active="Interviews"
        />
      </div>

      {/* Main Content */}
      <div className="flex mb-8 flex-col md:pl-0 sm:pl-14 w-full">
        <div className="flex-1">
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 mb-6">
                <TabsTrigger value="current">
                  <ListVideo className="mr-2 h-4 w-4" />
                  Current
                </TabsTrigger>
                <TabsTrigger value="bids">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Bids
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Children (content) */}
          <div className="w-full flex-1 items-start px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <div className="flex min-h-screen w-full">
                  <div className="flex flex-col mb-8 sm:gap-4 sm:py-0 sm:pl-14 w-full">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewLayout;
