'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const STEPS: TourStepConfig[] = [
  {
    id: 'public-profile',
    title: 'Public Profile',
    text: 'View your public profile.',
    selector: '', //[data-tour="public-profile-freelancer"]
    position: '',
  },
];

export function usePublicTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'public-profile';

  useTourFactory(STEPS, shouldStartTour);
}
