import { HomeIcon, User } from 'lucide-react';
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
    href: '/dashboard/business',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
  {
    href: '/business/settings/business-info',
    icon: <User className="h-5 w-5" />,
    label: 'Business Info',
  },
  {
    href: '/business/settings/kyc',
    icon: <User className="h-5 w-5" />,
    label: 'Business Info',
  },
];

export const menuItemsBottom: MenuItem[] = [];
