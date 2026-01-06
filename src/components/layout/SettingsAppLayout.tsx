import React from 'react';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as businessMenuItemsBottom,
  menuItemsTop as businessMenuItemsTop,
} from '@/config/menuItems/business/settingsMenuItems';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';

type BreadcrumbItem = {
  label: string;
  link: string;
};

type Props = {
  active: string;
  activeMenu: string;
  breadcrumbItems?: BreadcrumbItem[];
  userType?: 'freelancer' | 'business';
  isKycCheck?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  mainClassName?: string;
  children: React.ReactNode;
};

export default function SettingsAppLayout({
  active,
  activeMenu,
  breadcrumbItems,
  userType = 'freelancer',
  isKycCheck = true,
  containerClassName,
  contentClassName = 'flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8',
  mainClassName = 'grid flex-1 items-start gap-4 p-4 sm:py-0 mb-6',
  children,
}: Props) {
  const menuItemsTop =
    userType === 'business' ? businessMenuItemsTop : freelancerMenuItemsTop;
  const menuItemsBottom =
    userType === 'business'
      ? businessMenuItemsBottom
      : freelancerMenuItemsBottom;

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
