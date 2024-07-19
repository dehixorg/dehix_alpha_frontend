'use client';
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Search,
  CalendarX2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/shared/breadcrumbList';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
// import InterviewCard from '@/components/shared/interviewCard';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import ProjectTableCard from '@/components/freelancer/homeTableComponent';
import dummyData from '@/dummydata.json';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Calendar } from '@/components/ui/calendar';

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
  status?: string;
  team?: string[];
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const interviewData = {
  ...dummyData.freelancersampleInterview,
  interviewDate: new Date(dummyData.freelancersampleInterview.interviewDate),
};

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/freelancer/${user.uid}/project`,
        ); // Fetch data from API
        setProjects(response.data.data); // Store all projects initially
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData(); // Call fetch data function on component mount
  }, [user.uid]); // Empty dependency array ensures it runs only once on mount

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dashboard"
          />

          <Breadcrumb items={[{ label: 'Dashboard', link: '#' }]} />
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
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card
                className="sm:col-span-2 flex flex-col h-full"
                x-chunk="dashboard-05-chunk-0"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-3">0</CardTitle>
                </CardHeader>
                <CardFooter className=" grid gap-4 grid-cols-4">
                  <div className="col-span-3">
                    <CardTitle>Total Earnings</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      Your total earnings from projects.
                    </CardDescription>
                  </div>
                  <div className="flex items-end justify-end">
                    <ChevronRight className="h-12 w-12 text-muted-foreground" />
                  </div>
                </CardFooter>
              </Card>

              <StatCard
                title="Active Projects"
                value={
                  projects.filter((project) => project.status === 'Active')
                    .length
                }
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo="Earning stats will be here"
              />
              <StatCard
                title="Pending Projects"
                value={
                  projects.filter((project) => project.status === 'Pending')
                    .length
                }
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo="Project stats will be here"
              />
            </div>
            <Tabs defaultValue="active">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="active">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.status === 'Active',
                  )}
                />
              </TabsContent>
              <TabsContent value="pending">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.status === 'Pending',
                  )}
                />
              </TabsContent>
              <TabsContent value="completed">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.status === 'Completed',
                  )}
                />
              </TabsContent>
              <TabsContent value="rejected">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.status === 'Rejected',
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <div className="text-center py-10">
              <CalendarX2 className="mx-auto mb-2 text-gray-500" size="100" />
              <p className="text-gray-500">No interviews scheduled</p>
            </div>
            {/* <InterviewCard
              interviewer={dummyData.freelancersampleInterview.interviewer}
              interviewee={dummyData.freelancersampleInterview.interviewee}
              skill={dummyData.freelancersampleInterview.skill}
              interviewDate={interviewData.interviewDate}
              rating={dummyData.freelancersampleInterview.rating}
              comments={dummyData.freelancersampleInterview.comments}
            /> */}
          </div>
        </main>
      </div>
    </div>
  );
}
