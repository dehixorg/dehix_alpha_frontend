'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/lib/store';
import {
  useTourFactory,
  type TourStepConfig,
} from '@/components/tour/shared/tourFactory';

// Helper functions
function el(selector: string) {
  const element = document.querySelector(selector);
  // Check if element exists and is visible (not just offsetParent)
  if (element) {
    const style = window.getComputedStyle(element);
    // Check if element is actually visible
    if (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    ) {
      return element;
    }
  }
  return null;
}

function switchMarketTab(tab: 'projects' | 'talent') {
  const root = document.querySelector('[data-tour="market-root"]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent('market:switch-tab', { detail: tab }));
}

const MARKET_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'pm-market',
    title: 'Marketplace',
    text: 'This is the marketplace where you find your next opportunity.',
    // selector: '[data-tour="pm-market"]',
    // position: 'top',
    beforeShowPromise: () =>
      new Promise((resolve) => {
        // Ensure tour starts from projects tab
        switchMarketTab('projects');
        setTimeout(resolve, 300);
      }),
  },
  {
    id: 'market-filters-projects',
    title: 'Filters',
    text: 'Use filters to narrow down project results.',
    selector: () => {
      // Check mobile filter trigger first
      if (el('[data-tour="pm-filter-trigger"]')) {
        return '[data-tour="pm-filter-trigger"]';
      }
      // Fallback to desktop filters
      return '[data-tour="pm-filters-desktop"]';
    },
    position: 'left',
    scrollTo: false,
  },
  {
    id: 'pm-job-cards',
    title: 'Project Opportunities',
    text: 'Apply for project-based opportunities here.',
    selector: '[data-tour="pm-job-cards"]',
    position: 'top',
    scrollTo: false,
  },
  {
    id: 'market-tabs',
    title: 'Marketplace Tabs',
    text: 'Switch between Project Market and Talent Market from here.',
    selector: '[data-tour="market-tabs"]',
    position: 'top',
  },
  {
    id: 'switch-to-talent',
    title: 'Talent Marketplace',
    text: "Now let's explore the Talent marketplace.",
    beforeShowPromise: () =>
      new Promise((resolve) => {
        switchMarketTab('talent');
        setTimeout(resolve, 300);
      }),
  },
  {
    id: 'market-filters-talent',
    title: 'Talent Filters',
    text: 'Filter talent profiles based on your needs.',
    selector: () => {
      // Check mobile filter trigger first
      if (el('[data-tour="tm-filter-trigger"]')) {
        return '[data-tour="tm-filter-trigger"]';
      }
      // Fallback to desktop filters
      return '[data-tour="tm-filters-desktop"]';
    },
    position: 'left',
    scrollTo: false,
  },
  {
    id: 'tm-job-cards',
    title: 'Talent Opportunities',
    text: 'Browse and connect with talented professionals.',
    selector: '[data-tour="tm-job-cards"]',
    position: 'bottom',
    scrollTo: false,
  },
];

export function useMarketTour() {
  const { trigger, mode, target } = useSelector((s: RootState) => s.tour);

  const shouldStartTour = trigger > 0 && mode === 'page' && target === 'market';

  useTourFactory(MARKET_TOUR_STEPS, shouldStartTour);
}
