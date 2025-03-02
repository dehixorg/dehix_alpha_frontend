import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import CollapsibleSidebarMenu from '../menu/collapsibleSidebarMenu';
import { MenuItem } from '../menu/sidebarMenu';
import DropdownProfile from '../shared/DropdownProfile';
import { NotificationButton } from '../shared/notification';
import Breadcrumb from '../shared/breadcrumbList';
import { Button } from '../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import DisplayConnectsDialog from '../shared/DisplayConnectsDialog';

import { RootState } from '@/lib/store';

interface HeaderProps {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  activeMenu: string;
  breadcrumbItems: BreadcrumbMenuItem[];
  searchPlaceholder?: string;
}

interface BreadcrumbMenuItem {
  label: string;
  link: string;
}

const Header: React.FC<HeaderProps> = ({
  menuItemsTop,
  menuItemsBottom,
  activeMenu,
  breadcrumbItems,
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [connects, setConnects] = useState<number>(0);

  const fetchConnects = async () => {
    try {
      const data = localStorage.getItem('DHX_CONNECTS');
      const parsedData = data ? parseInt(data) : 0;
      if (!isNaN(parsedData)) {
        setConnects(parsedData);
      }
    } catch (error) {
      console.error('Error fetching connects:', error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchConnects();
    }
    const updateConnects = () => fetchConnects();
    window.addEventListener('connectsUpdated', updateConnects);

    return () => {
      window.removeEventListener('connectsUpdated', updateConnects);
    };
  }, [user?.uid]);

  const formatConnects = (num: number) => {
    if (!num) return '0';
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center py-6 gap-4 border-b bg-background px-4 sm:border-0 sm:px-6">
      {/* Sidebar Menu */}
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={activeMenu}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Search Bar */}
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* <Search
          className="w-full md:w-[200px] lg:w-[336px]"
          placeholder={searchPlaceholder}
        /> */}
      </div>

      <HoverCard>
        <div className="relative ml-auto flex-1 md:grow-0">
          <HoverCardTrigger asChild>
            <DisplayConnectsDialog userId={user.uid} connects={connects} />
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-4 py-2 text-center font-bold shadow-xl rounded-lg">
            {connects !== null
              ? `${formatConnects(connects)} rewards Available`
              : 'No rewards yet!'}
          </HoverCardContent>
        </div>
      </HoverCard>

      {/* Notification Button */}
      <NotificationButton />

      {/* Profile Dropdown */}
      <DropdownProfile setConnects={setConnects} />
    </header>
  );
};

export default Header;
