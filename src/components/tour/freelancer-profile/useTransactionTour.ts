'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const TRANSACTION_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'transaction',
    title: 'Transaction History',
    text: 'Track your connect transactions and balance changes.',
    selector: '[data-tour="transaction"]',
    position: 'top',
  },
];

export function useTransactionTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'transaction';

  useTourFactory(TRANSACTION_TOUR_STEPS, shouldStartTour);
}
