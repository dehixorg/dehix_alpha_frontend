import {
  FileText,
  FileWarning,
  UserCog,
  ShieldCheck,
  User,
  UserCheck,
  Award,
  ArrowLeft,
  MessageSquare,
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
    href: '/freelancer/settings/levels-badges',
    icon: <Award className="h-5 w-5" />,
    label: 'Levels & Badges',
  },
  {
    href: '/freelancer/settings/profiles',
    icon: <UserCheck className="h-5 w-5" />,
    label: 'Profiles',
  },
  {
    href: '/freelancer/settings/resume',
    icon: <FileText className="h-5 w-5" />,
    label: 'Resume',
  },
  {
    href: '/freelancer/settings/feedback',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Feedback',
  },
  {
    href: '/reports',
    icon: <FileWarning className="h-5 w-5" />,
    label: 'Reports',
  },
];

export const menuItemsBottom: MenuItem[] = [];
