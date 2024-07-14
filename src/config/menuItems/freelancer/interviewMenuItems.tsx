import { Boxes, Home, ListVideo, Users2, History } from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '/dashboard/freelancer/interview',
    icon: <Boxes className="h-5 w-5" />,
    label: 'Dehix',
  },
  {
    href: '/dashboard/freelancer/interview/profile',
    icon: <Users2 className="h-5 w-5" />,
    label: 'Profile',
  },
  {
    href: '/dashboard/freelancer/interview/current',
    icon: <ListVideo className="h-5 w-5" />,
    label: 'Current',
  },
  {
    href: '/dashboard/freelancer/interview/history',
    icon: <History className="h-5 w-5" />,
    label: 'History',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/freelancer',
    icon: <Home className="h-5 w-5" />,
    label: 'Home',
  },
];
