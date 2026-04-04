'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, User2, CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

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
  interviewerCompletionConfirmed?: boolean;
  intervieweeCompletionConfirmed?: boolean;
};

type InterviewItemCardProps = {
  item: InterviewItemCardItem;
  hideIds?: boolean;
  className?: string;
  role?: 'interviewer' | 'interviewee';
  onCompletionConfirmed?: () => void;
};

export default function InterviewItemCard({
  item,
  hideIds = false,
  className,
  role,
  onCompletionConfirmed,
}: InterviewItemCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [localInterviewerConfirmed, setLocalInterviewerConfirmed] = useState(
    item?.interviewerCompletionConfirmed ?? false,
  );
  const [localIntervieweeConfirmed, setLocalIntervieweeConfirmed] = useState(
    item?.intervieweeCompletionConfirmed ?? false,
  );

  // Sync local state when props change (e.g. after refetch/refresh)
  useEffect(() => {
    setLocalInterviewerConfirmed(item?.interviewerCompletionConfirmed ?? false);
  }, [item?.interviewerCompletionConfirmed]);

  useEffect(() => {
    setLocalIntervieweeConfirmed(item?.intervieweeCompletionConfirmed ?? false);
  }, [item?.intervieweeCompletionConfirmed]);

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
    ? talentName
      ? talentName
      : '-'
    : talentName || item?.talentId || '-';

  const dateLabel =
    interviewDate && !Number.isNaN(interviewDate.getTime())
      ? interviewDate.toLocaleString()
      : '-';

  const isScheduled = statusLabel === 'SCHEDULED';
  const bothConfirmed = localInterviewerConfirmed && localIntervieweeConfirmed;

  // Show meeting link only if scheduled and not both confirmed
  const showMeetingButton = meetingLink && isScheduled && !bothConfirmed;

  // For interviewer: show confirmation prompt after clicking "Open meeting"
  // For interviewee: show confirmation prompt if interviewer has confirmed but interviewee hasn't
  const showIntervieweeConfirmation =
    role === 'interviewee' &&
    localInterviewerConfirmed &&
    !localIntervieweeConfirmed &&
    isScheduled;

  const handleOpenMeeting = () => {
    window.open(meetingLink, '_blank', 'noopener,noreferrer');
    // For interviewer: show the completion dialog after opening meeting
    if (role === 'interviewer' && !localInterviewerConfirmed) {
      setTimeout(() => setShowConfirmDialog(true), 500);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!role || !item._id) return;
    setConfirming(true);
    try {
      await axiosInstance.put(`/interview/${item._id}/confirm-completion`, {
        role,
      });

      if (role === 'interviewer') {
        setLocalInterviewerConfirmed(true);
        notifySuccess(
          'Thank you for confirming! The interviewee will now be asked to confirm.',
          'Completion Confirmed',
        );
      } else {
        setLocalIntervieweeConfirmed(true);
        notifySuccess(
          'Interview marked as completed. The interviewer can now submit their review.',
          'Interview Completed',
        );
      }

      setShowConfirmDialog(false);
      onCompletionConfirmed?.();
    } catch (error: any) {
      console.error('Error confirming completion:', error);
      notifyError(
        error?.response?.data?.message ||
          'Failed to confirm completion. Please try again.',
        'Error',
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
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
                  {bothConfirmed
                    ? 'Interview completed'
                    : meetingLink
                      ? 'Meeting link available'
                      : 'No meeting link'}
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

          {/* Completion status indicators */}
          {isScheduled &&
            (localInterviewerConfirmed || localIntervieweeConfirmed) && (
              <div className="space-y-1">
                {localInterviewerConfirmed && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Interviewer confirmed completion</span>
                  </div>
                )}
                {localIntervieweeConfirmed && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Interviewee confirmed completion</span>
                  </div>
                )}
              </div>
            )}

          {/* Open meeting button (for interviewer, triggers confirmation after) */}
          {showMeetingButton ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={handleOpenMeeting}
            >
              Open meeting
              <ExternalLink className="h-4 w-4" />
            </Button>
          ) : null}

          {/* For interviewee: show confirm completion button when interviewer has confirmed */}
          {showIntervieweeConfirmation ? (
            <div className="space-y-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                The interviewer has confirmed this interview is complete. Do you
                confirm?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={confirming}
                >
                  {confirming ? 'Confirming...' : 'Yes, confirm'}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interview Completion</DialogTitle>
            <DialogDescription>
              {role === 'interviewer'
                ? 'Has this interview been completed? Once you confirm, the interviewee will be asked to confirm as well.'
                : 'The interviewer has confirmed this interview is complete. Do you confirm that the interview has been completed?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={confirming}
            >
              No
            </Button>
            <Button onClick={handleConfirmCompletion} disabled={confirming}>
              {confirming ? 'Confirming...' : 'Yes, completed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
