'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

const BUSINESS_CHAT_STEPS: TourStepConfig[] = [
  {
    id: 'chat-main',
    title: 'Chats',
    text: 'This is where you communicate with freelancers, discuss project details, and collaborate in real time.',
    // selector: '[data-tour="chat-main"]',
    // position: '',
  },
];

const FREELANCER_CHAT_STEPS: TourStepConfig[] = [
  {
    id: 'chat-main',
    title: 'Chats',
    text: 'This is where you chat with clients, receive updates, and coordinate on projects.',
    // selector: '[data-tour="chat-main"]',
    // position: '',
  },
];

export function useChatTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const userType = useSelector((s: RootState) => s.user.type);

  const steps =
    userType === 'business' ? BUSINESS_CHAT_STEPS : FREELANCER_CHAT_STEPS;
  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'chat';

  useTourFactory(steps, shouldStartTour);
}
