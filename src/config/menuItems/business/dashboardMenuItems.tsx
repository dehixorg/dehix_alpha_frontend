import {
  Archive,
  FolderOpen,
  Home,
  MessageSquare,
  Settings,
  ShoppingCart,
  StickyNote,
  Trash2,
  Users2,
  SendHorizontal,
  ArrowLeft,
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
        width={16}
        height={16}
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
    href: '/business/projects',
    icon: <FolderOpen className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '/project-invitations',
    icon: <SendHorizontal className="h-5 w-5" />,
    label: 'Project Invitations',
  },
  {
    href: '/business/talent',
    icon: <Users2 className="h-5 w-5" />,
    label: 'Talent',
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
    icon: <ArrowLeft className="h-5 w-5" />,
    label: 'Back',
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
