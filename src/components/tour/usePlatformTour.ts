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

export function usePlatformTour(isReady: boolean) {
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
        scrollTo: false,
        classes: 'shepherd-theme-custom',
      },
    });

    tour.on('cancel', () => dispatch(clearTour()));
    tour.on('complete', () => dispatch(clearTour()));

    //header
    tour.addStep({
      id: 'header-search',
      title: 'Global Search',
      text: 'Search across the entire platform from here.',
      attachTo: { element: '[data-tour="search"]', on: 'bottom' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'header-connects',
      title: 'Wallet & Connects',
      text: 'View and manage your connects here.',
      attachTo: { element: '[data-tour="header-connects"]', on: 'bottom' },
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
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'header-profile',
      title: 'Profile & Settings',
      text: 'Manage your account and preferences here.',
      attachTo: { element: '[data-tour="header-profile"]', on: 'left' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    //sidebar
    tour.addStep({
      id: 'sidebar',
      title: 'Navigation Sidebar',
      text: 'Use this sidebar to move across the platform.',
      attachTo: { element: '[data-tour="sidebar"]', on: 'right' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'nav-dashboard',
      title: 'Dashboard',
      text: 'Your overview of activity, progress, and stats.',
      attachTo: { element: '[data-tour="nav-dashboard"]', on: 'right' },
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
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'nav-chat',
      title: 'Chats',
      text: 'Communicate with teams and collaborators.',
      attachTo: { element: '[data-tour="nav-chat"]', on: 'right' },
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
    if (target !== 'navigation') return;

    const requiredSelectors = [
      '[data-tour="search"]',
      '[data-tour="header-connects"]',
      '[data-tour="header-notifications"]',
      '[data-tour="header-profile"]',
      '[data-tour="sidebar"]',
      '[data-tour="nav-dashboard"]',
      '[data-tour="nav-market"]',
      '[data-tour="nav-invitations"]',
      '[data-tour="nav-projects"]',
      '[data-tour="nav-talent"]',
      '[data-tour="nav-chat"]',
      '[data-tour="nav-notes"]',
    ];

    if (requiredSelectors.every((s) => el(s))) {
      tourRef.current?.start();
      dispatch(clearTour());
    }
  }, [trigger, mode, target, isReady, dispatch]);
}
