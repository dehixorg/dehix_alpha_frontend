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

export function useAddProjectTour(isReady: boolean) {
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
      id: 'add-project-intro',
      title: '➕ Create Project Wizard',
      text: 'Welcome to the Project Creation Wizard. Follow these steps to define your project requirements, specify technical skills, establish budget parameters, and structure milestones for candidate developers.',
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
      id: 'add-project-details',
      title: '📝 Core Project Details',
      text: 'Enter your project title, select the high-level business domain categories, and write a comprehensive description detailing the technical requirements, scope of work, and key expectations.',
      attachTo: { element: '[data-tour="add-project-details"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'add-project-requirements',
      title: '🛠️ Candidate Qualifications',
      text: 'Add technical skill tags (e.g. Solidity, Next.js), set minimum experience years required, specify desired hourly rates, and define minimum connects required for developers to place proposals.',
      attachTo: {
        element: '[data-tour="add-project-requirements"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'add-project-milestones',
      title: '📅 Milestone Scheduling',
      text: 'Add and configure development milestones. Each milestone must specify a description, budget percentage weight allocation (totalling 100%), and a calendar deadline date.',
      attachTo: { element: '[data-tour="add-project-milestones"]', on: 'top' },
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
    if (target !== 'add-project') return;

    if (
      el('[data-tour="add-project-details"]') ||
      el('[data-tour="add-project-requirements"]') ||
      el('[data-tour="add-project-milestones"]')
    ) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
