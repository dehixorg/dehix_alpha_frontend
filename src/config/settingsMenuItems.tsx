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
    isActive: 'logo',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/settings/personal-info',
    isActive: true,
    icon: <User className="h-5 w-5" />,
    label: 'Personal Info',
  },
  {
    href: '/settings/professional-info',
    isActive: false,
    icon: <Briefcase className="h-5 w-5" />,
    label: 'Professional Info',
  },
  {
    href: '/settings/projects',
    isActive: false,
    icon: <Package className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '#',
    isActive: false,
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Education',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/freelancer',
    isActive: false,
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
];
