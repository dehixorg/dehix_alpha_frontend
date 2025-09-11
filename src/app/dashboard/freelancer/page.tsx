'use client';
import { CheckCircle, Clock, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import MeetingDialog from '@/components/ui/meetingDialog';
import { StatusEnum } from '@/utils/freelancer/enum';
import Header from '@/components/header/header';
import ProfileCompletion from '@/components/dash-comp/profile-completion/page';
import { toast } from '@/components/ui/use-toast';
import EarningCard from '@/components/shared/earningCard';

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
  start: {
    expected: Date;
    actual?: Date;
  };
  end: {
    expected: Date;
    actual?: Date;
  };
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData(currentTab);
  }, [user.uid, currentTab]);

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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
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
    <div className="flex min-h-screen  w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {/* Profile Completion component */}
            <ProfileCompletion userId={user.uid} />
            {/* Project Status Cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <EarningCard
                className="sm:col-span-2 flex flex-col h-full"
                title="Total Revenue"
                value="$45,231.89"
                description="+20.1% from last month"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
              />
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
                  <ProjectTableCard
                    type="active"
                    projects={projects}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value={StatusEnum.PENDING}>
                  <ProjectTableCard
                    type="pending"
                    projects={projects}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value={StatusEnum.COMPLETED}>
                  <ProjectTableCard
                    type="completed"
                    projects={projects}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value={StatusEnum.REJECTED}>
                  <ProjectTableCard
                    type="rejected"
                    projects={projects}
                    loading={loading}
                  />
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
