'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from './star-rating';
import { Loader2 } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => Promise<void>;
  intervieweeName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  intervieweeName,
}) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit(rating);
      setRating(0);
      onClose();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Interview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Please rate your interview with <strong>{intervieweeName}</strong>
          </p>
          <div className="flex justify-center">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={32}
              interactive={true}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Rating'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
