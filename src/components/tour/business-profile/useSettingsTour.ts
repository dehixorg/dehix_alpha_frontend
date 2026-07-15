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

export function useSettingsTour(isReady: boolean) {
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
      id: 'settings-sidebar-intro',
      title: '📁 Business Settings Navigation',
      text: 'Welcome to your Company Settings Dashboard. Use this sidebar menu to update your business profile details, verify your corporate KYC compliance, review financial invoice logs, or file tickets with our administrative team.',
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
      id: 'settings-business-info',
      title: '🏢 Business Info Configuration',
      text: 'Start here to update basic company details: select size ranges, verify external websites, link LinkedIn profiles, and write description briefs for developer audiences.',
      attachTo: {
        element: '[data-tour="settings-business-info"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-kyc',
      title: '🆔 Compliance & KYC Verification',
      text: 'Mandatory verification portal for business profiles. Completing KYC unlocks invoice payouts, premium talent invitation options, and adds verified badges.',
      attachTo: {
        element: '[data-tour="settings-kyc"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-transactions',
      title: '💳 Financial Ledger & Invoicing',
      text: 'Review corporate balance histories, connects purchases, outstanding freelancer milestones, and export CSV tax receipts.',
      attachTo: {
        element: '[data-tour="settings-transactions"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-feedback',
      title: '✍️ Submit Platform Feedback',
      text: 'Report UI glitches, request features, or send bug logs directly to the developer team.',
      attachTo: {
        element: '[data-tour="settings-feedback"]',
        on: 'right',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'settings-reports',
      title: '📁 Support & Dispute Center',
      text: 'Raise formal project milestone disputes, coordinate contract revisions, or report compliance violations.',
      attachTo: {
        element: '[data-tour="settings-reports"]',
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
