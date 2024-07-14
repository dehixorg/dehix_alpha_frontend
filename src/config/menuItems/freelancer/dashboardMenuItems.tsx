import {
  Boxes,
  Home,
  LineChart,
  Settings,
  Briefcase,
  BriefcaseBusiness,
  Store ,
  TabletSmartphone ,
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/dashboard/freelancer',
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    href: '/market/freelancer',
    icon: <Store className="h-5 w-5" />,
    label: 'Market',
  },
  {
    href: '#',
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '#',
    icon: <LineChart className="h-5 w-5" />,
    label: 'Analytics',
  },
  {
    href: '/dashboard/freelancer/interview',
    icon: <TabletSmartphone  className="h-5 w-5" />,
    label: 'Interviews',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];
