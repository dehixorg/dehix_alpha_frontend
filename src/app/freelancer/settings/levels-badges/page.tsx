'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Trophy,
  Check,
  CheckCircle,
  Loader2,
  Lock,
  Crown,
  Medal,
} from 'lucide-react';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import EmptyState from '@/components/shared/EmptyState';

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
export interface BadgeItem extends GamificationItemBase {
  badge_id: string;
  type: 'BADGE';
  earnedAt?: string;
  isActive?: boolean;
  baseReward?: number;
  priority?: number;
}

// Badge eligibility response
interface BadgeEligibilityResponse {
  eligible: boolean;
  badge: BadgeItem;
  reason?: string;
  missingCriteria?: Record<string, any>;
}

// Status badge interface
interface StatusBadge {
  badge_id?: string;
  name?: string;
  priority?: number;
  imageUrl?: string;
  earnedAt?: string | Date;
  isActive?: boolean;
}

// Response type for gamification status
interface GamificationStatusResponse {
  data?: {
    currentLevel?: LevelItem | null;
    badges?: BadgeItem[];
  };
  currentLevel?: LevelItem | null;
  badges?: BadgeItem[];
}

// Response type for gamification eligible
interface GamificationEligibleResponse {
  data?: {
    badges?: BadgeItem[];
    levels?: LevelItem[];
  };
}

// Response type for gamification info
interface GamificationInfoResponse {
  badges: BadgeItem[];
  levels: LevelItem[];
}

// Fetch public gamification info (badges and levels)
const fetchGamificationInfo = async (): Promise<GamificationInfoResponse> => {
  try {
    const response = await axiosInstance.get('/gamification/info');
    const data = response?.data;
    return {
      badges: Array.isArray(data?.badges) ? data.badges : [],
      levels: Array.isArray(data?.levels) ? data.levels : [],
    };
  } catch (error) {
    console.error('Error in fetchGamificationInfo:', error);
    throw error;
  }
};

const fetchStatus = async (): Promise<GamificationStatusResponse> => {
  try {
    const response = await axiosInstance.get('/freelancer/gamification/status');
    const data = response?.data;

    // Handle both response formats for backward compatibility
    const result = data.data || data;
    return result;
  } catch (error: any) {
    console.error('Error in fetchStatus:', error);
    if (error?.response?.status === 401) {
      throw new Error('Please log in to view gamification data');
    }
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch status',
    );
  }
};

const fetchEligible = async (): Promise<GamificationEligibleResponse> => {
  try {
    const response = await axiosInstance.get(
      '/freelancer/gamification/eligible',
    );
    const data = response?.data;

    // Handle the response data
    const responseData = data.data || data;

    // Process badges if they exist in the response
    const badges = Array.isArray(responseData.badges)
      ? responseData.badges.map((badge: any) => ({
          ...badge,
          badge_id: badge._id,
          type: 'BADGE' as const,
        }))
      : [];

    // Process levels if they exist in the response
    const levels = Array.isArray(responseData.levels)
      ? responseData.levels.map((level: any) => ({
          ...level,
          level_id: level._id,
          type: 'LEVEL' as const,
        }))
      : [];

    return {
      data: {
        badges,
        levels,
      },
    };
  } catch (error: any) {
    console.error('Error in fetchEligible:', error);
    if (error?.response?.status === 401) {
      throw new Error('Please log in to view eligible badges');
    }
    // Return a properly structured response even in case of error
    return { data: { badges: [], levels: [] } };
  }
};

// Claim a badge
const claimBadge = async (
  badgeId: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    await axiosInstance.post('/freelancer/gamification/claim-badge', {
      badgeId,
    });
    return { success: true, message: 'Badge claimed successfully!' };
  } catch (error: any) {
    console.error('Error claiming badge:', error);
    if (error?.response?.status === 401) {
      throw new Error('Please log in to claim badges');
    }
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to claim badge',
    );
  }
};

// Check badge eligibility
const checkBadgeEligibility = async (
  badgeId: string,
): Promise<BadgeEligibilityResponse> => {
  try {
    const response = await axiosInstance.post(
      '/freelancer/gamification/check-badge-eligibility',
      { badgeId },
    );
    const data = response?.data?.data || response?.data;
    return data;
  } catch (error: any) {
    console.error('Error checking badge eligibility:', error);
    if (error?.response?.status === 401) {
      throw new Error('Please log in to check badge eligibility');
    }
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to check badge eligibility',
    );
  }
};

// Level up to next level
const levelUp = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.post(
      '/freelancer/gamification/level-up',
    );
    return { success: true, ...(response?.data || {}) };
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
};

export default function LevelsAndBadgesPage() {
  // State for toggling eligible badges
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  // State for badge eligibility checks
  const [eligibilityChecks, setEligibilityChecks] = useState<
    Record<string, BadgeEligibilityResponse>
  >({});
  const [checkingEligibility, setCheckingEligibility] = useState<
    Record<string, boolean>
  >({});

  const getStepTierMeta = (levelIndex: number) => {
    const stageNames = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const stageIndex = Math.floor(levelIndex / 3);
    const stage = stageNames[stageIndex] || `Stage ${stageIndex + 1}`;

    const tierIndex = levelIndex % 3;
    if (tierIndex === 0)
      return {
        title: `${stage} Bronze`,
        short: `${stage} Bronze`,
        Icon: Medal,
        badgeClass:
          'bg-gradient-to-r from-orange-400 to-orange-600 dark:text-muted text-white/80',
      };
    if (tierIndex === 1)
      return {
        title: `${stage} Silver`,
        short: `${stage} Silver`,
        Icon: Trophy,
        badgeClass:
          'bg-gradient-to-r from-gray-300 to-gray-400 dark:text-muted text-white/80',
      };
    return {
      title: `${stage} Gold`,
      short: `${stage} Gold`,
      Icon: Crown,
      badgeClass:
        'bg-gradient-to-r from-yellow-400 to-amber-500 dark:text-muted text-white/80',
    };
  };

  // Level up mutation with refetch
  const levelUpMutation = useMutation({
    mutationFn: levelUp,
    onSuccess: (data) => {
      refetchStatus();
      refetchEligible();
      toast({
        title: 'Level Up Successful!',
        description: data.message || 'You have successfully leveled up!',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Level Up Failed',
        description: error.message || 'Failed to level up. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handler for checking badge eligibility
  const handleCheckEligibility = async (badgeId: string) => {
    setCheckingEligibility((prev) => ({ ...prev, [badgeId]: true }));
    try {
      const result = await checkBadgeEligibility(badgeId);
      setEligibilityChecks((prev) => ({ ...prev, [badgeId]: result }));

      if (result.eligible) {
        toast({
          title: 'Eligible!',
          description: `You are eligible for this badge! Reward: ${result.badge.baseReward || 0} Connects`,
          variant: 'default',
        });
      } else {
        const reasons = [];
        if (result.missingCriteria) {
          Object.entries(result.missingCriteria).forEach(([key, value]) => {
            if (
              typeof value === 'object' &&
              value !== null &&
              'required' in value
            ) {
              reasons.push(
                `${key}: ${(value as any).current}/${(value as any).required}`,
              );
            } else {
              reasons.push(key);
            }
          });
        }
        toast({
          title: 'Not Eligible',
          description:
            result.reason || 'You do not meet the criteria for this badge.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check eligibility',
        variant: 'destructive',
      });
    } finally {
      setCheckingEligibility((prev) => ({ ...prev, [badgeId]: false }));
    }
  };

  // Mutation for claiming a badge with refetch
  const claimBadgeMutation = useMutation({
    mutationFn: claimBadge,
    onSuccess: (data, badgeId) => {
      refetchStatus();
      refetchEligible();
      // Clear eligibility check for this badge
      setEligibilityChecks((prev) => {
        const updated = { ...prev };
        delete updated[badgeId];
        return updated;
      });
      toast({
        title: 'Badge Claimed!',
        description:
          data.message || 'You have successfully claimed your badge!',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Claim Failed',
        description:
          error.message || 'Failed to claim badge. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Fetch public gamification info (no auth required)
  const { data: gamificationInfo } = useQuery<GamificationInfoResponse>({
    queryKey: ['gamification-info'],
    queryFn: fetchGamificationInfo,
    retry: 1, // Only retry once on failure
  });

  const {
    data: status,
    isLoading: loadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['gamification-status'],
    queryFn: fetchStatus,
    retry: 1, // Only retry once on failure
  });

  const {
    data: eligible,
    isLoading: loadingEligible,
    error: eligibleError,
    refetch: refetchEligible,
  } = useQuery({
    queryKey: ['gamification-eligible'],
    queryFn: fetchEligible,
    retry: 1, // Only retry once on failure
  });

  // Handle authentication errors
  const authError =
    statusError?.message?.includes('Please log in') ||
    eligibleError?.message?.includes('Please log in');

  useEffect(() => {
    if (authError) return;
    if (!statusError && !eligibleError) return;

    toast({
      variant: 'destructive',
      title: "Couldn't load gamification data",
      description: String(statusError?.message || eligibleError?.message || ''),
    });
  }, [authError, statusError, eligibleError]);

  if (authError) {
    return (
      <div className="flex flex-col h-screen">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="settings"
        />
        <div className="flex flex-1 overflow-hidden">
          <SidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="levels-badges"
          />
          <main className="flex-1 overflow-y-auto p-6">
            <Alert variant="destructive">
              <AlertTitle>Authentication required</AlertTitle>
              <AlertDescription>
                You need to be logged in to view this page. Please{' '}
                <a
                  href="/login"
                  className="font-medium underline underline-offset-4"
                >
                  sign in
                </a>
                .
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loadingStatus || loadingEligible) {
    return (
      <div className="min-h-screen">
        <SidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active="Levels & Badges"
          isKycCheck={true}
        />

        <div className="sm:ml-14">
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu="settings"
            breadcrumbItems={[
              { label: 'Settings', link: '#' },
              { label: 'Levels & Badges', link: '#' },
            ]}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-5xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-52" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
                <Skeleton className="h-28 w-full" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-36 w-full" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Handle both response formats
  const statusData = status?.data || status || {};

  // Get current level from the response
  const currentLevel = statusData.currentLevel || null;

  // Get earned badges from the response
  const earnedBadges = Array.isArray(statusData.badges)
    ? statusData.badges
    : [];
  const earnedBadgeIds = new Set(
    earnedBadges.map((badge: BadgeItem) => badge.badge_id || badge._id || ''),
  );

  // Extract badges and levels from the gamification info
  const publicBadges = Array.isArray(gamificationInfo?.badges)
    ? gamificationInfo.badges
    : [];
  const publicLevels = Array.isArray(gamificationInfo?.levels)
    ? gamificationInfo.levels
    : [];

  // Extract badges and levels from the response
  let eligibleBadges: BadgeItem[] = [];
  let eligibleLevels: LevelItem[] = [];

  if (Array.isArray(eligible)) {
    // Handle case where eligible is an array of GamificationItems
    eligibleBadges = eligible;
  } else if (eligible?.data) {
    // Handle case where eligible has a data property with badges and levels
    eligibleBadges = Array.isArray(eligible.data.badges)
      ? eligible.data.badges
      : [];
    eligibleLevels = Array.isArray(eligible.data.levels)
      ? eligible.data.levels
      : [];
  }

  // Combine public badges with eligible badges, ensuring required fields
  const allUniqueBadges = [...publicBadges, ...eligibleBadges]
    .filter(Boolean)
    .map((badge) => ({
      ...badge,
      _id: badge._id || badge.badge_id || '',
      badge_id: badge.badge_id || badge._id || '',
      type: 'BADGE' as const,
      isActive: true,
    }))
    .filter(
      (badge, index, self) =>
        index ===
        self.findIndex(
          (b) =>
            (b._id && b._id === badge._id) ||
            (b.badge_id && b.badge_id === badge.badge_id),
        ),
    );

  // Process levels - ensure required fields
  const allUniqueLevels = [...publicLevels, ...eligibleLevels]
    .filter((level): level is LevelItem =>
      Boolean(level && (level.level_id || level._id)),
    )
    .map((level) => ({
      ...level,
      _id: level._id || level.level_id || '',
      level_id: level.level_id || level._id || '',
      type: 'LEVEL' as const,
      priority: level.priority || 0,
      isActive: true,
    }));

  // Process active badges from both public and eligible sources
  const activeBadges = allUniqueBadges.filter((item) => {
    if (!item) return false;
    const isActive = item.isActive !== false;
    return isActive;
  });

  // Process active levels from both public and eligible sources
  const activeLevels = allUniqueLevels.filter((item) => {
    if (!item) return false;
    const isActive = item.isActive !== false;
    return isActive;
  });

  const allLevels = activeLevels
    .map((level: any) => ({
      ...level,
      level_id: level._id || level.level_id,
      type: 'LEVEL' as const,
    }))
    .sort((a: any, b: any) => (a.priority ?? 0) - (b.priority ?? 0));

  // Process badges - ensure all required fields are present and sort by priority
  const allBadges = activeBadges
    .map((badge: any) => {
      const processedBadge = {
        ...badge,
        _id:
          badge._id ||
          badge.badge_id ||
          `temp-${Math.random().toString(36).substr(2, 9)}`,
        badge_id: badge.badge_id || badge._id,
        name: badge.name || 'Unnamed Badge',
        description: badge.description || '',
        type: 'BADGE' as const,
        isActive: badge.isActive !== false,
        priority: badge.priority || 0,
      };
      return processedBadge;
    })
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  // Find max earned badge priority for sequential logic
  const earnedBadgePriorities = earnedBadges
    .map((b: StatusBadge) => b.priority || 0)
    .filter((p) => p > 0);
  const maxEarnedPriority =
    earnedBadgePriorities.length > 0 ? Math.max(...earnedBadgePriorities) : 0;

  // Function to check if a badge is earned
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadgeIds.has(badgeId);
  };

  // Filter badges based on showEligibleOnly
  const filteredBadges = showEligibleOnly
    ? allBadges.filter((badge) => {
        const badgeId = badge.badge_id || badge._id;
        const isEligible = eligibleBadges.some(
          (b) => (b.badge_id || b._id) === badgeId,
        );
        // Also consider checked eligibility status
        const isEligibleChecked = eligibilityChecks[badgeId]?.eligible === true;
        return (isEligible || isEligibleChecked) && !isBadgeEarned(badgeId);
      })
    : allBadges;

  // Check if there are any eligible levels to show
  const hasEligibleLevels = eligibleLevels.length > 0;

  // Get the next level the user can level up to
  const nextLevel = eligibleLevels[0];

  const currentLevelIndex = currentLevel
    ? allLevels.findIndex((lvl: any) => {
        const lvlId = lvl._id || lvl.level_id;
        const curId = currentLevel._id || currentLevel.level_id;
        return Boolean(curId && lvlId && String(lvlId) === String(curId));
      })
    : -1;
  const currentLevelTier =
    currentLevelIndex >= 0 ? getStepTierMeta(currentLevelIndex) : null;

  // Handle level up with confirmation
  const handleLevelUp = async () => {
    if (
      !window.confirm(
        'Are you sure you want to level up? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      await levelUpMutation.mutateAsync();
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Level up error:', error);
    }
  };

  // Handle badge claim
  const handleClaimBadge = async (badgeId: string) => {
    try {
      await claimBadgeMutation.mutateAsync(badgeId);
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error claiming badge:', error);
    }
  };

  // Main component render
  return (
    <div className="min-h-screen">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Levels & Badges"
        isKycCheck={true}
      />

      <div className="sm:ml-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="settings"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Levels & Badges', link: '#' },
          ]}
        />

        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          {/* Header with Title and Level Up Button */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Levels & Badges
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your progress and achievements.
              </p>
            </div>

            <div className="flex flex-col items-start gap-1 sm:items-end">
              <Button
                onClick={handleLevelUp}
                disabled={!hasEligibleLevels || levelUpMutation.isPending}
                className="h-9"
                type="button"
              >
                {levelUpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Leveling up
                  </>
                ) : hasEligibleLevels ? (
                  'Level up'
                ) : (
                  'Max level'
                )}
              </Button>
              {hasEligibleLevels ? (
                <div className="text-xs text-muted-foreground">
                  Next: {String(nextLevel?.name || '-')}
                </div>
              ) : null}
            </div>
          </div>

          {/* Current Level Card */}
          {currentLevel ? (
            <Card className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

              <CardHeader className="relative flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base">Current level</CardTitle>
                    <CardDescription className="text-sm truncate">
                      {currentLevel.name}
                    </CardDescription>
                    {currentLevelTier
                      ? (() => {
                          const Icon = currentLevelTier.Icon;
                          return (
                            <div className="pt-1">
                              <Badge
                                className={`${currentLevelTier.badgeClass} border-0 inline-flex items-center gap-1.5`}
                                title={currentLevelTier.title}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {currentLevelTier.title}
                              </Badge>
                            </div>
                          );
                        })()
                      : null}
                  </div>
                </div>

                <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Current
                </Badge>
              </CardHeader>
              <CardContent className="relative space-y-2">
                {/* Display current reward multiplier */}
                {currentLevel.rewardMultiplier && (
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Crown className="h-4 w-4 text-primary" />
                    <span>
                      Current Multiplier: {currentLevel.rewardMultiplier}x
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress to next level</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2 w-full bg-foreground/10" />
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              className="mb-8 py-10"
              title="No level data"
              description="Your current level will appear here once available."
              icon={<Trophy className="h-10 w-10 text-muted-foreground" />}
            />
          )}

          {/* Levels Section - Vertical Timeline */}
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">All levels</h2>
              <span className="text-xs text-muted-foreground border px-2 rounded-full">
                {allLevels.length} total
              </span>
            </div>

            <div className="space-y-4 relative">
              {/* Vertical timeline connector */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

              {allLevels.length > 0 ? (
                allLevels.map((level, index) => {
                  const levelId = level._id || level.level_id || '';
                  const currentLevelPriority = currentLevel?.priority || 0;
                  const isPastLevel =
                    (level.priority || 0) < currentLevelPriority;
                  const isCurrentLevel =
                    level.priority === currentLevelPriority;
                  const isNextLevel =
                    level.priority === currentLevelPriority + 10;
                  const isFutureLevel =
                    (level.priority || 0) > currentLevelPriority &&
                    !isNextLevel;

                  const tier = getStepTierMeta(index);
                  const TierIcon = tier?.Icon || Medal;

                  return (
                    <div key={levelId} className="relative pl-12">
                      {/* Timeline node */}
                      <div
                        className={`absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background ${
                          isPastLevel
                            ? 'bg-green-500'
                            : isCurrentLevel
                              ? 'bg-primary animate-pulse'
                              : 'bg-muted border-border'
                        }`}
                      >
                        {isPastLevel ? (
                          <Check className="h-5 w-5 text-white" />
                        ) : isCurrentLevel ? (
                          <TierIcon className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <Card
                        className={
                          isCurrentLevel ? 'border-primary shadow-lg' : ''
                        }
                      >
                        <CardHeader className="space-y-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="text-base">
                                  Level {index}
                                </CardTitle>
                                {tier && (
                                  <Badge
                                    className={`${tier.badgeClass} border-0 inline-flex items-center gap-1.5`}
                                    title={tier.title}
                                  >
                                    <TierIcon className="h-3.5 w-3.5" />
                                    {tier.short}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="line-clamp-2 mt-1">
                                {level.description}
                              </CardDescription>
                            </div>

                            {isPastLevel ? (
                              <Badge variant="secondary" className="gap-1">
                                <Check className="h-3.5 w-3.5" />
                                Completed
                              </Badge>
                            ) : isCurrentLevel ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Current
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <Lock className="h-3.5 w-3.5" />
                                Locked
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {/* Display reward multiplier prominently */}
                          {level.rewardMultiplier && (
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                              <Crown className="h-4 w-4" />
                              <span>
                                Reward Multiplier: {level.rewardMultiplier}x
                              </span>
                            </div>
                          )}

                          {/* Progress bar */}
                          <Progress
                            value={isPastLevel ? 100 : isCurrentLevel ? 50 : 0}
                            className="h-1.5 w-full"
                          />

                          {/* Show eligibility button only for next level */}
                          {isNextLevel &&
                            eligibleLevels.some(
                              (l) =>
                                l._id === levelId || l.level_id === levelId,
                            ) && (
                              <Button
                                onClick={handleLevelUp}
                                disabled={levelUpMutation.isPending}
                                size="sm"
                                className="w-full"
                                type="button"
                              >
                                {levelUpMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Leveling Up
                                  </>
                                ) : (
                                  'Level Up Now'
                                )}
                              </Button>
                            )}

                          {/* Show criteria only for locked levels (next and future) */}
                          {(isNextLevel || isFutureLevel) && level.criteria && (
                            <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                              <div className="font-medium">Requirements:</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {level.criteria.minProjectApplications && (
                                  <li>
                                    {level.criteria.minProjectApplications}{' '}
                                    project applications
                                  </li>
                                )}
                                {level.criteria.minVerifiedDehixTalent && (
                                  <li>
                                    {level.criteria.minVerifiedDehixTalent}{' '}
                                    verified talents
                                  </li>
                                )}
                                {level.criteria.minInterviewsTaken && (
                                  <li>
                                    {level.criteria.minInterviewsTaken}{' '}
                                    interviews
                                  </li>
                                )}
                                {level.criteria.minBids && (
                                  <li>{level.criteria.minBids} bids</li>
                                )}
                                {level.criteria.requiresVerifiedProfile && (
                                  <li>Verified profile</li>
                                )}
                                {level.criteria.requiresOracle && (
                                  <li>Oracle status</li>
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
                  icon={<Trophy className="h-10 w-10 text-muted-foreground" />}
                />
              )}
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">All badges</CardTitle>
                  <CardDescription>
                    Earn badges by completing achievements.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-eligible"
                    checked={showEligibleOnly}
                    onCheckedChange={setShowEligibleOnly}
                  />
                  <label
                    htmlFor="show-eligible"
                    className="text-sm font-medium"
                  >
                    Eligible only
                  </label>
                </div>
              </CardHeader>

              <CardContent>
                {filteredBadges.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
                    {filteredBadges.map((badge) => {
                      const badgeId = badge._id || badge.badge_id || '';
                      const isEarned = isBadgeEarned(badgeId);
                      const isNextBadge =
                        badge.priority === maxEarnedPriority + 10;
                      const isFutureBadge =
                        (badge.priority || 0) > maxEarnedPriority + 10;
                      const isEligible = eligibleBadges.some(
                        (b) => (b._id || b.badge_id) === badgeId,
                      );
                      const eligibilityCheck = eligibilityChecks[badgeId];
                      const isChecking = checkingEligibility[badgeId];

                      return (
                        <Card
                          key={badgeId}
                          className={`flex-shrink-0 w-72 snap-center overflow-hidden ${isNextBadge ? 'border-primary shadow-md' : ''}`}
                        >
                          <CardHeader className="space-y-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <CardTitle className="truncate text-sm">
                                  {badge.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                  {badge.description ||
                                    'Earn this badge by completing achievements'}
                                </CardDescription>
                              </div>

                              {isEarned ? (
                                <Badge className="gap-1" variant="secondary">
                                  <Check className="h-3.5 w-3.5" />
                                  Earned
                                </Badge>
                              ) : isNextBadge ? (
                                <Badge variant="default" className="gap-1">
                                  Next
                                </Badge>
                              ) : isFutureBadge ? (
                                <Badge variant="outline" className="gap-1">
                                  <Lock className="h-3.5 w-3.5" />
                                  Locked
                                </Badge>
                              ) : (
                                <Badge variant="outline">Locked</Badge>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0 space-y-3">
                            {/* Display badge image if available */}
                            {badge.imageUrl && (
                              <div className="flex justify-center">
                                <img
                                  src={badge.imageUrl}
                                  alt={badge.name}
                                  className="h-16 w-16 object-contain"
                                />
                              </div>
                            )}

                            {/* Display base reward prominently */}
                            {badge.baseReward && (
                              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <Trophy className="h-4 w-4" />
                                <span>Reward: {badge.baseReward} Connects</span>
                              </div>
                            )}

                            {/* Action buttons - only for next badge */}
                            {isEarned ? null : isNextBadge ? (
                              <div>
                                {!eligibilityCheck ? (
                                  <Button
                                    onClick={() =>
                                      handleCheckEligibility(badgeId)
                                    }
                                    disabled={isChecking}
                                    size="sm"
                                    variant="default"
                                    className="w-full"
                                    type="button"
                                  >
                                    {isChecking ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking
                                      </>
                                    ) : (
                                      'Check Eligibility'
                                    )}
                                  </Button>
                                ) : eligibilityCheck.eligible ? (
                                  <Button
                                    onClick={() => handleClaimBadge(badgeId)}
                                    disabled={claimBadgeMutation.isPending}
                                    size="sm"
                                    className="w-full"
                                    type="button"
                                  >
                                    {claimBadgeMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Claiming
                                      </>
                                    ) : (
                                      'Claim Badge'
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    disabled
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                  >
                                    Not Eligible
                                  </Button>
                                )}
                              </div>
                            ) : null}

                            {/* Show criteria only for locked badges (next and future) */}
                            {!isEarned &&
                              (isNextBadge || isFutureBadge) &&
                              (!eligibilityCheck ||
                                !eligibilityCheck.eligible) &&
                              badge.criteria && (
                                <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                                  <div className="font-medium">
                                    Requirements:
                                  </div>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {badge.criteria.minProjectApplications && (
                                      <li>
                                        {badge.criteria.minProjectApplications}{' '}
                                        project applications
                                      </li>
                                    )}
                                    {badge.criteria.minVerifiedDehixTalent && (
                                      <li>
                                        {badge.criteria.minVerifiedDehixTalent}{' '}
                                        verified Dehix talents
                                      </li>
                                    )}
                                    {badge.criteria
                                      .minVerifiedInterviewTalents && (
                                      <li>
                                        {
                                          badge.criteria
                                            .minVerifiedInterviewTalents
                                        }{' '}
                                        verified interview talents
                                      </li>
                                    )}
                                    {badge.criteria.minInterviewsTaken && (
                                      <li>
                                        {badge.criteria.minInterviewsTaken}{' '}
                                        interviews taken
                                      </li>
                                    )}
                                    {badge.criteria.minTalentHiring && (
                                      <li>
                                        {badge.criteria.minTalentHiring} talent
                                        hirings
                                      </li>
                                    )}
                                    {badge.criteria.minBids && (
                                      <li>{badge.criteria.minBids} bids</li>
                                    )}
                                    {badge.criteria.minLongestStreak && (
                                      <li>
                                        {badge.criteria.minLongestStreak} day
                                        streak
                                      </li>
                                    )}
                                    {(badge.criteria.requiresVerifiedProfile ||
                                      badge.criteria.verificationRequired) && (
                                      <li>Verified profile</li>
                                    )}
                                    {(badge.criteria.requiresOracle ||
                                      badge.criteria.oracleRequired) && (
                                      <li>Oracle status</li>
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Show earned date for earned badges */}
                            {isEarned && badge.earnedAt && (
                              <div className="text-xs text-muted-foreground border-t pt-2">
                                Earned on{' '}
                                {new Date(badge.earnedAt).toLocaleDateString()}
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
                    title="No badges to show"
                    description="Complete more tasks to unlock badges and level up your profile."
                    icon={
                      <Trophy className="h-10 w-10 text-muted-foreground" />
                    }
                    actions={
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        type="button"
                      >
                        Check progress
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
