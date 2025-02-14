'use client';
import { CheckCircle, ChevronRight, Clock, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

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
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import ProjectTableCard from '@/components/freelancer/homeTableComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import MeetingDialog from '@/components/ui/meetingDialog'; // Import MeetingDialog
import { StatusEnum } from '@/utils/freelancer/enum';
import Header from '@/components/header/header';
import ProfileCompletion from '@/components/dash-comp/profile-completion/page';

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
  profiles?: {
    _id?: string;
    domain?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    description?: string;
    domain_id: string;
    selectedFreelancer?: string[];
    freelancers?: {
      freelancerId: string;
      bidId: string;
    };
    totalBid?: string[];
  }[];
  status?: StatusEnum;
  team?: string[];
}

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false); // State for showing dialog
  const [currentTab, setCurrentTab] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchProjectData = async (status: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/freelancer/project?status=${status}`,
      );
      if (response.status == 200 && response?.data?.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    setLoadingStats(true);
    try {
      const activeCountResponse = await axiosInstance.get(
        `/freelancer/project?status=ACTIVE`,
      );
      const pendingCountResponse = await axiosInstance.get(
        `/freelancer/project?status=PENDING`,
      );

      if (
        activeCountResponse.status == 200 &&
        activeCountResponse?.data?.data
      ) {
        setActiveProjects(activeCountResponse.data.data);
      }
      if (
        pendingCountResponse.status == 200 &&
        pendingCountResponse?.data?.data
      ) {
        setPendingProjects(pendingCountResponse.data.data);
      }
    } catch (error) {
      console.error('API Error for project stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchProjectData(currentTab);
  }, [user.uid, currentTab]);

  useEffect(() => {
    fetchProjectStats();
  }, [user.uid]);

  const handleTabChange = (status: string) => {
    setCurrentTab(status);
    fetchProjectData(status);
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
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'Freelancer', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {/* Profile Completion component */}
            <ProfileCompletion userId={user.uid} />
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
                additionalInfo={'Earning stats will be here'}
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
              <Tabs
                value={currentTab}
                onValueChange={(status) => handleTabChange(status)}
              >
                <div className="flex items-center">
                  <TabsList>
                    <TabsTrigger value={StatusEnum.ACTIVE}>Active</TabsTrigger>
                    <TabsTrigger value={StatusEnum.PENDING}>
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value={StatusEnum.COMPLETED}>
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value={StatusEnum.REJECTED}>
                      Rejected
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value={StatusEnum.ACTIVE}>
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
                <TabsContent value={StatusEnum.PENDING}>
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
                <TabsContent value={StatusEnum.COMPLETED}>
                  <ProjectTableCard projects={projects} loading={loading} />
                </TabsContent>
                <TabsContent value={StatusEnum.REJECTED}>
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
