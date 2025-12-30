import React from 'react';
import { Calendar, Users, Trophy, Crown, Medal } from 'lucide-react';

import EmptyState from '../shared/EmptyState';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FullLeaderboard } from '@/types/leaderboard';
import StatusDot from '@/components/shared/StatusDot';

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
    return <EmptyState title="Open to all" className="h-4" />;
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

export function ContestCard({
  leaderboard,
  onParticipate,
}: {
  leaderboard: FullLeaderboard;
  onParticipate: (id: string) => void;
}) {
  const isCompleted = leaderboard.status === 'PUBLISHED';
  const isJoined = Boolean(leaderboard.isJoined);
  const statusForDot =
    leaderboard.status === 'PUBLISHED'
      ? 'COMPLETED'
      : leaderboard.status === 'SCHEDULED'
        ? 'PENDING'
        : leaderboard.status;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border transition-all duration-300 hover:shadow-md">
      <CardHeader className="relative pb-4">
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"></div>

            <CardTitle className="flex items-start gap-2 text-lg leading-snug">
              <span className="min-w-0 truncate">{leaderboard.name}</span>
            </CardTitle>
          </div>

          <div className="flex items-center pt-1">
            <StatusDot status={statusForDot} size="md" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        {/* Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDateRange(leaderboard.periodStart, leaderboard.periodEnd)}
            </span>
          </div>
        </div>

        {isJoined && !isCompleted && (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/10"
          >
            Joined
          </Badge>
        )}
        {leaderboard.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {leaderboard.description}
          </CardDescription>
        )}

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
          <div className="rounded-lg border bg-muted/20 p-3">
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
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {icons[idx]}
                      <span className="min-w-0 truncate">{reward.title}</span>
                    </div>
                    <span className="shrink-0 font-semibold">
                      ${reward.baseAmount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-end">
        {/* Participate Button */}
        <Button
          className="w-full"
          variant={isJoined || isCompleted ? 'outline' : 'default'}
          onClick={() => onParticipate(leaderboard._id)}
        >
          {isCompleted
            ? 'View Leaderboard'
            : isJoined
              ? 'View Details'
              : 'Participate Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
