'use client';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/settingsMenuItems';
import { BusinessForm } from '@/components/form/businessForm';
import Header from '@/components/header/header';

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Business Info"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Personal Info"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Settings', link: '#' },
            { label: 'Business Info', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <BusinessForm user_id={user.uid} />
        </main>
      </div>
    </div>
  );
}
