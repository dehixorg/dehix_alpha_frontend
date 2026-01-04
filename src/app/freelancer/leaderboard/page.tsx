'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Trophy,
  Zap,
} from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { FullLeaderboard } from '@/types/leaderboard';
import { ContestCard } from '@/components/leaderboard/ContestCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Skeleton Loaders
function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 600 240"
      role="img"
      aria-label="No contests illustration"
      className="w-full max-w-[520px]"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="24" y="24" width="552" height="192" rx="24" fill="url(#g)" />
      <rect
        x="70"
        y="70"
        width="220"
        height="24"
        rx="12"
        fill="hsl(var(--muted))"
      />
      <rect
        x="70"
        y="108"
        width="300"
        height="14"
        rx="7"
        fill="hsl(var(--muted))"
        opacity="0.9"
      />
      <rect
        x="70"
        y="132"
        width="260"
        height="14"
        rx="7"
        fill="hsl(var(--muted))"
        opacity="0.75"
      />
      <circle
        cx="468"
        cy="118"
        r="44"
        fill="hsl(var(--primary))"
        opacity="0.12"
      />
      <path
        d="M468 88c10 0 18 8 18 18s-8 18-18 18-18-8-18-18 8-18 18-18Z"
        fill="hsl(var(--primary))"
        opacity="0.25"
      />
      <path
        d="M442 166c14-20 40-20 52 0"
        stroke="hsl(var(--primary))"
        strokeOpacity="0.25"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmptyState({
  filter,
  onClear,
}: {
  filter: string;
  onClear: () => void;
}) {
  return (
    <Card>
      <CardContent className="py-10 sm:py-14">
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="text-muted-foreground">
            <EmptyIllustration />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">
              No {filter === 'ALL' ? '' : filter.toLowerCase()} contests
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              There are no contests matching your current filters.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button variant="outline" onClick={onClear}>
              Clear filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContestStatCard({
  title,
  value,
  icon,
  variant,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  variant: 'blue' | 'green' | 'amber';
}) {
  const styles = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50/70 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20',
      dot: 'bg-blue-200/30 dark:bg-blue-900/20',
      iconWrap: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-300',
      valueGrad:
        'bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50/70 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20',
      dot: 'bg-green-200/30 dark:bg-green-900/20',
      iconWrap: 'bg-green-100 dark:bg-green-900/50',
      iconColor: 'text-green-600 dark:text-green-300',
      valueGrad:
        'bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-200',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50/70 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20',
      dot: 'bg-amber-200/30 dark:bg-amber-900/20',
      iconWrap: 'bg-amber-100 dark:bg-amber-900/50',
      iconColor: 'text-amber-600 dark:text-amber-300',
      valueGrad:
        'bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200',
    },
  } as const;

  const s = styles[variant];

  return (
    <Card
      className={`relative overflow-hidden group hover:shadow-md transition-all duration-300 border ${s.bg}`}
    >
      <div
        className={`absolute -right-5 -top-5 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500 ${s.dot}`}
      />
      <CardHeader className="pb-1 px-4 pt-3 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${s.iconWrap}`}
          >
            <span className={s.iconColor}>{icon}</span>
          </div>
          <p
            className={`text-2xl font-bold bg-clip-text text-transparent ${s.valueGrad}`}
          >
            {value}
          </p>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground/90">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 px-4 py-1">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// Main Leaderboard Page Component
export default function LeaderboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboards, setLeaderboards] = useState<FullLeaderboard[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/leaderboard/current');

      // Data is now an array
      const data = response.data.data;
      if (Array.isArray(data)) {
        setLeaderboards(data);
      } else {
        setLeaderboards([]);
      }
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load leaderboard';
      setError(errorMessage);
      notifyError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipate = (id: string) => {
    router.push(`/freelancer/leaderboard/${id}`);
  };

  // Filter leaderboards by status first
  const filteredByStatus = leaderboards.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter; // Assuming status enum strings match filter values (ACTIVE, COMPLETED, etc.)
  });

  // Then filter by frequency for tabs
  const weeklyLeaderboards = filteredByStatus.filter(
    (l) => l.frequency === 'WEEKLY',
  );
  const biweeklyLeaderboards = filteredByStatus.filter(
    (l) => l.frequency === 'BIWEEKLY',
  );
  const monthlyLeaderboards = filteredByStatus.filter(
    (l) => l.frequency === 'MONTHLY',
  );

  const activeCount = leaderboards.filter((l) => l.status === 'ACTIVE').length;
  const upcomingCount = leaderboards.filter(
    (l) => l.status === 'SCHEDULED',
  ).length;
  const completedCount = leaderboards.filter(
    (l) => l.status === 'PUBLISHED',
  ).length;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Leaderboard"
      />
      <div className="flex flex-col sm:gap-4 sm:pb-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Leaderboard"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'Leaderboard', link: '/freelancer/leaderboard' },
          ]}
        />
        <main className="flex-1 p-4 sm:px-6 sm:py-2">
          <div className="mx-auto w-full max-w-[92vw]">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Leaderboard
                    </CardTitle>
                    <CardDescription>
                      Join contests, track performance, and compete for rewards.
                    </CardDescription>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ContestStatCard
                    title="Active"
                    value={activeCount}
                    subtitle="Live contests right now"
                    variant="blue"
                    icon={<Zap className="h-4 w-4" />}
                  />
                  <ContestStatCard
                    title="Upcoming"
                    value={upcomingCount}
                    subtitle="Scheduled contests"
                    variant="amber"
                    icon={<CalendarClock className="h-4 w-4" />}
                  />
                  <ContestStatCard
                    title="Completed"
                    value={completedCount}
                    subtitle="Finished contests"
                    variant="green"
                    icon={<Trophy className="h-4 w-4" />}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Tabs defaultValue="weekly" className="w-full">
                  <div className="border-b px-2 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="max-w-full overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-12 w-max min-w-max md:w-auto p-0 whitespace-nowrap">
                          <TabsTrigger
                            value="weekly"
                            className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                          >
                            <SignalLow className="h-4 w-4" />
                            <span>Weekly</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="biweekly"
                            className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                          >
                            <SignalMedium className="h-4 w-4" />
                            <span>Bi-weekly</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="monthly"
                            className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                          >
                            <SignalHigh className="h-4 w-4" />
                            <span>Monthly</span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TooltipProvider>
                        <div className="flex items-center gap-2">
                          <Separator
                            orientation="vertical"
                            className="hidden sm:block h-8"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-[190px]">
                                <Select
                                  value={statusFilter}
                                  onValueChange={(value) =>
                                    setStatusFilter(value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="ACTIVE">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="SCHEDULED">
                                      Upcoming
                                    </SelectItem>
                                    <SelectItem value="PUBLISHED">
                                      Completed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Filter contests by status
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6">
                    {isLoading ? (
                      <CardGridSkeleton />
                    ) : error ? (
                      <Card>
                        <CardContent className="py-10 sm:py-14">
                          <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                              <Trophy className="h-7 w-7 text-destructive" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">
                                Couldn’t load leaderboard
                              </h3>
                              <p className="text-muted-foreground mt-2 max-w-md">
                                {error}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Button onClick={loadLeaderboardData}>
                                Try again
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setStatusFilter('ALL')}
                              >
                                Clear filters
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <TabsContent value="weekly" className="m-0">
                          {weeklyLeaderboards.length === 0 ? (
                            <EmptyState
                              filter={statusFilter}
                              onClear={() => setStatusFilter('ALL')}
                            />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {weeklyLeaderboards.map((lb) => (
                                <ContestCard
                                  key={lb._id}
                                  leaderboard={lb}
                                  onParticipate={handleParticipate}
                                />
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="biweekly" className="m-0">
                          {biweeklyLeaderboards.length === 0 ? (
                            <EmptyState
                              filter={statusFilter}
                              onClear={() => setStatusFilter('ALL')}
                            />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {biweeklyLeaderboards.map((lb) => (
                                <ContestCard
                                  key={lb._id}
                                  leaderboard={lb}
                                  onParticipate={handleParticipate}
                                />
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="monthly" className="m-0">
                          {monthlyLeaderboards.length === 0 ? (
                            <EmptyState
                              filter={statusFilter}
                              onClear={() => setStatusFilter('ALL')}
                            />
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {monthlyLeaderboards.map((lb) => (
                                <ContestCard
                                  key={lb._id}
                                  leaderboard={lb}
                                  onParticipate={handleParticipate}
                                />
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
