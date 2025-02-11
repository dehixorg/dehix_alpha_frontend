import {
  Boxes,
  Home,
  ListVideo,
  Users2,
  History,
  Settings,
  Briefcase,
  UserPlus,
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '/freelancer/interview',
    icon: <Boxes className="h-5 w-5" />,
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
    href: '/freelancer/interview/start-interviewing',
    icon: <UserPlus className="h-5 w-5" />,
    label: 'Become Interviewer',
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
