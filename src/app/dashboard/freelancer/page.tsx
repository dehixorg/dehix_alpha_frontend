'use client';
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Search,
  UserIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Breadcrumb from '@/components/shared/breadcrumbList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
import InterviewCard from '@/components/shared/interviewCard';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import ProjectTableCard from '@/components/freelancer/homeTableComponent';

interface Project {
  id: string;
  projectName: string;
  projectType: string;
  verified: boolean;
  start: string;
}

const sampleInterview = {
  interviewer: 'John Doe',
  interviewee: 'Jane Smith',
  skill: 'React Development',
  interviewDate: new Date('2023-11-23T10:30:00Z'),
  rating: 4.5,
  comments: 'Great communication skills and technical expertise.',
};

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`); // Fetch data from API
        console.log(response.data.projects);
        setProjects(Object.values(response.data.projects)); // Store all projects initially
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
          <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Dashboard" />

          <Breadcrumb items={[{ label: 'Dashboard', link: '#' }]} />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/user.png" alt="@shadcn" />
                  <AvatarFallback>
                    <UserIcon size={16} />{' '}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card
                className="sm:col-span-2 flex flex-col h-full"
                x-chunk="dashboard-05-chunk-0"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-3">$1000</CardTitle>
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
                  projects.filter((project) => project.projectType === 'active')
                    .length
                }
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo="+10% from last month"
              />
              <StatCard
                title="Pending Projects"
                value={
                  projects.filter(
                    (project) => project.projectType === 'pending',
                  ).length
                }
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo="2 new projects this week"
              />
            </div>
            <Tabs defaultValue="active">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="applied">Applied</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="active">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.projectType === 'active',
                  )}
                />
              </TabsContent>
              <TabsContent value="applied">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.projectType === 'applied',
                  )}
                />
              </TabsContent>
              <TabsContent value="completed">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.projectType === 'completed',
                  )}
                />
              </TabsContent>
              <TabsContent value="rejected">
                <ProjectTableCard
                  projects={projects.filter(
                    (project) => project.projectType === 'rejected',
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <InterviewCard {...sampleInterview} />
            <InterviewCard {...sampleInterview} />
          </div>
        </main>
      </div>
    </div>
  );
}
