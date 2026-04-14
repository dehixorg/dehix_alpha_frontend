'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const STEPS: TourStepConfig[] = [
  {
    id: 'business-public-profile',
    title: 'Business Public Profile',
    text: 'You can view public profile.',
    selector: '', //[data-tour="public-profile"]
    position: 'top',
  },
];

export function useBusinessPublicTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-public-profile';

  useTourFactory(STEPS, shouldStartTour);
}
