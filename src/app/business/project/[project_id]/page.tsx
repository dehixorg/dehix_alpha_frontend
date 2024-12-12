'use client';

import { Search, CalendarX2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/shared/breadcrumbList';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import ProjectDetailCard from '@/components/freelancer/project/projectDetailCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectSkillCard from '@/components/business/projectSkillCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BidsDetails from '@/components/freelancer/project/bidsDetail';
import { Button } from '@/components/ui/button';
import { StatusEnum } from '@/utils/freelancer/enum';

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

  const handleCompleteProject = async () => {
    if (!project_id) return;

    try {
      const response = await axiosInstance.put(`/project/${project_id}`, {
        status: StatusEnum.COMPLETED,
      });

      if (response?.status === 200) {
        setProject((prev) => {
          if (prev) {
            return { ...prev, status: StatusEnum.COMPLETED };
          }
          return prev;
        });
        alert('Project marked as completed!');
      } else {
        console.error('Unexpected response:', response);
        alert('Failed to mark project as completed.');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('An error occurred while updating the project status.');
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active=""
          />
          <Breadcrumb
            items={[
              { label: 'Dashboard', link: '/dashboard/business' },
              { label: 'Project', link: '/dashboard/business' },
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
                      />
                    </div>
                    <div>
                      <CardHeader className="pl-0">
                        <CardTitle>Profiles</CardTitle>
                      </CardHeader>
                      <CardContent className="pl-0">
                        <div className="grid w-full items-center gap-4">
                          <div className="w-auto grid grid-cols-2 gap-4">
                            {project.profiles?.map((profile, index) => (
                              <ProjectSkillCard
                                key={index}
                                domainName={profile.domain}
                                description={profile.description}
                                email={project.email}
                                status={project.status}
                                startDate={project.createdAt}
                                endDate={project.end}
                                domains={[]}
                                skills={profile.skills}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <Button
                        className="w-full sm:w-[50%] md:w-[30%] lg:w-[15%]"
                        onClick={handleCompleteProject}
                      >
                        Mark as Completed
                      </Button>
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
