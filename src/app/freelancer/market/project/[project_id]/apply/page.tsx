'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  const [attachment, setAttachment] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Create form data for multipart/form-data
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('coverLetter', coverLetter);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await axiosInstance.post('/project/application', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });

      // Redirect back to projects
      router.push('/freelancer/market');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    router.back();
  };

  if (isLoading && !project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading project details...</div>
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:border-0 sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Market"
          />

          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Freelancer Market', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main className="w-[85vw] mx-auto text-foreground">
          {project && (
            <ProjectApplicationForm
              project={project}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
