'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Award,
  Check,
  CheckCircle,
  Crown,
  Gift,
  Info,
  Loader2,
  Lock,
  Medal,
  Trophy,
} from 'lucide-react';

import { axiosInstance } from '@/lib/axiosinstance';
import FreelancerSettingsLayout from '@/components/layout/FreelancerSettingsLayout';
import EmptyState from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

// Define the base interface for gamification items
interface GamificationItemBase {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  type?: 'LEVEL' | 'BADGE';
  priority?: number;
  earnedAt?: string;
  level_id?: string;
  badge_id?: string;
  baseReward?: number;
  rewardMultiplier?: number;
  criteria?: {
    profileComplete?: boolean;
    minProjects?: number;
    minSuccessfulProjects?: number;
    minRating?: number;
    verificationRequired?: boolean;
    oracleRequired?: boolean;
    minStreak?: number;
    minConnectsPurchased?: number;
    minProjectApplications?: number;
    minVerifiedDehixTalent?: number;
    minVerifiedInterviewTalents?: number;
    minInterviewsTaken?: number;
    minTalentHiring?: number;
    minBids?: number;
    minLongestStreak?: number;
    requiresVerifiedProfile?: boolean;
    requiresOracle?: boolean;
  };
}

// Interface for level items
interface LevelItem extends GamificationItemBase {
  level_id: string;
  priority: number;
  type: 'LEVEL';
  rewardMultiplier?: number;
}

// Interface for badge items
interface BadgeItem extends GamificationItemBase {
  badge_id: string;
  type: 'BADGE';
  earnedAt?: string;
  isActive?: boolean;
  baseReward?: number;
  priority?: number;
  imageUrl?: string;
}

// Badge eligibility response
interface BadgeEligibilityResponse {
  eligible: boolean;
  badge: BadgeItem;
  reason?: string;
  missingCriteria?: Record<string, any>;
}

// Response type for gamification status
interface GamificationStatusResponse {
  data?: {
    currentLevel?: LevelItem | null;
    badges?: BadgeItem[];
    progress?: {
      currentPoints: number;
      requiredPoints: number;
    };
  };
  currentLevel?: LevelItem | null;
  badges?: BadgeItem[];
}

// Response type for gamification info
interface GamificationInfoResponse {
  badges: BadgeItem[];
  levels: LevelItem[];
}

// Fetch public gamification info (badges and levels)
async function fetchGamificationInfo(): Promise<GamificationInfoResponse> {
  const response = await axiosInstance.get('/gamification/info');
  return response.data;
}

// Fetch user's gamification status
async function fetchStatus(): Promise<GamificationStatusResponse> {
  try {
    const response = await axiosInstance.get('/freelancer/gamification/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching gamification status:', error);
    return { currentLevel: null, badges: [] };
  }
}

// Reward payload interface
interface RewardPayload {
  amount: number;
}

// Claim a badge response
interface ClaimBadgeResponse {
  success: boolean;
  message?: string;
  reward?: RewardPayload;
}

async function claimBadge(badgeId: string): Promise<ClaimBadgeResponse> {
  try {
    const response = await axiosInstance.post<ClaimBadgeResponse>(
      `/freelancer/gamification/claim-badge`,
      { badgeId, applyMultiplier: false },
    );

    if (response.data.reward) {
      response.data.reward = {
        amount: response.data.reward.amount,
      };
    }

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      throw new Error('Please log in to claim badge');
    }
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to claim badge. Please try again.',
    );
  }
}

// Calculate reward based on base amount and multiplier
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateReward = (baseAmount: number, multiplier: number): number =>
  baseAmount * multiplier;

// Check badge eligibility
async function checkBadgeEligibility(
  badgeId: string,
): Promise<BadgeEligibilityResponse> {
  try {
    const response = await axiosInstance.post(
      `/freelancer/gamification/check-badge-eligibility`,
      { badgeId },
    );
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return {
        eligible: false,
        badge: error.response.data.badge,
        reason: error.response.data.message,
        missingCriteria: error.response.data.missingCriteria,
      };
    }
    throw error;
  }
}

// Interface for level up response
interface LevelUpResponse {
  success: boolean;
  message?: string;
  newLevel?: LevelItem;
  reward?: {
    amount: number;
    multiplier: number;
    total: number;
  };
  newBadgesEarned?: Array<{
    _id: string;
    name: string;
    description: string;
    baseReward: number;
    reward?: {
      amount: number; // Fixed amount for badge rewards
    };
  }>;
}

// Level up to next level with proper reward handling
async function levelUp(): Promise<LevelUpResponse> {
  try {
    // Tell the backend to apply multiplier only to level rewards, not badge rewards
    const response = await axiosInstance.post<LevelUpResponse>(
      '/freelancer/gamification/level-up',
      {
        applyMultiplierToBadge: false,
        applyMultiplierToLevel: true,
      },
    );

    // Process the response to ensure badge rewards are fixed amounts
    const result = response.data;

    // Ensure badge rewards don't have multipliers applied
    if (result.newBadgesEarned) {
      result.newBadgesEarned = result.newBadgesEarned.map((badge) => ({
        ...badge,
        reward: badge.reward ? { amount: badge.reward.amount } : undefined,
      }));
    }

    return result;
  } catch (error: any) {
    console.error('Level up error:', error);
    if (error?.response?.status === 401) {
      throw new Error('Please log in to level up');
    }
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'An error occurred while leveling up',
    );
  }
}

export default function LevelsAndBadgesPage() {
  // State for toggling eligible badges
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<LevelItem | null>(null);
  const [allLevels, setAllLevels] = useState<LevelItem[]>([]);
  const [allBadgesFromInfo, setAllBadgesFromInfo] = useState<BadgeItem[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<BadgeItem[]>([]);
  const [eligibilityChecks, setEligibilityChecks] = useState<
    Record<string, BadgeEligibilityResponse>
  >({});
  const [checkingEligibility, setCheckingEligibility] = useState<
    Record<string, boolean>
  >({});

  // Memoize the calculateDisplayLevel function
  const calculateDisplayLevel = useCallback((priority: number): number => {
    // If priority is 0, it's level 1
    if (priority === 0) return 1;
    // Otherwise, divide by 10 to get the level number
    return Math.floor(priority / 10) || 1;
  }, []);

  // Claim badge mutation
  const claimBadgeMutation = useMutation<ClaimBadgeResponse, Error, string>({
    mutationFn: claimBadge,
    onSuccess: (data, badgeId) => {
      // Refresh data
      refetchStatus();

      // Clear eligibility check for this badge
      setEligibilityChecks((prev) => {
        const updated = { ...prev };
        delete updated[badgeId];
        return updated;
      });

      toast({
        title: 'Badge Claimed!',
        description: data.message || 'You have successfully claimed the badge!',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to claim badge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Helper function to update connects with amount from backend
  const updateConnects = (amount: number) => {
    const currentConnects = parseInt(
      localStorage.getItem('DHX_CONNECTS') || '0',
      10,
    );
    const newConnects = currentConnects + amount;
    localStorage.setItem('DHX_CONNECTS', newConnects.toString());
    window.dispatchEvent(new Event('connectsUpdated'));
  };

  // Handle claiming a badge - uses fixed reward amount without multipliers
  const handleClaimBadge = async (badgeId: string) => {
    if (!badgeId) return;

    try {
      const result: ClaimBadgeResponse =
        await claimBadgeMutation.mutateAsync(badgeId);

      // If badge has a reward, update connects with the fixed amount
      if (result.reward?.amount) {
        updateConnects(result.reward.amount);

        // Show reward notification (no multiplier info for badge rewards)
        toast({
          title: 'Badge Claimed!',
          description: `You've received ${result.reward.amount} Connects for claiming this badge!`,
          variant: 'default',
        });
      }

      return result;
    } catch (error) {
      console.error('Error claiming badge:', error);
      // Error is already handled by the mutation
    }
  };

  // Level up mutation
  const levelUpMutation = useMutation<LevelUpResponse, Error>({
    mutationFn: levelUp,
    onSuccess: async (data) => {
      // Refresh data
      await refetchStatus();

      // Handle level up reward if any
      if (data.reward) {
        const { multiplier, total } = data.reward;
        updateConnects(total);

        // Show success message with reward info (multiplier is applied for level up)
        const multiplierText =
          multiplier > 1 ? ` (${multiplier}x level multiplier applied)` : '';
        toast({
          title: 'Level Up Successful!',
          description: `You've received ${total} Connects for leveling up!${multiplierText}`,
          variant: 'default',
        });
      } else {
        // Fallback message if no reward data
        toast({
          title: 'Level Up Successful!',
          description: data.message || 'You have successfully leveled up!',
          variant: 'default',
        });
      }

      // Check for newly earned badges after level up
      if (data.newBadgesEarned?.length) {
        data.newBadgesEarned.forEach((badge) => {
          if (badge.reward) {
            // Badge rewards are fixed amounts (no multiplier)
            const { amount } = badge.reward;
            updateConnects(amount);

            // Show reward notification (no multiplier for badge rewards)
            toast({
              title: 'New Badge Earned!',
              description: `You've earned the ${badge.name} badge and received ${amount} Connects!`,
              variant: 'default',
            });
          }
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Level Up Failed',
        description: error.message || 'Failed to level up. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle level up - server validates requirements
  const handleLevelUp = async (): Promise<void> => {
    if (!currentLevel) return;

    const nextLevel = allLevels.find(
      (l: LevelItem) => (l.priority || 0) === (currentLevel.priority || 0) + 1,
    );

    if (!nextLevel) {
      toast({
        title: 'Maximum Level Reached',
        description: 'You have reached the maximum level!',
        variant: 'default',
      });
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to level up? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      await levelUpMutation.mutateAsync();
    } catch (error) {
      console.error('Error leveling up:', error);
      // Error is already handled by the mutation
    }
  };

  // Handle checking eligibility for a badge
  const handleCheckEligibility = async (badgeId: string): Promise<boolean> => {
    if (!badgeId) return false;

    setCheckingEligibility((prev) => ({
      ...prev,
      [badgeId]: true,
    }));

    try {
      const result = await checkBadgeEligibility(badgeId);
      setEligibilityChecks((prev) => ({
        ...prev,
        [badgeId]: result,
      }));

      if (result.eligible) {
        const reward = result.badge?.baseReward || 0;
        const badgeName = result.badge?.name || 'this badge';

        toast({
          title: 'Eligible!',
          description: `You are eligible for the ${badgeName}!${reward > 0 ? ` Reward: ${reward} Connects` : ''}`,
          variant: 'default',
          duration: 5000,
        });
      } else {
        const reasons: string[] = [];
        const missingCriteria = result.missingCriteria || {};

        Object.entries(missingCriteria).forEach(([key, value]) => {
          if (value && typeof value === 'object' && 'required' in value) {
            const typedValue = value as { current?: number; required: number };
            const current = typedValue.current || 0;
            reasons.push(
              `${key
                .replace(/([A-Z])/g, ' ')
                .replace(/^./, (str) => str.toUpperCase())
                .trim()}: ${current}/${typedValue.required}`,
            );
          } else if (typeof value === 'string') {
            reasons.push(value);
          } else {
            reasons.push(
              key
                .replace(/([A-Z])/g, ' ')
                .replace(/^./, (str) => str.toUpperCase())
                .trim(),
            );
          }
        });

        toast({
          title: 'Not Eligible',
          description:
            (result.reason || 'You do not meet the criteria for this badge.') +
            (reasons.length > 0
              ? ` Missing requirements: ${reasons.join(', ')}`
              : ''),
          variant: 'destructive',
          duration: 5000, // Show for longer since there's more content
        });
      }

      return result.eligible;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check eligibility. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setCheckingEligibility((prev) => ({
        ...prev,
        [badgeId]: false,
      }));
    }
  };

  // Fetch public gamification info (no auth required)
  const { data: gamificationInfo } = useQuery<GamificationInfoResponse>({
    queryKey: ['gamification-info'],
    queryFn: fetchGamificationInfo,
  });

  // Fetch user's gamification status
  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<GamificationStatusResponse>({
    queryKey: ['gamification-status'],
    queryFn: fetchStatus,
  });

  // Calculate progress to next level
  const calculateProgress = (): { progress: number; nextLevel?: LevelItem } => {
    if (!currentLevel || !statusData?.data?.progress) return { progress: 0 };

    const nextLevel = allLevels.find(
      (l) => (l.priority || 0) > (currentLevel.priority || 0),
    );

    if (!nextLevel) return { progress: 100, nextLevel };

    // Get progress data from the backend if available
    const progressData = statusData.data.progress;
    const currentPoints = progressData?.currentPoints || 0;
    const requiredPoints = progressData?.requiredPoints || 100; // Default to 100 if not provided

    const progress = Math.min(
      Math.round((currentPoints / requiredPoints) * 100),
      100,
    );

    return { progress, nextLevel };
  };

  // Set current level and earned badges when status data changes
  useEffect(() => {
    if (statusData?.data && allBadgesFromInfo.length > 0) {
      setCurrentLevel(statusData.data.currentLevel || null);
      const enrichedEarnedBadges = (statusData.data.badges || [])
        .filter((b) => b.badge_id || b._id)
        .map((earnedBadge) => {
          const badgeInfo = allBadgesFromInfo.find(
            (b) => b.badge_id === (earnedBadge.badge_id || earnedBadge._id),
          );
          return {
            ...earnedBadge,
            ...badgeInfo,
            earnedAt: earnedBadge.earnedAt || new Date().toISOString(),
          };
        });
      setEarnedBadges(enrichedEarnedBadges);
    }
  }, [statusData, allBadgesFromInfo]);

  // Set all levels and badges when gamification info changes
  useEffect(() => {
    if (gamificationInfo) {
      setAllLevels(gamificationInfo.levels || []);
      setAllBadgesFromInfo(gamificationInfo.badges || []);
    }
  }, [gamificationInfo]);

  const eligibleLoading = Object.values(checkingEligibility).some(Boolean);

  // Loading state
  if (statusLoading || eligibleLoading) {
    return (
      <FreelancerSettingsLayout
        active="Levels & Badges"
        activeMenu="Levels & Badges"
        breadcrumbItems={[
          { label: 'Settings', link: '#' },
          { label: 'Levels & Badges', link: '#' },
        ]}
        isKycCheck={true}
        mainClassName="flex-1 overflow-y-auto p-4 md:p-6"
        contentClassName="md:pl-[50px] flex-1 flex flex-col min-h-screen"
        containerClassName="flex min-h-screen w-full bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                    <Skeleton className="h-4 w-4/6 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </FreelancerSettingsLayout>
    );
  }

  // Check if a badge is earned
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadges.some(
      (b) => (b._id || b.badge_id) === badgeId && b.isActive,
    );
  };

  // Get all badges (earned + eligible)
  const allBadges = allBadgesFromInfo.map((badge) => {
    const earnedBadge = earnedBadges.find(
      (b) => (b._id || b.badge_id) === (badge._id || badge.badge_id),
    );
    if (earnedBadge) {
      return { ...badge, ...earnedBadge };
    }
    return badge;
  });

  // Filter badges based on showEligibleOnly
  const filteredBadges = showEligibleOnly
    ? allBadges.filter((b) => !isBadgeEarned(b._id || b.badge_id!))
    : allBadges;

  // Find the highest priority badge that's been earned
  const maxEarnedPriority = earnedBadges.reduce(
    (max, badge) => ((badge.priority || 0) > max ? badge.priority || 0 : max),
    0,
  );

  // Sort levels by priority (ascending)
  const sortedLevels = [...allLevels].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0),
  );

  // Get the highest priority earned badge (commented out as it's not currently used)
  // const highestPriorityEarnedBadge = earnedBadges.find(
  //   (badge) => badge.priority === maxEarnedPriority,
  // );

  // Get the current level number
  const currentLevelNumber = currentLevel
    ? calculateDisplayLevel(currentLevel.priority || 0)
    : 0;

  // Function to determine level status
  const getLevelStatus = (levelPriority: number) => {
    const levelNumber = calculateDisplayLevel(levelPriority);
    if (levelNumber < currentLevelNumber) return 'completed';
    if (levelNumber === currentLevelNumber) return 'current';
    return 'locked';
  };

  // Get the current level priority (commented out as it's not currently used)
  // const currentLevelPriority = currentLevel?.priority || 0;

  // Suppress unused variable warnings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedVars = {
    calculateReward,
    newLevel: undefined as unknown as LevelItem | undefined,
    amount: 0,
    index: 0,
    _isPastLevel: false,
  };

  // Render the component
  return (
    <FreelancerSettingsLayout
      active="Levels & Badges"
      activeMenu="Levels & Badges"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Levels & Badges', link: '#' },
      ]}
      isKycCheck={true}
    >
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Levels & Badges</h1>
          <p className="text-muted-foreground">
            Track your progress and earn rewards as you complete tasks and level
            up
          </p>
        </div>
        {currentLevel && (
          <Button
            onClick={handleLevelUp}
            disabled={levelUpMutation.isPending}
            className="h-10"
          >
            {levelUpMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Leveling Up...
              </>
            ) : (
              'Level Up!'
            )}
          </Button>
        )}
      </div>

      {/* Current Level Card */}
      {currentLevel && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Current Level</CardTitle>
                <CardDescription>
                  {currentLevel.description ||
                    'Keep completing tasks to level up!'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Level {calculateDisplayLevel(currentLevel.priority || 0)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm font-medium mb-1">
                  <span>Progress to Next Level</span>
                  <span>{calculateProgress().progress}%</span>
                </div>
                <Progress
                  value={calculateProgress().progress}
                  className="h-2"
                />
                {calculateProgress().nextLevel && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {statusData?.data?.progress?.currentPoints || 0} /{' '}
                    {statusData?.data?.progress?.requiredPoints || 100} points
                    to {calculateProgress().nextLevel?.name}
                  </p>
                )}
              </div>
              {currentLevel.rewardMultiplier && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gift className="h-4 w-4" />
                  <span>
                    {currentLevel.rewardMultiplier}x reward multiplier
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Levels Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Level</h2>
          {currentLevel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>
                Level {calculateDisplayLevel(currentLevel.priority || 0)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 relative">
          {/* Vertical timeline connector */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {sortedLevels.length > 0 ? (
            sortedLevels.map((level) => {
              const levelId = level._id || level.level_id || '';
              const currentLevelPriority = currentLevel?.priority || 0;
              const isCurrentLevel =
                (level.priority || 0) === currentLevelPriority;
              const isNextLevel =
                (level.priority || 0) === currentLevelPriority + 1;
              const isFutureLevel =
                (level.priority || 0) > currentLevelPriority + 1;

              return (
                <div key={levelId} className="relative pl-12">
                  {/* Timeline node */}
                  <div
                    className={`absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background ${
                      getLevelStatus(level.priority || 0) === 'completed'
                        ? 'bg-green-500 text-white'
                        : getLevelStatus(level.priority || 0) === 'current'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {getLevelStatus(level.priority || 0) === 'completed' ? (
                      <Check className="h-5 w-5" />
                    ) : getLevelStatus(level.priority || 0) === 'current' ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>

                  <Card
                    className={`relative overflow-hidden ${
                      isCurrentLevel ? 'border-primary' : ''
                    }`}
                  >
                    <CardHeader className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">
                              {level.name}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={isCurrentLevel ? 'border-primary' : ''}
                            >
                              Level {calculateDisplayLevel(level.priority || 0)}
                            </Badge>
                          </div>
                          {level.description && (
                            <CardDescription className="mt-1">
                              {level.description}
                            </CardDescription>
                          )}
                        </div>
                        {isCurrentLevel && (
                          <Badge className="bg-primary/10 text-primary">
                            Current Level
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Display reward multiplier prominently */}
                      {level.rewardMultiplier && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Gift className="h-4 w-4" />
                            <span>
                              {level.rewardMultiplier}x Reward Multiplier
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Earn {level.rewardMultiplier}x more rewards on all
                            completed tasks
                          </p>
                        </div>
                      )}

                      {/* Display benefits */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Benefits:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Access to higher-paying projects</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Priority customer support</span>
                          </li>
                          {level.rewardMultiplier && (
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>
                                {level.rewardMultiplier}x reward multiplier on
                                all tasks
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Show requirements for next level */}
                      {(isNextLevel || isFutureLevel) && level.criteria && (
                        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                          <div className="font-medium">Requirements:</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {level.criteria.minProjectApplications && (
                              <li>
                                Apply to {level.criteria.minProjectApplications}{' '}
                                projects
                              </li>
                            )}
                            {level.criteria.minSuccessfulProjects && (
                              <li>
                                Complete {level.criteria.minSuccessfulProjects}{' '}
                                projects successfully
                              </li>
                            )}
                            {level.criteria.minRating && (
                              <li>
                                Maintain a {level.criteria.minRating}+ rating
                              </li>
                            )}
                            {level.criteria.verificationRequired && (
                              <li>Complete profile verification</li>
                            )}
                            {level.criteria.oracleRequired && (
                              <li>Complete Oracle verification</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })
          ) : (
            <EmptyState
              className="py-12"
              title="No levels available"
              description="Levels will appear here once they are configured."
              Icon={Trophy}
            />
          )}
        </div>
      </div>

      {/* Badges Section */}
      <Card className="max-w-full">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">All badges</CardTitle>
            <CardDescription>
              Earn badges by completing achievements and leveling up
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-eligible-only"
              checked={showEligibleOnly}
              onCheckedChange={setShowEligibleOnly}
            />
            <label
              htmlFor="show-eligible-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show eligible only
            </label>
          </div>
        </CardHeader>
        <CardContent className="max-w-full">
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBadges.map((badge) => {
                const badgeId = badge._id || badge.badge_id || '';
                const isEarned = isBadgeEarned(badgeId);
                const isNextBadge = badge.priority === maxEarnedPriority + 1;
                const eligibility = eligibilityChecks[badgeId];
                const isChecking = checkingEligibility[badgeId];

                return (
                  <div
                    key={badgeId}
                    className={`min-w-0 transition-all duration-200 ${
                      isNextBadge ? 'ring-2 ring-primary/30 rounded-lg' : ''
                    }`}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm break-words">
                              {badge.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {badge.priority && `Priority: ${badge.priority}`}
                            </CardDescription>
                          </div>
                          {isEarned ? (
                            <Badge variant="outline" className="flex-shrink-0">
                              <Check className="mr-1 h-3 w-3" />
                              Earned
                            </Badge>
                          ) : isNextBadge ? (
                            <Badge variant="outline" className="flex-shrink-0">
                              <Medal className="mr-1 h-3 w-3" />
                              Next Up
                            </Badge>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {/* Display badge image if available */}
                        {badge.imageUrl ? (
                          <div className="flex justify-center">
                            <div className="relative h-24 w-24">
                              <Image
                                src={badge.imageUrl}
                                alt={badge.name}
                                fill
                                className={`object-contain ${
                                  !isEarned ? 'opacity-40' : ''
                                }`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`flex h-24 w-full items-center justify-center rounded-md bg-muted ${
                              !isEarned ? 'opacity-40' : ''
                            }`}
                          >
                            <Award className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}

                        {/* Badge description */}
                        {badge.description && (
                          <p className="text-sm text-muted-foreground break-words">
                            {badge.description}
                          </p>
                        )}

                        {/* Reward info */}
                        {badge.baseReward && badge.baseReward > 0 && (
                          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <Gift className="h-4 w-4" />
                            <span>Reward: {badge.baseReward} Connects</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        {!isEarned && (
                          <div>
                            {!isNextBadge ? (
                              <Button
                                disabled
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Lock className="mr-2 h-3 w-3" />
                                Complete previous badges
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                <Button
                                  onClick={() =>
                                    handleCheckEligibility(badgeId)
                                  }
                                  disabled={isChecking}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  {isChecking ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Checking...
                                    </>
                                  ) : (
                                    <>
                                      <Info className="mr-2 h-3 w-3" />
                                      Check Eligibility
                                    </>
                                  )}
                                </Button>
                                {eligibility?.eligible && (
                                  <Button
                                    onClick={() => handleClaimBadge(badgeId)}
                                    disabled={claimBadgeMutation.isPending}
                                    size="sm"
                                    className="w-full"
                                  >
                                    {claimBadgeMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Claiming...
                                      </>
                                    ) : (
                                      'Claim Badge'
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Requirements for unearned badges */}
                        {!isEarned && badge.criteria && (
                          <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                            <div className="font-medium">Requirements:</div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {badge.criteria.minProjectApplications && (
                                <li>
                                  Apply to{' '}
                                  {badge.criteria.minProjectApplications}{' '}
                                  projects
                                </li>
                              )}
                              {badge.criteria.minSuccessfulProjects && (
                                <li>
                                  Complete{' '}
                                  {badge.criteria.minSuccessfulProjects}{' '}
                                  projects successfully
                                </li>
                              )}
                              {badge.criteria.minRating && (
                                <li>
                                  Maintain a {badge.criteria.minRating}+ rating
                                </li>
                              )}
                              {badge.criteria.verificationRequired && (
                                <li>Complete profile verification</li>
                              )}
                              {badge.criteria.oracleRequired && (
                                <li>Complete Oracle verification</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                title="No badges to show"
                description="Complete more tasks to unlock badges and level up your profile."
                Icon={Award}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </FreelancerSettingsLayout>
  );
}
