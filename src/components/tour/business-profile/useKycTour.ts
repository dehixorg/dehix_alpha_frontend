'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const KYC_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-kyc',
    title: 'Business KYC Verification',
    text: 'Please Complete the Mandatory KYC and earn reward.',
    selector: '',
    position: 'top',
  },
];

export function useKycTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-kyc';

  useTourFactory(KYC_TOUR_STEPS, shouldStartTour);
}
