'use client';

import { CalendarX2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Progress } from '@/components/ui/progress';
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
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/header/header';

interface ProjectProfile {
  _id?: string;
  selectedFreelancer?: string[];
  totalBid?: number[];
  domain?: string;
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
}

export default function Dashboard() {
  const { project_id } = useParams<{ project_id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/project/${project_id}`);
        const projectData = response?.data?.data?.data || response?.data?.data;

        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    fetchData();
  }, [project_id]);

  const handleCompleteProject = (): void => {
    if (!project_id) {
      toast({
        title: 'Error',
        description: 'Project ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    axiosInstance
      .put(`/project/${project_id}`, { status: StatusEnum.COMPLETED })
      .then((response) => {
        if (response.status === 200) {
          setProject((prev) =>
            prev ? { ...prev, status: StatusEnum.COMPLETED } : prev,
          );
          toast({
            title: 'Success',
            description: 'Project marked as completed!',
          });
        } else {
          console.error('Unexpected response:', response);
          toast({
            title: 'Failed',
            description: 'Failed to mark project as completed.',
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('Error updating project status:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while updating the project status.',
          variant: 'destructive',
        });
      });
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Progress className="w-1/2" value={50} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/business' },
            { label: 'Project', link: '/dashboard/business' },
            { label: project_id, link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div>
              <Tabs defaultValue="Project-Info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="Project-Info">Project-Info</TabsTrigger>
                  <TabsTrigger value="Profiles">Profile Bids</TabsTrigger>
                </TabsList>
                <TabsContent value="Project-Info">
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
                        skills={project.skillsRequired}
                        handleCompleteProject={handleCompleteProject}
                      />
                    </div>
                    <div>
                      <CardHeader className="pl-0 ">
                        <CardTitle className="pb-4">Profiles</CardTitle>
                      </CardHeader>
                      <Carousel className="w-1/2 relative pt-3">
                        <CarouselContent className="flex mt-3 gap-4">
                          {project.profiles?.map((profile, index) => (
                            <CarouselItem
                              key={index}
                              className="flex shrink-0 w-1/3"
                            >
                              <ProjectSkillCard
                                domainName={profile.domain}
                                description={profile.description}
                                email={project.email}
                                status={project.status}
                                startDate={project.createdAt}
                                endDate={project.end}
                                domains={[]}
                                skills={profile.skills}
                              />
                            </CarouselItem>
                          ))}
                          <div className="flex-nowrap w-full">
                            <ProjectSkillCard isLastCard={true} />
                          </div>
                        </CarouselContent>
                        {project.profiles && project.profiles.length > 0 && (
                          <>
                            <div className="flex">
                              <CarouselPrevious className="absolute  left-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                                Previous
                              </CarouselPrevious>
                              <CarouselNext className="absolute right-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
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
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <div className="text-center py-10">
              <CalendarX2 className="mx-auto mb-2 text-gray-500" size="100" />
              <p className="text-gray-500">No interviews scheduled</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
