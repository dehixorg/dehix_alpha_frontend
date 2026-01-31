'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState } from '@/lib/store';
import { clearTour } from '@/lib/tourSlice';

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

    if (userType === 'business') {
      tour.addStep({
        id: 'notes',
        title: 'Notes',
        scrollTo: false,
        text: 'Use this section to create, organize, and manage your personal notes. Keep important ideas, tasks, and references in one place.',
        attachTo: {
          element: '[data-tour="notes"]',
          on: 'top',
        },
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
    }

    if (userType === 'freelancer') {
      //   tour.addStep({
      //     id: 'freelancer-invitation',
      //     title: 'Project Invitations',
      //     text: 'View and respond to project invitations sent to you by clients.',
      //     attachTo: {
      //       element: '[data-tour="freelancer-invitation"]',
      //       on: 'top',
      //     },
      //     buttons: [
      //       {
      //         text: 'Got it',
      //         action: () => {
      //           tour.complete();
      //           dispatch(clearTour());
      //         },
      //       },
      //     ],
      //   });
    }

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

    tourRef.current?.start();
  }, [trigger, mode, target, isReady, userType]);
}
