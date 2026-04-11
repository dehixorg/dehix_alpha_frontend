'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_INTERVIEW_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-interview',
    title: 'Business Interviews',
    text: 'Check your current and past interviews here.',
    selector: '[data-tour="business-interviews"]',
    position: 'top',
  },
];

export function useBusinessInterviewTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-interviews';

  useTourFactory(BUSINESS_INTERVIEW_TOUR_STEPS, shouldStartTour);
}
