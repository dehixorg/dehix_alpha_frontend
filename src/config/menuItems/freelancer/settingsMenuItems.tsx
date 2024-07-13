import {
  BookOpen,
  Boxes,
  Briefcase,
  HomeIcon,
  Package,
  User,
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/settings/personal-info',
    icon: <User className="h-5 w-5" />,
    label: 'Personal Info',
  },
  {
    href: '/settings/professional-info',
    icon: <Briefcase className="h-5 w-5" />,
    label: 'Professional Info',
  },
  {
    href: '/settings/projects',
    icon: <Package className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '#',
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Education',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/freelancer',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
];
