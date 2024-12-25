import React from 'react';

import { Search } from '../search';
import CollapsibleSidebarMenu from '../menu/collapsibleSidebarMenu';
import { MenuItem } from '../menu/sidebarMenu';
import DropdownProfile from '../shared/DropdownProfile';
import { NotificationButton } from '../shared/notification';
import Breadcrumb from '../shared/breadcrumbList';

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
  searchPlaceholder = 'Search...',
}) => {
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
        <Search
          className="w-full md:w-[200px] lg:w-[336px]"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Notification Button */}
      <NotificationButton />

      {/* Profile Dropdown */}
      <DropdownProfile />
    </header>
  );
};

export default Header;
