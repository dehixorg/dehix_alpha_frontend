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

export function useIntervieweeTour(isReady: boolean) {
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
      id: 'interviewee-header',
      title: '🎓 Interviewee Board',
      text: 'Welcome to your Candidate Interview dashboard. When client organizations invite you to technical screenings or verification interviews, all matching meeting requests, links, and evaluations are managed from this workspace.',
      attachTo: {
        element: '[data-tour="interviewee-header"]',
        on: 'bottom',
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
      id: 'interviewee-tabs',
      title: '📁 Screening Pipeline Stages',
      text: 'Toggle between the status views: "Active" lists upcoming scheduled meetings, "Bids" shows meeting proposals awaiting confirmation, and "History" shows past results and scorecard logs.',
      attachTo: { element: '[data-tour="tab-list"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'interviewee-filter',
      title: '⚡ Filter Screenings',
      text: 'Use these filters to narrow down listed sessions by type: technical screenings, culture fit checkpoints, peer evaluations, or hiring reviews.',
      attachTo: { element: '[data-tour="all"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'interviewee-view-toggle',
      title: '🔄 Layout Toggle',
      text: 'Switch between a table view (useful for lists of files and scores) and a card view (ideal for date-oriented schedules).',
      attachTo: { element: '[data-tour="table"]', on: 'left' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'interviewee-empty',
      title: '📄 Scheduled Sessions List',
      text: 'Your active invitations and links to join live rooms will display here. Make sure to review the required topic notes before launching the meeting room.',
      attachTo: {
        element: '[data-tour="interviewee-empty"]',
        on: 'top',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'interviewee-sections',
      title: '📂 Skill Verifications & Growth',
      text: 'Interviews on Dehix help verify skills. Completing technical evaluations adds verified badges to your profile, increasing client trust.',
      attachTo: {
        element: '[data-tour="interviewee-sections"]',
        on: 'top',
      },
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
    if (target !== 'interviewee') return;

    if (el('[data-tour="interviewee"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
