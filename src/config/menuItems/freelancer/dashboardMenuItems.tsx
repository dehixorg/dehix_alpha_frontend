import {
  Home,
  LineChart,
  Settings,
  Sparkles,
  BriefcaseBusiness,
  Store,
  TabletSmartphone,
  ShieldCheck,
  CalendarClock,
  MessageSquare,
  Archive,
  StickyNote,
  Trash2,
  Trophy,
  SendHorizontal,
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
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
    tourId: 'nav-dashboard',
  },
  {
    href: '/freelancer/market',
    icon: <Store className="h-5 w-5" />,
    label: 'Market',
    tourId: 'nav-market',
  },
  {
    href: '/project-invitations',
    icon: <SendHorizontal className="h-5 w-5" />,
    label: 'Project Invitations',
    tourId: 'nav-invitations',
  },
  {
    href: '/freelancer/project/current',
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    label: 'Projects',
    tourId: 'nav-projects',
  },
  {
    href: '#',
    icon: <LineChart className="h-5 w-5 cursor-not-allowed" />,
    label: 'Analytics',
  },
  {
    href: '/freelancer/interviewer',
    icon: <TabletSmartphone className="h-5 w-5" />,
    label: 'Interviews',
    tourId: 'nav-interviewer',
  },
  {
    href: '/freelancer/interviewee/current',
    icon: <CalendarClock className="h-5 w-5" />,
    label: 'Schedule Interviews',
    tourId: 'nav-interviewee',
  },
  {
    href: '/freelancer/oracleDashboard',
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'Oracle',
    tourId: 'nav-oracle',
  },
  {
    href: '/freelancer/talent',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Talent',
    tourId: 'nav-talent',
  },
  {
    href: '/freelancer/leaderboard',
    icon: <Trophy className="h-5 w-5" />,
    label: 'Leaderboard',
    tourId: 'nav-leaderboard',
  },
  {
    href: '/chat',
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Chats',
    tourId: 'nav-chat',
  },
  {
    href: '/notes',
    icon: <StickyNote className="h-5 w-5" />,
    label: 'Notes',
    tourId: 'nav-notes',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/freelancer/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

export const notesMenu: MenuItem[] = [
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
export const chatsMenu: MenuItem[] = [
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
    label: 'Home',
  },
];
