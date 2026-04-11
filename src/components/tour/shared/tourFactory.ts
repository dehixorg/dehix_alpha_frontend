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
  selector: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isFirst?: boolean;
  isLast?: boolean;
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

    steps.forEach((step, index) => {
      const isFirst = index === 0;
      const isLast = index === steps.length - 1;

      // Determine which buttons to show
      let stepButtons = [...buttons.skipNext];

      if (!isFirst) {
        stepButtons = [...buttons.backNext];
      }

      if (isLast) {
        stepButtons = [...buttons.backComplete];
      }

      tour.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: {
          element: step.selector,
          on: (step.position || 'bottom') as any,
        },
        when: withProgress(tour),
        buttons: stepButtons,
      });
    });

    tourRef.current = tour;

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
