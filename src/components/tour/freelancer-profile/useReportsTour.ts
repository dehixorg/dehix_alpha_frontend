'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const REPORTS_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'reports',
    title: 'Reports Center',
    text: 'Generate and manage your reports in one place.',
    // selector: '[data-tour="reports"]',
    // position: '',
  },
];

export function useReportsTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'reports';

  useTourFactory(REPORTS_TOUR_STEPS, shouldStartTour);
}
