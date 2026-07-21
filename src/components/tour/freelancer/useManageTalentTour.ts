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

export function useManageTalentTour(isReady: boolean) {
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
      id: 'manage-talent-intro',
      title: '📁 Application Pipeline Manager',
      text: 'Welcome to your Job Application Workspace. From this view, you can filter inbound invites, track interviews, review status changes, and manage active contracts for your listed skills and domains.',
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
      id: 'manage-talent-dropdown',
      title: '🛠️ Switch Skill/Domain Profile',
      text: 'Click this select box to switch between your active talent categories. This dynamically reloads the application pipeline list below for the chosen topic.',
      attachTo: {
        element: '[data-tour="manage-talent-dropdown"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'manage-talent-tabs',
      title: '📂 Pipeline Stage Filters',
      text: 'Inspect applications by category status: Applied (general applications), Invited (direct organization offers), Interview (video calls scheduled), Lobby (contract negotiation stage), and Selected/Rejected outcomes.',
      attachTo: { element: '[data-tour="manage-talent-tabs"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'manage-talent-list',
      title: '📋 Applications List',
      text: 'Review detailed contract cards here. Each entry shows project title, budget rates, organizational managers, and contains buttons to join interview schedules or negotiate contract bids.',
      attachTo: { element: '[data-tour="manage-talent-list"]', on: 'top' },
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
    if (target !== 'manage-talent') return;

    if (
      el('[data-tour="manage-talent-dropdown"]') ||
      el('[data-tour="manage-talent-tabs"]') ||
      el('[data-tour="manage-talent-list"]')
    ) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
