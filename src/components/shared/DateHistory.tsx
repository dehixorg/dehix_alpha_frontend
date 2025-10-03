import React from 'react';
import { Calendar } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';

export interface DateHistoryProps {
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  className?: string;
}

const formatDate = (date?: Date | null) => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return '';
  }
};

export const DateHistory: React.FC<DateHistoryProps> = ({
  startDate,
  endDate,
  className = '',
}) => {
  return (
    <div className={`rounded-md border bg-muted/20 px-3 py-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4" />
        {startDate ? (
          <div className="flex items-center gap-2 flex-wrap w-full">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded">
              {formatDate(startDate)}
            </Badge>
            {/* Dashed connector */}
            <div className="flex-1 h-0 border-t-2 border-dashed border-muted-foreground/40 mx-1" />
            {endDate ? (
              <>
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 rounded"
                >
                  {formatDate(endDate)}
                </Badge>
              </>
            ) : (
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 rounded ${statusOutlineClasses('ACTIVE')}`}
              >
                Ongoing
              </Badge>
            )}
          </div>
        ) : (
          <span>No dates specified</span>
        )}
      </div>
    </div>
  );
};

export default DateHistory;
