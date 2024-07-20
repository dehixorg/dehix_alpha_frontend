'use client';
import { PackageOpen, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/projectMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';

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

export default function AppliedProject() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/freelancer/${user.uid}/project?status=Pending`,
        ); // Fetch data from API
        console.log(response.data.data);
        setProjects(response.data.data); // Store all projects initially
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user.uid]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Under Verification"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Under Verification"
          />
          <Breadcrumb
            items={[
              {
                label: 'Projects',
                link: '/project/current',
              },
              {
                label: 'Under Verification',
                link: '#',
              },
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
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {projects.length === 0 ? (
            <div className="col-span-full text-center mt-20 w-full">
              <PackageOpen className="mx-auto text-gray-500" size="100" />
              <p className="text-gray-500">No projects available</p>
            </div>
          ) : (
            projects.map((project, index: number) => (
              <ProjectCard key={index} project={project} />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
