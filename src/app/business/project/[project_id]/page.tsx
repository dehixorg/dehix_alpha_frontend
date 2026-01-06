'use client';

import { CalendarX2, Users2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectSkillCard from '@/components/business/projectSkillCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BidsDetails from '@/components/freelancer/project/bidsDetail';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import AddProfileDialog from '@/components/dialogs/addProfileDialog';
import type { Milestone } from '@/utils/types/Milestone';
import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';

interface ProjectProfile {
  _id?: string;
  selectedFreelancer?: string[];
  totalBid?: number[];
  domain?: string;
  profileType?: string;
  freelancersRequired?: string;
  skills?: string[];
  experience?: number;
  minConnect?: number;
  rate?: number;
  description?: string;
  domain_id: string;
  freelancers?: {
    freelancerId: string;
    bidId: string;
  };
  team: string[];
}

interface Consultant {
  _id: string;
  name: string;
  domain: string;
  email: string;
  startDate?: Date;
  endDate?: Date;
  status: string;
}

interface Project {
  _id: string;
  projectName: string;
  projectDomain: string;
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
  profiles?: ProjectProfile[];
  milestones?: Milestone[];
  status?: StatusEnum; // enum
  team?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  consultants?: Consultant[];
}

export default function Dashboard() {
  const { project_id } = useParams<{ project_id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isAddProfileDialogOpen, setIsAddProfileDialogOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Your existing project data fetching code
        const response = await axiosInstance.get(`/project/${project_id}`);
        const projectData = response?.data?.data?.data || response?.data?.data;
        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error('API Error:', error);
      }
    };
    fetchData();
  }, [project_id]);

  const handleCompleteProject = (): void => {
    if (!project_id) {
      notifyError('Project ID is missing.', 'Error');
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.COMPLETED })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.COMPLETED } : prev,
          );
          notifySuccess('Project marked as completed!', 'Success');
        } else {
          console.error('Unexpected response:', response);
          notifyError('Failed to mark project as completed.', 'Failed');
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        notifyError(
          'An error occurred while updating the project status.',
          'Error',
        );
      });
  };

  // Handle project start
  const handleStartProject = (): void => {
    if (!project_id) {
      notifyError('Project ID is missing.', 'Error');
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.ACTIVE })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.ACTIVE } : prev,
          );
          notifySuccess('Project started successfully!', 'Success');
        } else {
          console.error('Unexpected response:', response);
          notifyError('Failed to start the project.', 'Failed');
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        notifyError('An error occurred while starting the project.', 'Error');
      });
  };
  // Handle project mark as incomplete
  const handleIncompleteProject = (): void => {
    if (!project_id) {
      notifyError('Project ID is missing.', 'Error');
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.ACTIVE })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.ACTIVE } : prev,
          );
          notifySuccess('Project marked as incomplete!', 'Success');
        } else {
          console.error('Unexpected response:', response);
          notifyError('Failed to mark project as incomplete.', 'Failed');
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        notifyError(
          'An error occurred while updating the project status.',
          'Error',
        );
      });
  };

  // Handle profile addition
  const handleAddProfile = () => {
    setIsAddProfileDialogOpen(true);
  };

  // Handle profile added successfully
  const handleProfileAdded = async () => {
    // Refetch project data to update the profiles list
    try {
      const response = await axiosInstance.get(`/project/${project_id}`);
      const projectData = response?.data?.data?.data || response?.data?.data;

      if (projectData) {
        setProject(projectData);
      }
    } catch (error) {
      console.error('Error refetching project:', error);
      notifyError('Failed to refresh project data.', 'Error');
    }
  };

  if (!project) {
    return (
      <BusinessDashboardLayout
        active="Projects"
        activeMenu="Projects"
        breadcrumbItems={[{ label: 'Project', link: '/business/projects' }]}
        contentClassName="flex flex-col sm:gap-4 sm:py-4 md:py-0 sm:pl-14 mb-8"
        mainClassName="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-4 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-3 md:gap-8"
      >
        <div className="w-full lg:col-span-3 space-y-4 md:space-y-8">
          {/* Project Info Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-wrap gap-2 pt-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Profiles Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:col-span-1 lg:w-auto mt-8 lg:mt-0 space-y-6 min-w-0">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </BusinessDashboardLayout>
    );
  }

  return (
    <BusinessDashboardLayout
      active="Projects"
      activeMenu="Projects"
      breadcrumbItems={[
        { label: 'Project', link: '/business/projects' },
        { label: project.projectName, link: '#' },
      ]}
      contentClassName="flex flex-col sm:gap-4 sm:py-4 md:py-0 sm:pl-14 mb-8"
      mainClassName="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-4 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-3 md:gap-8"
    >
      <div className="w-full lg:col-span-3 space-y-4 md:space-y-8">
        <Card className="overflow-hidden rounded-xl border shadow-sm">
          <Tabs defaultValue="Project-Info" className="w-full">
            <div className="border-b px-4 sm:px-6">
              <div className="-mx-1 max-w-full overflow-x-auto no-scrollbar px-1">
                <TabsList className="bg-transparent h-12 w-max min-w-full md:w-auto p-0 flex-nowrap">
                  <TabsTrigger
                    value="Project-Info"
                    className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Project Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="Profiles"
                    className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Profile Bids
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="Project-Info" className="m-0">
              <CardContent className="p-4 sm:p-6 space-y-6">
                <ProjectDetailCard
                  projectName={project.projectName}
                  description={project.description}
                  email={project.email}
                  status={project.status}
                  startDate={project.createdAt}
                  endDate={project.end}
                  projectDomain={project.projectDomain}
                  skills={project.skillsRequired}
                  projectId={project._id}
                  handleCompleteProject={handleCompleteProject}
                  handleStartProject={handleStartProject}
                  handleIncompleteProject={handleIncompleteProject}
                  userRole="Business"
                  milestones={project.milestones}
                />

                <div className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Profiles</CardTitle>
                      <CardDescription>
                        Define requirements and manage team allocation
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div>
                  {!project.profiles || project.profiles.length === 0 ? (
                    <div className="rounded-xl border bg-muted/20 p-8 sm:p-10 text-center">
                      <div className="mx-auto mb-5 h-14 w-14 rounded-2xl border bg-background flex items-center justify-center">
                        <Users2 className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-semibold">
                        No profiles yet
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add a profile to start receiving bids for specific
                        roles.
                      </p>
                      {project.status !== StatusEnum.COMPLETED &&
                        project.status !== StatusEnum.REJECTED && (
                          <div className="mt-5 flex justify-center">
                            <ProjectSkillCard
                              isLastCard={true}
                              onAddProfile={handleAddProfile}
                            />
                          </div>
                        )}
                    </div>
                  ) : (
                    <Carousel className="w-full relative pt-2">
                      <CarouselContent className="flex mt-3 -ml-2">
                        {project.profiles?.map((profile, index) => (
                          <CarouselItem
                            key={index}
                            className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3"
                          >
                            <ProjectSkillCard
                              domainName={profile.domain}
                              description={profile.description}
                              email={project.email}
                              profileType={profile.profileType}
                              startDate={project.createdAt}
                              endDate={project.end}
                              domains={[]}
                              skills={profile.skills}
                              team={profile.team || []}
                            />
                          </CarouselItem>
                        ))}
                        {project.status !== StatusEnum.COMPLETED &&
                          project.status !== StatusEnum.REJECTED && (
                            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3 pl-2">
                              <ProjectSkillCard
                                isLastCard={true}
                                onAddProfile={handleAddProfile}
                              />
                            </CarouselItem>
                          )}
                      </CarouselContent>
                      <div className="flex mb-2">
                        <CarouselPrevious className="absolute left-0 top-0 transform -translate-y-1/2 shadow-md transition-colors bg-muted-foreground/20 dark:bg-muted/20" />
                        <CarouselNext className="absolute right-0 top-0 transform -translate-y-1/2 shadow-md transition-colors bg-muted-foreground/20 dark:bg-muted/20" />
                      </div>
                    </Carousel>
                  )}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="Profiles" className="m-0">
              <CardContent className="p-0">
                <BidsDetails id={project_id || ''} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="w-full lg:col-span-1 lg:w-auto mt-8 lg:mt-0 space-y-6 min-w-0">
        <CardTitle className="group flex items-center gap-2 text-xl">
          Interviews
        </CardTitle>
        <div className="text-center py-6">
          <CalendarX2 className="mx-auto mb-2 text-gray-500" size="80" />
          <p className="text-gray-500 text-sm">No interviews scheduled</p>
        </div>
      </div>

      {/* Add Profile Dialog */}
      <AddProfileDialog
        projectId={project_id || ''}
        onProfileAdded={handleProfileAdded}
        open={isAddProfileDialogOpen}
        onOpenChange={setIsAddProfileDialogOpen}
      />
    </BusinessDashboardLayout>
  );
}
