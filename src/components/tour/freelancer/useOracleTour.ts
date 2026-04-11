'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const ORACLE_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'oracle-intro',
    title: 'Oracle Dashboard',
    text: 'Review and manage verification requests across different categories from this dashboard.',
    selector: '[data-tour="oracle-page"]',
    position: 'bottom',
  },
  {
    id: 'oracle-business',
    title: 'Business Verification',
    text: 'View and review business verification requests submitted by companies.',
    selector: '[data-tour="oracle-page"]',
    position: 'top',
  },
  {
    id: 'oracle-tabs',
    title: 'Verification Categories',
    text: 'Use these tabs to switch between Business, Experience, Projects, and Education verifications.',
    selector: '[data-tour="oracle-tabs"]',
    position: 'bottom',
  },
];

export function useOracleTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'oracle-dashboard';

  useTourFactory(ORACLE_TOUR_STEPS, shouldStartTour);
}
