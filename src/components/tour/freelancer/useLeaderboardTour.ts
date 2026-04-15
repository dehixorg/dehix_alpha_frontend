'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const LEADERBOARD_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    text: 'This leaderboard shows rankings based on performance.',
    // selector: '[data-tour="leaderboard"]',
    // position: '',
  },
];

export function useLeaderboardTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'leaderboard';

  useTourFactory(LEADERBOARD_TOUR_STEPS, shouldStartTour);
}
