'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Briefcase, MessageSquare, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';

import Header from '@/components/header/header';
import SidebarMenu, { type MenuItem } from '@/components/menu/sidebarMenu';
import { menuItemsBottom as businessMenuItemsBottom } from '@/config/menuItems/business/dashboardMenuItems';
import { menuItemsBottom as freelancerMenuItemsBottom } from '@/config/menuItems/freelancer/dashboardMenuItems';

type BreadcrumbItem = {
  label: string;
  link: string;
};

type LiveRoomWorkspaceLayoutProps = {
  userType: 'business' | 'freelancer';
  includeAccessControl?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  children: React.ReactNode;
};

const TAB_LABELS: Record<string, string> = {
  channels: 'Channels and chat',
  roles: 'Roles and tasks',
  access: 'Access control settings',
};

function getActiveWorkspaceLabel(includeAccessControl: boolean) {
  if (typeof window === 'undefined') return TAB_LABELS.channels;
  const hash = window.location.hash.replace('#', '');
  if (hash === 'roles') return TAB_LABELS.roles;
  if (hash === 'access' && includeAccessControl) return TAB_LABELS.access;
  return TAB_LABELS.channels;
}

export default function LiveRoomWorkspaceLayout({
  userType,
  includeAccessControl = userType === 'business',
  breadcrumbItems,
  children,
}: LiveRoomWorkspaceLayoutProps) {
  const pathname = usePathname();
  const roomPath = pathname || '';
  const backHref =
    userType === 'business' ? '/business/liveroom' : '/freelancer/liveroom';
  const [activeMenu, setActiveMenu] = useState(() =>
    getActiveWorkspaceLabel(includeAccessControl),
  );

  useEffect(() => {
    const syncActiveMenu = () => {
      setActiveMenu(getActiveWorkspaceLabel(includeAccessControl));
    };

    syncActiveMenu();
    window.addEventListener('hashchange', syncActiveMenu);
    return () => window.removeEventListener('hashchange', syncActiveMenu);
  }, [includeAccessControl]);

  const menuItemsTop = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [
      {
        href: '#',
        icon: (
          <Image
            src="/dehix.png"
            alt="Icon"
            width={16}
            height={16}
            className="transition-all group-hover:scale-110 invert dark:invert-0"
          />
        ),
        label: 'Dehix',
      },
      {
        href: backHref,
        icon: <ArrowLeft className="h-5 w-5" />,
        label: 'Back',
      },
      {
        href: `${roomPath}#channels`,
        icon: <MessageSquare className="h-5 w-5" />,
        label: TAB_LABELS.channels,
      },
      {
        href: `${roomPath}#roles`,
        icon: <Briefcase className="h-5 w-5" />,
        label: TAB_LABELS.roles,
      },
    ];

    if (includeAccessControl) {
      items.push({
        href: `${roomPath}#access`,
        icon: <Shield className="h-5 w-5" />,
        label: TAB_LABELS.access,
      });
    }

    return items;
  }, [backHref, includeAccessControl, roomPath]);

  const menuItemsBottom =
    userType === 'business'
      ? businessMenuItemsBottom
      : freelancerMenuItemsBottom;

  return (
    <section className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={activeMenu}
        setActive={setActiveMenu}
      />
      <div className="flex min-w-0 flex-1 flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu={activeMenu}
          setActive={setActiveMenu}
          breadcrumbItems={breadcrumbItems}
        />
        <main className="flex-1 p-0">{children}</main>
      </div>
    </section>
  );
}
