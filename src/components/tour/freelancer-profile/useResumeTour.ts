'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import { useTourFactory, type TourStepConfig } from '@/components/tour/shared/tourFactory';

const RESUME_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'resume',
    title: 'Resume',
    text: 'Upload your resume.',
    selector: '[data-tour="resume"]',
    position: 'top',
  },
];

export function useResumeTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'resume';

  useTourFactory(RESUME_TOUR_STEPS, shouldStartTour);
}
