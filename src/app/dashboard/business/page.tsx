'use client';
import Link from 'next/link';
import { CheckCircle, Clock, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { PackageOpen } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
import { ProjectCard } from '@/components/cards/projectCard';
import InterviewCard from '@/components/shared/interviewCard';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import dummyData from '@/dummydata.json';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>([]); // State to hold response data
  const sampleInterviewData=dummyData.freelancersampleInterview;
  console.log(responseData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/business/all_project`); // Example API endpoint, replace with your actual endpoint
        console.log('API Response:', response.data.data);
        setResponseData(response.data.data); // Store response data in state
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user.uid]);
  console.log(user);
  const completedProjects = responseData.filter(
    (project: any) => project.status == 'Completed',
  );
  const pendingProjects = responseData.filter(
    (project: any) => project.status !== 'Completed',
  );
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* side bar need to make component */}
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dashboard"
          />
          <Breadcrumb
            items={[
              { label: 'Dashboard', link: '/dashboard/business' },
              { label: 'Business', link: '#' },
            ]}
          />

          {/* search need to remove without changing the layout */}
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>

          {/* profile dropdown need to create separeant component */}
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {/* Create project card */}
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic Projects Dashboard for Seamless
                    Management and Insightful Analysis.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button>
                    <Link href="/business/add-project">Create New Project</Link>
                  </Button>
                </CardFooter>
              </Card>

              <StatCard
                title="Completed Projects"
                value={completedProjects.length}
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo={"Project stats will be here"}
              />

              <StatCard
                title="Pending Projects"
                value={pendingProjects.length}
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo={"Pending project stats will be here"}
              />
            </div>
            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Current Projects {`(${pendingProjects.length})`}
            </h2>
            <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
              {pendingProjects? pendingProjects.map((project: any, index: number) => (
                <ProjectCard
                  key={index}
                  className="min-w-[45%]"
                  project={project}
                />
              )):
              <div className="text-center py-10 w-[100%] ">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">No projects available</p>
          </div>
              
              }
            </div>

            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Completed Projects {`(${completedProjects.length})`}
            </h2>
            <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
              { completedProjects.length>0?
              completedProjects.map((project: any, index: number) => (
                <ProjectCard
                  key={index}
                  className="min-w-[45%]"
                  project={project}
                />
              )):
              <div className="text-center py-10 w-[100%] ">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">No projects available</p>
          </div>
              }
            </div>
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            
            { dummyData?.freelancersampleInterview ?
            // just reverse the condition while integrating the api
            <div className="text-center py-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">No projects available</p>
          </div>:
              <InterviewCard
              interviewer={sampleInterviewData.interviewer}
              interviewee={sampleInterviewData.interviewee}
              skill={sampleInterviewData.skill}
              interviewDate={
                new Date(sampleInterviewData.interviewDate)
              }
              rating={sampleInterviewData.rating}
              comments={sampleInterviewData.comments}
            />
            
            }
          </div>
        </main>
      </div>
    </div>
  );
}
