'use client';

import { Activity, CheckCircle, Clock, HelpCircle } from 'lucide-react';
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
import { InterviewsSection } from '@/components/interviews/InterviewsSection';
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
import { Button } from '@/components/ui/button';

import DashboardTour from '@/components/tour/DashboardTour';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  // ✅ Shepherd: control tour start
  const [startTourSignal, setStartTourSignal] = useState(0);

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
    if (user?.uid) fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const totalRevenueValue = '$45,231.89';
  const revenueSpanClass =
    String(totalRevenueValue).length > 12 ? 'lg:col-span-2' : '';

  useEffect(() => {
  const key = `tour:dashboard:done:${user?.uid || 'guest'}`;
  const done = localStorage.getItem(key);
  if (!done) setStartTourSignal((x) => x + 1);
}, [user?.uid]);


  return (
    <div className="flex min-h-screen w-full flex-col" data-tour="page">
      {/* ✅ Anchor: Sidebar */}
        <SidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active="Dashboard"
        />

      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        {/* ✅ Anchor: Header */}
        <div data-tour="header">
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu="Dashboard"
            breadcrumbItems={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
            ]}
          />
        </div>

        {/* ✅ Founder demo button */}
        <div className="px-4 sm:px-6 pt-2 flex justify-end">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setStartTourSignal((x) => x + 1)}
          >
            <HelpCircle className="h-4 w-4" />
            Start Tour
          </Button>
        </div>

        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
          data-tour="main"
        >
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {/* ✅ Anchor: Welcome */}
            <Card
              className="bg-gradient shadow-sm overflow-hidden"
              data-tour="welcome"
            >
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
                      {user?.displayName?.charAt(0).toUpperCase() || 'X'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>

              {/* ✅ Anchor: Profile completion */}
              <div data-tour="profile-completion">
                {user?.uid ? (
                  <ProfileCompletion userId={user.uid} />
                ) : (
                  <div className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
              </div>
            </Card>

            {/* ✅ Anchor: Stats */}
            <div
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 grid-flow-row-dense"
              data-tour="stats"
            >
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
                value={loadingStats ? '...' : statusCounts[StatusEnum.COMPLETED] || 0}
                icon={<CheckCircle className="h-5 w-5" />}
                className="h-full min-w-0"
                color="blue"
                text_class="text-2xl"
                content_class="min-w-0"
                value_class="truncate whitespace-nowrap"
              />
            </div>

            {/* ✅ Anchor: Projects */}
            <div data-tour="projects">
              <ProjectTableCard projects={projects} loading={loading} />
            </div>
          </div>

          {/* ✅ Anchor: Interviews */}
          <div data-tour="interviews">
            <InterviewsSection />
          </div>
        </main>

        {/* ✅ Tour runner */}
        <DashboardTour startSignal={startTourSignal} isReady={!loading} />
      </div>
    </div>
  );
}
