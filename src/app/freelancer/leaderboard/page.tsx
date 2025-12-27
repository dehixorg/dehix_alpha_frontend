'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  Award,
  Star,
  ArrowLeft,
  Calendar,
  Users,
} from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

// Types
interface LeaderboardEntry {
  rank: number;
  freelancerId: string;
  name: string;
  profilePic: string;
  score: number;
  reward?: { amount: number; title: string };
}

interface IRewardConfig {
  rank: number;
  title: string;
  baseAmount: number;
}

interface FullLeaderboard {
  _id: string;
  name: string;
  description?: string;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  periodStart: string;
  periodEnd: string;
  status: string;
  eligibility: {
    badgesAllowed: string[];
    levelsAllowed: string[];
  };
  rewardConfig: IRewardConfig[];
  rankings: LeaderboardEntry[];
}

interface LeaderboardData {
  monthly: FullLeaderboard | null;
  biweekly: FullLeaderboard | null;
  weekly: FullLeaderboard | null;
}

// Helper Functions
function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
}

function getEligibilitySummary(eligibility: {
  badgesAllowed: string[];
  levelsAllowed: string[];
}): JSX.Element | string {
  const hasBadges =
    eligibility.badgesAllowed && eligibility.badgesAllowed.length > 0;
  const hasLevels =
    eligibility.levelsAllowed && eligibility.levelsAllowed.length > 0;

  if (!hasBadges && !hasLevels) {
    return 'Open to all freelancers';
  }

  return (
    <div className="flex flex-wrap gap-1">
      {eligibility.badgesAllowed?.map((badge, idx) => (
        <Badge key={`badge-${idx}`} variant="secondary" className="text-xs">
          {badge}
        </Badge>
      ))}
      {eligibility.levelsAllowed?.map((level, idx) => (
        <Badge key={`level-${idx}`} variant="secondary" className="text-xs">
          {level}
        </Badge>
      ))}
    </div>
  );
}

// Skeleton Loaders
function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Table Skeleton */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24 ml-auto" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Skeleton */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
          <div className="pt-4 border-t">
            <Skeleton className="h-4 w-24 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center">
          <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Contests</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No active contests at the moment. Check back soon!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Contest Card Component
function ContestCard({
  leaderboard,
  onParticipate,
}: {
  leaderboard: FullLeaderboard;
  onParticipate: (leaderboard: FullLeaderboard) => void;
}) {
  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY':
        return <Award className="h-5 w-5" />;
      case 'BIWEEKLY':
        return <Calendar className="h-5 w-5" />;
      case 'MONTHLY':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY':
        return 'from-blue-400 to-blue-600';
      case 'BIWEEKLY':
        return 'from-purple-400 to-purple-600';
      case 'MONTHLY':
        return 'from-yellow-400 to-orange-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge
            className={`bg-gradient-to-r ${getFrequencyColor(leaderboard.frequency)} text-white`}
          >
            {leaderboard.frequency}
          </Badge>
          <Badge variant="outline">{leaderboard.status}</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          {getFrequencyIcon(leaderboard.frequency)}
          {leaderboard.name}
        </CardTitle>
        {leaderboard.description && (
          <CardDescription className="text-sm mt-1">
            {leaderboard.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDateRange(leaderboard.periodStart, leaderboard.periodEnd)}
          </span>
        </div>

        {/* Eligibility */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Users className="h-3 w-3" />
            Eligibility
          </p>
          <div className="text-sm">
            {getEligibilitySummary(leaderboard.eligibility)}
          </div>
        </div>

        {/* Rewards Preview */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Top Rewards
          </p>
          <div className="space-y-2">
            {leaderboard.rewardConfig.slice(0, 3).map((reward, idx) => {
              const icons = [
                <Crown key="crown" className="h-4 w-4 text-yellow-500" />,
                <Trophy key="trophy" className="h-4 w-4 text-gray-400" />,
                <Medal key="medal" className="h-4 w-4 text-orange-500" />,
              ];
              return (
                <div
                  key={reward.rank}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    {icons[idx]}
                    <span>{reward.title}</span>
                  </div>
                  <span className="font-semibold">${reward.baseAmount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Participate Button */}
        <Button className="w-full" onClick={() => onParticipate(leaderboard)}>
          Participate Now
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper function to get reward title based on rank
function getRewardTitle(rank: number): string {
  if (rank === 1) return '1st Place';
  if (rank === 2) return '2nd Place';
  if (rank === 3) return '3rd Place';
  return `${rank}th Place`;
}

// Leaderboard Table Component
function LeaderboardTable({
  data,
  rewardConfig,
}: {
  data: LeaderboardEntry[];
  rewardConfig: IRewardConfig[];
}) {
  const allEntries = data;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Crown className="h-6 w-6 text-yellow-500 inline-block" />;
    if (rank === 2)
      return <Trophy className="h-6 w-6 text-gray-400 inline-block" />;
    if (rank === 3)
      return <Medal className="h-6 w-6 text-orange-500 inline-block" />;
    return null;
  };

  const getRankClassName = (rank: number) => {
    if (rank <= 3)
      return 'text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent';
    if (rank <= 10) return 'text-xl font-bold text-primary';
    return 'text-lg font-semibold text-muted-foreground';
  };

  const getRewardBadge = (rank: number, reward?: { amount: number }) => {
    if (!reward)
      return <span className="text-sm text-muted-foreground">-</span>;

    const variants = {
      1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
      2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
      3: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
    };

    return (
      <Badge
        className={`${variants[rank as 1 | 2 | 3]} font-bold px-3 py-1 text-sm`}
      >
        ${reward.amount}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Leaderboard Table */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEntries.map((entry) => (
                  <TableRow
                    key={entry.freelancerId}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className={getRankClassName(entry.rank)}>
                          {entry.rank}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={entry.profilePic}
                            alt={entry.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                            {getInitials(entry.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.freelancerId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-semibold">
                        {entry.score.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {getRewardBadge(entry.rank, entry.reward)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Rewards Information Card */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-500/20">
              <Crown className="h-6 w-6 text-yellow-500" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {rewardConfig[0]?.title || '1st Place'}
                </p>
                <p className="text-xs text-muted-foreground">Top Performer</p>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold">
                ${rewardConfig[0]?.baseAmount || 0}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-300/10 to-gray-500/10 border border-gray-400/20">
              <Trophy className="h-6 w-6 text-gray-400" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {rewardConfig[1]?.title || '2nd Place'}
                </p>
                <p className="text-xs text-muted-foreground">Runner Up</p>
              </div>
              <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white font-bold">
                ${rewardConfig[1]?.baseAmount || 0}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-400/10 to-orange-600/10 border border-orange-500/20">
              <Medal className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {rewardConfig[2]?.title || '3rd Place'}
                </p>
                <p className="text-xs text-muted-foreground">Third Place</p>
              </div>
              <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold">
                ${rewardConfig[2]?.baseAmount || 0}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3 text-sm">How to Win?</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete projects successfully to earn points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Maintain high client ratings and reviews</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Deliver work on time and exceed expectations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Stay active and responsive to opportunities</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Leaderboard Page Component
export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    monthly: null,
    biweekly: null,
    weekly: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] =
    useState<FullLeaderboard | null>(null);

  // Load data on mount
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/leaderboard/current');
      const data = response.data.data;

      // Map API response to frontend types
      const mapLeaderboard = (leaderboard: any): FullLeaderboard | null => {
        if (!leaderboard) return null;

        const rankings = (leaderboard.rankings || [])
          .slice(0, 50)
          .map((r: any) => {
            const rewardConfigEntry = leaderboard.rewardConfig?.find(
              (rc: any) => rc.rank === r.rank,
            );
            const rewardTitle =
              rewardConfigEntry?.title || getRewardTitle(r.rank);

            return {
              rank: r.rank,
              freelancerId:
                typeof r.freelancerId === 'string'
                  ? r.freelancerId
                  : r.freelancerId?._id || '',
              name: r.name,
              profilePic: r.profilePic || '',
              score: r.score,
              reward: r.reward
                ? { amount: r.reward.baseAmount, title: rewardTitle }
                : rewardConfigEntry
                  ? { amount: rewardConfigEntry.baseAmount, title: rewardTitle }
                  : undefined,
            };
          });

        return {
          _id: leaderboard._id,
          name: leaderboard.name,
          description: leaderboard.description,
          frequency: leaderboard.frequency,
          periodStart: leaderboard.periodStart,
          periodEnd: leaderboard.periodEnd,
          status: leaderboard.status,
          eligibility: leaderboard.eligibility || {
            badgesAllowed: [],
            levelsAllowed: [],
          },
          rewardConfig: leaderboard.rewardConfig || [],
          rankings,
        };
      };

      setLeaderboardData({
        monthly: mapLeaderboard(data.monthly),
        biweekly: mapLeaderboard(data.biweekly),
        weekly: mapLeaderboard(data.weekly),
      });
    } catch (err: any) {
      console.error('Error loading leaderboard:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load leaderboard';
      setError(errorMessage);
      notifyError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get contest for current tab
  const getCurrentContest = (): FullLeaderboard | null => {
    const contest = leaderboardData[activeTab as keyof LeaderboardData];
    return contest && contest.rankings.length > 0 ? contest : null;
  };

  const currentContest = getCurrentContest();

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
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Freelancer Leaderboard</h1>
                  <p className="text-gray-400 mt-2">
                    Join active contests and compete for rewards
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Contest Grid or Selected Contest Table */}
          {selectedContest ? (
            // Selected Contest View
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="outline"
                onClick={() => setSelectedContest(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Contests
              </Button>

              {/* Contest Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedContest.name}</h2>
                  {selectedContest.description && (
                    <p className="text-muted-foreground mt-1">
                      {selectedContest.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-600 text-white">
                      {selectedContest.frequency}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDateRange(
                        selectedContest.periodStart,
                        selectedContest.periodEnd,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <LeaderboardTable
                data={selectedContest.rankings}
                rewardConfig={selectedContest.rewardConfig}
              />
            </div>
          ) : (
            // Contest Grid View with Tabs
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
                <TabsTrigger value="monthly" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="biweekly" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Bi-weekly
                </TabsTrigger>
                <TabsTrigger value="weekly" className="gap-2">
                  <Award className="h-4 w-4" />
                  Weekly
                </TabsTrigger>
              </TabsList>

              {/* Monthly Tab */}
              <TabsContent value="monthly">
                {isLoading ? (
                  <CardGridSkeleton />
                ) : error ? (
                  <Card>
                    <CardContent className="py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Trophy className="h-16 w-16 text-destructive/50 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Error Loading Data
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          {error}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : !currentContest ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ContestCard
                      leaderboard={currentContest}
                      onParticipate={setSelectedContest}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Biweekly Tab */}
              <TabsContent value="biweekly">
                {isLoading ? (
                  <CardGridSkeleton />
                ) : error ? (
                  <Card>
                    <CardContent className="py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Trophy className="h-16 w-16 text-destructive/50 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Error Loading Data
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          {error}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : !currentContest ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ContestCard
                      leaderboard={currentContest}
                      onParticipate={setSelectedContest}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Weekly Tab */}
              <TabsContent value="weekly">
                {isLoading ? (
                  <CardGridSkeleton />
                ) : error ? (
                  <Card>
                    <CardContent className="py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Trophy className="h-16 w-16 text-destructive/50 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          Error Loading Data
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          {error}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : !currentContest ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ContestCard
                      leaderboard={currentContest}
                      onParticipate={setSelectedContest}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}
