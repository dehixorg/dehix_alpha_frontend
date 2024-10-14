'use client';
import { CheckCircle, ChevronRight, Clock, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Updated import for useRouter and useSearchParams

import { Search } from '@/components/search';
import Breadcrumb from '@/components/shared/breadcrumbList';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
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
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { Button } from '@/components/ui/button';

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

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter(); // Use the updated useRouter from next/navigation
  const searchParams = useSearchParams(); // Use useSearchParams to access query parameters

  // Get query string parameters (for example, auth response)
  useEffect(() => {
    const query = Object.fromEntries(searchParams.entries());
    
    // Check if the 'code' parameter exists
    if (query.code) {
      console.log('Query params:', query); // Log query string parameters
      handleCreateMeet();
    } else {
      // If no 'code' query parameter, trigger the auth flow
      handleAuth();
    }
  }, [searchParams]);

  // Function to handle Create Meet button press
  const handleCreateMeet = async () => {
    try {
      // Extract 'code' from query parameters
      const query = Object.fromEntries(searchParams.entries());
      const code = query.code;

      // Ensure the code exists
      if (!code) {
        console.error('Error: Missing code query parameter');
        return;
      }

      // Call your Fastify API to create a meeting
      const response = await axiosInstance.post(
        '/meeting/create-meeting',
        {
          attendees: ['akhilcodebugged@gmail.com'], // Replace with actual attendees
        },
        {
          params: { code }, // Pass the code as a query parameter
        }
      );

      // If the API responds with a meeting link, redirect to it
      const { meetLink } = response.data;
      if (meetLink) {
        router.push(meetLink);
      }
    } catch (error) {
      console.error('Error creating Google Calendar meeting:', error);
    }
  };

  // Function to handle Create Meet button press
  const handleAuth = async () => {
    try {
      const response = await axiosInstance.get('/meeting/auth-url', {
        params: { redirectUri: window.location.href }, // Pass current URL as redirectUri
      });
      const authUrl = response.data.url;
      if (authUrl) {
        router.push(authUrl); // Use router.push for navigation instead of window.location.href
      }
    } catch (error) {
      console.error('Error fetching Google Auth URL:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/freelancer/${user.uid}/project`,
        );
        setProjects(response.data.data); // Store projects data
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false); // Set loading to false when data is fetched
      }
    };

    fetchData(); // Fetch data on component mount
  }, [user.uid]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center py-6 gap-4 border-b bg-background px-4 sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dashboard"
          />

          <Breadcrumb items={[{ label: 'Dashboard', link: '#' }]} />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="sm:col-span-2 flex flex-col h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-3">
                    {loading ? <Skeleton className="h-10 w-20" /> : '0'}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="grid gap-4 grid-cols-4">
                  <div className="col-span-3">
                    <CardTitle>Total Earnings</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      {loading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                        'Your total earnings from projects.'
                      )}
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
                  loading
                    ? '...'
                    : projects.filter((p) => p.status === 'Active').length
                }
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo={
                  loading ? 'Loading...' : 'Earning stats will be here'
                }
              />
              <StatCard
                title="Pending Projects"
                value={
                  loading
                    ? '...'
                    : projects.filter((p) => p.status === 'Pending').length
                }
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo={
                  loading ? 'Loading...' : 'Project stats will be here'
                }
              />
            </div>
            <div className="overflow-x-auto">
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
                    projects={projects.filter((p) => p.status === 'Active')}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="pending">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Pending')}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="completed">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Completed')}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="rejected">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Rejected')}
                    loading={loading}
                  />
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
              <Button className="mt-3" onClick={handleAuth}>
                Create Meet
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
