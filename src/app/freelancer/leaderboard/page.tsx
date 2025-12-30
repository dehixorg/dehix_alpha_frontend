'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
function EmptyState({ filter }: { filter: string }) {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center">
          <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No {filter === 'ALL' ? '' : filter.toLowerCase()} Contests</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No {filter === 'ALL' ? '' : filter.toLowerCase()} contests found. Try changing your filter.
          </p>
        </div>
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
        <main className="p-4 sm:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Freelancer Contests</h1>
                  <p className="text-gray-400 mt-2">
                    Join active contests and compete for rewards
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <CardGridSkeleton />
          ) : error ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center">
                  <Trophy className="h-16 w-16 text-destructive/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Error Loading Data
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filter Controls */}
              <div className="flex justify-end mb-6">
                <div className="w-[180px]">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PUBLISHED">Completed</SelectItem>
                      <SelectItem value="SCHEDULED">Upcoming</SelectItem>
                      <SelectItem value="ALL">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-8">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="biweekly">Bi-weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>

                <TabsContent value="weekly">
                  {weeklyLeaderboards.length === 0 ? (
                    <EmptyState filter={statusFilter} />
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

                <TabsContent value="biweekly">
                  {biweeklyLeaderboards.length === 0 ? (
                    <EmptyState filter={statusFilter} />
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

                <TabsContent value="monthly">
                  {monthlyLeaderboards.length === 0 ? (
                    <EmptyState filter={statusFilter} />
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
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
