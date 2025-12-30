import {
  FileText,
  FileWarning,
  UserCog,
  ShieldCheck,
  User,
  UserCheck,
  Trophy,
  ArrowLeft,
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
    icon: <ArrowLeft className="h-5 w-5" />,
    label: 'Back',
  },
  {
    href: '/freelancer/settings/personal-info',
    icon: <User className="h-5 w-5" />,
    label: 'Personal Info',
  },
  {
    href: '/freelancer/settings/profile',
    icon: <UserCog className="h-5 w-5" />,
    label: 'Profile Settings',
  },
  {
    href: '/freelancer/settings/kyc',
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'KYC',
  },
  {
    href: '/freelancer/settings/profiles',
    icon: <UserCheck className="h-5 w-5" />,
    label: 'Profiles',
  },
  {
    href: '/freelancer/settings/leaderboard-history',
    icon: <Trophy className="h-5 w-5" />,
    label: 'Leaderboard History',
  },
  {
    href: '/freelancer/settings/resume',
    icon: <FileText className="h-5 w-5" />,
    label: 'Resume',
  },
  {
    href: '/reports', // Link to your new Reports page
    icon: <FileWarning className="h-5 w-5" />, // You can change icon
    label: 'Reports',
  },
];

export const menuItemsBottom: MenuItem[] = [];
