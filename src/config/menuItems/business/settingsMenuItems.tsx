import {
  ArrowLeft,
  FileWarning,
  ShieldCheck,
  User,
  Star,
  Receipt,
} from 'lucide-react';
import Image from 'next/image';

import NDAFileIcon from '@/components/icons/NDAFileIcon';
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
    icon: <ArrowLeft className="h-5 w-5" />,
    label: 'Back',
  },
  {
    href: '/business/settings/business-info',
    icon: <User className="h-5 w-5" />,
    label: 'Business Info',
    tourId: 'settings-business-info',
  },
  {
    href: '/business/settings/kyc',
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'KYC',
    tourId: 'settings-kyc',
  },
  {
    href: '/business/settings/transactions',
    icon: <Receipt className="h-5 w-5" />,
    label: 'Transactions',
    tourId: 'settings-transactions',
  },
  {
    href: '/settings/feedback',
    icon: <Star className="h-5 w-5" />,
    label: 'Feedback',
    tourId: 'settings-feedback',
  },
  {
    href: '/reports', // Link to your new Reports page
    icon: <FileWarning className="h-5 w-5" />, // You can change icon
    label: 'Reports',
    tourId: 'settings-reports',
  },
  {
    href: '/nda-transactions',
    icon: <NDAFileIcon className="h-5 w-5" />,
    label: 'NDA',
  },
];

export const menuItemsBottom: MenuItem[] = [];
