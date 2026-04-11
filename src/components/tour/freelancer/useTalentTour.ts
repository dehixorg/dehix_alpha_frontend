'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const TALENT_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'talent',
    title: 'Talent Marketplace',
    text: 'Explore professionals, review profiles, and connect with talent here.',
    selector: '[data-tour="talent"]',
    position: 'bottom',
  },
  {
    id: 'skill',
    title: 'Add Dehix Skill',
    text: 'Choose one of your profile skills, set your seniority level, and define your expected monthly pay. This helps clients understand where you shine.',
    selector: '[data-tour="skill"]',
    position: 'bottom',
  },
  {
    id: 'domain',
    title: 'Add Dehix Domain',
    text: 'Select one of your profile domains, set your seniority level, and define your expected monthly pay for domain-based work.',
    selector: '[data-tour="domain"]',
    position: 'bottom',
  },
];

export function useTalentTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'talent';

  useTourFactory(TALENT_TOUR_STEPS, shouldStartTour);
}
