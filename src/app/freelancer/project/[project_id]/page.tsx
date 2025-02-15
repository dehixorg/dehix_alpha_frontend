'use client';
import { Search, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/shared/breadcrumbList';
import { CardTitle } from '@/components/ui/card';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import { ProjectProfileDetailCard } from '@/components/freelancer/project/projectProfileDetailCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';

interface Project {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyId: string;
  email: string;
  url?: { value: string }[];
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date | null;
  skillsRequired: string[];
  experience?: string;
  role?: string;
  projectType?: string;
  profiles?: {
    _id?: string;
    domain?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    description?: string;
    domain_id: string;
    selectedFreelancer?: string[];
    freelancers?: {
      freelancerId: string;
      bidId: string;
    };
    totalBid?: string[];
  }[];
  status?: StatusEnum; //enum
  team?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default function Dashboard() {
  const { project_id } = useParams<{ project_id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/project/${project_id}`);
        // Safely access nested data
        const projectData = response?.data?.data?.data || response?.data?.data;

        if (projectData) {
          setProject(projectData);
        } else {
          console.error('Unexpected data structure:', response.data);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    fetchData();
  }, [project_id]);

  if (loading) {
    // Show loader while data is fetching
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="my-4 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    // Handle case where project data is not available
    return <div>Project data not found.</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Market"
          />

          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Project', link: '/freelancer/market' },
              { label: project_id, link: '#' },
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
              <ProjectDetailCard
                projectName={project.projectName}
                description={project.description}
                email={project.email}
                status={project.status}
                startDate={project.createdAt}
                endDate={project.end}
                projectDomain={project.projectDomain}
                projectId={project._id}
                skills={project.skillsRequired}
                userRole="Freelancer"
              />
            </div>
          </div>

          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Profiles
            </CardTitle>
            {project?.profiles?.map((profile: any, index: number) => (
              <ProjectProfileDetailCard
                key={index}
                className="w-full min-w-full p-4 shadow-md rounded-lg"
                {...profile}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
