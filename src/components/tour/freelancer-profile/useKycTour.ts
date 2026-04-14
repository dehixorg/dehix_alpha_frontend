'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const KYC_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'kyc verification',
    title: 'KYC Verification',
    text: 'Verify your identity with e-kyc.',
    // selector: '[data-tour="kyc"]',
    // position: '',
  },
];

export function useKycTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'kyc';

  useTourFactory(KYC_TOUR_STEPS, shouldStartTour);
}
