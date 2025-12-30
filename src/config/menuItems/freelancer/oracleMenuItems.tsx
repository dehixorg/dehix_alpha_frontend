import {
  HomeIcon,
  LineChart,
  Settings,
  Sparkles,
  BriefcaseBusiness,
  Store,
  TabletSmartphone,
  ShieldCheck,
  CalendarClock,
  MessageSquare,
  StickyNote,
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
    href: '/freelancer/interviewer',
    icon: <TabletSmartphone className="h-5 w-5" />,
    label: 'Interviews',
  },
  {
    href: '/freelancer/interviewee/current',
    icon: <CalendarClock className="h-5 w-5" />,
    label: 'Schedule Interviews',
  },
  {
    href: '/freelancer/oracleDashboard',
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
  // {
  //   href: '/freelancer/oracleDashboard/businessVerification',
  //   icon: <Briefcase className="h-5 w-5" />,
  //   label: 'Business Verification',
  // },
  // {
  //   href: '/freelancer/oracleDashboard/workExpVerification',
  //   icon: <User className="h-5 w-5" />,
  //   label: 'Experience Verification',
  // },
  // {
  //   href: '/freelancer/oracleDashboard/projectVerification',
  //   icon: <Package className="h-5 w-5" />,
  //   label: 'Project Verification',
  // },
  // {
  //   href: '/freelancer/oracleDashboard/educationVerification',
  //   icon: <BookOpen className="h-5 w-5" />,
  //   label: 'Education Verification',
  // },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/freelancer/settings/personal-info',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];
