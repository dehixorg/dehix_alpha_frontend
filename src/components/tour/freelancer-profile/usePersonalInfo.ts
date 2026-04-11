'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const PERSONAL_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'personal-info-intro',
    title: 'Personal Information',
    text: 'Keep your profile details updated so businesses can find and trust you faster.',
    selector: '[]',
  },
  {
    id: 'profile-picture',
    title: 'Profile picture',
    text: 'Upload or change your profile picture here. Changes are saved instantly — no need to click Save.',
    selector: '[data-tour="profile-picture"]',
    position: 'bottom',
  },
  {
    id: 'non-editable',
    title: 'Locked fields',
    text: 'These details are verified and cannot be edited for security reasons.',
    selector: '[data-tour="non-editable-field"]',
    position: 'top',
  },
  {
    id: 'skills-domains',
    title: 'Skills & Domains',
    text: 'Add or update your skills and domains here. These details can be saved here too and used for matching.',
    selector: '[data-tour="skills-domains"]',
    position: 'top',
  },
  {
    id: 'save-profile',
    title: 'Save updates',
    text: 'Update your skills and domains here to improve visibility and matching.',
    selector: '[data-tour="profile-save"]',
    position: 'top',
  },
];

export function usePersonalInfoTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'personal-info-form';

  useTourFactory(PERSONAL_TOUR_STEPS, shouldStartTour);
}
