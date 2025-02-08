import { Boxes, HomeIcon, User } from 'lucide-react';

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
    href: '/dashboard/business',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
  {
    href: '/settings/business-info',
    icon: <User className="h-5 w-5" />,
    label: 'Business Info',
  },
];

export const menuItemsBottom: MenuItem[] = [];
