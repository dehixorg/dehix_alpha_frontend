'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { Search } from '@/components/search';
import DropdownProfile from '@/components/shared/DropdownProfile';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import ProjectApplicationForm from '@/components/shared/ProjectApplicationPage';
import { axiosInstance } from '@/lib/axiosinstance';
import Header from '@/components/header/header';

interface Bid {
  _id: string;
  userName: string;
  current_price: number;
  bid_status: string;
  description: string;
}

interface Profile {
  _id: string;
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description: string;
}

interface Budget {
  type: string;
  hourly?: {
    minRate: number;
    maxRate: number;
    estimatedHours: number;
  };
  fixedAmount?: number;
}

interface ProjectData {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyName: string;
  skillsRequired: string[];
  status: string;
  projectType: string;
  profiles: Profile[];
  bids: Bid[];
  budget: Budget;
  createdAt: string;
}
const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');

  // Get project ID from URL (format: /freelancer/market/post/123/apply)
  const projectId: string = (params?.project_id as string) || '123';

  useEffect(() => {
    const fetchProjectDetails = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/project/project/${projectId}`,
        );

        setProject(response.data.data[0]);
      } catch (error) {
        console.error('Error fetching project details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch project data
    fetchProjectDetails();
  }, [projectId, toast]);

  const handleCancel = (): void => {
    router.back();
  };

  if (isLoading && !project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">
          <Loader2 className="animate-spin w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Market"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Marketplace', link: '#' },
          ]}
        />
        <main className="w-[85vw] mx-auto text-foreground">
          {project && (
            <ProjectApplicationForm
              project={project}
              isLoading={isLoading}
              onCancel={handleCancel}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
