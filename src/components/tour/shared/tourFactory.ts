import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { useDispatch } from 'react-redux';

import { TOUR_CONFIG, withProgress, getButtonCombinations } from './tourConfig';

import { clearTour } from '@/lib/tourSlice';

export interface TourStepConfig {
  id: string;
  title: string;
  text: string;
  selector?: string | (() => string | null);
  position?: 'top' | 'bottom' | 'left' | 'right' | '';
  isFirst?: boolean;
  isLast?: boolean;
  scrollTo?: boolean | ScrollIntoViewOptions;
  beforeShowPromise?: () => Promise<void>;
  customButtons?: Array<{ text: string; action: (this: Tour) => void }>;
}

/**
 * Factory function to create and initialize a tour
 * Reduces boilerplate across all tour hooks
 */
export function useTourFactory(
  steps: TourStepConfig[],
  isReady: boolean,
  options?: {
    onComplete?: () => void;
    onCancel?: () => void;
  },
) {
  const tourRef = useRef<Tour | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isReady || tourRef.current) return;

    const tour = new Shepherd.Tour(TOUR_CONFIG);

    tour.on('cancel', () => {
      options?.onCancel?.();
      dispatch(clearTour());
    });

    tour.on('complete', () => {
      options?.onComplete?.();
      dispatch(clearTour());
    });

    const buttons = getButtonCombinations(tour, dispatch, clearTour);

    const resolvedSteps = steps.flatMap((step) => {
      const resolvedSelector =
        typeof step.selector === 'function' ? step.selector() : step.selector;

      if (typeof step.selector === 'function' && !resolvedSelector) {
        return []; // Skip this step
      }

      return [{ step, resolvedSelector }];
    });

    resolvedSteps.forEach(({ step, resolvedSelector }, index) => {
      const isFirst = index === 0;
      const isLast = index === resolvedSteps.length - 1;

      // Determine which buttons to show
      let stepButtons = [...buttons.skipNext];

      if (!isFirst) {
        stepButtons = [...buttons.backNext];
      }

      if (isLast) {
        stepButtons = [...buttons.backComplete];
      }

      const stepConfig: any = {
        id: step.id,
        title: step.title,
        text: step.text,
        when: withProgress(tour),
        buttons: step.customButtons || stepButtons,
        classes: 'shepherd-theme-custom',
      };

      if (resolvedSelector) {
        stepConfig.attachTo = {
          element: resolvedSelector,
          on: (step.position || 'bottom') as any,
        };
      } else {
        // For steps without a selector, explicitly center the popover
        stepConfig.classes += ' shepherd-centered';
      }

      // Handle scrollTo behavior
      if (step.scrollTo === false) {
        stepConfig.scrollTo = false;
      } else if (step.scrollTo === true || typeof step.scrollTo === 'object') {
        if (typeof step.scrollTo === 'object') {
          stepConfig.scrollTo = step.scrollTo;
        } else {
          // Default smooth scroll behavior
          stepConfig.scrollTo = { behavior: 'smooth', block: 'center' };
        }
      }

      if (step.beforeShowPromise) {
        stepConfig.beforeShowPromise = step.beforeShowPromise;
      }

      tour.addStep(stepConfig);
    });

    tourRef.current = tour;

    // Ensure only one step is visible at a time
    const hideOtherSteps = () => {
      setTimeout(() => {
        const activeStep = tour.getCurrentStep();
        const allElements = document.querySelectorAll('.shepherd-element');

        allElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;

          // Check if this is the active step's element
          const isActive =
            activeStep &&
            (el === activeStep.el ||
              htmlEl.getAttribute('data-step-id') === activeStep.id);

          if (isActive) {
            htmlEl.style.display = 'block';
            htmlEl.style.visibility = 'visible';
            htmlEl.style.opacity = '1';
          } else {
            htmlEl.style.display = 'none';
            htmlEl.style.visibility = 'hidden';
            htmlEl.style.opacity = '0';
          }
        });
      }, 100); // Small delay to ensure Shepherd has rendered the step
    };

    tour.on('show', hideOtherSteps);
    tour.on('next', hideOtherSteps);
    tour.on('back', hideOtherSteps);

    // Start the tour
    tour.start();

    return () => {
      if (tourRef.current) {
        tourRef.current.cancel();
        tourRef.current = null;
      }
    };
  }, [isReady, dispatch, steps, options]);

  return tourRef;
}
