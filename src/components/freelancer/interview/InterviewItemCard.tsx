'use client';

import React from 'react';
import { Calendar, ExternalLink, User2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type InterviewItemCardItem = {
  _id: string;
  interviewType?: string;
  interviewStatus?: string;
  talentType?: string;
  talentId?: string;
  name?: string;
  talentName?: string;
  interviewDate?: string;
  description?: string;
  meetingLink?: string;
};

type InterviewItemCardProps = {
  item: InterviewItemCardItem;
  hideIds?: boolean;
  className?: string;
};

export default function InterviewItemCard({
  item,
  hideIds = false,
  className,
}: InterviewItemCardProps) {
  const getStatusPillClassName = (statusRaw: string) => {
    const status = String(statusRaw || '')
      .toUpperCase()
      .trim();
    const base =
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none';

    if (status === 'APPROVED' || status === 'COMPLETED')
      return `${base} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300`;
    if (status === 'PENDING' || status === 'APPLIED')
      return `${base} border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300`;
    if (status === 'REJECTED' || status === 'CANCELLED')
      return `${base} border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300`;

    return `${base} border-border bg-muted/40 text-muted-foreground`;
  };

  const interviewDate = item?.interviewDate
    ? new Date(item.interviewDate)
    : undefined;

  const meetingLink = String(item?.meetingLink || '').trim();
  const talentName = String(item?.name || item?.talentName || '').trim();
  const talentTypeLabel = String(item?.talentType || '-').toUpperCase();
  const statusLabel = String(item?.interviewStatus || '-').toUpperCase();
  const typeLabel = String(item?.interviewType || 'INTERVIEW').toUpperCase();

  const talentDetails = hideIds
    ? `${talentName ? talentName : '-'}`
    : `${item?.talentId || '-'}${talentName ? ` (${talentName})` : ''}`;

  const dateLabel =
    interviewDate && !Number.isNaN(interviewDate.getTime())
      ? interviewDate.toLocaleString()
      : '-';

  return (
    <Card
      className={`group overflow-hidden border bg-card/60 transition-shadow hover:shadow-sm${className ? ` ${className}` : ''}`}
    >
      <CardHeader className="gap-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base font-semibold tracking-tight">
                {typeLabel}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {meetingLink ? 'Meeting link available' : 'No meeting link'}
              </CardDescription>
            </div>
          </div>

          <div className={getStatusPillClassName(statusLabel)}>
            {statusLabel}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-2 rounded-lg border bg-background/60 p-3">
          <div className="flex items-start gap-2 text-sm">
            <User2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Talent
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <div className="min-w-0 truncate font-medium">
                  {talentDetails}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {talentTypeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Date
              </div>
              <div className="truncate">{dateLabel}</div>
            </div>
          </div>
        </div>

        {item?.description ? (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </div>
        ) : null}

        {meetingLink ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={() =>
              window.open(meetingLink, '_blank', 'noopener,noreferrer')
            }
          >
            Open meeting
            <ExternalLink className="h-4 w-4" />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
