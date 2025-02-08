import {
  BookOpen,
  Boxes,
  Briefcase,
  HomeIcon,
  Package,
  User,
  Settings,
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

import Image from 'next/image';

export const menuItemsTop: MenuItem[] = [
{
    href: '#',
    icon:<Image
    src="/dehix.png"  // Path to your image in the public folder
    alt="Icon"
    width={16}  // Set the desired width
    height={16}  // Set the desired height
    className="transition-all group-hover:scale-110"
  />
,  
    label: 'Dehix',
  },
  {
    href: '/dashboard/freelancer',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
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
    href: '/freelancer/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];
