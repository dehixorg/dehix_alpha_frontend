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

export function useMilestoneTour(isReady: boolean) {
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
      id: 'milestones-intro',
      title: '🪜 Project Milestones & Tasks Board',
      text: 'Welcome to your active project workspace. This board tracks scheduled milestones, features/stories required for the milestone, specific sub-tasks, and assigned developer teams.',
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
      id: 'milestones-timeline',
      title: '📈 Milestone Timeline',
      text: 'Your milestone sequence is displayed here. Select any milestone node to view its specific stories, assigned sub-tasks, budget weight allocations, and active deadline details.',
      attachTo: { element: '[data-tour="milestone-timeline"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'milestones-stories',
      title: '📝 Stories & Sub-tasks Panel',
      text: "This section details the selected milestone's requirements. Each story card breaks down into actionable developer sub-tasks. You can assign tasks to yourself, track status checkmarks, update code deliverables links, and submit completed features for client review.",
      attachTo: { element: '[data-tour="milestone-stories"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'milestones-freelancers',
      title: '👥 Co-working Developer Team',
      text: 'Lists all verified freelancers collaborating on this project. Click the Chat icon on any member card to initiate real-time secure messaging.',
      attachTo: { element: '[data-tour="milestone-freelancers"]', on: 'left' },
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
    if (target !== 'milestones') return;

    if (
      el('[data-tour="milestone-timeline"]') ||
      el('[data-tour="milestone-stories"]') ||
      el('[data-tour="milestone-freelancers"]')
    ) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
