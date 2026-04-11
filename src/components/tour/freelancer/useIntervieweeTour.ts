'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import { useTourFactory, type TourStepConfig } from '@/components/tour/shared/tourFactory';

const INTERVIEWEE_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'interviewee-header',
    title: 'Interviewee',
    text: 'Track your current interviews, bids, and interview history from this page.',
    selector: '[data-tour="interviewee-header"]',
    position: 'bottom',
  },
  {
    id: 'interviewee-tabs',
    title: 'Interview Stages',
    text: 'Switch between current interviews, bids you have placed, and your past interview history.',
    selector: '[data-tour="tab-list"]',
    position: 'bottom',
  },
  {
    id: 'interviewee-filter',
    title: 'Filter Interviews',
    text: 'Use this filter to view interviews by category or type.',
    selector: '[data-tour="all"]',
    position: 'bottom',
  },
  {
    id: 'interviewee-view-toggle',
    title: 'Change View',
    text: 'Switch between table and card views based on how you prefer to browse interviews.',
    selector: '[data-tour="table"]',
    position: 'left',
  },
  {
    id: 'interviewee-empty',
    title: 'Recent Interviews',
    text: 'Your scheduled interviews will appear here once they are created or assigned.',
    selector: '[data-tour="interviewee-empty"]',
    position: 'top',
  },
  {
    id: 'interviewee-sections',
    title: 'Interview Categories',
    text: 'Your interviews are grouped by purpose — talent, interviewer, projects, peer sessions, hiring, and growth.',
    selector: '[data-tour="interviewee-sections"]',
    position: 'top',
  },
];

export function useIntervieweeTour(isReady: boolean) {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'interviewee';

  useTourFactory(INTERVIEWEE_TOUR_STEPS, shouldStartTour);
}
