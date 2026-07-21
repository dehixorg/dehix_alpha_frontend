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

export function useDashboardTour(isReady: boolean) {
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
      id: 'profile-completion',
      title: '📈 Onboarding & Profile Strength',
      text: 'This metric monitors the completeness of your public presence on Dehix. Providing details for your bio, skill set, work experiences, and undergoing KYC validation directly improves your profile strength, boosting your visibility index to hiring client organizations.',
      attachTo: { element: '[data-tour="profile-completion"]', on: 'bottom' },
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
      title: '📊 Overall Key Metrics',
      text: 'Monitor your platform career performance parameters from a single row. This layout aggregates your count of Active Contracts, Pending proposal bids, successfully Delivered Projects, and Total Net Earnings (USD). Hovering on each card exposes monthly comparison indicators.',
      attachTo: { element: '[data-tour="stats"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'projects',
      title: '📁 Project Contracts Pipeline',
      text: 'This panel showcases your active milestones and deliverables. You can review ongoing contracts, check deadlines, and access files or feedback dashboards directly by selecting any active card.',
      attachTo: { element: '[data-tour="projects"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'interview',
      title: '📅 Screening & Interview Timeline',
      text: 'Access scheduled technical screenings, live evaluations, or consultation slots here. Hovering or clicking on an upcoming session will reveal meeting links, interviewer details, and candidate requirements.',
      attachTo: { element: '[data-tour="interviews"]', on: 'bottom' },
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

    if (mode !== 'page') return;
    if (target !== 'dashboard') return;

    if (el('[data-tour="profile-completion"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
