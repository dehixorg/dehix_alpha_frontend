'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const INTERVIEW_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'interviewer-header',
    title: 'Interviews',
    text: 'Apply as an interviewer, manage your profile, and track interviews from here.',
    selector: '[data-tour="interviewer-header"]',
    position: 'bottom',
  },
  {
    id: 'interview-lifecycle',
    title: 'Interview Lifecycle',
    text: 'Start with your profile. Once approved, you can manage active interviews, bids, and view your history here.',
    selector: '[data-tour="interviewer-tabs"]',
    position: 'bottom',
  },
  {
    id: 'apply-interviewer',
    title: 'Apply as an Interviewer',
    text: 'Apply using your verified skills or domains. Once approved, you can start taking interviews.',
    selector: '[data-tour="apply-interviewer"]',
    position: 'bottom',
  },
  {
    id: 'manage-availability',
    title: 'Manage Availability',
    text: 'Set when you are available to take interviews after approval. This helps companies schedule you faster.',
    selector: '[data-tour="manage-availability"]',
    position: 'bottom',
  },
];

export function useInterviewerProfileTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'interviewer-profile';

  useTourFactory(INTERVIEW_TOUR_STEPS, shouldStartTour);
}
