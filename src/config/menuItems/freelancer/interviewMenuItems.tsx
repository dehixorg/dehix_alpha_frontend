import {
  Home,
  ListVideo,
  Users2,
  History,
  Settings,
  Briefcase,
} from 'lucide-react';
import Image from 'next/image';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: (
      <Image
        src="/dehix.png" // Path to your image in the public folder
        alt="Icon"
        width={16} // Set the desired width
        height={16} // Set the desired height
        className="transition-all group-hover:scale-110 invert dark:invert-0"
      />
    ),
    label: 'Dehix',
  },
  {
    href: '/dashboard/freelancer',
    icon: <Home className="h-5 w-5" />,
    label: 'Home',
  },
  {
    href: '/freelancer/interview/profile',
    icon: <Users2 className="h-5 w-5" />,
    label: 'Profile',
  },
  {
    href: '/freelancer/interview/current',
    icon: <ListVideo className="h-5 w-5" />,
    label: 'Current',
  },
  {
    href: '/freelancer/interview/bids',
    icon: <Briefcase className="h-5 w-5" />,
    label: 'Bids',
  },
  {
    href: '/freelancer/interview/history',
    icon: <History className="h-5 w-5" />,
    label: 'History',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/freelancer/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];
