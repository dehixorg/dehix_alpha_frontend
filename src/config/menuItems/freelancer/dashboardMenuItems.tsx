import {
  Boxes,
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
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/dashboard/freelancer',
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    href: '/freelancer/market',
    icon: <Store className="h-5 w-5" />,
    label: 'Market',
  },
  {
    href: '/freelancer/project/current',
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    label: 'Projects',
  },
  {
    href: '#',
    icon: <LineChart className="h-5 w-5 cursor-not-allowed" />,
    label: 'Analytics',
  },
  {
    href: '/freelancer/interview/profile',
    icon: <TabletSmartphone className="h-5 w-5" />,
    label: 'Interviews',
  },
  {
    href: '/freelancer/scheduleInterview',
    icon: <CalendarClock className="h-5 w-5" />,
    label: 'ScheduleInterviews',
  },
  {
    href: '/freelancer/oracleDashboard/businessVerification',
    icon: <ShieldCheck className="h-5 w-5" />,
    label: 'Oracle',
  },
  {
    href: '/freelancer/talent',
    icon: <Sparkles className="h-5 w-5" />,
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
    href: '/freelancer/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

export const notesMenu: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
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
