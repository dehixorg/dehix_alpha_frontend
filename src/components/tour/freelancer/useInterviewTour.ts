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

export function useInterviewerProfileTour(isReady: boolean) {
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
      id: 'interviewer-header',
      title: 'Interviews',
      text: 'Apply as an interviewer, manage your profile, and track interviews from here.',
      attachTo: {
        element: '[data-tour="interviewer-header"]',
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
      id: 'interview-lifecycle',
      title: 'Interview Lifecycle',
      text: 'Start with your profile. Once approved, you can manage active interviews, bids, and view your history here.',
      attachTo: {
        element: '[data-tour="interviewer-tabs"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'apply-interviewer',
      title: 'Apply as an Interviewer',
      text: 'Apply using your verified skills or domains. Once approved, you can start taking interviews.',
      attachTo: {
        element: '[data-tour="apply-interviewer"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'manage-availability',
      title: 'Manage Availability',
      text: 'Set when you are available to take interviews after approval. This helps companies schedule you faster.',
      attachTo: {
        element: '[data-tour="manage-availability"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
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
    if (target !== 'interviewer-profile') return;

    if (el('[data-tour="interviewer-profile"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
