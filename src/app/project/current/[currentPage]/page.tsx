'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Search, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';

import Breadcrumb from '@/components/shared/breadcrumbList';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/lib/store';
import { menuItemsTop } from '@/config/menuItems/freelancer/projectMenuItems';
import CurrentProjectDetailCard from '@/components/freelancer/project/projectPages/currentProjectCards/currentProjectDetailCard';
import { ProjectProfileDetailCard } from '@/components/freelancer/project/projectProfileDetailCard';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: string;
  team?: string[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
}
export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState<Project[]>([]);
  const { projectId } = useParams();
  useEffect(() => {
    if (projectId) {
      // Fetch project details using the projectId
      // Example:
      // fetchProjectDetails(projectId);
    }
  }, [projectId]);
  const menuItemsBottom: MenuItem[] = [
    {
      href: '/settings/personal-info',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];
  const projectProfileDetails = [
    {
      domain: 'Web Development',
      freelancersRequired: '2',
      skills: ['React', 'TypeScript', 'CSS'],
      experience: 3,
      minConnect: 5,
      rate: 50,
      description: 'Looking for experienced web developers.',
      email: 'contact@company.com',
      status: 'Open',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      className: 'w-full min-w-full p-4 shadow-md rounded-lg',
    },
    // Add more dummy data as needed
  ];
  console.log(user);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Current Projects"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Current Projects"
          />

          <Breadcrumb
            items={[
              {
                label: 'Projects',
                link: '/project/current',
              },
              {
                label: 'Current Project',
                link: '/project/current',
              },
              { label: '#current_id', link: '#' },
            ]}
          />

          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>

          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div>
              <CurrentProjectDetailCard />
            </div>
            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Profiles
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 sm:overflow-x-scroll sm:no-scrollbar pb-8">
              {projectProfileDetails.map((details, index) => (
                <ProjectProfileDetailCard key={index} {...details} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Other Projects
            </CardTitle>
            {projectProfileDetails.map((details, index) => (
              <ProjectProfileDetailCard key={index} {...details} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
