'use client';
import * as React from 'react';


import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import ScheduleInterviewDialog from '@/components/freelancer/scheduleInterview/scheduleInterviewDialog';
import Header from '@/components/header/header';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="ScheduleInterviews"
      />
      <div className="flex flex-col sm:py-0 sm:gap-2 sm:pl-14 w-full">
      <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="ScheduleInterviews"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
                { label: 'Schedule-Interview', link: '#' },
          ]}
        />
        <ScheduleInterviewDialog />
      </div>
    </div>
  );
}
