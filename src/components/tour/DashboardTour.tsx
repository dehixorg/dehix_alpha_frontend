'use client';

import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';

type Props = {
  startSignal: number;
  isReady: boolean;
};

function el(selector: string): Element | null {
  return document.querySelector(selector);
}

export default function DashboardTour({ startSignal, isReady }: Props) {
  const tourRef = useRef<Tour | null>(null);

  useEffect(() => {
    if (tourRef.current) return;

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: 'smooth', block: 'center' },
        classes: 'shepherd-theme-custom',
      },
      useModalOverlay: true,
    });

    tour.addStep({
      id: 'sidebar',
      title: 'Navigation',
      text: 'Use the sidebar to move between Dashboard, Projects, Interviews, Settings and more.',
      attachTo: { element: '[data-tour="sidebar"]', on: 'left' },
      buttons: [
        { text: 'Skip', action: tour.cancel },
        { text: 'Next', action: tour.next },
      ],
    });

    // tour.addStep({
    //   id: 'header',
    //   title: 'Header',
    //   text: 'This top area shows your current section and helps you navigate quickly.',
    //   attachTo: { element: '[data-tour="header"]', on: 'bottom' },
    //   buttons: [
    //     { text: 'Back', action: tour.back },
    //     { text: 'Next', action: tour.next },
    //   ],
    // });

    // tour.addStep({
    //   id: 'welcome',
    //   title: 'Welcome overview',
    //   text: 'This card summarizes what’s happening today and gives you quick access to key actions.',
    //   attachTo: { element: '[data-tour="welcome"]', on: 'bottom' },
    //   buttons: [
    //     { text: 'Back', action: tour.back },
    //     { text: 'Next', action: tour.next },
    //   ],
    // });

    tour.addStep({
      id: 'profile',
      title: 'Profile completion',
      text: 'Complete your profile to improve visibility and unlock more opportunities.',
      attachTo: { element: '[data-tour="profile-completion"]', on: 'bottom' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'stats',
      title: 'Quick stats',
      text: 'Track revenue and project status at a glance.',
      attachTo: { element: '[data-tour="stats"]', on: 'top' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'projects',
      title: 'Projects',
      text: 'View and manage your projects here. Use filters/tabs to switch views.',
      attachTo: { element: '[data-tour="projects"]', on: 'top' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Next', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'interviews',
      title: 'Interviews',
      text: 'Schedule and manage your meetings/interviews from this panel.',
      attachTo: { element: '[data-tour="interviews"]', on: 'left' },
      buttons: [
        { text: 'Back', action: tour.back },
        { text: 'Finish', action: tour.complete },
      ],
    });

    tour.on('complete', () => {
  const key = `tour:dashboard:done:${(window as any).__uid || 'guest'}`;
  localStorage.setItem(key, '1');
});
tour.on('cancel', () => {
  const key = `tour:dashboard:done:${(window as any).__uid || 'guest'}`;
  localStorage.setItem(key, '1');
});


    tourRef.current = tour;

    return () => {
      tourRef.current?.cancel();
      tourRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!startSignal) return;
    if (!isReady) return;

    const targetsExist =
      el('[data-tour="sidebar"]') &&
      el('[data-tour="header"]') &&
      el('[data-tour="welcome"]') &&
      el('[data-tour="profile-completion"]') &&
      el('[data-tour="stats"]') &&
      el('[data-tour="projects"]') &&
      el('[data-tour="interviews"]');

    if (!targetsExist) {
      setTimeout(() => tourRef.current?.start(), 300);
      return;
    }

    tourRef.current?.start();
  }, [startSignal, isReady]);

  return null;
}
