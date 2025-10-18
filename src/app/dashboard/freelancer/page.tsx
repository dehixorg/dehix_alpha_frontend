'use client';
import { Activity, CheckCircle, Clock, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import StatItem from '@/components/shared/StatItem';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { cn } from '@/lib/utils';
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
import { notifyError } from '@/utils/toastMessage';
import { Project } from '@/types/project';
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/freelancer/project`);
      if (response.status === 200 && response?.data?.data) {
        setProjects(response.data.data);
        setLoadingStats(false);
      }
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized counts of projects by status for efficient rendering of stats
  const statusCounts = useMemo(() => {
    const counts: Record<StatusEnum, number> = {
      [StatusEnum.ACTIVE]: 0,
      [StatusEnum.PENDING]: 0,
      [StatusEnum.COMPLETED]: 0,
      [StatusEnum.REJECTED]: 0,
    };
    for (const p of projects) {
      if (p.status && counts[p.status as StatusEnum] !== undefined) {
        counts[p.status as StatusEnum] += 1;
      }
    }
    return counts;
  }, [projects]);

  useEffect(() => {
    fetchProjectData();
  }, [user.uid]);

  const handleCreateMeetClick = () => {
    setShowMeetingDialog(true);
  };

  // Total revenue display (placeholder for now, can be made dynamic later)
  const totalRevenueValue = '$45,231.89';
  const revenueSpanClass =
    String(totalRevenueValue).length > 12 ? 'lg:col-span-2' : '';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 px-4 sm:px-6 sm:py-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <Card className="bg-gradient shadow-sm overflow-hidden">
              <CardHeader className="py4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                      Welcome Back,{' '}
                      {user?.displayName
                        ? user.displayName
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(' ')
                        : 'User'}
                      !
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Here&lsquo;s what&lsquo;s happening with your projects
                      today.
                    </CardDescription>
                  </div>
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              {user?.uid ? (
                <ProfileCompletion userId={user.uid} />
              ) : (
                <div className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
            </Card>
            {/* Project Status Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 grid-flow-row-dense">
              <StatItem
                variant="card"
                label="Total Revenue"
                value={totalRevenueValue}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                className={cn('h-full min-w-0', revenueSpanClass)}
                color="green"
                text_class="text-2xl"
                content_class="min-w-0"
                label_class="truncate"
                value_class=""
              />

              <StatItem
                variant="card"
                label="Active Projects"
                value={loadingStats ? '...' : statusCounts[StatusEnum.ACTIVE]}
                icon={<Activity className="h-5 w-5" />}
                className="h-full min-w-0"
                color="green"
                text_class="text-2xl"
                content_class="min-w-0"
                value_class="truncate whitespace-nowrap"
              />

              <StatItem
                variant="card"
                label="Pending Projects"
                value={loadingStats ? '...' : statusCounts[StatusEnum.PENDING]}
                icon={<Clock className="h-5 w-5" />}
                className="h-full min-w-0"
                color="amber"
                text_class="text-2xl"
                content_class="min-w-0"
                value_class="truncate whitespace-nowrap"
              />

              <StatItem
                variant="card"
                label="Completed Projects"
                value={
                  loadingStats ? '...' : statusCounts[StatusEnum.COMPLETED] || 0
                }
                icon={<CheckCircle className="h-5 w-5" />}
                className="h-full min-w-0"
                color="blue"
                text_class="text-2xl"
                content_class="min-w-0"
                label_class=""
                value_class="truncate whitespace-nowrap"
              />
            </div>

            {/* Projects with internal tabs */}
            <ProjectTableCard projects={projects} loading={loading} />
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
