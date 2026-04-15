'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const PROFILE_PLATFORM_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'sidebar',
    title: 'Settings Menu',
    text: 'Use this sidebar to navigate all your freelancer settings.',
    selector: '[data-tour="sidebar"]',
    position: 'right',
  },
  {
    id: 'sidebar-personal-info',
    title: 'Personal Information',
    text: 'Start here to fill in your basic personal details.',
    selector: '[data-tour="sidebar-personal-info"]',
    position: 'right',
  },
  {
    id: 'sidebar-profile',
    title: 'My Profile',
    text: 'Manage your public profile and how clients see you.',
    selector: '[data-tour="sidebar-profile"]',
    position: 'right',
  },
  {
    id: 'sidebar-public-profile',
    title: 'Public Profile',
    text: 'See how visitors view your profile.',
    selector: '[data-tour="sidebar-public-profile"]',
    position: 'right',
  },
  {
    id: 'sidebar-kyc',
    title: 'KYC Verification',
    text: 'Complete KYC to unlock payments and higher limits.',
    selector: '[data-tour="sidebar-kyc"]',
    position: 'right',
  },
  {
    id: 'sidebar-levels',
    title: 'Levels & Badges',
    text: 'Track your progress and unlock new freelancer levels.',
    selector: '[data-tour="sidebar-levels"]',
    position: 'right',
  },
  {
    id: 'sidebar-streak',
    title: 'Streak',
    text: 'Maintain activity streaks to boost your visibility.',
    selector: '[data-tour="sidebar-streak"]',
    position: 'right',
  },
  {
    id: 'sidebar-transactions',
    title: 'Transactions',
    text: 'View all your earnings, withdrawals, and payment history.',
    selector: '[data-tour="sidebar-transactions"]',
    position: 'right',
  },
  {
    id: 'sidebar-profiles',
    title: 'Profiles',
    text: 'Manage multiple profiles for different roles or skills.',
    selector: '[data-tour="sidebar-profiles"]',
    position: 'right',
  },
  {
    id: 'sidebar-resume',
    title: 'Resume',
    text: 'Upload and manage your resume for quick applications.',
    selector: '[data-tour="sidebar-resume"]',
    position: 'right',
  },
  {
    id: 'sidebar-feedback',
    title: 'Feedback',
    text: 'Share your experience and help us improve the platform.',
    selector: '[data-tour="sidebar-feedback"]',
    position: 'right',
  },
  {
    id: 'sidebar-reports',
    title: 'Reports',
    text: 'View platform reports and account summaries.',
    selector: '[data-tour="sidebar-reports"]',
    position: 'right',
  },
];

export function useProfilePlatformTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'platform' && target === 'sidebar';

  useTourFactory(PROFILE_PLATFORM_TOUR_STEPS, shouldStartTour);
}
