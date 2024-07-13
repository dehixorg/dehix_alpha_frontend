import { Boxes, HomeIcon, User } from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/settings/business-info',
    icon: <User className="h-5 w-5" />,
    label: 'Business Info',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/business',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
];
