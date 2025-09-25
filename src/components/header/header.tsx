import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Wallet } from 'lucide-react';

import CollapsibleSidebarMenu from '../menu/collapsibleSidebarMenu';
import { MenuItem } from '../menu/sidebarMenu';
import DropdownProfile from '../shared/DropdownProfile';
import { NotificationButton } from '../shared/notification';
import Breadcrumb from '../shared/breadcrumbList';
import { Button } from '../ui/button';
import DisplayConnectsDialog from '../shared/DisplayConnectsDialog';

import { RootState } from '@/lib/store';

interface HeaderProps {
  menuItemsTop: MenuItem[];
  menuItemsBottom: MenuItem[];
  activeMenu: string;
  breadcrumbItems?: BreadcrumbMenuItem[];
  searchPlaceholder?: string;
  setActiveConversation?: any;
  conversations?: any;
  activeConversation?: any;
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
  conversations,
  activeConversation,
  setActiveConversation,
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

  return (
<<<<<<< HEAD
    <header
      className="
    sticky top-0 z-30 flex h-14 items-center gap-4
    border-b border-white/20 bg-white/30 backdrop-blur-md shadow-md
    px-4 sm:px-6
    dark:border-white/10 dark:bg-muted/30
  "
    >
=======
  <header className="sticky top-0 z-30 flex h-14 items-center py-6 gap-4 border-b bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 border-b">
>>>>>>> f03d4b10bfd603b2fa6196d5e2a2416ae158c1d1
      {/* Sidebar Menu */}
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={activeMenu}
        setActiveConversation={setActiveConversation}
        conversations={conversations}
        activeConversation={activeConversation}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems || []} />

      {/* Search Bar */}
      {/* <div className="relative ml-auto flex-1 md:grow-0">
        <Search
          className="w-full md:w-[200px] lg:w-[336px]"
          placeholder={searchPlaceholder}
        />
      </div> */}

      {user?.uid ? (
        <DisplayConnectsDialog userId={user.uid} connects={connects} />
      ) : (
        <Button variant="ghost" size="sm">
          <Wallet className="h-4 w-4" />
        </Button>
      )}
      {/* Notification Button */}
      <NotificationButton />

      {/* Profile Dropdown */}
      <DropdownProfile setConnects={setConnects} />
    </header>
  );
};

export default Header;
