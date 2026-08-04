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

export function useProjectInvitationTour(isReady: boolean) {
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
        id: 'business-invitation-intro',
        title: '✉️ Sent Project Invitations',
        text: 'Welcome to your Outgoing Invitations dashboard. This dashboard tracks all invitation requests your business has extended to developers. You can review response states, send quick reminders, and check matches in real time.',
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
        id: 'business-invitation-status',
        title: '📋 Response Tracking & Stages',
        text: 'Invitations are organized by status categories: "Pending" indicates candidates currently reviewing your invitation offer, "Accepted" lists users ready to initiate project milestones, and "Declined" displays responses with candidate feedback.',
        attachTo: { element: '[data-tour="business-invitation"]', on: 'top' },
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
    }

    if (userType === 'freelancer') {
      tour.addStep({
        id: 'freelancer-invitation-intro',
        title: '✉️ Incoming Project Invitations',
        text: 'Welcome to your Project Invitations dashboard. When client organizations view your profile in the talent market and wish to work with you directly, their incoming invitations appear here.',
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
        id: 'freelancer-invitation-action',
        title: '✅ Accept or Decline Offers',
        text: 'Review the proposed budget details, role definitions, and milestones for each incoming invitation. You can click Accept to open a contract directly, or click Decline to send optional feedback to the company.',
        attachTo: { element: '[data-tour="freelancer-invitation"]', on: 'top' },
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
    if (target !== 'project-invitations') return;

    const selector =
      userType === 'business'
        ? '[data-tour="business-invitation"]'
        : '[data-tour="freelancer-invitation"]';

    if (el(selector)) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady, userType]);
}
