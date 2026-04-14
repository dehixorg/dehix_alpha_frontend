import type { Tour } from 'shepherd.js';

import type { AppDispatch } from '@/lib/store';

/**
 * Inject smooth tour animations CSS
 * Consolidated styling to keep config compact
 */
function injectTourStyles() {
  if (document.getElementById('tour-styles')) return;

  const style = document.createElement('style');
  style.id = 'tour-styles';
  style.textContent = `
    /* Light Mode (default) */
    :root {
      --shepherd-text-color: #1f2937;
      --shepherd-bg-color: #ffffff;
      --shepherd-border-color: #e5e7eb;
      --shepherd-button-bg: #ffffff;
      --shepherd-button-border: #d1d5db;
      --shepherd-button-text: #1f2937;
      --shepherd-button-hover: #a855f7;
      --shepherd-button-hover-text: #ffffff;
      --shepherd-overlay-color: rgba(0, 0, 0, 0.5);
    }

    /* Dark Mode */
    .dark {
      --shepherd-text-color: #f3f4f6;
      --shepherd-bg-color: #1f2937;
      --shepherd-border-color: #374151;
      --shepherd-button-bg: #374151;
      --shepherd-button-border: #4b5563;
      --shepherd-button-text: #f3f4f6;
      --shepherd-button-hover: #a855f7;
      --shepherd-button-hover-text: #ffffff;
      --shepherd-overlay-color: rgba(0, 0, 0, 0.7);
    }

    /* Core Shepherd Styles */
    .shepherd-element {
      animation: stepFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: opacity, transform;
      background-color: var(--shepherd-bg-color);
      color: var(--shepherd-text-color);
      border: 1px solid var(--shepherd-border-color);
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.16);
    }

    .dark .shepherd-element {
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    @keyframes stepFadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .shepherd-highlight {
      animation: highlightPulse 0.6s ease-in-out;
      transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 4px;
    }

    @keyframes highlightPulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
      50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }

    .shepherd-modal-overlay {
      animation: overlayFadeIn 0.3s ease-out;
      background-color: var(--shepherd-overlay-color);
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .shepherd-button {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: var(--shepherd-button-bg);
      color: var(--shepherd-button-text);
      border: 1px solid var(--shepherd-button-border);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
    }

    .shepherd-button:hover:not(:disabled) {
      background-color: var(--shepherd-button-hover);
      color: var(--shepherd-button-hover-text);
      border-color: var(--shepherd-button-hover);
      transform: translateY(-1px);
    }

    .shepherd-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .shepherd-title {
      color: var(--shepherd-text-color);
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .shepherd-text {
      color: var(--shepherd-text-color);
      font-size: 14px;
      line-height: 1.5;
    }

    .shepherd-progress {
      font-size: 12px;
      color: var(--shepherd-text-color);
      opacity: 0.7;
      margin-bottom: 10px;
    }

    .shepherd-centered {
      position: fixed;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 9999;
      max-width: 440px;
      width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
    }

    /* Ensure proper transitions between steps */
    .shepherd-element {
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .shepherd-element.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .shepherd-cancel-icon {
      color: var(--shepherd-text-color);
    }

    .shepherd-cancel-icon:hover {
      opacity: 0.7;
    }
  `;
  document.head.appendChild(style);
}

// Inject styles on module load
if (typeof window !== 'undefined') {
  injectTourStyles();
}

export const TOUR_CONFIG = {
  useModalOverlay: true,
  defaultStepOptions: {
    arrow: true,
    cancelIcon: { enabled: true },
    scrollTo: { behavior: 'smooth', block: 'center' },
    classes: 'shepherd-theme-custom',
  },
  tourName: 'platform-tour',
  modalOverlayOpeningPadding: 12,
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
      text: 'Got it',
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
