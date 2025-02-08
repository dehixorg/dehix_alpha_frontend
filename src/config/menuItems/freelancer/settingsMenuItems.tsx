import {
  BookOpen,
  Boxes,
  Briefcase,
  HomeIcon,
  ImagePlus,
  Package,
  User,
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
    href: '/freelancer/settings/personal-info',
    icon: <User className="h-5 w-5" />,
    label: 'Personal Info',
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
    href: '/freelancer/settings/resume',
    icon: <ImagePlus className="h-5 w-5" />,
    label: 'Resume',
  },
];

export const menuItemsBottom: MenuItem[] = [];
