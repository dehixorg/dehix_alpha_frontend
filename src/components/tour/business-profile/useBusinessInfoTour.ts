'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';
import { useSelector, useDispatch } from 'react-redux';

import type { RootState } from '@/lib/store';
import { clearTour } from '@/lib/tourSlice';

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

export function useBusinessInfoTour(isReady: boolean) {
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
        modalOverlayOpeningRadius: 9999,
        modalOverlayOpeningPadding: 8,
      },
    });

    tour.on('cancel', () => dispatch(clearTour()));
    tour.on('complete', () => dispatch(clearTour()));

    tour.addStep({
      id: 'business-info-intro',
      title: '🏢 Company Profile Settings',
      text: 'Welcome to your Business Information panel. Keeping your details accurate (e.g. company sizes, active websites, LinkedIn profiles) directly enhances trust with freelancers and peer verification networks.',
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
      id: 'business-profile-picture',
      title: '📸 Company Logo Upload',
      text: 'Click here or drag-and-drop a company logo (JPG, PNG, max 5MB). Once uploaded, your brand identity is saved automatically and updated across all platform listings.',
      attachTo: {
        element: '[data-tour="profile-picture"]',
        on: 'bottom',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'business-readonly-fields',
      title: '🔒 Secure Lock Contacts',
      text: 'For regulatory compliance and account security, verified contact parameters such as your registration email and phone numbers are locked here. If you need to make changes, please raise a ticket in the Reports section.',
      attachTo: {
        element: '[data-tour="business-readonly-fields"]',
        on: 'top',
      },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'save-changes',
      title: '💾 Save Profile Modifications',
      text: 'Make sure to click the Save Changes button to push any edited company size ranges, websites, or contact roles to the live platform database.',
      attachTo: {
        element: '[data-tour="save"]',
        on: 'top',
      },
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
    if (mode !== 'page') return;
    if (target !== 'business-info') return;

    tourRef.current?.start();
  }, [trigger, mode, target, isReady]);
}
