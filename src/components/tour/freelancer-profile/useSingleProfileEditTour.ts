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

export function useSingleProfileEditTour(isReady: boolean) {
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
      id: 'profile-edit-intro',
      title: '✏️ Role Profile Designer',
      text: 'Welcome to the role profile configurations dashboard. This workspace enables you to tailor your resume details, skills weight, github repositories, projects portfolio, and rate limits for this specialized role profile.',
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
      id: 'profile-edit-rate',
      title: '💵 Base Billing Rate Limit',
      text: 'Define your hourly rate in USD. This rate will be displayed on client proposals and is used to match you with suitable organization budgets.',
      attachTo: { element: '[data-tour="profile-edit-rate"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'profile-edit-git',
      title: '🐙 GitHub Sync Integration',
      text: 'Synchronize your public and private GitHub repositories to display real-time contribution metrics, commit histories, and verify development stacks.',
      attachTo: { element: '[data-tour="profile-edit-git"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'profile-edit-portfolio',
      title: '📁 Portfolio Projects',
      text: 'Publish or link individual project links. Showcasing actual applications, code snippets, and deployment links builds high trust with business clients.',
      attachTo: { element: '[data-tour="profile-edit-portfolio"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'profile-edit-save',
      title: '💾 Save Profile Configuration',
      text: 'Once you are satisfied with your changes, click here to push updates. Changes are processed instantly and synced to the Dehix Talent Marketplace.',
      attachTo: { element: '[data-tour="profile-edit-save"]', on: 'top' },
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
    if (target !== 'single-profile-edit') return;

    if (
      el('[data-tour="profile-edit-rate"]') &&
      el('[data-tour="profile-edit-git"]') &&
      el('[data-tour="profile-edit-portfolio"]') &&
      el('[data-tour="profile-edit-save"]')
    ) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
