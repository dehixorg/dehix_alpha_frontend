'use client';
import * as React from 'react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
import Header from '@/components/header/header';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen w-full  bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="project"
      />
      <div className="flex flex-col sm:pl-14 w-full">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Interview', link: '#' },
            { label: 'start-interviewing', link: '#' },
          ]}
        />
        <div>TODO</div>
      </div>
    </div>
  );
}
