'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Info,
  Sparkles,
  Award,
  CheckCircle,
} from 'lucide-react';

import { useAppSelector } from '@/lib/hooks';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { FullLeaderboard } from '@/types/leaderboard';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import StatItem from '@/components/shared/StatItem';

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
          <main className="p-4 sm:px-8 space-y-8">
            <Skeleton className="h-12 w-1/3" />
            <Card className="h-96">
              <CardHeader className="pb-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
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
          <main className="p-4 sm:px-8">
            <Card className="relative overflow-hidden">
              <CardContent className="py-16 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/10 rounded-full blur-2xl" />
                  <Info className="relative h-16 w-16 text-destructive mb-4" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Error</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {error || 'Leaderboard not found'}
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
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

    const getColorForMetric = (
      name: string,
    ): 'blue' | 'green' | 'amber' | 'default' => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('completion')) return 'green';
      if (lowerName.includes('rating')) return 'amber';
      if (lowerName.includes('earnings')) return 'blue';
      return 'default';
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((item, index) => (
            <StatItem
              key={index}
              variant="card"
              color={getColorForMetric(item.name)}
              label={item.name}
              value={
                <div className="text-left">
                  <div className="text-lg font-bold text-primary">
                    {item.weight} pts
                  </div>
                  {item.min > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Min: {item.min}
                    </div>
                  )}
                </div>
              }
              text_class="text-lg"
              value_class="justify-end"
            />
          ))}
        </div>

        {/* Bonus Points Section */}
        {(weights.verifiedProfileBonus > 0 || weights.oracleBonus > 0) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Bonus Points
            </div>
            <div className="flex flex-wrap gap-3">
              {weights.verifiedProfileBonus > 0 && (
                <StatItem
                  variant="default"
                  color="green"
                  icon={<CheckCircle className="h-4 w-4" />}
                  label="Verified Profile"
                  value={`+${weights.verifiedProfileBonus} pts`}
                  text_class="text-sm font-semibold"
                />
              )}
              {weights.oracleBonus > 0 && (
                <StatItem
                  variant="default"
                  color="blue"
                  icon={<Award className="h-4 w-4" />}
                  label="Oracle Badge"
                  value={`+${weights.oracleBonus} pts`}
                  text_class="text-sm font-semibold"
                />
              )}
            </div>
          </div>
        )}
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
          {/* Header Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
            <CardHeader className="relative pb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                      {leaderboard.frequency}
                    </Badge>
                    <Badge
                      variant={
                        leaderboard.status === 'ACTIVE'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {leaderboard.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex-shrink-0">
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
                          variant="default"
                          className="bg-gradient-to-r from-green-500 to-emerald-600"
                          disabled
                        >
                          Reward Claimed
                        </Button>
                      );
                    } else if (isClaimable) {
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                onClick={handleClaim}
                                disabled={isClaiming}
                              >
                                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You ranked in the top 3! Claim your reward.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    } else if (leaderboard.isJoined) {
                      return (
                        <Button
                          variant="secondary"
                          className="w-full lg:w-auto"
                          disabled
                        >
                          Joined
                        </Button>
                      );
                    } else if (isPublished && !leaderboard.isJoined) {
                      return (
                        <Button
                          variant="secondary"
                          className="w-full lg:w-auto"
                          disabled
                        >
                          Participate Now
                        </Button>
                      );
                    } else {
                      return (
                        <Button
                          className="shadow-lg shadow-primary/20"
                          onClick={handleParticipate}
                        >
                          Participate Now
                        </Button>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="space-y-4">
                <CardTitle className="text-3xl lg:text-4xl font-bold tracking-tight">
                  {leaderboard.name}
                </CardTitle>
                {leaderboard.description && (
                  <CardDescription className="text-base lg:text-lg max-w-3xl">
                    {leaderboard.description}
                  </CardDescription>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(leaderboard.periodStart)} -{' '}
                    {formatDate(leaderboard.periodEnd)}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rankings */}
            <div className="lg:col-span-2">
              <LeaderboardTable
                data={leaderboard.rankings}
                rewardConfig={leaderboard.rewardConfig}
              />
            </div>

            {/* Sidebar */}
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
                  <Separator />
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
                    <CardDescription>How points are calculated</CardDescription>
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
