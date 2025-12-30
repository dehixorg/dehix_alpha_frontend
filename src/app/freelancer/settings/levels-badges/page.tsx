'use client';

import { Trophy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { RootState } from '@/lib/store';

/* ================= CONFIG ================= */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUS_API = `${API_BASE_URL}/api/freelancer/gamification/status`;

const ELIGIBLE_API = `${API_BASE_URL}/api/freelancer/gamification/eligible`;

/* ================= TYPES ================= */

type GamificationItem = {
  _id?: string;
  badge_id?: string;
  level_id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  type?: 'LEVEL' | 'BADGE';
  priority?: number;
  earnedAt?: string;
};

type GamificationStatusResponse = {
  data?: {
    currentLevel?: {
      level_id: string;
      name: string;
      priority: number;
      imageUrl?: string;
    } | null;
    badges?: Array<{
      badge_id: string;
      name: string;
      imageUrl?: string;
      earnedAt: string;
      isActive: boolean;
      _id: string;
    }>;
  };
  currentLevel?: GamificationItem | null;
  badges?: GamificationItem[];
};

type GamificationEligibleResponse =
  | {
      data?: GamificationItem[];
    }
  | GamificationItem[];

/* ================= API ================= */

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
    throw new Error('No authentication token found');
  }

  try {
    console.log('Fetching status from:', STATUS_API);
    const res = await axios.get(STATUS_API, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status API Response:', res.data);

    // Handle both response formats for backward compatibility
    const result = res.data.data || res.data;
    console.log('Processed status data:', result);
    return result;
  } catch (error) {
    console.error('Error in fetchStatus:', error);
    throw error;
  }
};

const fetchEligible = async (): Promise<{
  data: {
    badges: GamificationItem[];
    levels: GamificationItem[];
  };
}> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    console.log('Fetching eligible items from:', ELIGIBLE_API);
    const res = await axios.get(ELIGIBLE_API, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Eligible API Response:', res.data);

    // Handle the response structure
    const responseData = res.data.data ||
      res.data || { badges: [], levels: [] };
    console.log('Processed eligible data:', responseData);

    // Transform the data to match the expected format
    const badges = Array.isArray(responseData.badges)
      ? responseData.badges.map((badge) => ({
          ...badge,
          badge_id: badge._id,
          type: 'BADGE' as const,
        }))
      : [];

    const levels = Array.isArray(responseData.levels)
      ? responseData.levels.map((level) => ({
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
    return []; // Return empty array on error to prevent UI breakage
  }
};

/* ================= PAGE ================= */

export default function LevelsAndBadgesPage() {
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);

  // Function to check if a badge is earned
  const isBadgeEarned = (badgeId: string): boolean => {
    return earnedBadgeIds.has(badgeId);
  };

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

  // First, process the status data to get current level and earned badges
  console.log('Processing status data:', status);
  const statusData = (status as GamificationStatusResponse)?.data || status;
  const currentLevel = statusData?.currentLevel || null;
  const earnedBadges = Array.isArray(statusData?.badges)
    ? statusData.badges
    : [];
  const earnedBadgeIds = new Set(
    earnedBadges.map((badge) => badge.badge_id || badge._id),
  );

  console.log('Processed current level:', currentLevel);
  console.log('Processed earned badges:', earnedBadges);
  console.log('Earned badge IDs:', Array.from(earnedBadgeIds));

  // Then process the eligible data
  console.log('=== RAW ELIGIBLE DATA ===');
  console.log(JSON.stringify(eligible, null, 2));

  // Extract badges and levels from the response
  const eligibleData = eligible?.data || eligible || {};
  const eligibleBadges = Array.isArray(eligibleData.badges)
    ? eligibleData.badges
    : [];
  const eligibleLevels = Array.isArray(eligibleData.levels)
    ? eligibleData.levels
    : [];

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

  // Process active badges
  const activeBadges = eligibleBadges.filter((item: any) => {
    const isActive = item.isActive !== false;
    console.log('Badge:', { id: item._id, name: item.name, isActive });
    return isActive;
  });

  // Process active levels
  const activeLevels = eligibleLevels.filter((item: any) => {
    const isActive = item.isActive !== false;
    console.log('Level:', { id: item._id, name: item.name, isActive });
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

  const filteredBadges = showEligibleOnly
    ? allBadges.filter((badge: any) => {
        const isEarned = isBadgeEarned(badge.badge_id || badge._id);
        console.log(
          `Badge: ${badge.name}, ID: ${badge.badge_id || badge._id}, Earned: ${isEarned}`,
        );
        return !isEarned;
      })
    : allBadges;

  console.log('Filtered badges count:', filteredBadges.length);

  // Debug level filtering
  console.log('=== LEVEL FILTERING ===');
  console.log('Show eligible only:', showEligibleOnly);
  console.log('Current level priority:', currentLevel?.priority);

  const filteredLevels = showEligibleOnly
    ? allLevels.filter((level: any) => {
        const isEligible =
          !currentLevel ||
          (level.priority !== undefined &&
            currentLevel.priority !== undefined &&
            level.priority > currentLevel.priority);
        console.log(
          `Level: ${level.name}, Priority: ${level.priority}, Eligible: ${isEligible}`,
        );
        return isEligible;
      })
    : allLevels;

  console.log('Filtered levels count:', filteredLevels.length);

  // If no data is found, show a message
  const hasNoData =
    !currentLevel && (!earnedBadges || earnedBadges.length === 0);
  if (hasNoData) {
    console.warn('No gamification data found in the response');
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
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No gamification data available. Start completing tasks to
                    earn badges and level up!
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Levels & Badges"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Levels & Badges"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Levels & Badges', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 sm:px-6 sm:py-2 md:gap-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gamification Status
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Track your progress, badges, and level achievements
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <Switch
                  id="eligible-toggle"
                  checked={showEligibleOnly}
                  onCheckedChange={setShowEligibleOnly}
                  className="data-[state=checked]:bg-primary"
                />
                <label
                  htmlFor="eligible-toggle"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  Show eligible only
                </label>
              </div>
            </div>

            {showEligibleOnly && (
              <div className="mt-3 flex items-center text-sm text-primary bg-blue-50 dark:bg-gray-800 rounded-md w-fit">
                <Check className="h-4 w-4 mr-2" />
                <span className="text-gray-700 dark:text-gray-200">
                  Showing only items you can earn next
                </span>
              </div>
            )}
          </div>

          {/* Current Level */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Your Current Level
            </h2>
            {currentLevel ? (
              <div className="flex items-center space-x-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-2xl font-bold">
                  {currentLevel.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentLevel.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep going to reach the next level!
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No level assigned yet
              </p>
            )}
          </section>

          {/* Earned Badges */}
          <section>
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Your Badges
            </h2>
            {earnedBadges && earnedBadges.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {earnedBadges.map((badge: any) => (
                  <div
                    key={badge.badge_id || badge._id}
                    className="flex items-center space-x-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {badge.earnedAt
                          ? `Earned on ${new Date(badge.earnedAt).toLocaleDateString()}`
                          : 'Earned'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 dark:border-gray-700 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-gray-200">
                      No badges earned yet. Complete tasks to earn badges!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Available Badges & Levels */}
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
              Available to Earn
            </h2>

            {/* Available Badges */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Badges
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredBadges.length} of {allBadges.length}
                </span>
              </div>
              {filteredBadges.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBadges.map((badge) => {
                    const isEarned = isBadgeEarned(
                      badge.badge_id || badge._id || '',
                    );
                    return (
                      <div
                        key={badge.badge_id || badge._id}
                        className={`flex items-center space-x-4 rounded-lg border p-4 transition-shadow ${
                          isEarned
                            ? 'border-green-200 bg-green-50 dark:bg-green-900'
                            : 'border-gray-200 bg-white dark:bg-gray-800 opacity-70 hover:shadow-md'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full ${
                            isEarned
                              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-200'
                          }`}
                        >
                          <Trophy size={24} />
                        </div>
                        <div>
                          <h3
                            className={`font-medium ${
                              isEarned ? 'text-green-800' : 'text-gray-700'
                            } dark:text-white`}
                          >
                            {badge.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEarned
                              ? 'Earned! ' +
                                (badge.earnedAt
                                  ? new Date(
                                      badge.earnedAt,
                                    ).toLocaleDateString()
                                  : '')
                              : badge.description ||
                                'Complete tasks to earn this badge'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400 dark:text-gray-200"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-gray-200">
                        No additional badges available at the moment. Check back
                        later for new challenges!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Available Levels */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Levels
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredLevels.length} of {allLevels.length}
                </span>
              </div>
              {filteredLevels.length > 0 ? (
                <div className="space-y-4">
                  {filteredLevels.map((level) => {
                    const isCurrent =
                      currentLevel &&
                      ((currentLevel.level_id &&
                        currentLevel.level_id === level.level_id) ||
                        (currentLevel._id && currentLevel._id === level._id));
                    const isUnlocked =
                      isCurrent ||
                      (currentLevel &&
                        level.priority &&
                        currentLevel.priority &&
                        level.priority <= currentLevel.priority);

                    return (
                      <div
                        key={level.level_id || level._id}
                        className={`relative flex items-center space-x-4 rounded-lg border p-4 ${
                          isCurrent
                            ? 'border-blue-200 bg-blue-50 dark:bg-blue-900'
                            : isUnlocked
                              ? 'border-green-100 bg-green-50 dark:bg-green-900'
                              : 'border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-70'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-full text-xl font-bold ${
                            isCurrent
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                              : isUnlocked
                                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-200'
                          }`}
                        >
                          {level.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 dark:text-gray-200">
                          <div className="flex justify-between items-center">
                            <h3
                              className={`font-medium ${
                                isCurrent ? 'text-blue-800' : 'text-gray-700'
                              } dark:text-white`}
                            >
                              {level.name}
                            </h3>
                            {isCurrent && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400">
                                Current Level
                              </span>
                            )}
                            {!isCurrent && isUnlocked && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400">
                                Unlocked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {level.description ||
                              'Reach this level by earning more points'}
                          </p>

                          {/* Progress bar for current level */}
                          {isCurrent && (
                            <div className="mt-2">
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 dark:bg-blue-900 rounded-full"
                                  style={{ width: '75%' }} // You can replace this with actual progress
                                />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                75% to next level
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400 dark:text-gray-200"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        No additional levels available at the moment. Keep an
                        eye out for future updates!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
