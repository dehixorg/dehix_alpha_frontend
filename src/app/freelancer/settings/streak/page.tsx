'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Flame, Calendar, Trophy, Gift } from 'lucide-react';

import { updateConnectsBalance } from '@/lib/updateConnects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import FreelancerSettingsLayout from '@/components/layout/FreelancerSettingsLayout';

// TypeScript Interfaces
interface StreakInfo {
  freelancerId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakStartDate: string | null;
  claimableMilestones: number[]; // Array of milestones that can be claimed
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

const canClaimMilestone = async (milestone: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`/streak/can-claim/${milestone}`);
    return response.data.canClaim;
  } catch (error) {
    console.error('Error checking if milestone can be claimed:', error);
    return false;
  }
};

export default function StreakPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(
    null,
  );
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
        mainClassName="flex-1 overflow-y-auto p-4 md:p-6"
        contentClassName="md:pl-[50px] flex-1 flex flex-col min-h-screen"
        containerClassName="flex min-h-screen w-full bg-background"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Login Streak</h1>
            <p className="text-muted-foreground">
              Build your streak by logging in daily and earn connect rewards!
            </p>
          </div>

          {/* Loading Skeleton */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
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
        mainClassName="flex-1 overflow-y-auto p-4 md:p-6"
        contentClassName="md:pl-[50px] flex-1 flex flex-col min-h-screen"
        containerClassName="flex min-h-screen w-full bg-background"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Login Streak</h1>
            <p className="text-muted-foreground">
              Build your streak by logging in daily and earn connect rewards!
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-destructive">
                  Failed to load streak data:{' '}
                  {error?.message || 'Unknown error'}
                </p>
                <Button onClick={() => refetch()}>Retry</Button>
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
        mainClassName="flex-1 overflow-y-auto p-4 md:p-6"
        contentClassName="md:pl-[50px] flex-1 flex flex-col min-h-screen"
        containerClassName="flex min-h-screen w-full bg-background"
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Login Streak</h1>
            <p className="text-muted-foreground">
              Build your streak by logging in daily and earn connect rewards!
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Flame className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  No streak data available. Start your streak by logging in
                  daily!
                </p>
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
      mainClassName="flex-1 overflow-y-auto p-4 md:p-6"
      contentClassName="md:pl-[50px] flex-1 flex flex-col min-h-screen"
      containerClassName="flex min-h-screen w-full bg-background"
    >
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Login Streak</h1>
          <p className="text-muted-foreground">
            Build your streak by logging in daily and earn connect rewards at
            milestones! You can claim missed rewards within 7 days.
          </p>
        </div>

        {/* Streak Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Your Streak Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Streak */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <span className="text-5xl font-bold text-orange-500">
                    {streakData.currentStreak}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-xs text-muted-foreground">
                  {streakData.currentStreak === 1 ? 'day' : 'days'} in a row
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:block border-r border-border"></div>

              {/* Longest Streak & Last Login */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Longest Streak</p>
                    <p className="text-2xl font-bold">
                      {streakData.longestStreak} days
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(streakData.lastLoginDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Progress Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Milestone Rewards</h2>
          {isRewardsError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-destructive">
                    Failed to load streak rewards:{' '}
                    {(rewardsError as any)?.message || 'Unknown error'}
                  </p>
                  <Button onClick={() => refetchRewards()}>Retry</Button>
                </div>
              </CardContent>
            </Card>
          ) : !isLoadingRewards &&
            (!rewardsData || rewardsData.length === 0) ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Gift className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No streak rewards configured yet. Check back later!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(rewardsData || [])
                .sort((a, b) => a.days - b.days)
                .map((milestone) => {
                  const status = getMilestoneStatus(milestone.days);
                  const progress = getMilestoneProgress(milestone.days);
                  const claimable = isClaimable(milestone.days);
                  const isPending = claimingMilestone === milestone.days;

                  return (
                    <div
                      key={milestone.days}
                      className={`border shadow-sm rounded-lg overflow-hidden bg-green-50 dark:bg-green-950/30 ${
                        claimable
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : status === 'claimed'
                            ? ''
                            : 'opacity-75'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              claimable
                                ? 'bg-blue-100 dark:bg-blue-900/50'
                                : status === 'claimed'
                                  ? 'bg-green-100 dark:bg-green-900/50'
                                  : 'bg-gray-100 dark:bg-gray-900/50'
                            }`}
                          >
                            <Gift
                              className={`h-5 w-5 ${
                                claimable
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : status === 'claimed'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {milestone.days} Day Streak
                                </p>
                                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                  {milestone.reward} Connects
                                </div>
                              </div>
                              <Badge
                                variant={
                                  status === 'claimed'
                                    ? 'default'
                                    : claimable
                                      ? 'default'
                                      : 'secondary'
                                }
                                className={
                                  status === 'claimed'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : claimable
                                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }
                              >
                                {status === 'claimed'
                                  ? 'Reward Claimed'
                                  : claimable
                                    ? 'Available'
                                    : 'Locked'}
                              </Badge>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3 space-y-2">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground text-right">
                                {streakData.currentStreak} / {milestone.days}{' '}
                                days{' '}
                              </p>
                            </div>

                            {/* Action Button */}
                            {claimable && (
                              <Button
                                onClick={() =>
                                  handleClaimReward(milestone.days)
                                }
                                disabled={
                                  isPending || claimRewardMutation.isPending
                                }
                                className="w-full mt-3"
                              >
                                {isPending ? 'Claiming...' : 'Claim Reward'}
                              </Button>
                            )}

                            {status === 'claimed' && (
                              <Button
                                disabled={true}
                                className="w-full mt-3 opacity-50 cursor-not-allowed"
                              >
                                Reward Claimed
                              </Button>
                            )}

                            {status === 'locked' && (
                              <p className="text-sm text-muted-foreground text-center mt-3">
                                Keep logging in to unlock this reward
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold">How it works:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Log in daily to build your streak</li>
                <li>Reach milestones to unlock rewards</li>
                <li>Claim rewards immediately when you reach a milestone</li>
                <li>
                  Missed a reward? Claim it within 7 days of your last login
                </li>
                <li>Miss the 7-day window? The reward is forfeited</li>
                <li>Missing a day resets your current streak</li>
                <li>Your longest streak is always saved</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </FreelancerSettingsLayout>
  );
}
