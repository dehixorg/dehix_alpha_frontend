'use client';
import {
  PackageOpen,
  FolderDot,
  Pointer,
  FileCheck,
  CircleX,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';
import { StatusEnum } from '@/utils/freelancer/enum';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Badge } from '@/components/ui/badge';

// Reusable header component for tab sections
function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center mb-8 ml-6 pr-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-400 mt-2">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

// Reusable project type toggle (Consultant <-> Freelancer)
function FilterToggle({
  projectType,
  onChange,
  id,
}: {
  projectType: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Badge className="font-medium">FREELANCER</Badge>
      <Switch
        id={id}
        checked={projectType === 'FREELANCER'}
        onCheckedChange={(checked) =>
          onChange(checked ? 'FREELANCER' : 'CONSULTANT')
        }
      />
      <Badge className="font-medium">CONSULTANT</Badge>
    </div>
  );
}

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
  status?: StatusEnum;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectList = ({
  status,
  projectType,
}: {
  status: string;
  projectType?: string;
}) => {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let url = `/freelancer/project?status=${status}`;
        if (projectType) {
          url += `&project_type=${projectType}`;
        }
        const response = await axiosInstance.get(url);
        setProjects(response.data.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.uid, status, projectType]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col sm:gap-8 sm:py-0 mb-8">
        {isLoading ? (
          <div
            className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default function ProjectPage() {
  const [projectType, setProjectType] = useState('CONSULTANT');

  return (
    <div className="flex min-h-screen bg-background">
      <div className="bg-background border-r">
        <SidebarMenu
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          active="Projects"
        />
      </div>
      <div className="flex mb-8 flex-col sm:pl-14 w-full">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Projects', link: '/freelancer/project' },
          ]}
        />
        <div className="flex-1">
          <div className="w-full p-4">
            <Tabs defaultValue="current" className="w-full flex flex-col gap-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="current"
                  className="flex items-center gap-2"
                >
                  <FolderDot className="h-4 w-4" />
                  Current
                </TabsTrigger>
                <TabsTrigger
                  value="applied"
                  className="flex items-center gap-2"
                >
                  <Pointer className="h-4 w-4" />
                  Applied
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center gap-2"
                >
                  <CircleX className="h-4 w-4" />
                  Rejected
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <SectionHeader
                  title="Current Projects"
                  subtitle="Browse and manage your active freelance projects"
                  right={
                    <FilterToggle
                      id="project-type"
                      projectType={projectType}
                      onChange={setProjectType}
                    />
                  }
                />
                <ProjectList status="ACTIVE" projectType={projectType} />
              </TabsContent>

              <TabsContent value="applied">
                <SectionHeader
                  title="Applied Projects"
                  subtitle="Track the status of your projects currently undergoing verification before final approval."
                />
                <ProjectList status="PENDING" />
              </TabsContent>

              <TabsContent value="completed">
                <SectionHeader
                  title="Completed Projects"
                  subtitle="Explore and manage your successfully completed freelance projects."
                />
                <ProjectList status="COMPLETED" />
              </TabsContent>

              <TabsContent value="rejected">
                <SectionHeader
                  title="Rejected Projects"
                  subtitle="Explore and Review projects that were not selected and gain insights for future submissions."
                  right={
                    <FilterToggle
                      id="project-type-rejected"
                      projectType={projectType}
                      onChange={setProjectType}
                    />
                  }
                />
                <ProjectList status="REJECTED" projectType={projectType} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
