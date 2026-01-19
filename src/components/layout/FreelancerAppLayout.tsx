'use client';

import React from 'react';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as defaultMenuItemsBottom,
  menuItemsTop as defaultMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

type BreadcrumbItem = { label: string; link: string };

type MenuItem = any;

type Props = {
  active: string;
  activeMenu: string;
  breadcrumbItems?: BreadcrumbItem[];

  menuItemsTop?: MenuItem[];
  menuItemsBottom?: MenuItem[];

  headerSlot?: React.ReactNode;

  containerClassName?: string;
  contentClassName?: string;
  mainClassName?: string;

  children: React.ReactNode;
};

export default function FreelancerAppLayout({
  active,
  activeMenu,
  breadcrumbItems,
  menuItemsTop = defaultMenuItemsTop,
  menuItemsBottom = defaultMenuItemsBottom,
  headerSlot,
  containerClassName,
  contentClassName = 'flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8',
  mainClassName = 'flex-1 p-4 sm:px-6 sm:py-2',
  children,
}: Props) {
  return (
    <div className={containerClassName ?? 'flex w-full flex-col'}>
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={active}
      />
      <div className={contentClassName}>
        {headerSlot ?? (
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu={activeMenu}
            breadcrumbItems={breadcrumbItems}
          />
        )}
        <main className={mainClassName}>{children}</main>
      </div>
    </div>
  );
}
