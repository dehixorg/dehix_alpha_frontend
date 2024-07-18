// SidebarPage.tsx

import React from 'react';
import {
  Boxes,
  Home,
  Lightbulb,
  LineChart,
  Package,
  Settings,
  Users2,
} from 'lucide-react';

import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';

const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '#',
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    href: '#',
    icon: <Package className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '#',
    icon: <Users2 className="h-5 w-5" />,
    label: 'Customers',
  },
  {
    href: '#',
    icon: <LineChart className="h-5 w-5" />,
    label: 'Analytics',
  },
  {
    href: '#',
    icon: <Lightbulb className="h-5 w-5" />,
    label: 'Talent',
  },
];

const menuItemsBottom: MenuItem[] = [
  {
    href: '/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

const SidebarPage: React.FC = () => {
  return (
    <div>
      {/* SidebarMenu */}
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects" // Replace with your active state logic
      />

      {/* CollapsibleSidebarMenu */}
      <CollapsibleSidebarMenu
        menuItems={menuItemsTop}
        active="Projects" // Replace with your active state logic
      />
    </div>
  );
};

export default SidebarPage;
