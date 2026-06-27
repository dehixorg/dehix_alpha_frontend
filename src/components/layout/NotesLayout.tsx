import React from 'react';
import { useSelector } from 'react-redux';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  notesMenu,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import { menuItemsBottom as FreelancerMenuItemsBottom } from '@/config/menuItems/freelancer/dashboardMenuItems';
import { RootState } from '@/lib/store';

type BreadcrumbItem = {
  label: string;
  link: string;
};

type Props = {
  active: string;
  activeMenu: string;
  breadcrumbItems?: BreadcrumbItem[];
  containerClassName?: string;
  contentClassName?: string;
  mainClassName?: string;
  children: React.ReactNode;
};

export default function NotesLayout({
  active,
  activeMenu,
  breadcrumbItems,
  containerClassName,
  contentClassName = 'flex flex-col gap-4 sm:py-0 sm:pl-14',
  mainClassName = 'px-4 mb-5',
  children,
}: Props) {
  const user = useSelector((state: RootState) => state.user);
  return (
    <section
      className={containerClassName ?? 'flex min-h-screen w-full flex-col'}
    >
      <SidebarMenu
        menuItemsTop={notesMenu}
        menuItemsBottom={
          user?.role === 'freelancer'
            ? FreelancerMenuItemsBottom
            : menuItemsBottom
        }
        active={active}
      />
      <div className={contentClassName}>
        <Header
          menuItemsTop={notesMenu}
          menuItemsBottom={
            user?.role === 'freelancer'
              ? FreelancerMenuItemsBottom
              : menuItemsBottom
          }
          activeMenu={activeMenu}
          breadcrumbItems={breadcrumbItems}
        />
        <div className={mainClassName}>{children}</div>
      </div>
    </section>
  );
}
