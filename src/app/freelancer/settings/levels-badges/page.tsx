'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Check, CheckCircle, Loader2 } from 'lucide-react';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';

/* ================= CONFIG ================= */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const GAMIFICATION_INFO_API = `${API_BASE_URL}/api/v1/gamification/info`;
const STATUS_API = `${API_BASE_URL}/api/freelancer/gamification/status`;
const ELIGIBLE_API = `${API_BASE_URL}/api/freelancer/gamification/eligible`;
const CLAIM_BADGE_API = `${API_BASE_URL}/api/freelancer/gamification/claim-badge`;
const LEVEL_UP_API = `${API_BASE_URL}/api/freelancer/gamification/level-up`;

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
    console.log('Fetching gamification info from:', GAMIFICATION_INFO_API);
    const response = await fetch(GAMIFICATION_INFO_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.message || 'Failed to fetch gamification info');
    }

    const data = await response.json();
    console.log('Gamification Info API Response:', data);
    return {
      badges: Array.isArray(data?.badges) ? data.badges : [],
      levels: Array.isArray(data?.levels) ? data.levels : [],
    };
  } catch (error) {
    console.error('Error in fetchGamificationInfo:', error);
    throw error;
  }
};

// Get the auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || null;
  }
  return null;
};

const fetchStatus = async (): Promise<GamificationStatusResponse> => {
  const token = getAuthToken();
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Please log in to view gamification data');
  }

  try {
    console.log('Fetching status from:', STATUS_API);
    const response = await fetch(STATUS_API, {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.message || 'Failed to fetch status');
    }

    const data = await response.json();
    console.log('Status API Response:', data);

    // Handle both response formats for backward compatibility
    const result = data.data || data;
    console.log('Processed status data:', result);
    return result;
  } catch (error) {
    console.error('Error in fetchStatus:', error);
    throw error;
  }
};

const fetchEligible = async (): Promise<GamificationEligibleResponse> => {
  const token = getAuthToken();
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Please log in to view eligible badges');
  }

  try {
    console.log('Fetching eligible from:', ELIGIBLE_API);
    const response = await fetch(ELIGIBLE_API, {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(errorData.message || 'Failed to fetch eligible items');
    }

    const data = await response.json();
    console.log('Eligible API Response:', data);

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
  } catch (error) {
    console.error('Error in fetchEligible:', error);
    // Return a properly structured response even in case of error
    return { data: { badges: [], levels: [] } };
  }
};

// Claim a badge
const claimBadge = async (
  badgeId: string,
): Promise<{ success: boolean; message?: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to claim badges');
  }

  try {
    const response = await fetch(CLAIM_BADGE_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ badgeId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to claim badge');
    }

    return { success: true, message: 'Badge claimed successfully!' };
  } catch (error) {
    console.error('Error claiming badge:', error);
    throw error;
  }
};

// Level up to next level
const levelUp = async (): Promise<{ success: boolean; message?: string }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to level up');
  }

  try {
    const response = await fetch(LEVEL_UP_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to level up');
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error: any) {
    console.error('Level up error:', error);
    throw new Error(error.message || 'An error occurred while leveling up');
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
    statusError?.message?.includes('No authentication token found') ||
    eligibleError?.message?.includes('No authentication token found');

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
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    You need to be logged in to view this page. Please{' '}
                    <a
                      href="/login"
                      className="font-medium text-red-700 underline hover:text-red-600"
                    >
                      sign in
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
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
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-gray-600">
                Loading gamification data...
              </span>
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
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading gamification data. Please try again later.
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    {statusError?.message || eligibleError?.message}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
        />

        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header with Title and Level Up Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Levels & Badges
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Track your progress and achievements
              </p>
            </div>
            <Button
              onClick={handleLevelUp}
              disabled={!hasEligibleLevels || levelUpMutation.isPending}
              className={`mt-2 sm:mt-0 flex items-center gap-2 ${
                hasEligibleLevels
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {levelUpMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Leveling Up...
                </>
              ) : hasEligibleLevels ? (
                'Level Up!'
              ) : (
                'Max Level Reached'
              )}
            </Button>
          </div>

          {/* Current Level Card */}
          {currentLevel && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Current Level
                  </h2>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentLevel.name}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="h-5 w-5 mr-1.5" />
                    Current Level
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Progress to next level</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Levels Section */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Available Levels
            </h2>
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
                    <div
                      key={levelId}
                      className={`bg-white dark:bg-gray-800 rounded-xl border ${
                        isCurrent
                          ? 'border-blue-200 dark:border-blue-900 shadow-md dark:shadow-lg'
                          : 'border-gray-200 dark:border-gray-700'
                      } p-6 transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}
                          >
                            <Trophy
                              className={`h-6 w-6 ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {level.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {level.description}
                            </p>
                          </div>
                        </div>
                        <div>
                          {isCurrent ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Current
                            </span>
                          ) : isUnlocked ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                              <Check className="h-4 w-4 mr-1.5" />
                              Unlocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar for Current Level */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isCurrent ? 'bg-blue-500' : isUnlocked ? 'bg-green-500' : 'bg-gray-400'}`}
                            style={{
                              width: isCurrent
                                ? '50%'
                                : isUnlocked
                                  ? '100%'
                                  : '0%',
                            }}
                          />
                        </div>
                      </div>

                      {/* Requirements */}
                      {isCurrent && level.requirements && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Requirements to next level:
                          </h4>
                          <ul className="space-y-2">
                            {Array.isArray(level.requirements) &&
                              level.requirements.map(
                                (req: string, i: number) => (
                                  <li
                                    key={i}
                                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    {req}
                                  </li>
                                ),
                              )}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No levels available
                </div>
              )}
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Badges
              </h2>
              <div className="flex items-center mt-3 sm:mt-0 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                <Switch
                  id="show-eligible"
                  checked={showEligibleOnly}
                  onCheckedChange={setShowEligibleOnly}
                  className={`mr-2 ${showEligibleOnly ? 'data-[state=checked]:bg-blue-600' : ''}`}
                />
                <label
                  htmlFor="show-eligible"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  Show eligible only
                </label>
              </div>
            </div>

            {filteredBadges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBadges.map((badge) => {
                  const badgeId = badge._id || badge.badge_id || '';
                  const isEarned = isBadgeEarned(badgeId);
                  const isEligible = eligibleBadges.some(
                    (b) => (b._id || b.badge_id) === badgeId,
                  );

                  return (
                    <div
                      key={badgeId}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                isEarned
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}
                            >
                              <Trophy
                                className={`h-6 w-6 ${isEarned ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {badge.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {badge.description ||
                                'Earn this badge by completing achievements'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          {isEarned ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                              <Check className="h-3 w-3 mr-1" /> Earned
                            </span>
                          ) : isEligible ? (
                            <Button
                              onClick={() => handleClaimBadge(badgeId)}
                              disabled={claimBadgeMutation.isPending}
                              className="text-xs py-1 px-3 h-8"
                              size="sm"
                            >
                              {claimBadgeMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Claiming...
                                </>
                              ) : (
                                'Claim Badge'
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Not eligible yet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
                <div className="mx-auto h-16 w-16 text-blue-400 dark:text-blue-500 mb-4">
                  <Trophy className="h-full w-full opacity-70" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  No Badges Available Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  You haven&apos;t unlocked any badges yet. Complete more tasks
                  and earn badges to level up your profile!
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  >
                    Check Your Progress
                  </Button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
