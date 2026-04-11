'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import { useTourFactory, type TourStepConfig } from '@/components/tour/shared/tourFactory';

// Define dashboard tour steps
const DASHBOARD_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'profile-completion',
    title: 'Profile Completion',
    text: 'Complete your profile to unlock more features.',
    selector: '[data-tour="profile-completion"]',
    position: 'bottom',
  },
  {
    id: 'stats',
    title: 'Stats Overview',
    text: 'Track your progress and revenue here.',
    selector: '[data-tour="stats"]',
    position: 'top',
  },
  {
    id: 'projects',
    title: 'Projects',
    text: 'Manage all your projects here.',
    selector: '[data-tour="projects"]',
    position: 'top',
  },
  {
    id: 'interview',
    title: 'Interview Schedule',
    text: 'Your upcoming meetings and interview slots.',
    selector: '[data-tour="interviews"]',
    position: 'bottom',
  },
];

export function useDashboardTour(isReady: boolean) {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  // Determine if tour should run - trigger is a number that increments
  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'dashboard';

  useTourFactory(DASHBOARD_TOUR_STEPS, shouldStartTour);
}
