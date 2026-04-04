'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Calendar,
  Clock,
  User,
  RefreshCw,
  ClipboardCheck,
} from 'lucide-react';

import ReviewDialog from './ReviewDialog';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';

interface SubmitResultInterview {
  _id: string;
  intervieweeId?: string;
  interviewDate?: string;
  talentType?: string;
  talentName?: string;
  talentId?: string;
  interviewType?: string;
  description?: string;
  interviewee?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    profilePic?: string;
  };
}

const SubmitResult: React.FC = () => {
  const [interviews, setInterviews] = useState<SubmitResultInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] =
    useState<SubmitResultInterview | null>(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        '/interview/interviewer/pending-review',
      );
      const data = res?.data?.data;
      setInterviews(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Error fetching interviews:', error);
        notifyError(
          'Failed to load interviews. Please try again.',
          'Error',
        );
      }
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleOpenReview = (interview: SubmitResultInterview) => {
    setSelectedInterview(interview);
    setReviewDialogOpen(true);
  };

  const handleReviewSubmitted = () => {
    // Remove the reviewed interview from the list
    if (selectedInterview) {
      setInterviews((prev) =>
        prev.filter((i) => i._id !== selectedInterview._id),
      );
    }
    setSelectedInterview(null);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: '-', time: '-' };
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return { date: '-', time: '-' };
    return {
      date: d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading interviews...
          </p>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No pending reviews
        </h3>
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
          All completed interviews have been reviewed. New interviews will
          appear here once they are completed.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInterviews}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Submit Results</h2>
          <p className="text-sm text-muted-foreground">
            Review interviewees from completed interviews ({interviews.length}{' '}
            pending)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInterviews}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interviews.map((interview) => {
          const { date, time } = formatDateTime(interview.interviewDate);
          const intervieweeName = interview.interviewee
            ? `${interview.interviewee.firstName || ''} ${interview.interviewee.lastName || ''}`.trim()
            : 'Unknown';

          return (
            <Card
              key={interview._id}
              className="border-l-4 border-l-amber-400 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 space-y-3">
                {/* Talent info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      {interview.talentName || 'Unknown talent'}
                    </h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {String(
                        interview.talentType || interview.interviewType || '',
                      ).toUpperCase()}
                    </Badge>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  >
                    Pending
                  </Badge>
                </div>

                {/* Interviewee info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{intervieweeName}</span>
                  {interview.interviewee?.userName && (
                    <span className="text-xs">
                      (@{interview.interviewee.userName})
                    </span>
                  )}
                </div>

                {/* Date/Time */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{time}</span>
                  </div>
                </div>

                {/* Description */}
                {interview.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {interview.description}
                  </p>
                )}

                {/* Review Button */}
                <Button
                  className="w-full mt-2"
                  onClick={() => handleOpenReview(interview)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Give Review
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Review Dialog */}
      {selectedInterview && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          interviewId={selectedInterview._id}
          talentName={selectedInterview.talentName}
          intervieweeName={
            selectedInterview.interviewee
              ? `${selectedInterview.interviewee.firstName || ''} ${selectedInterview.interviewee.lastName || ''}`.trim()
              : undefined
          }
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default SubmitResult;
