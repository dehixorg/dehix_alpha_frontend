'use client';
import { CheckCircle, ChevronRight, Clock, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

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
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import MeetingDialog from '@/components/ui/meetingDialog'; // Import MeetingDialog

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
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false); // State for showing dialog
  const [currentTab, setCurrentTab] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchData = async (status: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/freelancer/${user.uid}/project?status=${status}`,
      );
      setProjects(response.data.data);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }; // Fetch data when selectedStatus changes

  const fetchProjectStats = async () => {
    setLoadingStats(true);
    try {
      const activeCountResponse = await axiosInstance.get(
        `/freelancer/${user.uid}/project?status=Active`,
      );
      const pendingCountResponse = await axiosInstance.get(
        `/freelancer/${user.uid}/project?status=Pending`,
      );

      setActiveProjects(activeCountResponse.data.data);
      setPendingProjects(pendingCountResponse.data.data);
    } catch (error) {
      console.error('API Error for project stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchProjectStats();
    fetchData(currentTab);
  }, [user.uid, currentTab]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleTabChange = (status: string) => {
    setCurrentTab(status);
    fetchData(status);
  };

  const handleCreateMeetClick = () => {
    setShowMeetingDialog(true); // Open meeting dialog
  };

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
            {/* Project Status Cards */}
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
                value={loadingStats ? '...' : activeProjects.length}
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo={
                  loadingStats ? 'Loading...' : 'Earning stats will be here'
                }
              />
              <StatCard
                title="Pending Projects"
                value={loadingStats ? '...' : pendingProjects.length}
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo={
                  loadingStats ? 'Loading...' : 'Project stats will be here'
                }
              />
            </div>

            {/* Tabs for project filtering */}
            <div className="overflow-x-auto">
              <Tabs value={currentTab} onValueChange={handleTabChange}>
                <div className="flex items-center">
                  <TabsList>
                    <TabsTrigger value="Active">Active</TabsTrigger>
                    <TabsTrigger value="Pending">Pending</TabsTrigger>
                    <TabsTrigger value="Completed">Completed</TabsTrigger>
                    <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="Active">
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
                <TabsContent value="Pending">
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
                <TabsContent value="Completed">
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
                <TabsContent value="Rejected">
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Create Meet Section */}
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <div className="text-center py-10">
              <CalendarX2 className="mx-auto mb-2 text-gray-500" size="100" />
              <p className="text-gray-500">No interviews scheduled</p>
              <Button className="mt-3" onClick={handleCreateMeetClick} disabled>
                Create Meet
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* MeetingDialog Modal */}
      <MeetingDialog
        isOpen={showMeetingDialog}
        onClose={() => setShowMeetingDialog(false)}
      />
    </div>
  );
}
