import type { Tour } from 'shepherd.js';

import type { AppDispatch } from '@/lib/store';

/**
 * Shared Shepherd.js tour configuration
 * Reduces boilerplate across all tour hooks
 */

export const TOUR_CONFIG = {
  useModalOverlay: true,
  defaultStepOptions: {
    arrow: true,
    cancelIcon: { enabled: true },
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'shepherd-theme-custom',
  },
} as const;

/**
 * Button factories for common tour actions
 * @param tour - The Shepherd tour instance
 * @param dispatch - Redux dispatch function
 * @param clearTour - clearTour action from tourSlice
 */
export const createTourButtons = (
  tour: Tour,
  dispatch: AppDispatch,
  clearTour: () => any,
) => {
  return {
    skipButton: {
      text: 'Skip',
      action: () => {
        tour.cancel();
        dispatch(clearTour());
      },
    },
    backButton: {
      text: 'Back',
      action: () => tour.back(),
    },
    nextButton: {
      text: 'Next',
      action: () => tour.next(),
    },
    completeButton: {
      text: 'Complete',
      action: () => tour.complete(),
    },
  };
};

/**
 * Button combinations for common workflows
 * @param tour - The Shepherd tour instance
 * @param dispatch - Redux dispatch function
 * @param clearTour - clearTour action from tourSlice
 */
export const getButtonCombinations = (
  tour: Tour,
  dispatch: AppDispatch,
  clearTour: () => any,
) => {
  const buttons = createTourButtons(tour, dispatch, clearTour);
  return {
    skipNext: [buttons.skipButton, buttons.nextButton],
    backNext: [buttons.backButton, buttons.nextButton],
    backComplete: [buttons.backButton, buttons.completeButton],
    skipBackNext: [buttons.skipButton, buttons.backButton, buttons.nextButton],
  };
};

/**
 * Add progress indicator to tour footer
 * @param tour - The Shepherd tour instance
 */
export const withProgress = (tour: Tour) => {
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
};
