import React from 'react';

import { cn } from '@/lib/utils';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';

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

export default function BusinessDashboardLayout({
  active,
  activeMenu,
  breadcrumbItems,
  isKycCheck = true,
  containerClassName,
  contentClassName = 'flex flex-col sm:gap-4 sm:py-0 mb-8 sm:pl-14 w-full',
  mainClassName = 'grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8 w-full',
  children,
}: Props) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full !max-w-none overflow-x-clip',
        containerClassName,
      )}
    >
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={active}
        isKycCheck={isKycCheck}
      />
      <div
        className={cn(
          'flex flex-col min-w-0 flex-1 w-full !max-w-none',
          contentClassName,
        )}
      >
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
