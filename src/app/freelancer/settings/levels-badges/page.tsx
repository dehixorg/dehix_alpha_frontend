'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Check, CheckCircle, Loader2 } from 'lucide-react';

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

/* ================= CONFIG ================= */

const GAMIFICATION_INFO_API = '/api/v1/gamification/info';
const STATUS_API = '/api/freelancer/gamification/status';
const ELIGIBLE_API = '/api/freelancer/gamification/eligible';
const CLAIM_BADGE_API = '/api/freelancer/gamification/claim-badge';
const LEVEL_UP_API = '/api/freelancer/gamification/level-up';

/* ================= TYPES ================= */

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
}

// Interface for level items
interface LevelItem extends GamificationItemBase {
  level_id: string;
  priority: number;
  type: 'LEVEL';
}

// Interface for badge items
export interface BadgeItem extends GamificationItemBase {
  badge_id: string;
  type: 'BADGE';
  earnedAt?: string;
  isActive?: boolean;
}

// Union type for gamification items

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

/* ================= API ================= */

// Fetch public gamification info (badges and levels)
const fetchGamificationInfo = async (): Promise<GamificationInfoResponse> => {
  try {
    const response = await axiosInstance.get(GAMIFICATION_INFO_API);
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
    const response = await axiosInstance.get(STATUS_API);
    const data = response?.data;

    // Handle both response formats for backward compatibility
    const result = data.data || data;
    console.log('Processed status data:', result);
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
    const response = await axiosInstance.get(ELIGIBLE_API);
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
    await axiosInstance.post(CLAIM_BADGE_API, { badgeId });
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

// Level up to next level
const levelUp = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.post(LEVEL_UP_API);
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

/* ================= PAGE ================= */

export default function LevelsAndBadgesPage() {
  // State for toggling eligible badges
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const queryClient = useQueryClient();

  // Level up mutation with optimistic updates
  const levelUpMutation = useMutation({
    mutationFn: levelUp,
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['gamification-status'] });
      await queryClient.cancelQueries({ queryKey: ['gamification-eligible'] });

      // Snapshot the previous value
      const previousStatus =
        queryClient.getQueryData<GamificationStatusResponse>([
          'gamification-status',
        ]);
      const previousEligible =
        queryClient.getQueryData<GamificationEligibleResponse>([
          'gamification-eligible',
        ]);

      return { previousStatus, previousEligible };
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['gamification-status'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-eligible'] });

      toast({
        title: 'Level Up Successful!',
        description: data.message || 'You have successfully leveled up!',
        variant: 'default',
      });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['gamification-status'],
          context.previousStatus,
        );
      }
      if (context?.previousEligible) {
        queryClient.setQueryData(
          ['gamification-eligible'],
          context.previousEligible,
        );
      }

      toast({
        title: 'Level Up Failed',
        description: error.message || 'Failed to level up. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for claiming a badge with optimistic updates
  const claimBadgeMutation = useMutation({
    mutationFn: claimBadge,
    onMutate: async (badgeId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['gamification-status'] });
      await queryClient.cancelQueries({ queryKey: ['gamification-eligible'] });

      // Snapshot the previous values
      const previousStatus =
        queryClient.getQueryData<GamificationStatusResponse>([
          'gamification-status',
        ]);
      const previousEligible =
        queryClient.getQueryData<GamificationEligibleResponse>([
          'gamification-eligible',
        ]);

      // Optimistically update the UI
      if (previousStatus) {
        const updatedStatus = {
          ...previousStatus,
          badges: [
            ...(previousStatus.badges || []),
            { badge_id: badgeId, earnedAt: new Date().toISOString() },
          ],
        };
        queryClient.setQueryData(['gamification-status'], updatedStatus);
      }

      return { previousStatus, previousEligible };
    },
    onSuccess: (data, badgeId) => {
      // Invalidate and refetch to ensure we have fresh data
      queryClient.invalidateQueries({ queryKey: ['gamification-status'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-eligible'] });

      // Show success message
      toast({
        title: 'Badge Claimed!',
        description:
          data.message || 'You have successfully claimed your badge!',
        variant: 'default',
      });

      console.log(`Successfully claimed badge ${badgeId}:`, data);
    },
    onError: (error: Error, badgeId, context) => {
      console.error(`Error claiming badge ${badgeId}:`, error);

      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          ['gamification-status'],
          context.previousStatus,
        );
      }
      if (context?.previousEligible) {
        queryClient.setQueryData(
          ['gamification-eligible'],
          context.previousEligible,
        );
      }

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
  } = useQuery({
    queryKey: ['gamification-status'],
    queryFn: fetchStatus,
    retry: 1, // Only retry once on failure
  });

  const {
    data: eligible,
    isLoading: loadingEligible,
    error: eligibleError,
  } = useQuery({
    queryKey: ['gamification-eligible'],
    queryFn: fetchEligible,
    retry: 1, // Only retry once on failure
  });

  // Handle authentication errors
  const authError =
    statusError?.message?.includes('Please log in') ||
    eligibleError?.message?.includes('Please log in');

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

  // Show error state if there was an error
  if (statusError || eligibleError) {
    console.error('API Error - Status:', statusError);
    console.error('API Error - Eligible:', eligibleError);

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
            <div className="mx-auto w-full max-w-4xl space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load gamification data</AlertTitle>
                <AlertDescription>
                  {statusError?.message || eligibleError?.message}
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-fit"
              >
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ===== FRONTEND LOGIC (BASED ON BACKEND DATA) ===== */

  // Process the status API response
  console.log('Status API response:', status);

  // Handle both response formats
  const statusData = status?.data || status || {};

  // Get current level from the response
  const currentLevel = statusData.currentLevel || null;
  console.log('Current level from API:', currentLevel);

  // Get earned badges from the response
  const earnedBadges = Array.isArray(statusData.badges)
    ? statusData.badges
    : [];
  const earnedBadgeIds = new Set(
    earnedBadges.map((badge: BadgeItem) => badge.badge_id || badge._id || ''),
  );
  console.log('Earned badges:', earnedBadges);
  console.log('Earned badge IDs:', Array.from(earnedBadgeIds));

  // Process gamification info (public badges and levels)
  console.log('=== GAMIFICATION INFO ===');
  console.log('Gamification info:', gamificationInfo);

  // Extract badges and levels from the gamification info
  const publicBadges = Array.isArray(gamificationInfo?.badges)
    ? gamificationInfo.badges
    : [];
  const publicLevels = Array.isArray(gamificationInfo?.levels)
    ? gamificationInfo.levels
    : [];

  console.log('Public badges:', publicBadges);
  console.log('Public levels:', publicLevels);

  // Then process the eligible data
  console.log('=== RAW ELIGIBLE DATA ===');
  console.log(JSON.stringify(eligible, null, 2));

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

  console.log('All unique badges:', allUniqueBadges);
  console.log('All unique levels:', allUniqueLevels);

  console.log('=== PROCESSED DATA ===');
  console.log('Eligible badges count:', eligibleBadges.length);
  console.log('Eligible levels count:', eligibleLevels.length);

  // Log the first badge and level for debugging
  if (eligibleBadges.length > 0) {
    console.log(
      'First eligible badge:',
      JSON.stringify(eligibleBadges[0], null, 2),
    );
  }
  if (eligibleLevels.length > 0) {
    console.log(
      'First eligible level:',
      JSON.stringify(eligibleLevels[0], null, 2),
    );
  }

  // Process active badges from both public and eligible sources
  const activeBadges = allUniqueBadges.filter((item) => {
    if (!item) return false;
    const isActive = item.isActive !== false;
    console.log('Badge:', {
      id: item._id || item.badge_id,
      name: item.name,
      isActive,
    });
    return isActive;
  });

  // Process active levels from both public and eligible sources
  const activeLevels = allUniqueLevels.filter((item) => {
    if (!item) return false;
    const isActive = item.isActive !== false;
    console.log('Level:', {
      id: item._id || item.level_id,
      name: item.name,
      isActive,
    });
    return isActive;
  });

  console.log('Active badges count:', activeBadges.length);
  console.log('Active levels count:', activeLevels.length);

  // Process levels
  const allLevels = activeLevels
    .map((level: any) => ({
      ...level,
      level_id: level._id || level.level_id,
      type: 'LEVEL' as const,
    }))
    .sort((a: any, b: any) => (a.priority ?? 0) - (b.priority ?? 0));

  // Process badges - ensure all required fields are present
  const allBadges = activeBadges.map((badge: any) => {
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

    console.log('Processed badge:', JSON.stringify(processedBadge, null, 2));
    return processedBadge;
  });

  console.log('Total processed badges:', allBadges.length);

  // Debug badge filtering
  console.log('=== BADGE FILTERING ===');
  console.log('Show eligible only:', showEligibleOnly);
  console.log('All badges count:', allBadges.length);

  // Filter badges based on showEligibleOnly
  const filteredBadges = showEligibleOnly
    ? allBadges.filter((badge) => {
        const isEligible = eligibleBadges.some(
          (b) => (b.badge_id || b._id) === (badge.badge_id || badge._id),
        );
        return isEligible && !isBadgeEarned(badge.badge_id || badge._id);
      })
    : allBadges;

  // Debug eligible levels
  console.log('Eligible levels:', eligibleLevels);
  console.log('Current level:', currentLevel);

  // Check if there are any eligible levels to show
  const hasEligibleLevels = eligibleLevels.length > 0;

  // Get the next level the user can level up to
  const nextLevel = eligibleLevels[0];

  // Function to check if a badge is earned
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadgeIds.has(badgeId);
  };

  console.log('Has eligible levels:', hasEligibleLevels);
  console.log('Next level:', nextLevel);

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
      toast({
        title: 'Success',
        description: 'Badge claimed successfully!',
        variant: 'default',
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['gamification-status'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-eligible'] });
    } catch (error) {
      console.error('Error claiming badge:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to claim badge',
        variant: 'destructive',
      });
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
            <Card className="mb-8">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-base">Current level</CardTitle>
                  <CardDescription className="text-sm">
                    {currentLevel.name}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Current
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress to next level</span>
                  <span>0%</span>
                </div>
                <Progress value={0} />
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

          {/* Levels Section */}
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available levels</h2>
              <span className="text-xs text-muted-foreground">
                {allLevels.length} total
              </span>
            </div>

            <div className="space-y-4">
              {allLevels.length > 0 ? (
                allLevels.map((level, index) => {
                  const levelId = level._id || level.level_id || '';
                  const isCurrent =
                    currentLevel &&
                    (currentLevel._id === levelId ||
                      currentLevel.level_id === levelId);
                  const isUnlocked =
                    index === 0 ||
                    allLevels
                      .slice(0, index)
                      .some((l) =>
                        earnedBadges.some(
                          (b) => b.level_id === (l._id || l.level_id),
                        ),
                      );

                  return (
                    <Card key={levelId}>
                      <CardHeader className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base">
                              {level.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {level.description}
                            </CardDescription>
                          </div>

                          {isCurrent ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Current
                            </Badge>
                          ) : isUnlocked ? (
                            <Badge variant="outline" className="gap-1">
                              <Check className="h-3.5 w-3.5" />
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge variant="outline">Locked</Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <Progress
                          value={isCurrent ? 50 : isUnlocked ? 100 : 0}
                        />

                        {/* Requirements */}
                        {isCurrent && level.requirements && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">
                              Requirements to next level
                            </div>
                            <div className="space-y-1">
                              {Array.isArray(level.requirements)
                                ? level.requirements.map(
                                    (req: string, i: number) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 text-sm"
                                      >
                                        <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                                        <span className="text-muted-foreground">
                                          {req}
                                        </span>
                                      </div>
                                    ),
                                  )
                                : null}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
                  <CardTitle className="text-base">Your badges</CardTitle>
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredBadges.map((badge) => {
                      const badgeId = badge._id || badge.badge_id || '';
                      const isEarned = isBadgeEarned(badgeId);
                      const isEligible = eligibleBadges.some(
                        (b) => (b._id || b.badge_id) === badgeId,
                      );

                      return (
                        <Card key={badgeId} className="overflow-hidden">
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
                              ) : isEligible ? (
                                <Badge variant="outline">Eligible</Badge>
                              ) : (
                                <Badge variant="outline">Locked</Badge>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            {isEarned ? null : isEligible ? (
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
                                  'Claim badge'
                                )}
                              </Button>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                Not eligible yet
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
