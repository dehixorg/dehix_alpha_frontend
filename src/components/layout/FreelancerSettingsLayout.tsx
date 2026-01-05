import React from 'react';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';

type BreadcrumbItem = {
  label: string;
  link: string;
};

type Props = {
  active: string;
  activeMenu: string;
  breadcrumbItems?: BreadcrumbItem[];
  isKycCheck?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  mainClassName?: string;
  children: React.ReactNode;
};

export default function FreelancerSettingsLayout({
  active,
  activeMenu,
  breadcrumbItems,
  isKycCheck = true,
  containerClassName,
  contentClassName = 'flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8',
  mainClassName = 'grid flex-1 items-start gap-4 p-4 sm:py-0 mb-6',
  children,
}: Props) {
  return (
    <div className={containerClassName ?? 'flex min-h-screen w-full flex-col'}>
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={active}
        isKycCheck={isKycCheck}
      />
      <div className={contentClassName}>
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu={activeMenu}
          breadcrumbItems={breadcrumbItems}
        />
        <main className={mainClassName}>{children}</main>
      </div>
    </div>
  );
}
