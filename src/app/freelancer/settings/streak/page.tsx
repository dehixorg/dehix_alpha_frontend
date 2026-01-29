'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Flame, Calendar, Trophy, Gift, Check, Lock } from 'lucide-react';

import { updateConnectsBalance } from '@/lib/updateConnects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import FreelancerSettingsLayout from '@/components/layout/FreelancerSettingsLayout';
import StatCard from '@/components/shared/statCard';

// TypeScript Interfaces
interface StreakInfo {
  freelancerId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakStartDate: string | null;
  claimableMilestones: number[]; // Array of milestones that can be claimed
}

function Illustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 220"
      role="img"
      aria-label="Streak illustration"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="418"
        height="218"
        rx="18"
        className="fill-muted/40"
      />
      <path
        d="M78 148c24-38 60-64 112-64 70 0 92 56 144 56 24 0 44-8 60-20"
        className="stroke-muted-foreground/40"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M112 148c18-26 44-42 78-42 48 0 62 34 96 34 16 0 30-5 42-12"
        className="stroke-primary/40"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M210 46c10 16 6 30-4 40-10 10-8 22 0 30"
        className="stroke-orange-500/50"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="210" cy="124" r="10" className="fill-orange-500/50" />
      <rect
        x="1"
        y="1"
        width="418"
        height="218"
        rx="18"
        className="stroke-border"
      />
    </svg>
  );
}

interface StreakRewardResponse {
  success: boolean;
  message: string;
  data: {
    finalAmount: number;
    transactionId: string;
    baseAmount: number;
    rewardMultiplier: number;
    levelPriority: number;
  };
}

interface StreakReward {
  _id: string;
  days: number;
  reward: number;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Service Functions
const fetchStreakInfo = async (): Promise<StreakInfo> => {
  try {
    const response = await axiosInstance.get('/freelancer/me');
    const streakData = response.data.data.streak;
    const userId = response.data.data._id;

    if (!streakData) {
      return {
        freelancerId: userId,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        streakStartDate: null,
        claimableMilestones: [],
      };
    }

    return {
      freelancerId: streakData.freelancerId || userId,
      currentStreak: streakData.currentStreak || 0,
      longestStreak: streakData.longestStreak || 0,
      lastLoginDate: streakData.lastLoginDate || null,
      streakStartDate: streakData.streakStartDate || null,
      claimableMilestones: streakData.claimableMilestones || [],
    };
  } catch (error) {
    console.error('Error fetching streak info:', error);
    throw error;
  }
};

const claimStreakReward = async (
  milestone?: number,
): Promise<StreakRewardResponse> => {
  try {
    const response = await axiosInstance.post('/streak/claim-reward', {
      milestone,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error claiming streak reward:', error);

    if (error.response?.status === 409) {
      throw new Error('Reward already claimed');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'No reward available');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to claim reward');
    } else {
      throw new Error(
        error.response?.data?.message || 'Failed to claim reward',
      );
    }
  }
};

const fetchStreakRewards = async (): Promise<StreakReward[]> => {
  try {
    const response = await axiosInstance.get('/streak-rewards/active');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching streak rewards:', error);
    throw error;
  }
};

export default function StreakPage() {
  const [claimingMilestone, setClaimingMilestone] = useState<number | null>(
    null,
  );

  // React Query Hooks
  const {
    data: streakData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['streak-info'],
    queryFn: fetchStreakInfo,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    isError: isRewardsError,
    error: rewardsError,
    refetch: refetchRewards,
  } = useQuery({
    queryKey: ['streak-rewards'],
    queryFn: fetchStreakRewards,
    staleTime: 1000 * 60 * 5,
  });

  const claimRewardMutation = useMutation({
    mutationFn: (milestone?: number) => claimStreakReward(milestone),
    onSuccess: async (data) => {
      // Prefer server-provided remaining connects to avoid drift
      const remaining = (data?.data as { remainingConnects?: number })
        ?.remainingConnects;
      if (typeof remaining === 'number') {
        updateConnectsBalance(remaining);
      } else {
        // Fallback: calculate locally if backend doesn't return remainingConnects
        const currentConnects = localStorage.getItem('DHX_CONNECTS');
        const connectsValue = currentConnects
          ? parseInt(currentConnects, 10)
          : 0;
        const newConnects = connectsValue + data.data.finalAmount;
        updateConnectsBalance(newConnects);
      }

      // Refetch streak data
      await refetch();
      setClaimingMilestone(null);

      // Show success toast after refetch
      toast({
        title: 'Reward Claimed!',
        description: `You received ${data.data.finalAmount} connects.`,
        variant: 'default',
      });
    },
    onError: async (error: Error) => {
      // If reward already claimed, refresh the data to sync state
      if (error.message.includes('already claimed')) {
        await refetch();
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to claim reward',
        variant: 'destructive',
      });

      setClaimingMilestone(null);
    },
  });

  // Reward Claim Handler
  const handleClaimReward = async (milestone?: number) => {
    if (!streakData) return;

    setClaimingMilestone(milestone || streakData.currentStreak);

    try {
      await claimRewardMutation.mutateAsync(milestone);
    } catch (error) {
      console.error('Claim reward error:', error);
    }
  };

  // Helper Functions
  const getMilestoneStatus = (milestone: number) => {
    if (!streakData) return 'locked';

    const canClaim = streakData.claimableMilestones.includes(milestone);

    // If this milestone is in claimable list, it's available
    if (canClaim) {
      return 'available';
    }

    // Check if milestone is already passed (user moved beyond it)
    if (streakData.currentStreak > milestone && !canClaim) {
      return 'claimed'; // Either claimed or outside 7-day window
    }

    // Check if milestone is reached but not yet in claimable list
    if (streakData.currentStreak === milestone && !canClaim) {
      return 'available'; // Current milestone is always available
    }

    // Otherwise locked (user hasn't reached this milestone yet)
    return 'locked';
  };

  const getMilestoneProgress = (milestone: number) => {
    if (!streakData) return 0;
    return Math.min((streakData.currentStreak / milestone) * 100, 100);
  };

  const isClaimable = (milestone: number) => {
    if (!streakData) return false;
    return streakData.claimableMilestones.includes(milestone);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Loading State
  if (isLoading || isLoadingRewards) {
    return (
      <FreelancerSettingsLayout
        active="Streak"
        activeMenu="Streak"
        breadcrumbItems={[
          { label: 'Settings', link: '#' },
          { label: 'Streak', link: '#' },
        ]}
        isKycCheck={true}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Login Streak
              </h1>
              <p className="text-muted-foreground">
                Build your streak by logging in daily and earn connect rewards.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[104px]" />
            <Skeleton className="h-[104px]" />
            <Skeleton className="h-[104px]" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            </CardContent>
          </Card>
        </div>
      </FreelancerSettingsLayout>
    );
  }

  // Error State
  if (isError) {
    return (
      <FreelancerSettingsLayout
        active="Streak"
        activeMenu="Streak"
        breadcrumbItems={[
          { label: 'Settings', link: '#' },
          { label: 'Streak', link: '#' },
        ]}
        isKycCheck={true}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Login Streak
              </h1>
              <p className="text-muted-foreground">
                Track your consistency and claim milestone rewards.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
                <div>
                  <p className="text-sm font-medium">Something went wrong</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Failed to load streak data:{' '}
                    {error?.message || 'Unknown error'}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => refetch()}>Retry</Button>
                  </div>
                </div>
                <Illustration className="w-full max-w-[420px] justify-self-end" />
              </div>
            </CardContent>
          </Card>
        </div>
      </FreelancerSettingsLayout>
    );
  }

  // Empty State
  if (!streakData) {
    return (
      <FreelancerSettingsLayout
        active="Streak"
        activeMenu="Streak"
        breadcrumbItems={[
          { label: 'Settings', link: '#' },
          { label: 'Streak', link: '#' },
        ]}
        isKycCheck={true}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Login Streak
              </h1>
              <p className="text-muted-foreground">
                Build your streak by logging in daily and earn connect rewards.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
                <div>
                  <p className="text-sm font-medium">No data yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start your streak by logging in daily.
                  </p>
                </div>
                <Illustration className="w-full max-w-[420px] justify-self-end" />
              </div>
            </CardContent>
          </Card>
        </div>
      </FreelancerSettingsLayout>
    );
  }

  return (
    <FreelancerSettingsLayout
      active="Streak"
      activeMenu="Streak"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Streak', link: '#' },
      ]}
      isKycCheck={true}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Login Streak</h1>
            <p className="text-muted-foreground">
              Build your streak and claim connect rewards at milestones.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">Overview</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Current streak"
              value={streakData.currentStreak}
              additionalInfo={
                streakData.currentStreak === 1
                  ? 'day in a row'
                  : 'days in a row'
              }
              icon={
                <div className="rounded-lg border bg-orange-500/10 p-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
              }
              variant="accent"
            />
            <StatCard
              title="Longest streak"
              value={streakData.longestStreak}
              additionalInfo={
                streakData.longestStreak === 1 ? 'day best' : 'days best'
              }
              icon={
                <div className="rounded-lg border bg-yellow-500/10 p-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
              }
              variant="secondary"
            />
            <StatCard
              title="Last login"
              value={formatDate(streakData.lastLoginDate)}
              additionalInfo="Most recent activity"
              icon={
                <div className="rounded-lg border bg-blue-500/10 p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              }
              variant="default"
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">
              Next milestone
            </h2>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              {(() => {
                const ordered = (rewardsData || [])
                  .slice()
                  .sort((a, b) => a.days - b.days);
                const next =
                  ordered.find((m) => m.days > streakData.currentStreak) ||
                  ordered[ordered.length - 1];
                if (!next) {
                  return (
                    <div>
                      <p className="text-sm font-medium">
                        No rewards configured
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Rewards will appear here when configured.
                      </p>
                    </div>
                  );
                }

                const progress = getMilestoneProgress(next.days);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Target</p>
                        <p className="text-lg font-semibold truncate">
                          {next.days} day streak
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {next.reward} connects
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {streakData.currentStreak} / {next.days} days
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">Rewards</h2>
          </div>

          {isRewardsError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
                  <div>
                    <p className="text-sm font-medium">
                      Could not load rewards
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {(rewardsError as any)?.message || 'Unknown error'}
                    </p>
                    <div className="mt-4">
                      <Button onClick={() => refetchRewards()}>Retry</Button>
                    </div>
                  </div>
                  <Illustration className="w-full max-w-[420px] justify-self-end" />
                </div>
              </CardContent>
            </Card>
          ) : !isLoadingRewards &&
            (!rewardsData || rewardsData.length === 0) ? (
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
                  <div>
                    <p className="text-sm font-medium">No rewards yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Rewards will show up here when configured.
                    </p>
                  </div>
                  <Illustration className="w-full max-w-[420px] justify-self-end" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(rewardsData || [])
                .slice()
                .sort((a, b) => a.days - b.days)
                .map((milestone) => {
                  const status = getMilestoneStatus(milestone.days);
                  const progress = getMilestoneProgress(milestone.days);
                  const claimable = isClaimable(milestone.days);
                  const isPending = claimingMilestone === milestone.days;

                  const badgeText =
                    status === 'claimed'
                      ? 'Claimed'
                      : claimable
                        ? 'Available'
                        : 'Locked';
                  const badgeVariant = claimable
                    ? 'default'
                    : status === 'claimed'
                      ? 'secondary'
                      : 'outline';

                  const accentClass = claimable
                    ? 'border-l-blue-500 bg-blue-500/5'
                    : status === 'claimed'
                      ? 'border-l-emerald-500 bg-emerald-500/5'
                      : 'border-l-muted-foreground/30 bg-muted/20';
                  const iconWrapClass = claimable
                    ? 'border-blue-500/20 bg-blue-500/10'
                    : status === 'claimed'
                      ? 'border-emerald-500/20 bg-emerald-500/10'
                      : 'border-muted-foreground/20 bg-muted/40';
                  const iconClass = claimable
                    ? 'text-blue-600'
                    : status === 'claimed'
                      ? 'text-emerald-600'
                      : 'text-muted-foreground';
                  const badgeClass = claimable
                    ? 'bg-blue-600 hover:bg-blue-600 text-white'
                    : status === 'claimed'
                      ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                      : '';

                  return (
                    <Card
                      key={milestone.days}
                      className={`relative overflow-hidden border-l-2 shadow-sm transition-colors ${accentClass}`}
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate flex items-center gap-2">
                              <div
                                className={`rounded-md border p-2 inline-block ${iconWrapClass}`}
                              >
                                {status === 'claimed' ? (
                                  <Check className={`h-4 w-4 ${iconClass}`} />
                                ) : status === 'available' ? (
                                  <Gift className={`h-4 w-4 ${iconClass}`} />
                                ) : (
                                  <Lock className={`h-4 w-4 ${iconClass}`} />
                                )}
                              </div>
                              {milestone.days} day streak
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {milestone.reward} connects
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={badgeVariant}
                              className={badgeClass}
                            >
                              {badgeText}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Progress value={progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {streakData.currentStreak} / {milestone.days} days
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                        </div>

                        {claimable ? (
                          <Button
                            onClick={() => handleClaimReward(milestone.days)}
                            disabled={
                              isPending || claimRewardMutation.isPending
                            }
                            className="w-full"
                          >
                            {isPending ? 'Claiming...' : 'Claim reward'}
                          </Button>
                        ) : status === 'claimed' ? (
                          <Button disabled className="w-full">
                            Claimed
                          </Button>
                        ) : (
                          <Button disabled variant="outline" className="w-full">
                            Keep logging in
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">Rules</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">
                    Build the streak
                  </p>
                  <p className="mt-1">
                    Log in daily to increase your current streak.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Claim rewards</p>
                  <p className="mt-1">
                    Milestones unlock rewards you can claim.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Grace window</p>
                  <p className="mt-1">
                    Missed a reward? Claim it within 7 days.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="font-medium text-foreground">Reset</p>
                  <p className="mt-1">
                    Missing a day resets your current streak.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </FreelancerSettingsLayout>
  );
}
