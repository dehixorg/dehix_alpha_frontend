'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/settingsMenuItems';
import { BusinessForm } from '@/components/form/businessForm';
import Header from '@/components/header/header';
import { UpdatePasswordForm } from '@/components/form/updatePasswordForm';

export default function BusinessInfoPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  // Optional: Redirect if user is not authenticated
  useEffect(() => {
    if (!user.uid) {
      // uid will be empty string if not authenticated
      router.push('/auth/login');
    }
  }, [user.uid, router]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Business Info"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 mb-8 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Business Info"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Settings', link: '#' },
            { label: 'Business Info', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
          <BusinessForm user_id={user.uid} />
          <UpdatePasswordForm user_id={user.uid} userType="business" />
        </main>
      </div>
    </div>
  );
}
