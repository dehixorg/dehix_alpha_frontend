'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_INVITATION_STEPS: TourStepConfig[] = [
  {
    id: 'business-invitation',
    title: 'Project Invitations',
    text: 'Manage and track all your project invitations in one place. Review requests, respond quickly, and keep collaborations moving forward.',
    selector: '[data-tour="business-invitation"]',
    position: 'top',
  },
];

const FREELANCER_INVITATION_STEPS: TourStepConfig[] = [
  {
    id: 'freelancer-invitation',
    title: 'Project Invitations',
    text: 'Here you can see projects where clients have directly invited you to apply.',
    selector: '[data-tour="freelancer-invitation"]',
    position: 'top',
  },
];

export function useProjectInvitationTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const userType = useSelector((s: RootState) => s.user.type);

  const steps =
    userType === 'business'
      ? BUSINESS_INVITATION_STEPS
      : FREELANCER_INVITATION_STEPS;
  const shouldStartTour =
    trigger > 0 && mode === 'page' && target === 'project-invitations';

  useTourFactory(steps, shouldStartTour);
}
