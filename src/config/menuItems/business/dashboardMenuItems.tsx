// import {
//   Archive,
//   Home,
//   MessageSquare,
//   Settings,
//   ShoppingCart,
//   StickyNote,
//   Trash2,
//   Users,
// } from 'lucide-react';
// import Image from 'next/image';

// import { MenuItem } from '@/components/menu/sidebarMenu';

// export const menuItemsTop: MenuItem[] = [
//   {
//     href: '#',
//     icon: (
//       <Image
//         src="/dehix.png" // Path to your image in the public folder
//         alt="Icon"
//         width={16} // Set the desired width
//         height={16} // Set the desired height
//         className="transition-all group-hover:scale-110"
//       />
//     ),
//     label: 'Dehix',
//   },
//   {
//     href: '/dashboard/business',
//     icon: <Home className="h-5 w-5" />,
//     label: 'Dashboard',
//   },
//   {
//     href: '/business/market',
//     icon: <ShoppingCart className="h-5 w-5" />,
//     label: 'Market',
//   },
//   {
//     href: '/business/talent',
//     icon: <Users className="h-5 w-5" />,
//     label: 'Dehix Talent',
//   },
//   {
//     href: '/chat',
//     icon: <MessageSquare className="h-5 w-5" />,
//     label: 'Chats',
//   },
//   {
//     href: '/notes',
//     icon: <StickyNote className="h-5 w-5" />,
//     label: 'Notes',
//   },
// ];

// export const menuItemsBottom: MenuItem[] = [
//   {
//     href: '/business/settings/business-info',
//     icon: <Settings className="h-5 w-5" />,
//     label: 'Settings',
//   },
// ];

// export const notesMenu: MenuItem[] = [
//   {
//     href: '#',
//     icon: (
//       <Image
//         src="/dehix.png" // Path to your image in the public folder
//         alt="Icon"
//         width={16} // Set the desired width
//         height={16} // Set the desired height
//         className="transition-all group-hover:scale-110"
//       />
//     ),
//     label: 'Dehix',
//   },
//   {
//     href: '/dashboard/business',
//     icon: <Home className="h-5 w-5" />,
//     label: 'Home',
//   },
//   {
//     href: '/notes',
//     icon: <StickyNote className="h-5 w-5" />,
//     label: 'Notes',
//   },
//   {
//     href: '/notes/archive',
//     icon: <Archive className="h-5 w-5" />,
//     label: 'Archive',
//   },
//   {
//     href: '/notes/trash',
//     icon: <Trash2 className="h-5 w-5" />,
//     label: 'Trash',
//   },
// ];
import {
  Archive,
  BookMarked,
  CheckCircle2,
  Home,
  MessageSquare,
  Settings,
  ShoppingCart,
  StickyNote,
  Trash2,
  Users2,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

import type { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: (
      <Image
        src="/dehix.png"
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
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    href: '/business/market',
    icon: <ShoppingCart className="h-5 w-5" />,
    label: 'Market',
  },
  {
    href: '/business/talent',
    icon: <Users2 className="h-5 w-5" />,
    label: 'Dehix Talent',
    subItems: [
      {
        label: 'Overview',
        href: '/business/talent',
        icon: <Users2 className="h-4 w-4" />,
      },
      {
        label: 'Invites',
        href: '/business/market/invited',
        icon: <BookMarked className="h-4 w-4" />,
      },
      {
        label: 'Accepted',
        href: '/business/market/accepted',
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      {
        label: 'Rejected',
        href: '/business/market/rejected',
        icon: <XCircle className="h-4 w-4" />,
      },
    ],
  },
  {
    href: '/chat',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Chats',
  },
  {
    href: '/notes',
    icon: <StickyNote className="h-5 w-5" />,
    label: 'Notes',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/business/settings/business-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

export const notesMenu: MenuItem[] = [
  {
    href: '#',
    icon: (
      <Image
        src="/dehix.png"
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
    icon: <Home className="h-5 w-5" />,
    label: 'Home',
  },
  {
    href: '/notes',
    icon: <StickyNote className="h-5 w-5" />,
    label: 'Notes',
  },
  {
    href: '/notes/archive',
    icon: <Archive className="h-5 w-5" />,
    label: 'Archive',
  },
  {
    href: '/notes/trash',
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Trash',
  },
];
