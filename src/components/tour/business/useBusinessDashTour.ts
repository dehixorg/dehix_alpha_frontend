'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState } from '@/lib/store';
import { clearTour } from '@/lib/tourSlice';

export function useBusinessDashboardTour(isReady: boolean) {
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

    tour.on('cancel', () => dispatch(clearTour()));
    tour.on('complete', () => dispatch(clearTour()));

    tour.addStep({
      id: 'welcome',
      title: 'Welcome',
      text: 'This is your business dashboard overview.',
      attachTo: { element: '[data-tour="business-welcome"]', on: 'bottom' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'stats',
      title: 'Stats',
      text: 'Track your projects and progress here.',
      attachTo: { element: '[data-tour="business-stats"]', on: 'bottom' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'projects',
      title: 'Projects',
      text: 'Manage your current and completed projects here.',
      attachTo: { element: '[data-tour="business-projects"]', on: 'top' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'actions',
      title: 'Quick actions',
      text: 'Create and manage projects quickly from here.',
      attachTo: { element: '[data-tour="business-quick-actions"]', on: 'left' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Got it', action: tour.complete },
      ],
    });

    tourRef.current = tour;

    return () => {
      tourRef.current?.cancel();
      tourRef.current = null;
      dispatch(clearTour());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!trigger || !isReady) return;
    if (mode !== 'page') return;
    if (target !== 'business-dashboard') return;

    tourRef.current?.start();
  }, [trigger, mode, target, isReady]);
}
