'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const FEEDBACK_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'feedback',
    title: 'Feedback',
    text: 'Submit your feedback here.',
    selector: '[data-tour="feedback"]',
    position: 'bottom',
  },
];

export function useFeedbackTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'feedback';

  useTourFactory(FEEDBACK_TOUR_STEPS, shouldStartTour);
}
