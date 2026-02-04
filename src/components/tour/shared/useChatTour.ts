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

    if (userType === 'business') {
      tour.addStep({
        id: 'chat-main',
        title: 'Chats',
        text: 'This is where you communicate with freelancers, discuss project details, and collaborate in real time.',
        attachTo: {
          element: '[data-tour="chat-main"]',
          on: 'top',
        },
        when: withProgress(tour),
        buttons: [
          {
            text: 'Got it',
            action: () => {
              tour.complete();
              dispatch(clearTour());
            },
          },
        ],
      });
    }

    if (userType === 'freelancer') {
      tour.addStep({
        id: 'chat-main',
        title: 'Chats',
        text: 'This is where you chat with clients, receive updates, and coordinate on projects.',
        attachTo: {
          element: '[data-tour="chat-main"]',
          on: 'top',
        },
        when: withProgress(tour),
        buttons: [
          {
            text: 'Got it',
            action: () => {
              tour.complete();
              dispatch(clearTour());
            },
          },
        ],
      });
    }

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
