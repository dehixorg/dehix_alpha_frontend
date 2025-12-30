'use client';
import { Loader2, Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Header from '@/components/header/header';
import { CardTitle } from '@/components/ui/card';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import { ProjectProfileDetailCard } from '@/components/freelancer/project/projectProfileDetailCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';
import type { Milestone } from '@/utils/types/Milestone';
import { toast } from '@/components/ui/use-toast';

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
  milestones?: Milestone[];
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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
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
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects"
      />
      <div className="flex mb-8 flex-col sm:pl-14 w-full">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Projects', link: '/freelancer/project' },
            { label: project.projectName, link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 mt-6">
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
                milestones={project.milestones}
                userRole="Freelancer"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Profiles</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Open profiles and submit your bid
                </p>
              </div>
            </div>
            {(project?.profiles ?? []).map((profile: any, index: number) => (
              <ProjectProfileDetailCard
                key={profile?._id ?? profile?.domain_id ?? index}
                className="w-full min-w-full"
                {...profile}
                skills={profile?.skills ?? []}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
