'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const TRANSACTIONS_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-transactions',
    title: 'Business Transaction History',
    text: 'View all your connect transactions and balance changes',
    selector: '',
    position: 'top',
  },
];

export function useTransactionsTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-transactions';

  useTourFactory(TRANSACTIONS_TOUR_STEPS, shouldStartTour);
}
