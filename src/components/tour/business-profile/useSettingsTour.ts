'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const SETTINGS_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'settings-sidebar',
    title: 'Settings Navigation',
    text: 'Use this sidebar to manage your business settings, compliance, and reports.',
    selector: '[data-tour="sidebar"]',
    position: 'right',
  },
  {
    id: 'settings-business-info',
    title: 'Business Information',
    text: 'Update your company details and basic information used across the platform.',
    selector: '[data-tour="settings-business-info"]',
    position: 'right',
  },
  {
    id: 'settings-kyc',
    title: 'Compliance & Verification',
    text: 'Complete verification to enable full access to platform features.',
    selector: '[data-tour="settings-kyc"]',
    position: 'right',
  },
  {
    id: 'settings-transactions',
    title: 'Transactions',
    text: 'View invoices, payments, and financial records related to your projects.',
    selector: '[data-tour="settings-transactions"]',
    position: 'right',
  },
  {
    id: 'settings-feedback',
    title: 'Feedback',
    text: 'Share your experience and help us improve the platform.',
    selector: '[data-tour="settings-feedback"]',
    position: 'right',
  },
  {
    id: 'settings-reports',
    title: 'Reports & Issues',
    text: 'Access reports and important updates related to your account and projects.',
    selector: '[data-tour="settings-reports"]',
    position: 'right',
  },
];

export function useSettingsTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'platform' && target === 'sidebar';

  useTourFactory(SETTINGS_TOUR_STEPS, shouldStartTour);
}
