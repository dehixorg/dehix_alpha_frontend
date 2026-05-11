'use client';

import { Activity, CheckCircle, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import StatItem from '@/components/shared/StatItem';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
const ProjectTableCard = dynamic(() => import('@/components/freelancer/homeTableComponent'), { loading: () => <Skeleton className="h-48 w-full" /> });
import { InterviewsSection } from '@/components/interviews/InterviewsSection';
import { StatusEnum } from '@/utils/freelancer/enum';
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
import { useDashboardTour } from '@/components/tour/freelancer/useDashboardTour';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  useDashboardTour(true);

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

    // Track unique project IDs for each status to avoid counting duplicate bids on the same project
    const uniqueProjectIds: Record<StatusEnum, Set<string>> = {
      [StatusEnum.ACTIVE]: new Set(),
      [StatusEnum.PENDING]: new Set(),
      [StatusEnum.COMPLETED]: new Set(),
      [StatusEnum.REJECTED]: new Set(),
    };

    for (const p of projects) {
      if (p.status && counts[p.status as StatusEnum] !== undefined) {
        // Only count if this project hasn't been counted for this status yet
        if (!uniqueProjectIds[p.status as StatusEnum].has(p._id)) {
          uniqueProjectIds[p.status as StatusEnum].add(p._id);
          counts[p.status as StatusEnum] += 1;
        }
      }
    }
    return counts;
  }, [projects]);

  useEffect(() => {
    if (user?.uid) fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const totalRevenueValue = '$0';
  const revenueSpanClass =
    String(totalRevenueValue).length > 12 ? 'lg:col-span-2' : '';

  return (
    <FreelancerAppLayout
      active="Dashboard"
      activeMenu="Dashboard"
      breadcrumbItems={[{ label: 'Freelancer', link: '/dashboard/freelancer' }]}
    >
      <div
        className="grid items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
        data-tour="main"
      >
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
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
              value={
                loadingStats ? '...' : statusCounts[StatusEnum.COMPLETED] || 0
              }
              icon={<CheckCircle className="h-5 w-5" />}
              className="h-full min-w-0"
              color="blue"
              text_class="text-2xl"
              content_class="min-w-0"
              value_class="truncate whitespace-nowrap"
            />
          </div>

          <div data-tour="projects">
            <ProjectTableCard projects={projects} loading={loading} />
          </div>
        </div>

        <div data-tour="interviews">
          <InterviewsSection />
        </div>
      </div>
    </FreelancerAppLayout>
  );
}
