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

export function useDashboardTour(isReady: boolean) {
  const tourRef = useRef<Tour | null>(null);
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
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

    tour.addStep({
      id: 'profile-completion',
      title: 'Profile completion',
      text: 'Complete your profile to unlock more features.',
      attachTo: { element: '[data-tour="profile-completion"]', on: 'bottom' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'stats',
      title: 'Stats overview',
      text: 'Track your progress and revenue here.',
      attachTo: { element: '[data-tour="stats"]', on: 'top' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'projects',
      title: 'Projects',
      text: 'Manage all your projects here.',
      attachTo: { element: '[data-tour="projects"]', on: 'top' },
      buttons: [
        { text: 'Back', action: tour.back },
        {
          text: 'Got it',
          action: () => {
            tour.complete();
            dispatch(clearTour());
          },
        },
      ],
    });

    tourRef.current = tour;
  }, [dispatch]);

  useEffect(() => {
    if (!trigger) return;
    if (!isReady) return;

    if (mode !== 'page') return;
    if (target !== 'dashboard') return;

    if (el('[data-tour="sidebar"]') && el('[data-tour="profile-completion"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
