import { HeartHandshake, Boxes, HomeIcon, User } from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/settings/support',
    icon: <HeartHandshake className="h-5 w-5" />,
    label: 'support',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/freelancer',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
];
