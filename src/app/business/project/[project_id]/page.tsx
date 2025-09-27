'use client';

import { CalendarX2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectSkillCard from '@/components/business/projectSkillCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BidsDetails from '@/components/freelancer/project/bidsDetail';
import { StatusEnum } from '@/utils/freelancer/enum';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import Header from '@/components/header/header';
import AddProfileDialog from '@/components/dialogs/addProfileDialog';

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
  profiles?: ProjectProfile[];
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
      <div className="flex min-h-screen w-full flex-col p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
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
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 md:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Project', link: '/dashboard/business' },
            { label: project.projectName, link: '#' },
          ]}
        />
        <main className="flex flex-col lg:grid lg:grid-cols-4 xl:grid-cols-4 flex-1 items-start gap-4 p-4 sm:px-6 sm:py-3 md:gap-8">
          <div className="w-full lg:col-span-3 space-y-4 md:space-y-8">
            <Tabs defaultValue="Project-Info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Project-Info">Project Info</TabsTrigger>
                <TabsTrigger value="Profiles">Profile Bids</TabsTrigger>
              </TabsList>
              <TabsContent value="Project-Info">
                <div className="space-y-4 md:space-y-8">
                  <div>
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
                      userRole="Business"
                    />
                  </div>
                  <div>
                    <CardHeader className="pl-0 ">
                      <CardTitle className="pb-4">Profiles</CardTitle>
                    </CardHeader>
                    <Carousel className="w-full relative pt-3">
                      <CarouselContent className="flex mt-3 -ml-2">
                        {project.profiles?.map((profile, index) => (
                          <CarouselItem
                            key={index}
                            className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3 pl-2"
                          >
                            <ProjectSkillCard
                              domainName={profile.domain}
                              description={profile.description}
                              email={project.email}
                              status={project.status}
                              profileType={profile.profileType}
                              startDate={project.createdAt}
                              endDate={project.end}
                              domains={[]}
                              skills={profile.skills}
                              team={profile.team || []}
                            />
                          </CarouselItem>
                        ))}
                        {/* Only show Add Profile card if project is not completed or rejected */}
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
                      {project.profiles && project.profiles.length > 0 && (
                        <>
                          <div className="flex">
                            <CarouselPrevious className="absolute  left-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors bg-muted-foreground/20 dark:bg-muted/20">
                              Previous
                            </CarouselPrevious>
                            <CarouselNext className="absolute right-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors bg-muted-foreground/20 dark:bg-muted/20">
                              Next
                            </CarouselNext>
                          </div>
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="Profiles">
                <BidsDetails id={project_id || ''} />
              </TabsContent>
            </Tabs>
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
        </main>

        {/* Add Profile Dialog */}
        <AddProfileDialog
          projectId={project_id || ''}
          onProfileAdded={handleProfileAdded}
          open={isAddProfileDialogOpen}
          onOpenChange={setIsAddProfileDialogOpen}
        />
      </div>
    </div>
  );
}
