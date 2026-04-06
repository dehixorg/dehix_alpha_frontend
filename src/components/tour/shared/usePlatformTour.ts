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

export function usePlatformTour(isReady: boolean) {
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
      id: 'header-search',
      title: 'Global Search',
      text: 'Search across the entire platform from here.',
      attachTo: { element: '[data-tour="search"]', on: 'bottom' },
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
      id: 'header-connects',
      title: 'Wallet & Connects',
      text: 'View and manage your connects here.',
      attachTo: { element: '[data-tour="header-connects"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'header-notifications',
      title: 'Notifications',
      text: 'All important alerts and updates appear here.',
      attachTo: { element: '[data-tour="header-notifications"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'header-profile',
      title: 'Profile & Settings',
      text: 'Manage your account and preferences here.',
      attachTo: { element: '[data-tour="header-profile"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    // tour.addStep({
    //   id: 'sidebar',
    //   title: 'Navigation Sidebar',
    //   text: 'Use this sidebar to move across the platform.',
    //   attachTo: { element: '[data-tour="sidebar"]', on: 'right' },
    //   buttons: [
    //     { text: 'Back', action: tour.back },
    //     { text: 'Next', action: tour.next },
    //   ],
    // });

    tour.addStep({
      id: 'nav-dashboard',
      title: 'Dashboard',
      text: 'Your overview of activity, progress, and stats.',
      attachTo: { element: '[data-tour="nav-dashboard"]', on: 'right' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'nav-market',
      title: 'Marketplace',
      text: 'Explore projects, opportunities, and listings.',
      attachTo: { element: '[data-tour="nav-market"]', on: 'right' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    if (userType === 'business') {
      tour.addStep({
        id: 'nav-projects',
        title: 'Projects',
        text: 'Manage your active and completed projects.',
        attachTo: { element: '[data-tour="nav-projects"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-invitations',
        title: 'Project Invitations',
        text: 'View and respond to project invitations here.',
        attachTo: { element: '[data-tour="nav-invitations"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-interviews',
        title: 'Interviews',
        text: 'Manage your interviews schedule.',
        attachTo: { element: '[data-tour="nav-interviews"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-talent',
        title: 'Talent',
        text: 'Explore and manage talent opportunities.',
        attachTo: { element: '[data-tour="nav-talent"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });
    }

    if (userType === 'freelancer') {
      tour.addStep({
        id: 'nav-invitations',
        title: 'Project Invitations',
        text: 'View and respond to project invitations here.',
        attachTo: { element: '[data-tour="nav-invitations"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-projects',
        title: 'Projects',
        text: 'Manage your active and completed projects.',
        attachTo: { element: '[data-tour="nav-projects"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-interviewer',
        title: 'Interviews',
        text: 'Conduct and manage interviews from here.',
        attachTo: { element: '[data-tour="nav-interviewer"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-interviewee',
        title: 'Schedule Interviews',
        text: 'View and schedule your interviews.',
        attachTo: { element: '[data-tour="nav-interviewee"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-oracle',
        title: 'Oracle',
        text: 'Access oracle tools and insights here.',
        attachTo: { element: '[data-tour="nav-oracle"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-talent',
        title: 'Talent',
        text: 'Explore and manage talent opportunities.',
        attachTo: { element: '[data-tour="nav-talent"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });

      tour.addStep({
        id: 'nav-leaderboard',
        title: 'Leaderboard',
        text: 'See rankings and top performers here.',
        attachTo: { element: '[data-tour="nav-leaderboard"]', on: 'right' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          { text: 'Next', action: tour.next },
        ],
      });
    }

    tour.addStep({
      id: 'nav-chat',
      title: 'Chats',
      text: 'Communicate with teams and collaborators.',
      attachTo: { element: '[data-tour="nav-chat"]', on: 'right' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'nav-notes',
      title: 'Notes',
      text: 'Keep personal notes and reminders here.',
      attachTo: { element: '[data-tour="nav-notes"]', on: 'right' },
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
  }, [dispatch, userType]);

  useEffect(() => {
    if (!trigger || !isReady) return;
    if (mode !== 'platform' || target !== 'navigation') return;

    const required = [
      '[data-tour="search"]',
      '[data-tour="sidebar"]',
      '[data-tour="nav-dashboard"]',
      '[data-tour="nav-market"]',
      '[data-tour="nav-projects"]',
      '[data-tour="nav-chat"]',
      '[data-tour="nav-notes"]',
    ];

    if (required.every(el)) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
