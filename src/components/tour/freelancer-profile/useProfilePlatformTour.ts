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

export function useProfilePlatformTour(isReady: boolean) {
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
      id: 'sidebar',
      title: 'Settings Menu',
      text: 'Use this sidebar to navigate all your freelancer settings.',
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
      id: 'sidebar-personal-info',
      title: 'Personal Information',
      text: 'Start here to fill in your basic personal details.',
      attachTo: {
        element: '[data-tour="sidebar-personal-info"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-profile',
      title: 'My Profile',
      text: 'Manage your public profile and how clients see you.',
      attachTo: {
        element: '[data-tour="sidebar-profile"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-kyc',
      title: 'KYC Verification',
      text: 'Complete KYC to unlock payments and higher limits.',
      attachTo: {
        element: '[data-tour="sidebar-kyc"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-levels',
      title: 'Levels & Badges',
      text: 'Track your progress and unlock new freelancer levels.',
      attachTo: {
        element: '[data-tour="sidebar-levels"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-streak',
      title: 'Streak',
      text: 'Maintain activity streaks to boost your visibility.',
      attachTo: {
        element: '[data-tour="sidebar-streak"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-transactions',
      title: 'Transactions',
      text: 'View all your earnings, withdrawals, and payment history.',
      attachTo: {
        element: '[data-tour="sidebar-transactions"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-profiles',
      title: 'Profiles',
      text: 'Manage multiple profiles for different roles or skills.',
      attachTo: {
        element: '[data-tour="sidebar-profiles"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-resume',
      title: 'Resume',
      text: 'Upload and manage your resume for quick applications.',
      attachTo: {
        element: '[data-tour="sidebar-resume"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-feedback',
      title: 'Feedback',
      text: 'Share your experience and help us improve the platform.',
      attachTo: {
        element: '[data-tour="sidebar-feedback"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-reports',
      title: 'Reports',
      text: 'View platform reports and account summaries.',
      attachTo: {
        element: '[data-tour="sidebar-reports"]',
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
