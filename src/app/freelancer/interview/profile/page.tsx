'use client';
import * as React from 'react';
import { Search } from 'lucide-react';

import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import Breadcrumb from '@/components/shared/breadcrumbList';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
import InterviewProfile from '@/components/freelancer/interviewProfile/interviewProfile';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Profile"
      />
      <div className="flex flex-col sm:py-2 sm:pl-14 w-full">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-2 sm:static sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-4">
            <CollapsibleSidebarMenu
              menuItemsTop={menuItemsTop}
              menuItemsBottom={menuItemsBottom}
              active="Profile"
            />
            <Breadcrumb
              items={[
                { label: 'Freelancer', link: '/dashboard/freelancer' },
                { label: 'Interview Profile', link: '#' },
              ]}
              className="hidden sm:flex-1 sm:flex sm:items-center"
            />
          </div>
          <div className="relative flex items-center gap-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[336px]"
            />
            <DropdownProfile />
          </div>
        </header>
        <InterviewProfile />
      </div>
    </div>
  );
}
