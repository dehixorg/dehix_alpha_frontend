'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const PROFILES_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'profiles-center',
    title: 'Profile Center',
    text: 'Create and manage profiles to showcase your expertise.',
    selector: '[data-tour="profiles-center"]',
    position: 'top',
  },
];

export function useProfilesTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'profiles-center';

  useTourFactory(PROFILES_TOUR_STEPS, shouldStartTour);
}
