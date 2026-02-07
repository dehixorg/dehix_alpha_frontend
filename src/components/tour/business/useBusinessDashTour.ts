'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState } from '@/lib/store';
import { clearTour } from '@/lib/tourSlice';

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
      when: withProgress(tour),
      buttons: [
        {
          text: 'Skip',
          action: () => {
            tour.cancel();
            dispatch(clearTour());
          },
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'stats',
      title: 'Stats',
      text: 'Track your projects and progress here.',
      attachTo: { element: '[data-tour="business-stats"]', on: 'bottom' },
      when: withProgress(tour),
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
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
  id: 'create-project-primary',
  title: 'Create Your First Project',
  text: 'Start by creating a project. This is where you define your requirements and begin collaborating.',
  attachTo: {
    element: '[data-tour="create-project-primary"]',
    on: 'top',
  },
  when: withProgress(tour),
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
      when: withProgress(tour),
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
