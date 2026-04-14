'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const LEVEL_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'level & badges',
    title: 'Level & Badges',
    text: 'Track your progress and earn rewards as you complete tasks and level up.',
    // selector: '[data-tour="level-badges"]',
  },
];

export function useLevelTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'level-badges';

  useTourFactory(LEVEL_TOUR_STEPS, shouldStartTour);
}
