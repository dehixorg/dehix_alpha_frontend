'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { FullLeaderboard } from '@/types/leaderboard';
import { ContestCard } from '@/components/leaderboard/ContestCard';

// Helper component for loading state
function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper component for empty state
function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Leaderboard History</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          You haven&apos;t participated in any leaderboards yet. Visit the
          Leaderboard page to join contests!
        </p>
      </CardContent>
    </Card>
  );
}

export default function LeaderboardHistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboards, setLeaderboards] = useState<FullLeaderboard[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard history
  const loadLeaderboardHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/leaderboard/my-history');
      const data = response.data.data;

      if (Array.isArray(data)) {
        setLeaderboards(data);
      } else {
        setLeaderboards([]);
      }
    } catch (err: any) {
      console.error('Error loading leaderboard history:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to load leaderboard history';
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadLeaderboardHistory();
  }, []);

  // Navigation handler
  const handleViewDetails = (id: string) => {
    router.push(`/freelancer/leaderboard/${id}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Leaderboard History"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Leaderboard History"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Leaderboard History', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 mb-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Leaderboard History</h1>
                <p className="text-muted-foreground">
                  View all the contests you&apos;ve participated in
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Rendering */}
          {isLoading ? (
            <CardGridSkeleton />
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-destructive mb-4">
                  <svg
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Error Loading History
                </h3>
                <p className="text-muted-foreground text-center max-w-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={loadLeaderboardHistory}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </CardContent>
            </Card>
          ) : leaderboards.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboards.map((lb) => (
                <ContestCard
                  key={lb._id}
                  leaderboard={lb}
                  onParticipate={handleViewDetails}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
