'use client';
import { PackageOpen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';


import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/projectMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';
import { Type } from '@/utils/enum';
import { StatusEnum } from '@/utils/freelancer/enum';
import Header from '@/components/header/header';

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
  status?: StatusEnum; //enum
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
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
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
      <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Under Verification"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            {
              label: 'Projects',
              link: '/freelancer/project/current',
            },
            {
              label: 'Under Verification',
              link: '#',
            },
          ]}
          
        />
        <div className="mb-8 ml-10">
          <h1 className="text-3xl font-bold">Projects Under Verification</h1>
          <p className="text-gray-400 mt-2">
            Track the status of your projects currently undergoing verification
            before final approval.
          </p>
        </div>
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
              <ProjectCard key={index} project={project} type={user.type} />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
