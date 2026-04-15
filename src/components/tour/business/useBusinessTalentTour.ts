'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_TALENT_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-talent-header',
    title: 'Hire Talent',
    text: 'This is your talent hub where you can discover, review, and manage candidates for your business needs.',
    // selector: '[data-tour="business-talent-header"]',
    // position: 'bottom',
  },
  {
    id: 'business-talent-tabs',
    title: 'Overview & Applications',
    text: 'Switch between the overview of available talent and applications received from candidates.',
    selector: '[data-tour="business-talent-tabs"]',
    position: 'bottom',
  },
  {
    id: 'hire-talent-skill',
    title: 'Fill the Requirements',
    text: 'Select required skills and domains here to find candidates with the right technical expertise.',
    selector: '[data-tour="requirements"]',
    position: 'bottom',
  },
  {
    id: 'business-talent-filter',
    title: 'Filter Talent',
    text: 'Use filters to narrow down talent based on specific skills or domains.',
    selector: '[data-tour="business-talent-filter"]',
    position: 'bottom',
  },
  {
    id: 'business-talent-list',
    title: 'Talent List',
    text: 'Browse through talent profiles here and take action to connect or move forward with the right candidates.',
    selector: '[data-tour="business-talent-list"]',
    position: 'top',
  },
];

export function useBusinessTalentTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-talent';

  useTourFactory(BUSINESS_TALENT_TOUR_STEPS, shouldStartTour);
}
