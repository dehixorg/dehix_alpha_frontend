'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string;
  talentName?: string;
  intervieweeName?: string;
  onReviewSubmitted: (result: { verified: boolean; rating: number }) => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  open,
  onOpenChange,
  interviewId,
  talentName,
  intervieweeName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      notifyError('Please select a rating.', 'Error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.put(`/interview/${interviewId}/review`, {
        rating,
        feedback: feedback.trim() || undefined,
      });

      const result = res?.data?.data;
      const verified = result?.verified === true;

      if (verified) {
        notifySuccess(
          `Great news! ${intervieweeName ? `${intervieweeName}'s` : "The interviewee's"} ${talentName || 'skill'} has been verified successfully! 🎉`,
          'Skill Verified',
        );
      } else {
        notifySuccess(
          `Review submitted. ${intervieweeName ? `${intervieweeName}` : 'The interviewee'} has been notified that they need to improve their knowledge of ${talentName || 'this skill'}. They can try again in the future.`,
          'Review Submitted',
        );
      }

      onReviewSubmitted({ verified, rating });
      onOpenChange(false);
      setRating(0);
      setHoveredRating(0);
      setFeedback('');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      notifyError(
        error?.response?.data?.message ||
          'Failed to submit review. Please try again.',
        'Error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1:
        return 'Poor';
      case 2:
        return 'Below Average';
      case 3:
        return 'Average';
      case 4:
        return 'Good';
      case 5:
        return 'Excellent';
      default:
        return 'Select a rating';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Rate Interview Performance
          </DialogTitle>
          <DialogDescription>
            Rate{' '}
            <span className="font-medium text-foreground">
              {intervieweeName || 'the interviewee'}
            </span>{' '}
            for their{' '}
            <span className="font-medium text-foreground">
              {talentName || 'skill'}
            </span>{' '}
            interview.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={submitting}
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-transparent text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {getRatingLabel(displayRating)}
              </span>
            </div>
            {rating >= 3.5 && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ A rating of 3.5 or above will verify this skill/domain.
              </p>
            )}
            {rating > 0 && rating < 3.5 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                A rating below 3.5 means the skill will not be verified.
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="review-feedback">
              Feedback <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="review-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the interviewee's performance..."
              className="min-h-[100px] resize-none"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
