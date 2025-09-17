import {
  BookOpen,
  Briefcase,
  Files,
  HomeIcon,
  ImagePlus,
  Package,
  Shield,
  ShieldCheck,
  User,
  UserCheck,
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
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
  {
    href: '/freelancer/settings/personal-info',
    icon: <User className="h-5 w-5" />,
    label: 'Personal Info',
  },
  {
    href: '/freelancer/settings/kyc',
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'KYC',
  },
  {
    href: '/freelancer/settings/professional-info',
    icon: <Briefcase className="h-5 w-5" />,
    label: 'Professional Info',
  },
  {
    href: '/freelancer/settings/projects',
    icon: <Package className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '/freelancer/settings/education-info',
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Education',
  },
  {
    href: '/freelancer/settings/profiles',
    icon: <UserCheck className="h-5 w-5" />,
    label: 'Profiles',
  },
  {
    href: '/freelancer/settings/resume',
    icon: <ImagePlus className="h-5 w-5" />,
    label: 'Portfolio',
  },
  {
    href: '/reports', // Link to your new Reports page
    icon: <Files className="h-5 w-5" />, // You can change icon
    label: 'Reports',
  },
];

export const menuItemsBottom: MenuItem[] = [];
