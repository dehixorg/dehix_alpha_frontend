import React from 'react';
import { Calendar, Users, Trophy, Award, Crown, Medal } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FullLeaderboard } from '@/types/leaderboard';

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

export function ContestCard({
  leaderboard,
  onParticipate,
}: {
  leaderboard: FullLeaderboard;
  onParticipate: (id: string) => void;
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
        <Button
          className="w-full"
          variant={
            leaderboard.isJoined || leaderboard.status === 'PUBLISHED'
              ? 'outline'
              : 'default'
          }
          onClick={() => onParticipate(leaderboard._id)}
        >
          {leaderboard.status === 'PUBLISHED'
            ? 'View Leaderboard'
            : leaderboard.isJoined
              ? 'View Details'
              : 'Participate Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
