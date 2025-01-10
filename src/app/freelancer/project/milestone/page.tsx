'use client';
import React from 'react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/projectMenuItems';
import Header from '@/components/header/header';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';

const page = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Milestone"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Milestone"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            {
              label: 'Projects',
              link: '/freelancer/project/current',
            },
            {
              label: 'Milestone',
              link: '#',
            },
          ]}
        />
        <div className="py-8 px-4">
          <h1 className="text-2xl font-bold mb-4">Project Milestones</h1>
          <div className="w-full flex justify-center items-center">
            <div className="flex justify-center items-center w-[100vw] h-[39vh] p-10">
              <MilestoneTimeline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
