'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_DASHBOARD_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    text: 'This is your business dashboard overview.',
    selector: '[data-tour="business-welcome"]',
    position: 'bottom',
  },
  {
    id: 'stats',
    title: 'Stats',
    text: 'Track your projects and progress here.',
    selector: '[data-tour="business-stats"]',
    position: 'bottom',
  },
  {
    id: 'projects',
    title: 'Projects',
    text: 'Manage your current and completed projects here.',
    selector: '[data-tour="business-projects"]',
    position: 'top',
  },
  {
    id: 'create-project-primary',
    title: 'Create Your First Project',
    text: 'Start by creating a project. This is where you define your requirements and begin collaborating.',
    selector: '[data-tour="create-project-primary"]',
    position: 'top',
  },
  {
    id: 'actions',
    title: 'Quick Actions',
    text: 'Create and manage projects quickly from here.',
    selector: '[data-tour="business-quick-actions"]',
    position: 'left',
  },
];

export function useBusinessDashboardTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'business-dashboard';

  useTourFactory(BUSINESS_DASHBOARD_TOUR_STEPS, shouldStartTour);
}
