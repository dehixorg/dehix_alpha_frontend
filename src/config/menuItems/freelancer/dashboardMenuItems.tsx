import {
  Boxes,
  Home,
  LineChart,
  Package,
  Settings,
  Users2,
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
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
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];