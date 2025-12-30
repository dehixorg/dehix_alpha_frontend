import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Clock,
  Calendar,
  ChevronRight,
  Dot,
  Bookmark,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TalentMarketItem {
  _id: string;
  businessId: string;
  skillId?: string;
  skillName?: string;
  talentId?: string;
  talentName?: string;
  domainId?: string;
  domainName?: string;
  description?: string;
  experience?: string;
  status?: string;
  visible?: boolean;
  bookmarked?: boolean;
  freelancerRequired?: number;
  freelancerInLobby?: Array<any>;
  freelancerInvited?: Array<any>;
  freelancerSelected?: Array<any>;
  freelancerRejected?: Array<any>;
  createdAt?: string;
  updatedAt?: string;
  freelancers?: Array<{
    _id: string;
    freelancerId: string;
    freelancer_professional_profile_id?: string;
    status: string;
    cover_letter?: string;
    interview_ids?: string[];
    updatedAt?: string;
  }>;
}

interface Props {
  item: TalentMarketItem;
  onNotInterested: () => void;
  onApply: (item: TalentMarketItem) => void;
  onToggleBookmark?: (
    item: TalentMarketItem,
    next: boolean,
  ) => void | Promise<void>;
}

// Outline-style status classes mapping
const getOutlineStatusClasses = (status?: string) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'added':
    case 'active':
      return 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-400/40 dark:text-blue-300 dark:bg-blue-950/30';
    case 'pending':
    case 'on going':
    case 'ongoing':
      return 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-400/40 dark:text-amber-300 dark:bg-amber-950/30';
    case 'completed':
    case 'selected':
      return 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-400/40 dark:text-emerald-300 dark:bg-emerald-950/30';
    case 'rejected':
      return 'border-red-300 text-red-700 bg-red-50 dark:border-red-400/40 dark:text-red-300 dark:bg-red-950/30';
    case 'invited':
      return 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-400/40 dark:text-purple-300 dark:bg-purple-950/30';
    case 'applied':
      return 'border-sky-300 text-sky-700 bg-sky-50 dark:border-sky-400/40 dark:text-sky-300 dark:bg-sky-950/30';
    default:
      return 'border-gray-300 text-gray-700 bg-gray-50 dark:border-gray-400/40 dark:text-gray-300 dark:bg-gray-950/30';
  }
};

const TalentMarketCard: React.FC<Props> = ({
  item,
  onNotInterested,
  onApply,
  onToggleBookmark,
}) => {
  const title =
    item.skillName || item.domainName || item.talentName || 'Opportunity';
  const [bookmarked, setBookmarked] = useState<boolean>(!!item.bookmarked);

  React.useEffect(() => {
    setBookmarked(!!item.bookmarked);
  }, [item.bookmarked]);

  const created = item.createdAt
    ? (() => {
        const date = new Date(item.createdAt);
        return isNaN(date.getTime())
          ? 'Recently'
          : formatDistanceToNow(date, { addSuffix: true });
      })()
    : 'Recently';
  const updated = item.updatedAt
    ? (() => {
        const date = new Date(item.updatedAt);
        return isNaN(date.getTime())
          ? undefined
          : formatDistanceToNow(date, { addSuffix: true });
      })()
    : undefined;

  return (
    <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20">
      <CardHeader className="pb-2 px-6 pt-6">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className={cn(
              'h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors',
              bookmarked
                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800',
            )}
            onClick={async (e) => {
              e.stopPropagation();
              const next = !bookmarked;
              setBookmarked(next);
              try {
                await onToggleBookmark?.(item, next);
              } catch (err) {
                // revert on error
                setBookmarked(!next);
              }
            }}
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
          </button>
          {item.status && (
            <Badge
              variant="outline"
              className={cn(getOutlineStatusClasses(item.status))}
            >
              {String(item.status).toUpperCase()}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {item.domainName && (
            <span className="font-medium text-primary dark:text-primary-300">
              {item.domainName}
            </span>
          )}
          {item.domainName && (item.experience || item.status) && (
            <Dot className="text-muted-foreground" />
          )}
          {item.experience && <span>{item.experience}+ yrs experience</span>}
        </div>

        {item.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-1">
            {item.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="px-6 py-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {item.experience && (
            <Badge variant="secondary">Exp: {item.experience}+ yrs</Badge>
          )}
          {typeof item.freelancerRequired === 'number' && (
            <Badge variant="secondary">
              Required: {item.freelancerRequired}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Positions
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.freelancerRequired ?? 1}{' '}
                  {item.freelancerRequired === 1 ? 'Position' : 'Positions'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Posted
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {created}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {updated || 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <div className="text-sm text-muted-foreground">
            {updated && (
              <span className="hidden sm:inline-flex items-center ml-2">
                Updated {updated}
              </span>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onNotInterested}>
              Not Interested
            </Button>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={() => onApply(item)}
            >
              <span>Apply Now</span>
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TalentMarketCard;
