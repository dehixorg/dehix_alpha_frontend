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

export function useProfilePlatformTour(isReady: boolean) {
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
      id: 'sidebar-intro',
      title: '📁 Freelancer Settings Sidebar',
      text: 'Welcome to your Settings Workspace. Use this sidebar to navigate all your personal configurations, verification procedures, streak trackings, resumes, and payment histories.',
      attachTo: {
        element: '[data-tour="sidebar"]',
        on: 'right',
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
      id: 'sidebar-personal-info',
      title: '👤 Identity Details & Bio',
      text: 'Start by filling in your basic personal details: upload your profile avatar, write a professional bio, add description tags, and configure your phone numbers.',
      attachTo: {
        element: '[data-tour="sidebar-personal-info"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-profile',
      title: '💼 Experience & Portfolios',
      text: 'Maintain your academic history, list previous employment roles, and link custom developer projects to enhance client matchmaking.',
      attachTo: {
        element: '[data-tour="sidebar-profile"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-kyc',
      title: '🆔 Identity KYC Verification',
      text: 'Mandatory verification portal. Upload government-issued identification cards and capture webcam selfies to unlock payouts and verified badges.',
      attachTo: {
        element: '[data-tour="sidebar-kyc"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-levels',
      title: '🏆 Level & Badges Progression',
      text: 'Track your XP progress, check qualifications, claim connects rewards, and unlock platform benefits.',
      attachTo: {
        element: '[data-tour="sidebar-levels"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-streak',
      title: '🔥 Daily Activity Streaks',
      text: 'Monitor your login streak, check heatmap charts, and claim milestone rewards.',
      attachTo: {
        element: '[data-tour="sidebar-streak"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-transactions',
      title: '💳 Financial Ledger & Withdrawal',
      text: 'Review connects transactions, track outstanding project payouts, and initiate cash withdrawals.',
      attachTo: {
        element: '[data-tour="sidebar-transactions"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-profiles',
      title: '📁 Specialized Sub-Profiles',
      text: 'Manage multiple sub-profiles to target separate roles (e.g. smart contract developer vs frontend developer).',
      attachTo: {
        element: '[data-tour="sidebar-profiles"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-resume',
      title: '📄 Resume Builder Center',
      text: 'Generate and compile resume templates dynamically using your profile metadata.',
      attachTo: {
        element: '[data-tour="sidebar-resume"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-feedback',
      title: '✍️ Submit Platform Feedback',
      text: 'Share UI bugs, suggest adjustments, or submit feature requests directly to the team.',
      attachTo: {
        element: '[data-tour="sidebar-feedback"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'sidebar-reports',
      title: '📁 Support & Dispute Logs',
      text: 'Raise formal milestone disputes, coordinate contract revisions, or report compliance violations. Your settings tour is complete!',
      attachTo: {
        element: '[data-tour="sidebar-reports"]',
        on: 'right',
      },
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

    if (mode !== 'platform') return;
    if (target !== 'sidebar') return;

    if (el('[data-tour="sidebar"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
