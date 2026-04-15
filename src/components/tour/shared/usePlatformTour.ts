'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const SHARED_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'header-search',
    title: 'Global Search',
    text: 'Search across the entire platform from here.',
    selector: '[data-tour="search"]',
    position: 'bottom',
  },
  {
    id: 'header-connects',
    title: 'Wallet & Connects',
    text: 'View and manage your connects here.',
    selector: '[data-tour="header-connects"]',
    position: 'bottom',
  },
  {
    id: 'header-notifications',
    title: 'Notifications',
    text: 'All important alerts and updates appear here.',
    selector: '[data-tour="header-notifications"]',
    position: 'bottom',
  },
  {
    id: 'header-profile',
    title: 'Profile & Settings',
    text: 'Manage your account and preferences here.',
    selector: '[data-tour="header-profile"]',
    position: 'bottom',
  },
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    text: 'Your overview of activity, progress, and stats.',
    selector: '[data-tour="nav-dashboard"]',
    position: 'right',
  },
  {
    id: 'nav-market',
    title: 'Marketplace',
    text: 'Explore projects, opportunities, and listings.',
    selector: '[data-tour="nav-market"]',
    position: 'right',
  },
];

const BUSINESS_TOUR_STEPS: TourStepConfig[] = [
  ...SHARED_TOUR_STEPS,
  {
    id: 'nav-projects',
    title: 'Projects',
    text: 'Manage your active and completed projects.',
    selector: '[data-tour="nav-projects"]',
    position: 'right',
  },
  {
    id: 'nav-invitations',
    title: 'Project Invitations',
    text: 'View and respond to project invitations here.',
    selector: '[data-tour="nav-invitations"]',
    position: 'right',
  },
  {
    id: 'nav-interviews',
    title: 'Interviews',
    text: 'Manage your interviews schedule.',
    selector: '[data-tour="nav-interviews"]',
    position: 'right',
  },
  {
    id: 'nav-talent',
    title: 'Talent',
    text: 'Explore and manage talent opportunities.',
    selector: '[data-tour="nav-talent"]',
    position: 'right',
  },
  {
    id: 'nav-chat',
    title: 'Chats',
    text: 'Communicate with teams and collaborators.',
    selector: '[data-tour="nav-chat"]',
    position: 'right',
  },
  {
    id: 'nav-notes',
    title: 'Notes',
    text: 'Keep personal notes and reminders here.',
    selector: '[data-tour="nav-notes"]',
    position: 'right',
  },
];

const FREELANCER_TOUR_STEPS: TourStepConfig[] = [
  ...SHARED_TOUR_STEPS,
  {
    id: 'nav-invitations',
    title: 'Project Invitations',
    text: 'View and respond to project invitations here.',
    selector: '[data-tour="nav-invitations"]',
    position: 'right',
  },
  {
    id: 'nav-projects',
    title: 'Projects',
    text: 'Manage your active and completed projects.',
    selector: '[data-tour="nav-projects"]',
    position: 'right',
  },
  {
    id: 'nav-interviewer',
    title: 'Interviews',
    text: 'Conduct and manage interviews from here.',
    selector: '[data-tour="nav-interviewer"]',
    position: 'right',
  },
  {
    id: 'nav-interviewee',
    title: 'Schedule Interviews',
    text: 'View and schedule your interviews.',
    selector: '[data-tour="nav-interviewee"]',
    position: 'right',
  },
  {
    id: 'nav-oracle',
    title: 'Oracle',
    text: 'Access oracle tools and insights here.',
    selector: '[data-tour="nav-oracle"]',
    position: 'right',
  },
  {
    id: 'nav-talent',
    title: 'Talent',
    text: 'Explore and manage talent opportunities.',
    selector: '[data-tour="nav-talent"]',
    position: 'right',
  },
  {
    id: 'nav-leaderboard',
    title: 'Leaderboard',
    text: 'See rankings and top performers here.',
    selector: '[data-tour="nav-leaderboard"]',
    position: 'right',
  },
  {
    id: 'nav-chat',
    title: 'Chats',
    text: 'Communicate with teams and collaborators.',
    selector: '[data-tour="nav-chat"]',
    position: 'right',
  },
  {
    id: 'nav-notes',
    title: 'Notes',
    text: 'Keep personal notes and reminders here.',
    selector: '[data-tour="nav-notes"]',
    position: 'right',
  },
];

export function usePlatformTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const userType = useSelector((s: RootState) => s.user.type);

  const steps =
    userType === 'business' ? BUSINESS_TOUR_STEPS : FREELANCER_TOUR_STEPS;
  const shouldStartTour =
    trigger > 0 && mode === 'platform' && target === 'navigation';

  useTourFactory(steps, shouldStartTour);
}
