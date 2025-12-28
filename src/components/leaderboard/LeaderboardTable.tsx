import React from 'react';
import { Award, Crown, Trophy, Medal } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { LeaderboardEntry, IRewardConfig } from '@/types/leaderboard';

export function LeaderboardTable({
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
