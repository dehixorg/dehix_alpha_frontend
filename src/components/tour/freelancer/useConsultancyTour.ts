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

export function useConsultancyTour(isReady: boolean) {
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
      id: 'consultancy-intro',
      title: '💼 Expert Consultancy Hub',
      text: 'Welcome to your Consultancy Workspace. This page allows you to list direct-hire consultancy packages, configure your hourly billing rates, review project contracts, and manage booking invitations.',
      when: withProgress(tour),
      buttons: [
        {
          text: 'Skip',
          action: () => {
            tour.cancel();
            dispatch(clearTour());
          },
        },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'add-consultancy-btn',
      title: '➕ Offer a Consultancy Service',
      text: 'Click here to publish a new consultancy offer. You can define specialized topics, upload portfolios, and set your target hourly billing rates.',
      attachTo: { element: '[data-tour="add-consultancy-btn"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'consultancy-list',
      title: '📋 Published Offers',
      text: 'This section renders your active consultancy offers. Client organizations can view these packages and book your services directly.',
      attachTo: { element: '[data-tour="consultancy-list"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'consultancy-projects',
      title: '📊 Project Milestones & Contracts',
      text: 'Track your ongoing and completed projects associated with booked consultancies. Monitor milestones, review deadlines, and upload deliverables.',
      attachTo: { element: '[data-tour="consultancy-projects"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'consultancy-invitations',
      title: '✉️ Inbound Booking Invitations',
      text: 'Check pending consultation requests from organizations. Here you can accept, renegotiate, or reject booking bids.',
      attachTo: {
        element: '[data-tour="consultancy-invitations"]',
        on: 'left',
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
    if (target !== 'consultancy') return;

    if (
      el('[data-tour="add-consultancy-btn"]') ||
      el('[data-tour="consultancy-list"]') ||
      el('[data-tour="consultancy-projects"]') ||
      el('[data-tour="consultancy-invitations"]')
    ) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
