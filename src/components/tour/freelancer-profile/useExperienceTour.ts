'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const EXPERIENCE_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'professional-experience',
    title: 'Academic and Work experience',
    text: 'Fill your academic and work details correctly.',
    // selector: '[data-tour="experience"]',
    // position: 'bottom',
  },
  {
    id: 'add-experience',
    title: 'Add Experience',
    text: 'Add your professional experience from here.',
    selector: '[data-tour="add-details"]',
    position: 'bottom',
  },
];

export function useExperienceTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'experience';

  useTourFactory(EXPERIENCE_TOUR_STEPS, shouldStartTour);
}
