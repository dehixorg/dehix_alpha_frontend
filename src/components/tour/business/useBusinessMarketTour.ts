'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_MARKET_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-market-header',
    title: 'Business Marketplace',
    text: 'Browse and discover freelancers for your business needs.',
    selector: '[data-tour="business-market-header"]',
    position: 'bottom',
  },
  {
    id: 'business-market-filters',
    title: 'Filters',
    text: 'Use filters to narrow down freelancers by skills, experience, and location.',
    selector: '[data-tour="business-market-filters"]',
    position: 'right',
  },
  {
    id: 'business-market-list',
    title: 'Freelancer List',
    text: 'Explore freelancer profiles and choose the best fit for your project.',
    selector: '[data-tour="business-market-list"]',
    position: 'top',
  },
];

export function useBusinessMarketTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-market';

  useTourFactory(BUSINESS_MARKET_TOUR_STEPS, shouldStartTour);
}
