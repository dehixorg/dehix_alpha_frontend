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
    href: '/freelancer/oracleDashboard/businessVerification',
    icon: <Briefcase className="h-5 w-5" />,
    label: 'Business Verification',
  },
  {
    href: '/freelancer/oracleDashboard/workExpVerification',
    icon: <User className="h-5 w-5" />,
    label: 'Experience Verification',
  },
  {
    href: '/freelancer/oracleDashboard/projectVerification',
    icon: <Package className="h-5 w-5" />,
    label: 'Project Verification',
  },
  {
    href: '/freelancer/oracleDashboard/educationVerification',
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Education Verification',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/freelancer',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
];
