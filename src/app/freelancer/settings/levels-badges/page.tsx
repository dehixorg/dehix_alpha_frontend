'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Award,
  Check,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

// Define the base interface for gamification items
interface GamificationItemBase {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  type?: 'LEVEL' | 'BADGE';
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
  type: 'LEVEL';
  levelNumber: number;
  rewardMultiplier?: number;
}

// Interface for badge items
interface BadgeItem extends GamificationItemBase {
  badge_id: string;
  type: 'BADGE';
  earnedAt?: string;
  isActive?: boolean;
  baseReward?: number;
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
  console.log('the gamification info is', response);
  return response.data;
}

// Fetch user's gamification status
async function fetchStatus(): Promise<GamificationStatusResponse> {
  try {
    const response = await axiosInstance.get('/freelancer/gamification/status');
    console.log('the gamification status is', response);
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

  // Calculate display level number from index in sorted levels array
  const getDisplayLevelNumber = useCallback(
    (levelId: string): number => {
      const level = allLevels.find((l) => (l._id || l.level_id) === levelId);
      return level?.levelNumber ?? 1;
    },
    [allLevels],
  );

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

    const currentNum = currentLevel.levelNumber ?? 0;
    const nextLevel = allLevels.find(
      (l: LevelItem) => (l.levelNumber ?? 0) === currentNum + 1,
    );

    if (!nextLevel) {
      toast({
        title: 'Maximum Level Reached',
        description: 'You have reached the maximum level!',
        variant: 'default',
      });
      return;
    }

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

  // Set current level and earned badges when status data changes
  useEffect(() => {
    if (statusData?.data && allBadgesFromInfo.length > 0) {
      setCurrentLevel(statusData.data.currentLevel || null);
      const enrichedEarnedBadges = (statusData.data.badges || [])
        .filter((b) => b.badge_id || b._id)
        .map((earnedBadge) => {
          // Match info badge's badge_id (normalized from _id) against earned badge's badge_id
          const badgeInfo = allBadgesFromInfo.find(
            (b) => b.badge_id === earnedBadge.badge_id,
          );
          return {
            ...badgeInfo,
            ...earnedBadge,
            badge_id: earnedBadge.badge_id || badgeInfo?.badge_id || '',
            isActive: earnedBadge.isActive ?? true,
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
      // Normalize: info badges have _id but no badge_id, so set badge_id = _id for consistent matching
      setAllBadgesFromInfo(
        (gamificationInfo.badges || []).map(
          (b) =>
            ({
              ...b,
              badge_id: (b._id || b.badge_id || '') as string,
            }) as BadgeItem,
        ),
      );
    }
  }, [gamificationInfo]);

  // Loading state
  if (statusLoading) {
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

  // Check if a badge is earned - match using badge_id consistently
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadges.some((b) => b.badge_id === badgeId && b.isActive);
  };

  // Get all badges (earned + eligible) - match using badge_id consistently
  const allBadges = allBadgesFromInfo.map((badge) => {
    const earnedBadge = earnedBadges.find((b) => b.badge_id === badge.badge_id);
    if (earnedBadge) {
      return { ...badge, ...earnedBadge };
    }
    return badge;
  });

  // Filter badges based on showEligibleOnly
  const filteredBadges = showEligibleOnly
    ? allBadges.filter((b) => !isBadgeEarned(b.badge_id!))
    : allBadges;

  // Get collected (earned) badges only
  const collectedBadges = allBadges.filter((b) => isBadgeEarned(b.badge_id!));

  // Levels are already sorted by levelNumber from the backend
  const sortedLevels = allLevels;

  // Get the current level number from the backend
  const currentLevelNumber = currentLevel?.levelNumber ?? 0;

  // Function to determine level status by levelNumber
  const getLevelStatus = (level: LevelItem) => {
    const levelNum = level.levelNumber ?? 0;
    if (currentLevelNumber <= 0) return 'locked';
    if (levelNum < currentLevelNumber) return 'completed';
    if (levelNum === currentLevelNumber) return 'current';
    return 'locked';
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

      {/* Levels Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Level</h2>
          {currentLevel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>
                Level{' '}
                {getDisplayLevelNumber(
                  currentLevel._id || currentLevel.level_id,
                )}
              </span>
            </div>
          )}
        </div>

        {sortedLevels.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sortedLevels.map((level) => {
              const levelId = level._id || level.level_id || '';
              const levelNum = level.levelNumber ?? 0;
              const isCurrentLevel = levelNum === currentLevelNumber;
              const isNextLevel = levelNum === currentLevelNumber + 1;
              const isFutureLevel = levelNum > currentLevelNumber + 1;
              const levelStatus = getLevelStatus(level);

              return (
                <Card
                  key={levelId}
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
                            Level {level.levelNumber ?? '?'}
                          </Badge>
                        </div>
                        {level.description && (
                          <CardDescription className="mt-1">
                            {level.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {levelStatus === 'completed' ? (
                          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/10">
                            <Check className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        ) : levelStatus === 'current' ? (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                            <Crown className="mr-1 h-3 w-3" />
                            Current Level
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="mr-1 h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
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

                    {(isNextLevel || isFutureLevel) && level.criteria && (
                      <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
                        <div className="font-medium">Requirements:</div>
                        <ul className="list-disc list-inside space-y-0.5">
                          {level.criteria.minProjectApplications != null &&
                            level.criteria.minProjectApplications > 0 && (
                              <li>
                                Apply to {level.criteria.minProjectApplications}{' '}
                                projects
                              </li>
                            )}
                          {level.criteria.minBids != null &&
                            level.criteria.minBids > 0 && (
                              <li>
                                Place at least {level.criteria.minBids} bids
                              </li>
                            )}
                          {level.criteria.minLongestStreak != null &&
                            level.criteria.minLongestStreak > 0 && (
                              <li>
                                Reach a {level.criteria.minLongestStreak}-day
                                streak
                              </li>
                            )}
                          {level.criteria.minVerifiedDehixTalent != null &&
                            level.criteria.minVerifiedDehixTalent > 0 && (
                              <li>
                                Verify {level.criteria.minVerifiedDehixTalent}{' '}
                                Dehix talent(s)
                              </li>
                            )}
                          {level.criteria.minVerifiedInterviewTalents != null &&
                            level.criteria.minVerifiedInterviewTalents > 0 && (
                              <li>
                                Verify{' '}
                                {level.criteria.minVerifiedInterviewTalents}{' '}
                                interview talent(s)
                              </li>
                            )}
                          {level.criteria.minInterviewsTaken != null &&
                            level.criteria.minInterviewsTaken > 0 && (
                              <li>
                                Complete {level.criteria.minInterviewsTaken}{' '}
                                interviews
                              </li>
                            )}
                          {level.criteria.minTalentHiring != null &&
                            level.criteria.minTalentHiring > 0 && (
                              <li>
                                Hire {level.criteria.minTalentHiring} talent(s)
                              </li>
                            )}
                          {level.criteria.requiresVerifiedProfile && (
                            <li>Complete profile verification</li>
                          )}
                          {level.criteria.requiresOracle && (
                            <li>Complete Oracle verification</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            className="py-12"
            title="No levels available"
            description="Levels will appear here once they are configured."
            Icon={Trophy}
          />
        )}
      </div>

      {/* Badges Section */}
      <Tabs defaultValue="collected" className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="collected">
              Collected Badges ({collectedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Badges ({allBadges.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Collected Badges Tab */}
        <TabsContent value="collected">
          <Card className="max-w-full">
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-base">Collected Badges</CardTitle>
                <CardDescription>
                  Badges you have earned through your achievements
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="max-w-full">
              {collectedBadges.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {collectedBadges.map((badge) => {
                    const badgeId = badge.badge_id || '';

                    return (
                      <div
                        key={badgeId}
                        className="min-w-0 transition-all duration-200"
                      >
                        <Card className="h-full border-green-500/30">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm break-words">
                                  {badge.name}
                                </CardTitle>
                                {badge.earnedAt && (
                                  <CardDescription className="text-xs">
                                    Earned on{' '}
                                    {new Date(
                                      badge.earnedAt,
                                    ).toLocaleDateString()}
                                  </CardDescription>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className="flex-shrink-0 border-green-500 text-green-600"
                              >
                                <Check className="mr-1 h-3 w-3" />
                                Earned
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            {badge.imageUrl ? (
                              <div className="flex justify-center">
                                <div className="relative h-24 w-24">
                                  <Image
                                    src={badge.imageUrl}
                                    alt={badge.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-24 w-full items-center justify-center rounded-md bg-muted">
                                <Award className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}

                            {badge.description && (
                              <p className="text-sm text-muted-foreground break-words">
                                {badge.description}
                              </p>
                            )}

                            {badge.baseReward && badge.baseReward > 0 && (
                              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                <Gift className="h-4 w-4" />
                                <span>Reward: {badge.baseReward} Connects</span>
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
                    title="No badges collected yet"
                    description="Start completing tasks and check your eligibility to earn badges."
                    Icon={Award}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Badges Tab */}
        <TabsContent value="all">
          <Card className="max-w-full">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base">All Badges</CardTitle>
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
              {allBadges.length > 0 &&
              allBadges.every((b) => isBadgeEarned(b.badge_id!)) ? (
                <div className="py-12">
                  <EmptyState
                    title="All badges claimed!"
                    description="Congratulations! You have already claimed all the badges available. Check back later for new badges."
                    Icon={Trophy}
                  />
                </div>
              ) : filteredBadges.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBadges.map((badge) => {
                    const badgeId = badge.badge_id || '';
                    const isEarned = isBadgeEarned(badgeId);
                    const eligibility = eligibilityChecks[badgeId];
                    const isChecking = checkingEligibility[badgeId];

                    return (
                      <div
                        key={badgeId}
                        className={`min-w-0 transition-all duration-200 ${
                          !isEarned ? 'ring-2 ring-primary/30 rounded-lg' : ''
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
                                  {badge.description || ''}
                                </CardDescription>
                              </div>
                              {isEarned ? (
                                <Badge
                                  variant="outline"
                                  className="flex-shrink-0 border-green-500 text-green-600"
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  Earned
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="flex-shrink-0"
                                >
                                  <Medal className="mr-1 h-3 w-3" />
                                  Available
                                </Badge>
                              )}
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

                            {/* Action buttons - only for unearned badges */}
                            {!isEarned && (
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

                            {/* Earned date for earned badges */}
                            {isEarned && badge.earnedAt && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Earned on{' '}
                                {new Date(badge.earnedAt).toLocaleDateString()}
                              </p>
                            )}

                            {/* Requirements for unearned badges */}
                            {!isEarned && badge.criteria && (
                              <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                                <div className="font-medium">Requirements:</div>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {badge.criteria.minProjectApplications !=
                                    null &&
                                    badge.criteria.minProjectApplications >
                                      0 && (
                                      <li>
                                        Apply to{' '}
                                        {badge.criteria.minProjectApplications}{' '}
                                        projects
                                      </li>
                                    )}
                                  {badge.criteria.minBids != null &&
                                    badge.criteria.minBids > 0 && (
                                      <li>
                                        Place at least {badge.criteria.minBids}{' '}
                                        bids
                                      </li>
                                    )}
                                  {badge.criteria.minLongestStreak != null &&
                                    badge.criteria.minLongestStreak > 0 && (
                                      <li>
                                        Reach a{' '}
                                        {badge.criteria.minLongestStreak}-day
                                        streak
                                      </li>
                                    )}
                                  {badge.criteria.minVerifiedDehixTalent !=
                                    null &&
                                    badge.criteria.minVerifiedDehixTalent >
                                      0 && (
                                      <li>
                                        Verify{' '}
                                        {badge.criteria.minVerifiedDehixTalent}{' '}
                                        Dehix talent(s)
                                      </li>
                                    )}
                                  {badge.criteria.minVerifiedInterviewTalents !=
                                    null &&
                                    badge.criteria.minVerifiedInterviewTalents >
                                      0 && (
                                      <li>
                                        Verify{' '}
                                        {
                                          badge.criteria
                                            .minVerifiedInterviewTalents
                                        }{' '}
                                        interview talent(s)
                                      </li>
                                    )}
                                  {badge.criteria.minInterviewsTaken != null &&
                                    badge.criteria.minInterviewsTaken > 0 && (
                                      <li>
                                        Complete{' '}
                                        {badge.criteria.minInterviewsTaken}{' '}
                                        interviews
                                      </li>
                                    )}
                                  {badge.criteria.minTalentHiring != null &&
                                    badge.criteria.minTalentHiring > 0 && (
                                      <li>
                                        Hire {badge.criteria.minTalentHiring}{' '}
                                        talent(s)
                                      </li>
                                    )}
                                  {badge.criteria.requiresVerifiedProfile && (
                                    <li>Complete profile verification</li>
                                  )}
                                  {badge.criteria.requiresOracle && (
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
        </TabsContent>
      </Tabs>
    </FreelancerSettingsLayout>
  );
}
