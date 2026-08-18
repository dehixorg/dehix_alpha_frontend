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
      title: '💼 Client Control Center',
      text: 'Welcome back to your Dehix Business Dashboard. From this single overview page, you can coordinate your active developments, inspect freelancer applications, monitor team progress, and evaluate technical candidates.',
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
      title: '📊 Business Operational Metrics',
      text: 'Track key performance statistics at a glance: Total Budget Released/Spent, Active Project Contracts, Open Positions/Bids, and Currently Engaged Freelancer Talents.',
      attachTo: { element: '[data-tour="business-stats"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'projects',
      title: '📁 Project Deliverables Hub',
      text: 'Review quick cards representing your open contract deliverables. Clicking any project card expands it to show milestone progress percentages, pending deliverable approvals, and current team communications.',
      attachTo: { element: '[data-tour="business-projects"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'create-project-primary',
      title: '✨ Launch New Projects',
      text: 'Click here to start the Project Creation Wizard. You can draft technical requirement details, select required developer skill categories, allocate milestone budgets, and publish opportunities to the open marketplace.',
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
      title: '⚡ Quick Administrative Controls',
      text: 'Use these shortcuts to search candidate directories, manage interview evaluations, or handle company invoices and connects balances. Your tour is now complete!',
      attachTo: { element: '[data-tour="business-quick-actions"]', on: 'left' },
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
  }, [dispatch]);

  useEffect(() => {
    if (!trigger || !isReady) return;
    if (mode !== 'page') return;
    if (target !== 'business-dashboard') return;

    tourRef.current?.start();
  }, [trigger, mode, target, isReady]);
}
