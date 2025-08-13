import {
  Home,
  GraduationCap,
  Briefcase,
  Users,
  UserCheck,
  Settings,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const createScheduleInterviewMenuItems = (
  setActiveTab: (tab: string) => void,
) => {
  const menuItemsTop: MenuItem[] = [
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
      href: '/dashboard/freelancer',
      icon: <Home className="h-5 w-5" />,
      label: 'Home Page',
    },
    // {
    //   onClick: () => setActiveTab('main'),
    //   icon: <Calendar className="h-5 w-5" />,
    //   label: 'Schedule Interview',
    // },
    {
      onClick: () => setActiveTab('upskill'),
      icon: <GraduationCap className="h-5 w-5" />,
      label: 'Upskill Interview',
    },
    {
      onClick: () => setActiveTab('project'),
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Project Interview',
    },
    {
      onClick: () => setActiveTab('talent'),
      icon: <Users className="h-5 w-5" />,
      label: 'Dehix Talent Interview',
    },
    {
      onClick: () => setActiveTab('dehix'),
      icon: <UserCheck className="h-5 w-5" />,
      label: 'Dehix Interview',
    },
  ];

  const menuItemsBottom: MenuItem[] = [
    {
      href: '/freelancer/settings/personal-info',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];

  return { menuItemsTop, menuItemsBottom };
};
