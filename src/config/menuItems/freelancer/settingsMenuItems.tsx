import {
  FileText,
  FileWarning,
  UserCog,
  ShieldCheck,
  User,
  UserCheck,
  Award,
  ArrowLeft,
  Star,
  Flame,
  Receipt,
  Globe,
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
    tourId: 'sidebar-personal-info',
  },
  {
    href: '/freelancer/settings/profile',
    icon: <UserCog className="h-5 w-5" />,
    label: 'My Profile',
    tourId: 'sidebar-profile',
  },
  {
    href: '/freelancer/settings/public-profile',
    icon: <Globe className="h-5 w-5" />,
    label: 'Public Profile',
    tourId: 'sidebar-public-profile',
  },
  {
    href: '/freelancer/settings/kyc',
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'KYC',
    tourId: 'sidebar-kyc',
  },
  {
    href: '/freelancer/settings/levels-badges',
    icon: <Award className="h-5 w-5" />,
    label: 'Levels & Badges',
    tourId: 'sidebar-levels',
  },
  {
    href: '/freelancer/settings/streak',
    icon: <Flame className="h-5 w-5" />,
    label: 'Streak',
    tourId: 'sidebar-streak',
  },
  {
    href: '/freelancer/settings/transactions',
    icon: <Receipt className="h-5 w-5" />,
    label: 'Transactions',
    tourId: 'sidebar-transactions',
  },
  {
    href: '/freelancer/settings/profiles',
    icon: <UserCheck className="h-5 w-5" />,
    label: 'Profiles',
    tourId: 'sidebar-profiles',
  },
  {
    href: '/freelancer/settings/resume',
    icon: <FileText className="h-5 w-5" />,
    label: 'Resume',
    tourId: 'sidebar-resume',
  },
  {
    href: '/settings/feedback',
    icon: <Star className="h-5 w-5" />,
    label: 'Feedback',
    tourId: 'sidebar-feedback',
  },
  {
    href: '/reports',
    icon: <FileWarning className="h-5 w-5" />,
    label: 'Reports',
    tourId: 'sidebar-reports',
  },
];

export const menuItemsBottom: MenuItem[] = [];
