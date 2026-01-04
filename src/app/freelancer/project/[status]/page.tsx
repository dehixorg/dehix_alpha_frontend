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
import { usePathname, useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { ProjectCard } from '@/components/cards/projectCard';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError } from '@/utils/toastMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Section header component
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

// Toggle between FREELANCER and CONSULTANT
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
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <Badge variant={projectType === 'FREELANCER' ? 'default' : 'outline'}>
        FREELANCER
      </Badge>
      <Switch
        id={id}
        checked={projectType === 'FREELANCER'}
        onCheckedChange={(checked) =>
          onChange(checked ? 'FREELANCER' : 'CONSULTANT')
        }
      />
      <Badge variant={projectType === 'CONSULTANT' ? 'default' : 'outline'}>
        CONSULTANT
      </Badge>
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

// Project list component
const ProjectList = ({
  status,
  projectType,
  refreshTrigger,
}: {
  status: string;
  projectType?: string;
  refreshTrigger?: number;
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
        const projectsData = response.data.data;
        if (status === 'ACTIVE') {
          const filteredProjects = projectsData.filter(
            (project: Project) => project.status === 'ACTIVE',
          );
          setProjects(filteredProjects);
        } else {
          setProjects(projectsData);
        }
      } catch (error) {
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error('API Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.uid, status, projectType, refreshTrigger]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col sm:gap-8 sm:py-0 mb-8">
        {isLoading ? (
          <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
          <main className="grid grid-cols-1 flex-1 items-start gap-4 sm:py-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            {projects.length === 0 ? (
              <div className="col-span-full w-full">
                <EmptyState
                  Icon={PackageOpen}
                  title="No projects available"
                  description="Once you have projects in this status, they will appear here."
                  className="border-0 bg-transparent py-6"
                />
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

// Main page component
export default function ProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [projectType, setProjectType] = useState('FREELANCER');
  const [activeTab, setActiveTab] = useState('current');
  const [projectsRefreshTrigger, setProjectsRefreshTrigger] = useState(0);

  // Listen for task assignment updates
  useEffect(() => {
    const handleTaskAssignmentUpdate = () => {
      setProjectsRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener(
      'taskAssignmentUpdated',
      handleTaskAssignmentUpdate,
    );
    return () => {
      window.removeEventListener(
        'taskAssignmentUpdated',
        handleTaskAssignmentUpdate,
      );
    };
  }, []);

  // Sync tab with URL
  useEffect(() => {
    const parts = pathname.split('/');
    const tabFromUrl = parts[parts.length - 1];
    if (['current', 'applied', 'completed', 'rejected'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('current');
      router.replace('/freelancer/project/current'); // default
    }
  }, [pathname, router]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/freelancer/project/${tab}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col pb-10">
      <SidebarMenu
        menuItemsTop={freelancerMenuItemsTop}
        menuItemsBottom={freelancerMenuItemsBottom}
        active="Projects"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Projects', link: '/freelancer/project' },
          ]}
        />

        <div className="flex-1">
          <div className="w-full p-4 sm:px-6 sm:py-2">
            <Card className="w-full">
              <CardHeader className="space-y-1 bg-gradient">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Projects
                </CardTitle>
                <CardDescription>
                  Track your projects by status and respond to invitations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-0">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="border-b px-4 sm:px-6">
                    <div className="max-w-full overflow-x-auto no-scrollbar">
                      <TabsList className="bg-transparent h-12 w-max min-w-max md:w-auto p-0 whitespace-nowrap">
                        <TabsTrigger
                          value="current"
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <FolderDot className="mr-2 h-4 w-4" /> Current
                        </TabsTrigger>
                        <TabsTrigger
                          value="applied"
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <Pointer className="mr-2 h-4 w-4" /> Applied
                        </TabsTrigger>
                        <TabsTrigger
                          value="completed"
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <FileCheck className="mr-2 h-4 w-4" /> Completed
                        </TabsTrigger>
                        <TabsTrigger
                          value="rejected"
                          className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <CircleX className="mr-2 h-4 w-4" /> Rejected
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <TabsContent value="current" className="space-y-4 px-6">
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
                    <ProjectList
                      status="ACTIVE"
                      projectType={projectType}
                      refreshTrigger={projectsRefreshTrigger}
                    />
                  </TabsContent>

                  <TabsContent value="applied" className="space-y-4 px-6">
                    <SectionHeader
                      title="Projects Under Verification"
                      subtitle="Track the status of your projects currently undergoing verification before final approval."
                      right={
                        <FilterToggle
                          id="project-type-applied"
                          projectType={projectType}
                          onChange={setProjectType}
                        />
                      }
                    />
                    <ProjectList status="PENDING" projectType={projectType} />
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4 px-6">
                    <SectionHeader
                      title="Completed Projects"
                      subtitle="Explore and manage your successfully completed freelance projects."
                      right={
                        <FilterToggle
                          id="project-type-completed"
                          projectType={projectType}
                          onChange={setProjectType}
                        />
                      }
                    />
                    <ProjectList status="COMPLETED" projectType={projectType} />
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-4 px-6">
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
                    <ProjectList
                      status="REJECTED"
                      projectType={projectType}
                      refreshTrigger={projectsRefreshTrigger}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
