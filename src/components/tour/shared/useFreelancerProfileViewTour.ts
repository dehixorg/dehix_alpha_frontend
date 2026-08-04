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

export function useFreelancerProfileViewTour(isReady: boolean) {
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
      id: 'profile-view-intro',
      title: '👤 Professional Portfolio',
      text: "Welcome to this freelancer's public profile. This page compiles the developer's full credentials, certified work history, verified skills, and technical portfolios.",
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
      id: 'profile-view-actions',
      title: '✉️ Initiate Collaboration',
      text: 'If you are logged in as a business, you can invite this freelancer to your active projects or initiate a direct chat session to discuss contract requirements.',
      attachTo: { element: '[data-tour="profile-view-actions"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'profile-view-skills',
      title: '🛠️ Certified Technical Skills',
      text: "Browse the developer's matching skills and project domains. Verified badges indicate credentials certified by Dehix smart contract history.",
      attachTo: { element: '[data-tour="profile-view-skills"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'profile-view-projects',
      title: '📁 Portfolio Projects',
      text: 'Explore individual projects built by the freelancer. You can check source code links, live demo links, and review peer ratings.',
      attachTo: { element: '[data-tour="profile-view-projects"]', on: 'top' },
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
    if (target !== 'freelancer-profile-view') return;

    if (
      el('[data-tour="profile-view-actions"]') ||
      el('[data-tour="profile-view-skills"]') ||
      el('[data-tour="profile-view-projects"]')
    ) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
