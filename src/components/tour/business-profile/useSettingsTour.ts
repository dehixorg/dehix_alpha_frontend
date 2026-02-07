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

export function useSettingsTour(isReady: boolean) {
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
      id: 'settings-sidebar',
  title: 'Settings Navigation',
  text: 'Use this sidebar to manage your business settings, compliance, and reports.',
  attachTo: {
    element: '[data-tour="sidebar"]',
    on: 'right',
  },
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
      id: 'settings-business-info',
  title: 'Business Information',
  text: 'Update your company details and basic information used across the platform.',
  attachTo: {
    element: '[data-tour="settings-business-info"]',
    on: 'right',
  },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
     id: 'settings-kyc',
  title: 'Compliance & Verification',
  text: 'Complete verification to enable full access to platform features.',
  attachTo: {
    element: '[data-tour="settings-kyc"]',
    on: 'right',
  },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-transactions',
  title: 'Transactions',
  text: 'View invoices, payments, and financial records related to your projects.',
  attachTo: {
    element: '[data-tour="settings-transactions"]',
    on: 'right',
  },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-feedback',
      title: 'Feedback',
      text: 'Share your experience and help us improve the platform.',
      attachTo: {
        element: '[data-tour="settings-feedback"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-reports',
  title: 'Reports & Issues',
  text: 'Access reports and important updates related to your account and projects.',
  attachTo: {
    element: '[data-tour="settings-reports"]',
    on: 'right',
  },
      when: withProgress(tour),
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

    return () => {
      tourRef.current?.cancel();
      tourRef.current = null;
      dispatch(clearTour());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!trigger) return;
    if (!isReady) return;

    if (mode !== 'platform') return;
    if (target !== 'sidebar') return;

    if (el('[data-tour="sidebar"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
