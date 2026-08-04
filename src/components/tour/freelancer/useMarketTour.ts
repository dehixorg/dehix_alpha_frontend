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
      title: '🛍️ Dehix Opportunities Market',
      text: 'Welcome to the core marketplace. This is where all active client opportunities are published. You can browse detailed work descriptions, budget offers, expected milestones, required skills, and timelines for each project to find roles matching your professional developer profile.',
      attachTo: { element: '[data-tour="pm-market"]', on: 'top' },
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
      id: 'market-filters-projects',
      title: '⚡ Filter Opportunities',
      text: 'Filter projects dynamically to locate ideal fits. You can refine your search by setting minimum and maximum budget ranges, selecting specific required skills (e.g. Solidity, Next.js), filtering by technology domains, or sorting listings by newest posts and highest budgets.',
      attachTo: {
        element: el('[data-tour="pm-filter-trigger"]')
          ? '[data-tour="pm-filter-trigger"]'
          : '[data-tour="pm-filters-desktop"]',
        on: 'left',
      },
      scrollTo: false,
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'pm-job-cards',
      title: '📄 Project Cards & Details',
      text: 'Each project card displays essential info at a glance: client ratings, project category tags, duration estimates, skills required, and the total budget. Click any card to read the complete project requirements document, ask questions, or prepare your custom proposal bid.',
      attachTo: { element: '[data-tour="pm-job-cards"]', on: 'top' },
      scrollTo: false,
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'market-tabs',
      title: '🔄 Switch Market Type',
      text: 'Use these tabs to switch between views. The "Project Market" is for freelancers looking for clients, while the "Talent Market" allows clients to browse, search, and contact verified professionals for direct contracts.',
      attachTo: { element: '[data-tour="market-tabs"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'switch-to-talent',
      title: '👥 Talent Marketplace Search',
      text: 'Let’s look at the Talent section. Businesses use this grid to filter developer profiles, view certifications, track GitHub contributions, inspect portfolio histories, check hourly rates, and invite members directly to schedule interviews.',
      beforeShowPromise: () =>
        new Promise((resolve) => {
          switchMarketTab('talent');
          setTimeout(resolve, 300);
        }),
      when: withProgress(tour),
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
      title: '🔍 Talent Filters',
      text: 'Businesses can search the developer pool by filtering for verified KYC states, hourly contract limits, completed project ratings, and specific skills to find matching candidates.',
      attachTo: {
        element: el('[data-tour="tm-filter-trigger"]')
          ? '[data-tour="tm-filter-trigger"]'
          : '[data-tour="tm-filters-desktop"]',
        on: 'left',
      },
      scrollTo: false,
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'tm-job-cards',
      title: '✨ Connect & Collaborate',
      text: "Click any profile card here to check a candidate's achievements, open their resumes, review past clients feedback, or schedule a technical chat session. You are now familiar with the entire Dehix Opportunities Market!",
      attachTo: { element: '[data-tour="tm-job-cards"]', on: 'bottom' },
      scrollTo: false,
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
    if (!trigger) return;
    if (!isReady) return;

    if (mode !== 'page') return;
    if (target !== 'market') return;

    if (el('[data-tour="market-tabs"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
