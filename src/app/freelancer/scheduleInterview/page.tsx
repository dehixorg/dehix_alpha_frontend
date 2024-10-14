'use client';
import * as React from 'react';

import { Search } from '@/components/search';
import DropdownProfile from '@/components/shared/DropdownProfile';
import Breadcrumb from '@/components/shared/breadcrumbList';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import ScheduleInterviewDialog from '@/components/freelancer/scheduleInterview/scheduleInterviewDialog';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="ScheduleInterviews"
      />
      <div className="flex flex-col sm:py-0 sm:gap-8 sm:pl-14 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 py-8 gap-4 sm:border-0 sm:px-6">
          <div className="flex items-center gap-4">
            <CollapsibleSidebarMenu
              menuItemsTop={menuItemsTop}
              menuItemsBottom={menuItemsBottom}
              active="ScheduleInterviews"
            />
            <Breadcrumb
              items={[
                { label: 'Freelancer', link: '/dashboard/freelancer' },
                { label: 'Schedule-Interview', link: '#' },
              ]}
              className="hidden sm:flex-1 sm:flex sm:items-center"
            />
          </div>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <ScheduleInterviewDialog />
      </div>
    </div>
  );
}
