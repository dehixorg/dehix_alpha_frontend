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

export function usePersonalInfoTour(isReady: boolean) {
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
      id: 'personal-info-intro',
      title: '👤 Onboarding & Identity Details',
      text: 'Welcome to your Personal Information settings. Maintaining highly detailed profiles directly increases the probability of matching with premium organizations. Start by filling out your legal name, username, and professional description.',
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
      id: 'profile-picture',
      title: '📸 Profile Avatar Upload',
      text: 'Click here or drag-and-drop a professional profile image (JPG, PNG, max 5MB). Once uploaded, your avatar is securely stored and updated instantly across all client directories.',
      attachTo: { element: '[data-tour="profile-picture"]', on: 'bottom' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'non-editable',
      title: '🔒 Secure Lock Information',
      text: 'For regulatory compliance, verified fields such as your registration email and phone numbers are locked here. If you need to update these parameters, please open a verification dispute ticket in the Reports section.',
      attachTo: { element: '[data-tour="non-editable-field"]', on: 'top' },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'skills-domains',
      title: '🛠️ Skill & Domain Mapping',
      text: 'Select your primary work domains and add tech-stack tags (e.g. React, Rust, Solidity). These attributes determine which marketplace projects appear on your feed, and are checked by our matching algorithms.',
      attachTo: {
        element: '[data-tour="skills-domains"]',
        on: 'top',
      },
      when: withProgress(tour),
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'save-profile',
      title: '💾 Save Profile Modifications',
      text: 'Always click Save Changes to push updates to the live databases. Verified changes will automatically recalculate your profile completion indicators.',
      attachTo: { element: '[data-tour="profile-save"]', on: 'top' },
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

    if (mode !== 'page') return;
    if (target !== 'personal-info-form') return;

    if (el('[data-tour="non-editable-field"]')) {
      tourRef.current?.start();
    }
  }, [trigger, mode, target, isReady]);
}
