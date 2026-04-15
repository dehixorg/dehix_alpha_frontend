'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const STREAK_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'streak',
    title: 'Login Streak',
    text: 'Build your streak and claim connect rewards at milestones.',
  },
];

export function useStreakTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'streak';

  useTourFactory(STREAK_TOUR_STEPS, shouldStartTour);
}
