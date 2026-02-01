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

function switchMarketTab(tab: 'projects' | 'talent') {
  const root = document.querySelector('[data-tour="market-root"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent('market:switch-tab', { detail: tab }));
}

export function useMarketTour(isReady: boolean) {
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
      id: 'pm-market',
      title: 'Marketplace',
      text: 'This is the marketplace where you find your next opportunity.',
      attachTo: { element: '[data-tour="pm-market"]', on: 'top' },
      buttons: [{ text: 'Next', action: tour.next }],
    });

    tour.addStep({
      id: 'market-filters-projects',
      title: 'Filters',
      text: 'Use filters to narrow down project results.',
      attachTo: {
        element: el('[data-tour="pm-filter-trigger"]')
          ? '[data-tour="pm-filter-trigger"]'
          : '[data-tour="pm-filters-desktop"]',
        on: 'left',
      },
      scrollTo: false,
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'pm-job-cards',
      title: 'Project Opportunities',
      text: 'Apply for project-based opportunities here.',
      attachTo: { element: '[data-tour="pm-job-cards"]', on: 'top' },
      scrollTo: false,
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'market-tabs',
      title: 'Marketplace Tabs',
      text: 'Switch between Project Market and Talent Market from here.',
      attachTo: { element: '[data-tour="market-tabs"]', on: 'top' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'switch-to-talent',
      title: 'Talent Marketplace',
      text: 'Now let’s explore the Talent marketplace.',
      beforeShowPromise: () =>
        new Promise((resolve) => {
          switchMarketTab('talent');
          setTimeout(resolve, 300);
        }),
      buttons: [
        {
          text: 'Back',
          action: () => {
            switchMarketTab('projects');
            tour.back();
          },
        },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'market-filters-talent',
      title: 'Talent Filters',
      text: 'Filter talent profiles based on your needs.',
      attachTo: {
        element: el('[data-tour="tm-filter-trigger"]')
          ? '[data-tour="tm-filter-trigger"]'
          : '[data-tour="tm-filters-desktop"]',
        on: 'left',
      },
      scrollTo: false,
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'tm-job-cards',
      title: 'Talent Opportunities',
      text: 'Browse and connect with talented professionals.',
      attachTo: { element: '[data-tour="tm-job-cards"]', on: 'bottom' },
      scrollTo: false,
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

    if (mode !== 'page') return;
    if (target !== 'market') return;

    if (el('[data-tour="market-tabs"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
