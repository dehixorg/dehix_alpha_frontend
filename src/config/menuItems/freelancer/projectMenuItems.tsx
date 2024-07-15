import {
  Boxes,
  HomeIcon,
  FileCheck ,
  Pointer ,
  FolderDot ,
  CircleX ,
} from 'lucide-react';

import { MenuItem } from '@/components/menu/sidebarMenu';

export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
    label: 'Dehix',
  },
  {
    href: '/freelancer/platformProjects/currentProject',
    icon: <FolderDot   className="h-5 w-5" />,
    label: 'Current Projects',
  },
  {
    href: '/freelancer/platformProjects/appliedProject',
    icon: <Pointer className="h-5 w-5" />,
    label: 'Applied Verification',
  },
  {
    href: '/freelancer/platformProjects/completedProject',
    icon: <FileCheck className="h-5 w-5" />,
    label: 'Completed Projects',
  },
  {
    href: '/freelancer/platformProjects/rejectedProject',
    icon: <CircleX  className="h-5 w-5" />,
    label: 'Rejected Verification',
  },
];

export const menuItemsBottom: MenuItem[] = [
  {
    href: '/dashboard/freelancer',
    icon: <HomeIcon className="h-5 w-5" />,
    label: 'Home',
  },
];
