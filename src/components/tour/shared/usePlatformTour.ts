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
      title: '🔍 Global Platform Search',
      text: 'Our powerful search bar allows you to scan the entire Dehix ecosystem instantly. You can type keywords, technology names (like React or Solidity), or specific user handles to locate matching projects, freelancer talent pools, or verified business profiles across the platform.',
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
      title: '💎 Wallet & Connects Balance',
      text: 'This display tracks your current balance of Dehix Connects (DHX). Connects act as the utility currency on our platform. Freelancers use them to place project bids and apply for listings, while businesses consume them to post opportunities, list talent positions, or direct-hire freelancers. You can click here to purchase more connects or review your detailed transactional log.',
      attachTo: { element: '[data-tour="header-connects"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'header-notifications',
      title: '🔔 Live Notifications & Alerts',
      text: 'Stay updated with your activities in real time. The notifications bell highlights any unread messages, new project milestones awaiting approval, interview schedule changes, or application invitations. Clicking the bell displays a dropdown preview where you can read, clear, or navigate directly to the origin of the event.',
      attachTo: { element: '[data-tour="header-notifications"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'header-profile',
      title: '👤 Account Settings & Session Management',
      text: 'Clicking your avatar opens the quick session control dropdown. From here, you can navigate directly to your public-facing profile preview, open comprehensive system settings, toggle dark and light modes, or securely log out. Keep your personal data and profiles updated here to boost your platform credibility.',
      attachTo: { element: '[data-tour="header-profile"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'nav-dashboard',
      title: '📊 Central Activity Dashboard',
      text: 'Your main control center on Dehix. Depending on your role, this page aggregates all key performance indicators including active contracts, outstanding payments, profile strength parameters, upcoming milestones, and overall platform analytics in a visual card format.',
      attachTo: { element: '[data-tour="nav-dashboard"]', on: 'right' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'nav-market',
      title: '🛍️ Dehix Opportunities Marketplace',
      text: 'The open market hub where work matches are made. Freelancers can browse through active client projects, filter by technology tags, and place competitive bids. Business profiles can navigate here to discover top-rated developer profiles and extend direct interview requests.',
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
