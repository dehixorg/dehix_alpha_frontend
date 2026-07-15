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

export function useLeaderboardTour(isReady: boolean) {
  const tourRef = useRef<Tour | null>(null);
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!trigger) return;
    if (!isReady) return;
    if (mode !== 'page') return;
    if (target !== 'leaderboard') return;

    if (!el('[data-tour="leaderboard"]')) return;

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

    const hasPodium = !!el('[data-tour="lb-podium"]');
    const hasTable = !!el('[data-tour="lb-table"]');
    const hasUserRank = !!el('[data-tour="lb-user-rank"]');

    tour.addStep({
      id: 'leaderboard-header',
      title: '🏆 Dehix Talent Leaderboard',
      scrollTo: false,
      text: "Welcome to the Dehix Rankings. This leaderboard highlights our community's top contributors. Rankings are calculated based on total contracts completed, peer evaluations, code contribution metrics, and active levels.",
      attachTo: { element: '[data-tour="leaderboard"]', on: 'bottom' },
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
          text: hasPodium || hasTable || hasUserRank ? 'Next' : 'Complete',
          action:
            hasPodium || hasTable || hasUserRank
              ? tour.next
              : () => {
                  tour.complete();
                  dispatch(clearTour());
                },
        },
      ],
    });

    if (hasPodium) {
      tour.addStep({
        id: 'lb-podium-step',
        title: '🥇 Top Performers Podium',
        scrollTo: false,
        text: 'The top three podium columns display the current leaders for the active time period. You can hover on their cards to inspect their primary development domains and top achievements.',
        attachTo: { element: '[data-tour="lb-podium"]', on: 'bottom' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          {
            text: hasTable || hasUserRank ? 'Next' : 'Complete',
            action:
              hasTable || hasUserRank
                ? tour.next
                : () => {
                    tour.complete();
                    dispatch(clearTour());
                  },
          },
        ],
      });
    }

    if (hasTable) {
      tour.addStep({
        id: 'lb-table-step',
        title: '📋 Detailed Ranking Table',
        scrollTo: false,
        text: "Scroll through the paginated rankings table to see other participants. Each row displays the developer's current rank status, level badge, experience profile, total score, and peer ratings.",
        attachTo: { element: '[data-tour="lb-table"]', on: 'top' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          {
            text: hasUserRank ? 'Next' : 'Complete',
            action: hasUserRank
              ? tour.next
              : () => {
                  tour.complete();
                  dispatch(clearTour());
                },
          },
        ],
      });
    }

    if (hasUserRank) {
      tour.addStep({
        id: 'lb-user-rank-step',
        title: '⭐ Your Ranking Status',
        text: 'This sticky widget displays your exact placement, experience points (XP), and progress relative to the rest of the community. Participate in more reviews or complete contracts to boost your positioning here!',
        attachTo: { element: '[data-tour="lb-user-rank"]', on: 'top' },
        when: withProgress(tour),
        buttons: [
          { text: 'Back', action: tour.back },
          {
            text: 'Got it',
            action: () => {
              tour.complete();
              dispatch(clearTour());
            },
          },
        ],
      });
    }

    tour.start();
    tourRef.current = tour;

    return () => {
      tour.cancel();
      tourRef.current = null;
      dispatch(clearTour());
    };
  }, [trigger, mode, target, isReady, dispatch]);
}
