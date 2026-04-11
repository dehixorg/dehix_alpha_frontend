'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const PROJECT_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'current-projects',
    title: 'Your Projects',
    text: 'Track your projects by status and respond to invitations here.',
    selector: '[data-tour="current-projects"]',
    position: 'bottom',
  },
];

export function useProjectTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'current-projects';

  useTourFactory(PROJECT_TOUR_STEPS, shouldStartTour);
}
