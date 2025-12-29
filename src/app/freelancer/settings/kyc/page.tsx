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
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="KYC"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="KYC"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'KYC', link: '#' },
          ]}
        />
        <main className="flex-1 p-4 sm:p-8 md:p-12">
          <div className="mx-auto w-full max-w-6xl">
            <KYCForm user_id={user.uid} />
          </div>
        </main>
      </div>
    </div>
  );
}
