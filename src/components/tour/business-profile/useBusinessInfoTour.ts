'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import { useTourFactory, type TourStepConfig } from '@/components/tour/shared/tourFactory';

const BUSINESS_INFO_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'business-info',
    title: 'Business Information',
    text: 'Keep your business profile accurate. It helps freelancers trust and recognize you.',
    selector: '',
    position: 'top',
  },
  {
    id: 'business-profile-picture',
    title: 'Profile Picture',
    text: 'Upload or change your profile picture here. The image is saved automatically — no need to click save.',
    selector: '[data-tour="profile-picture"]',
    position: 'bottom',
  },
  {
    id: 'business-readonly-fields',
    title: 'Contact Information',
    text: 'Email and phone number are non-editable, enter it carefully.',
    selector: '[data-tour="business-readonly-fields"]',
    position: 'top',
  },
  {
    id: 'save-changes',
    title: 'Save Changes',
    text: 'Use this button to save updates made on this page. Profile picture uploads are saved automatically.',
    selector: '[data-tour="save"]',
    position: 'top',
  },
];

export function useBusinessInfoTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'business-info';

  useTourFactory(BUSINESS_INFO_TOUR_STEPS, shouldStartTour);
}
