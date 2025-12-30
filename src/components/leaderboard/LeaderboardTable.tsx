import React from 'react';
import {
  Award,
  Crown,
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import EmptyState from '../shared/EmptyState';

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
import { Separator } from '@/components/ui/separator';
import { LeaderboardEntry, IRewardConfig } from '@/types/leaderboard';

export function LeaderboardTable({
  data,
  rewardConfig,
}: {
  data: LeaderboardEntry[];
  rewardConfig: IRewardConfig[];
}) {
  const allEntries = data;

  const getTierMeta = (rank: number) => {
    if (rank === 1)
      return {
        title: 'Gold Champion',
        Icon: Crown,
        badgeClass:
          'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-amber-500/20',
        iconWrapClass:
          'bg-gradient-to-r from-yellow-400 to-amber-500 dark:text-muted text-white/80',
      };
    if (rank === 2)
      return {
        title: 'Silver Runner-up',
        Icon: Trophy,
        badgeClass:
          'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-slate-500/20',
        iconWrapClass:
          'bg-gradient-to-r from-gray-300 to-gray-400 dark:text-muted text-white/80',
      };
    if (rank === 3)
      return {
        title: 'Bronze Achiever',
        Icon: Medal,
        badgeClass:
          'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-rose-500/20',
        iconWrapClass:
          'bg-gradient-to-r from-orange-400 to-orange-600 dark:text-muted text-white/80',
      };
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    const tier = getTierMeta(rank);
    if (tier) {
      const Icon = tier.Icon;
      return (
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${tier.iconWrapClass}`}
            title={tier.title}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            {tier.title.split(' ')[0]}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
        {rank}
      </div>
    );
  };

  const getRankClassName = (rank: number) => {
    if (rank <= 3) return 'font-bold text-primary';
    if (rank <= 10) return 'font-semibold text-foreground';
    return 'font-medium text-muted-foreground';
  };

  const getRewardBadge = (rank: number, reward?: { amount: number }) => {
    if (!reward)
      return <span className="text-sm text-muted-foreground">-</span>;

    const variants = {
      1: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-amber-500/20',
      2: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-500/20',
      3: 'bg-gradient-to-r from-rose-400 to-orange-500 text-white shadow-rose-500/20',
    };

    return (
      <Badge
        className={`${variants[rank as 1 | 2 | 3] || 'bg-muted text-muted-foreground'} font-semibold px-2.5 py-0.5 text-xs shadow-sm`}
      >
        {reward.amount} connects
      </Badge>
    );
  };

  const getTierBadge = (rank: number) => {
    const tier = getTierMeta(rank);
    if (!tier) return <span className="text-sm text-muted-foreground">-</span>;
    const Icon = tier.Icon;
    return (
      <Badge
        className={`${tier.badgeClass} font-semibold px-2.5 py-0.5 text-xs shadow-sm border-0 inline-flex items-center gap-1.5`}
      >
        <Icon className="h-3.5 w-3.5" />
        {tier.title}
      </Badge>
    );
  };
  const router = useRouter();

  if (!allEntries || allEntries.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5 text-primary" />
              Rankings
            </CardTitle>
            <CardDescription>Current standings and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No participants yet"
              description="Be the first to join this leaderboard and start climbing the ranks!"
              icon={<Trophy className="h-12 w-12 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        {/* Rewards Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-amber-500" />
              Prize Pool
            </CardTitle>
            <CardDescription>Top 3 rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {rewardConfig.slice(0, 3).map((reward, index) => {
                const rank = index + 1;
                const icons = [Crown, Trophy, Medal];
                const Icon = icons[index];
                const gradients = [
                  'from-yellow-400/10 to-amber-500/10 border-yellow-500/20',
                  'from-gray-300/10 to-gray-400/10 border-gray-400/20',
                  'from-orange-400/10 to-orange-600/10 border-orange-500/20',
                ];
                const badgeGradients = [
                  'from-yellow-400 to-amber-500',
                  'from-gray-300 to-gray-400',
                  'from-orange-400 to-orange-600',
                ];

                return (
                  <div
                    key={rank}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r ${gradients[index]}`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${badgeGradients[index]} dark:text-muted text-white/80`}
                    >
                      <Icon className="h-5 w-5 dark:text-muted text-white/80" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {reward.title ||
                          `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'} Place`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rank === 1
                          ? 'Top Performer'
                          : rank === 2
                            ? 'Runner Up'
                            : 'Third Place'}
                      </p>
                    </div>
                    <Badge
                      className={`bg-gradient-to-r ${badgeGradients[index]} dark:text-muted text-white/80 font-semibold border-0`}
                    >
                      {reward.baseAmount} connects
                    </Badge>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                How to Win
              </h4>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>Complete projects successfully</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-primary" />
                  <span>Maintain high client ratings</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>Deliver on time and exceed expectations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rewards Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-amber-500" />
            Prize Pool
          </CardTitle>
          <CardDescription>Top 3 rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {rewardConfig.slice(0, 3).map((reward, index) => {
              const rank = index + 1;
              const icons = [Crown, Trophy, Medal];
              const Icon = icons[index];
              const gradients = [
                'from-yellow-400/10 to-amber-500/10 border-yellow-500/20',
                'from-gray-300/10 to-gray-400/10 border-gray-400/20',
                'from-orange-400/10 to-orange-600/10 border-orange-500/20',
              ];
              const badgeGradients = [
                'from-yellow-400 to-amber-500',
                'from-gray-300 to-gray-400',
                'from-orange-400 to-orange-600',
              ];

              return (
                <div
                  key={rank}
                  className={`flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r ${gradients[index]}`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${badgeGradients[index]} text-white`}
                  >
                    <Icon className="h-5 w-5 dark:text-muted text-white/80" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {reward.title ||
                        `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'} Place`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rank === 1
                        ? 'Top Performer'
                        : rank === 2
                          ? 'Runner Up'
                          : 'Third Place'}
                    </p>
                  </div>
                  <Badge
                    className={`bg-gradient-to-r ${badgeGradients[index]} dark:text-muted text-white/80 font-semibold border-0`}
                  >
                    {reward.baseAmount} connects
                  </Badge>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              How to Win
            </h4>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                <span>Complete projects successfully</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3 w-3 text-primary" />
                <span>Maintain high client ratings</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span>Deliver on time and exceed expectations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Leaderboard Table */}
      <ScrollArea className="rounded-xl border">
        <Table>
          <TableHeader className="sticky top-0 bg-gradient">
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Badge</TableHead>
              <TableHead className="text-center">Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="card">
            {allEntries.map((entry) => (
              <TableRow
                key={entry.freelancerId}
                className="hover:bg-accent/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                </TableCell>
                <TableCell
                  onClick={() => {
                    router.push(`/freelancer-profile/${entry.freelancerId}`);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={entry.profilePic} alt={entry.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-sm">
                        {getInitials(entry.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p
                        className={`font-medium truncate ${getRankClassName(entry.rank)}`}
                      >
                        {entry.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold">
                    {entry.score.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {getTierBadge(entry.rank)}
                </TableCell>
                <TableCell className="text-center">
                  {getRewardBadge(entry.rank, entry.reward)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
