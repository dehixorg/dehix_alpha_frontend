'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_NOTES_STEPS: TourStepConfig[] = [
  {
    id: 'notes',
    title: 'Notes',
    text: 'Use this space to keep business notes, ideas, and important references in one place.',
    // selector: '[data-tour="notes"]',
    // position: '',
  },
];

const FREELANCER_NOTES_STEPS: TourStepConfig[] = [
  {
    id: 'notes',
    title: 'Notes',
    text: 'Use this section to write down ideas, reminders, and personal notes.',
    // selector: '[data-tour="notes"]',
    // position: '',
  },
];

export function useNotesTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const userType = useSelector((s: RootState) => s.user.type);

  const steps =
    userType === 'business' ? BUSINESS_NOTES_STEPS : FREELANCER_NOTES_STEPS;
  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'notes';

  useTourFactory(steps, shouldStartTour);
}
