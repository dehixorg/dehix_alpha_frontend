import {
  Boxes,
  HomeIcon,
  FileCheck,
  Pointer,
  FolderDot,
  CircleX,
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
    href: '/freelancer/project/current',
    icon: <FolderDot className="h-5 w-5" />,
    label: 'Current Projects',
  },
  {
    href: '/freelancer/project/applied',
    icon: <Pointer className="h-5 w-5" />,
    label: 'Under Verification',
  },
  {
    href: '/freelancer/project/completed',
    icon: <FileCheck className="h-5 w-5" />,
    label: 'Completed Projects',
  },
  {
    href: '/freelancer/project/rejected',
    icon: <CircleX className="h-5 w-5" />,
    label: 'Rejected Verification',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/freelancer/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];
