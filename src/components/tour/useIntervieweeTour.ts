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

export function useIntervieweeTour(isReady: boolean) {
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

    tour.addStep({
      id: 'interviewee',
      title: 'Interviewee Profile',
      scrollTo: false,
      text: 'Manage your interview profile, availability, and interview history here.',
      attachTo: { element: '[data-tour="interviewee"]', on: 'top' },
      buttons: [
        {
          text: 'Got it',
          action: () => {
            tour.complete();
            dispatch(clearTour());
          },
        },
      ],
    });

    tourRef.current = tour;
  }, [dispatch]);

  useEffect(() => {
    if (!trigger) return;
    if (!isReady) return;

    // ✅ page-only
    if (mode !== 'page') return;
    if (target !== 'interviewee') return;

    if (el('[data-tour="interviewee"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
