'use client';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import KYCForm from '@/components/form/kycFreelancerForm';

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="KYC"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="KYC"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'KYC', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start sm:px-10 md:px-16 py-10 md:gap-12 bg-gradient-to-br">
          <KYCForm user_id={user.uid} />
        </main>
      </div>
    </div>
  );
}
