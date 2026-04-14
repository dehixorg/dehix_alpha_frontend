'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

// Helper to check if element exists and is visible
function elementExists(selector: string): boolean {
  const el = document.querySelector(selector);
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

const PERSONAL_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'personal-info-intro',
    title: 'Personal Information',
    text: 'Keep your profile details updated so businesses can find and trust you faster.',
    // No selector - will be centered
    scrollTo: false,
    beforeShowPromise: () =>
      new Promise((resolve) => {
        // Wait for DOM to be ready
        setTimeout(resolve, 500);
      }),
  },
  {
    id: 'profile-picture',
    title: 'Profile picture',
    text: 'Upload or change your profile picture here. Changes are saved instantly — no need to click Save.',
    selector: () => {
      // Only show this step if the element exists
      if (elementExists('[data-tour="profile-picture"]')) {
        return '[data-tour="profile-picture"]';
      }
      return null; // Skip this step if element doesn't exist
    },
    position: 'bottom',
    scrollTo: true,
  },
  {
    id: 'non-editable',
    title: 'Locked fields',
    text: 'These details are verified and cannot be edited for security reasons.',
    selector: '[data-tour="non-editable-field"]',
    position: 'top',
    scrollTo: true,
  },
  {
    id: 'skills-domains',
    title: 'Skills & Domains',
    text: 'Add or update your skills and domains here. These details can be saved here too and used for matching.',
    selector: '[data-tour="skills-domains"]',
    position: 'top',
    scrollTo: true,
  },
  {
    id: 'save-profile',
    title: 'Save updates',
    text: 'Update your skills and domains here to improve visibility and matching.',
    selector: '[data-tour="profile-save"]',
    position: 'top',
    scrollTo: true,
  },
];

export function usePersonalInfoTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'personal-info-form';

  useTourFactory(PERSONAL_TOUR_STEPS, shouldStartTour);
}
