import { Boxes, Home, Settings, ShoppingCart, Users } from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/dashboard/business',
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    href: '/market/business',
    icon: <ShoppingCart className="h-5 w-5" />,
    label: 'Market',
  },
  {
    href: '/dashboard/business/talent/HireTalent1',
    icon: <Users className="h-5 w-5" />,
    label: 'Dehix Talent',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/settings/business-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];
