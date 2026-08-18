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

export function useInterviewerProfileTour(isReady: boolean) {
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
      id: 'interviewer-header',
      title: '🎙️ Peer Interviewer Dashboard',
      text: 'Welcome to your Interviewer Profile. Verified developers on Dehix can register as peer interviewers. Conducting technical screenings and culture-fit assessments for other candidates earns you connects rewards and boosts your platform level.',
      attachTo: {
        element: '[data-tour="interviewer-header"]',
        on: 'bottom',
      },
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
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'interview-lifecycle',
      title: '📁 Interview Pipeline Navigation',
      text: 'Use these tabs to coordinate your interviewer tasks: "Active" shows scheduled screenings, "Bids" lists candidate slots you have requested, and "History" details all evaluations you have submitted.',
      attachTo: {
        element: '[data-tour="interviewer-tabs"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'apply-interviewer',
      title: '✍️ Apply as an Interviewer',
      text: 'Click here to submit an interviewer application. You will select specific tech stacks or domains (e.g. Frontend, Smart Contracts) you are qualified to screen candidates for.',
      attachTo: {
        element: '[data-tour="apply-interviewer"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'manage-availability',
      title: '📅 Manage Screening Availability',
      text: 'Once approved as an interviewer, use this calendar module to publish your weekly availability slots. Client organizations will schedule matching candidates directly within your specified hours.',
      attachTo: {
        element: '[data-tour="manage-availability"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
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
    if (target !== 'interviewer-profile') return;

    if (el('[data-tour="interviewer-profile"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
