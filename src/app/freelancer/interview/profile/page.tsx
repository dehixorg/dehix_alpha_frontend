'use client';
import * as React from 'react';
import { useSelector } from 'react-redux';

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
import { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/search';

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Profile"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
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
            />
          <div className="relative ml-auto flex-1 md:grow-0 hidden md:block">
            <Button className="w-auto">Page Tour</Button>
          </div>
          <div className="relative flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <InterviewProfile freelancerId={user?.uid} />
      </div>
    </div>
  );
}
