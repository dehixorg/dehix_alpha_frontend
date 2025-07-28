import {
  Home,
  Wand2,
  BriefcaseBusiness,
  Users2,
} from 'lucide-react';
import Image from 'next/image';

import { MenuItem } from '@/components/menu/sidebarMenu';

/**
 * Top & bottom sidebar items for the Schedule Interview flow.
 * Four key icons requested by product:
 * 1. Upskill (wand)
 * 2. Project Interview (briefcase)
 * 3. DehixTalent (users)
 * 4. DehixInterview (video list icon reused)
 *
 * NOTE: Only the DehixTalent item is wired up initially. Others can be
 * implemented later as dedicated routes when their pages exist.
 */
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
    href: '/dashboard/freelancer',
    icon: <Home className="h-5 w-5" />,
    label: 'Home',
  },
  {
    href: '/freelancer/scheduleInterview/upskill',
    icon: <Wand2 className="h-5 w-5" />,
    label: 'Upskill',
  },
  {
    href: '/freelancer/scheduleInterview/project',
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    label: 'Project Int.',
  },
  {
    href: '/freelancer/scheduleInterview',
    icon: <Users2 className="h-5 w-5" />,
    label: 'DehixTalent',
  },
  {
    href: '/freelancer/scheduleInterview/dehixInterview',
    icon: <BriefcaseBusiness className="h-5 w-5 rotate-180" />,
    label: 'DehixInterview',
  },
];

export const menuItemsBottom: MenuItem[] = [];
