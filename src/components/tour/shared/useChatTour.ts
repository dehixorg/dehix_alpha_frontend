'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState } from '@/lib/store';
import { clearTour } from '@/lib/tourSlice';

function el(selector: string) {
  return document.querySelector(selector);
}

function withProgress(tour: Tour) {
  return {
    show(this: any) {
      const current = tour.steps.indexOf(this) + 1;
      const total = tour.steps.length;

      const footer = this.el?.querySelector('.shepherd-footer');
      if (!footer) return;

      let progress = footer.querySelector('.shepherd-progress');
      if (!progress) {
        progress = document.createElement('div');
        progress.className = 'shepherd-progress';
        footer.insertBefore(progress, footer.firstChild);
      }

      progress.textContent = `${current} / ${total}`;
    },
  };
}

export function useChatTour(isReady: boolean) {
  const tourRef = useRef<Tour | null>(null);
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const userType = useSelector((s: RootState) => s.user.type);
  const dispatch = useDispatch();

  useEffect(() => {
    if (tourRef.current) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        arrow: true,
        cancelIcon: { enabled: true },
        scrollTo: { behavior: 'smooth', block: 'center' },
        classes: 'shepherd-theme-custom',
      },
    });

    tour.on('cancel', () => dispatch(clearTour()));
    tour.on('complete', () => dispatch(clearTour()));

    tour.addStep({
      id: 'chat-intro',
      title: '💬 Real-Time Messaging Hub',
      text:
        userType === 'business'
          ? 'Welcome to the Dehix Messaging Center. This is where you communicate directly with freelancers, discuss project requirements, arrange milestones, and coordinate deliverables. Direct interaction helps keep your projects on schedule.'
          : 'Welcome to the Dehix Messaging Center. This workspace allows you to converse directly with client organizations, discuss proposal details, ask questions about tasks, and receive real-time updates.',
      when: withProgress(tour),
      buttons: [
        {
          text: 'Skip',
          action: () => {
            tour.cancel();
            dispatch(clearTour());
          },
        },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'chat-list-step',
      title: '📂 Conversation Registry',
      text: "This left-hand sidebar lists all your ongoing conversations. Each row displays the recipient's avatar name, role indicators, a preview of the last message, and orange notification bubbles for unread items.",
      attachTo: { element: '[data-tour="chat-main"]', on: 'right' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'chat-search-step',
      title: '🔍 Search & Filter Chats',
      text: 'Use this input field to quickly locate conversations. You can filter discussions by user names, email addresses, or specific project title keywords.',
      attachTo: { element: '[data-tour="chat-main"]', on: 'right' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'chat-new-step',
      title: '➕ Start New Discussions',
      text: 'Click this button to launch the user search directory modal. You can search verified Dehix profiles, select matching users, and instantly start a real-time chat session.',
      attachTo: { element: '[data-tour="chat-main"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        {
          text: 'Complete',
          action: () => {
            tour.complete();
            dispatch(clearTour());
          },
        },
      ],
    });

    tourRef.current = tour;

    return () => {
      tourRef.current?.cancel();
      tourRef.current = null;
      dispatch(clearTour());
    };
  }, [dispatch, userType]);

  useEffect(() => {
    if (!trigger) return;
    if (!isReady) return;
    if (mode !== 'page') return;
    if (target !== 'chat') return;

    if (el('[data-tour="chat-main"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady, userType]);
}
