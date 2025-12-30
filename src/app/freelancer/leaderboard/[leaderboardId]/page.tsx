'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Users, Target, Info } from 'lucide-react';

import { useAppSelector } from '@/lib/hooks';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { FullLeaderboard } from '@/types/leaderboard';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';

// types for params
interface PageProps {
  params: {
    leaderboardId: string;
  };
}

export default function LeaderboardDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { leaderboardId } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<FullLeaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const currentUserId = useAppSelector((state) => state.user.uid);

  useEffect(() => {
    if (!currentUserId) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }
    if (leaderboardId) {
      loadLeaderboardDetails();
    }
  }, [leaderboardId, currentUserId]);

  const loadLeaderboardDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/leaderboard/${leaderboardId}`);
      setLeaderboard(response.data.data);
    } catch (err: any) {
      console.error('Error loading leaderboard details:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load leaderboard details';
      setError(errorMessage);
      notifyError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipate = async () => {
    if (!leaderboard) return;

    try {
      const response = await axiosInstance.post(
        `/leaderboard/${leaderboardId}/join`,
      );

      if (response.data.success) {
        notifySuccess('Successfully joined the leaderboard!', 'Success');
        // Update local state to reflect change
        setLeaderboard({ ...leaderboard, isJoined: true });
      }
    } catch (err: any) {
      console.error('Error joining leaderboard:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to join leaderboard';
      notifyError(errorMessage, 'Error');
    }
  };

  const handleClaim = async () => {
    if (!leaderboard) return;

    setIsClaiming(true);
    try {
      const response = await axiosInstance.post(
        `/leaderboard/claim-reward/${leaderboardId}`,
      );

      if (response.data.success) {
        notifySuccess(
          `Congratulations! You've claimed your reward of ${response.data.data.baseAmount} connects!`,
          'Reward Claimed',
        );

        // Fetch fresh connects balance from backend
        try {
          const userResponse = await axiosInstance.get(
            `/freelancer/${currentUserId}`,
          );
          const freshConnects =
            userResponse.data?.data?.connects ??
            userResponse.data?.connects ??
            0;
          localStorage.setItem('DHX_CONNECTS', freshConnects.toString());
          window.dispatchEvent(new Event('connectsUpdated'));
        } catch (error) {
          console.error('Error fetching updated connects:', error);
          // Fallback to calculating from response if user fetch fails
          const currentConnects = localStorage.getItem('DHX_CONNECTS') || '0';
          const newConnects =
            parseInt(currentConnects) + response.data.data.finalAmount;
          localStorage.setItem('DHX_CONNECTS', newConnects.toString());
          window.dispatchEvent(new Event('connectsUpdated'));
        }

        // Reload leaderboard details to show updated reward status
        await loadLeaderboardDetails();
      }
    } catch (err: any) {
      console.error('Error claiming reward:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to claim reward';
      notifyError(errorMessage, 'Error');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
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
              { label: 'Details', link: '#' },
            ]}
          />
          <main className="p-8 space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (error || !leaderboard) {
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
          <main className="p-8">
            <Card>
              <CardContent className="py-16 flex flex-col items-center">
                <Info className="h-16 w-16 text-destructive/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground">
                  {error || 'Leaderboard not found'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.back()}
                >
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  // Scoring Weights Display Helper
  const renderScoringWeights = (weights: any) => {
    if (!weights) return null;
    const entries = Object.entries(weights)
      .filter(
        ([key]) => key !== 'verifiedProfileBonus' && key !== 'oracleBonus',
      )
      .map(([key, value]: [string, any]) => ({
        name: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase()),
        min: value.min,
        weight: value.weight,
      }));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((item) => (
            <div
              key={item.name}
              className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border"
            >
              <span className="font-medium text-sm">{item.name}</span>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Min: {item.min}
                </div>
                <div className="font-bold text-primary">{item.weight} pts</div>
              </div>
            </div>
          ))}
        </div>
        {/* Bonuses */}
        <div className="flex gap-4 mt-2">
          {weights.verifiedProfileBonus > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              Verified Profile: +{weights.verifiedProfileBonus} pts
            </Badge>
          )}
          {weights.oracleBonus > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              Oracle Badge: +{weights.oracleBonus} pts
            </Badge>
          )}
        </div>
      </div>
    );
  };

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
            { label: leaderboard.name, link: '#' },
          ]}
        />
        <main className="p-4 sm:px-8 space-y-8">
          {/* Top Navigation */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Contests
          </Button>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  {leaderboard.frequency}
                </Badge>
                <Badge
                  variant={
                    leaderboard.status === 'ACTIVE' ? 'default' : 'secondary'
                  }
                >
                  {leaderboard.status}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {leaderboard.name}
              </h1>
              {leaderboard.description && (
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {leaderboard.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(leaderboard.periodStart)} -{' '}
                  {formatDate(leaderboard.periodEnd)}
                </div>
              </div>
            </div>

            {(() => {
              const userEntry = leaderboard?.rankings?.find(
                (r) => r.freelancerId === currentUserId,
              );
              const userRank = userEntry?.rank;
              const hasClaimedReward = userEntry?.reward;
              const isClaimable =
                leaderboard?.status === 'PUBLISHED' &&
                userRank !== undefined &&
                userRank <= 3 &&
                !hasClaimedReward;
              const isPublished = leaderboard?.status === 'PUBLISHED';

              if (hasClaimedReward) {
                return (
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600"
                    disabled
                  >
                    Reward Claimed
                  </Button>
                );
              } else if (isClaimable) {
                return (
                  <Button
                    size="lg"
                    className="w-full md:w-auto shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={handleClaim}
                    disabled={isClaiming}
                  >
                    {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                  </Button>
                );
              } else if (leaderboard.isJoined) {
                return (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full md:w-auto"
                    disabled
                  >
                    Joined
                  </Button>
                );
              } else if (isPublished && !leaderboard.isJoined) {
                return (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full md:w-auto"
                    disabled
                  >
                    Participate Now
                  </Button>
                );
              } else {
                return (
                  <Button
                    size="lg"
                    className="w-full md:w-auto shadow-lg shadow-primary/20"
                    onClick={handleParticipate}
                  >
                    Participate Now
                  </Button>
                );
              }
            })()}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Rankings */}
            <div className="lg:col-span-2 space-y-8">
              <LeaderboardTable
                data={leaderboard.rankings}
                rewardConfig={leaderboard.rewardConfig}
              />
            </div>

            {/* Sidebar: Rules & Config */}
            <div className="space-y-6">
              {/* Eligibility Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Allowed Badges
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {leaderboard.eligibility.badgesAllowed.length > 0 ? (
                        leaderboard.eligibility.badgesAllowed.map(
                          (badge, i) => (
                            <Badge key={i} variant="secondary">
                              {badge}
                            </Badge>
                          ),
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Any badge level
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Allowed Levels
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {leaderboard.eligibility.levelsAllowed.length > 0 ? (
                        leaderboard.eligibility.levelsAllowed.map(
                          (level, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-primary/50"
                            >
                              {level}
                            </Badge>
                          ),
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          All levels allowed
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scoring Rules Card */}
              {leaderboard.scoringWeights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-green-500" />
                      Scoring Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderScoringWeights(leaderboard.scoringWeights)}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
