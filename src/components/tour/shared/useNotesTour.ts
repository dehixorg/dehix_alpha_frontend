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

export function useNotesTour(isReady: boolean) {
  const tourRef = useRef<Tour | null>(null);
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const userType = useSelector((s: RootState) => s.user.type);
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
      id: 'notes-intro',
      title: '📝 Personal Notes Board',
      text:
        userType === 'business'
          ? 'Welcome to your Personal Notes space. This module allows you to write down business ideas, draft requirements, list developer requirements, or store quick bookmarks during candidate evaluations.'
          : 'Welcome to your Notes workspace. Use this board to write down reminders, store code snippets, draft project requirements, or track progress checklists for your active milestones.',
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
      id: 'notes-grid-step',
      title: '🎨 Color-Coded Note Cards',
      text: 'Your notes are displayed in a clean card grid. You can assign custom colors (e.g. blue, green, yellow), add tags, and filter notes by creation dates or categories.',
      attachTo: { element: '[data-tour="notes"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'notes-options-step',
      title: '📁 Note Management & Archiving',
      text: 'Hover over any card to pin it to the top of your feed, send it to the Archive tab, or move it to the Trash. Notes moved to the trash are automatically deleted after 30 days.',
      attachTo: { element: '[data-tour="notes"]', on: 'top' },
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
  }, [dispatch, userType]);

  useEffect(() => {
    if (!trigger) return;
    if (!isReady) return;
    if (mode !== 'page') return;
    if (target !== 'notes') return;

    if (el('[data-tour="notes"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady, userType]);
}
