'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const MARKET_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'pm-market',
    title: 'Marketplace',
    text: 'This is the marketplace where you find your next opportunity.',
    selector: '[data-tour="pm-market"]',
    position: 'top',
  },
  {
    id: 'market-filters-projects',
    title: 'Filters',
    text: 'Use filters to narrow down project results.',
    selector: '[data-tour="pm-filter-trigger"]',
    position: 'left',
  },
  {
    id: 'pm-job-cards',
    title: 'Project Opportunities',
    text: 'Apply for project-based opportunities here.',
    selector: '[data-tour="pm-job-cards"]',
    position: 'top',
  },
  {
    id: 'market-tabs',
    title: 'Marketplace Tabs',
    text: 'Switch between Project Market and Talent Market from here.',
    selector: '[data-tour="market-tabs"]',
    position: 'top',
  },
  {
    id: 'market-filters-talent',
    title: 'Talent Filters',
    text: 'Filter talent profiles based on your needs.',
    selector: '[data-tour="tm-filter-trigger"]',
    position: 'left',
  },
  {
    id: 'tm-job-cards',
    title: 'Talent Opportunities',
    text: 'Browse and connect with talented professionals.',
    selector: '[data-tour="tm-job-cards"]',
    position: 'bottom',
  },
];

export function useMarketTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'market';

  useTourFactory(MARKET_TOUR_STEPS, shouldStartTour);
}
