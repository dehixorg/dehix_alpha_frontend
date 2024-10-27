import React from 'react';

import CollapsibleSidebarMenu from '../menu/collapsibleSidebarMenu';
import { Search } from '../search';
import DropdownProfile from '../shared/DropdownProfile';

import Breadcrumb from '@/components/shared/breadcrumbList';

// Define the type for a breadcrumb item
interface BreadcrumbItem {
  label: string;
  link: string;
}

// Define the type for the props
interface HeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  menuItemsTop: any[]; // Replace with a more specific type if you have one for your menu items
  menuItemsBottom: any[]; // Replace with a more specific type if you have one for your menu items
  activeMenu: string;
}

const Header: React.FC<HeaderProps> = ({
  breadcrumbItems,
  menuItemsTop,
  menuItemsBottom,
  activeMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 gap-3 flex items-center justify-between border-b bg-background px-4 py-4 sm:border-0 sm:px-6">
      <div className="flex items-center ml-2 gap-4">
        <CollapsibleSidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active={activeMenu}
        />
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="w-full md:w-[200px] lg:w-[336px]" />
      </div>
      <DropdownProfile />
    </header>
  );
};

export default Header;
