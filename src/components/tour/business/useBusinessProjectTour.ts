'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import { useTourFactory, type TourStepConfig } from '@/components/tour/shared/tourFactory';

const BUSINESS_PROJECT_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-projects',
    title: 'Manage Your Projects',
    text: 'All your active and completed business projects are managed from here. Track progress, update details, and take action on projects easily.',
    selector: '[data-tour="business-projects"]',
    position: 'bottom',
  },
];

export function useBusinessProjectTour(isReady: boolean) {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'business-projects';

  useTourFactory(BUSINESS_PROJECT_TOUR_STEPS, shouldStartTour);
}
