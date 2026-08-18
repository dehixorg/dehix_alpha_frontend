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

export function useLevelTour(isReady: boolean) {
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
      id: 'level-intro',
      title: '🏆 Level & Badges Center',
      text: 'Welcome to your Levels & Achievements overview. The gamification mechanics on Dehix track your contributions, reward you with platform levels, and unlock premium developer benefits (such as reduced fees and increased bid visibility).',
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
      id: 'level-xp-step',
      title: '⚡ Level Milestones & XP Progression',
      text: 'This card displays your current level, active XP points, and progression requirements. The level requirements checker tracks metrics like total bids placed, milestones completed, streak achievements, and peer interviews taken.',
      attachTo: { element: '[data-tour="level-badges"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'badges-claim-step',
      title: '🥇 Claim Achievements & Badges',
      text: 'Toggle the tabs below to check available achievements: "Collected Badges" show items you already own, and "All Badges" lists locked credentials. Click "Check Eligibility" on any badge card to see if you have met the requirements and claim connects rewards.',
      attachTo: { element: '[data-tour="level-badges"]', on: 'top' },
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
    if (target !== 'level-badges') return;

    if (el('[data-tour="level-badges"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
