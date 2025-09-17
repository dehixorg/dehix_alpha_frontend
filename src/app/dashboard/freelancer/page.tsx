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
import { Project } from '@/types/project';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [rejectedProjects, setRejectedProjects] = useState<Project[]>([]);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(StatusEnum.ACTIVE);
  const [loading, setLoading] = useState(false);
  const loadingStats = true;

  const fetchProjectData = async (status: StatusEnum) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/project`);
      if (response.status === 200 && response?.data?.data) {
        switch (status) {
          case StatusEnum.ACTIVE:
            setActiveProjects(response.data.data);
            break;
          case StatusEnum.PENDING:
            setPendingProjects(response.data.data);
            break;
          case StatusEnum.COMPLETED:
            setCompletedProjects(response.data.data);
            break;
          case StatusEnum.REJECTED:
            setRejectedProjects(response.data.data);
            break;
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData(StatusEnum.ACTIVE);
    fetchProjectData(StatusEnum.PENDING);
    fetchProjectData(StatusEnum.COMPLETED);
    fetchProjectData(StatusEnum.REJECTED);
  }, [user.uid]);

  const handleTabChange = (status: StatusEnum) => {
    setCurrentTab(status);
  };

  const handleCreateMeetClick = () => {
    setShowMeetingDialog(true);
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
                onValueChange={(status) =>
                  handleTabChange(status as StatusEnum)
                }
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
                    type={StatusEnum.ACTIVE}
                    projects={activeProjects}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value={StatusEnum.PENDING}>
                  <ProjectTableCard
                    type={StatusEnum.PENDING}
                    projects={pendingProjects}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value={StatusEnum.COMPLETED}>
                  <ProjectTableCard
                    type={StatusEnum.COMPLETED}
                    projects={completedProjects}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value={StatusEnum.REJECTED}>
                  <ProjectTableCard
                    type={StatusEnum.REJECTED}
                    projects={rejectedProjects}
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

      <MeetingDialog
        isOpen={showMeetingDialog}
        onClose={() => setShowMeetingDialog(false)}
      />
    </div>
  );
}
