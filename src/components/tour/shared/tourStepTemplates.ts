import type { TourStepConfig } from './tourFactory';

/**
 * Reusable tour step templates
 * Use these as base templates for creating new tours quickly
 */

/**
 * Create a standard step with title and description
 */
export const createBasicStep = (
  id: string,
  title: string,
  text: string,
  selector: string,
  position: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
): TourStepConfig => {
  return {
    id,
    title,
    text,
    selector,
    position,
  };
};

/**
 * Create steps for header navigation
 */
export const createHeaderSteps = (): TourStepConfig[] => [
  createBasicStep(
    'header-search',
    'Global Search',
    'Search across the entire platform from here.',
    '[data-tour="search"]',
    'bottom',
  ),
  createBasicStep(
    'header-connects',
    'Wallet & Connects',
    'View and manage your connects here.',
    '[data-tour="header-connects"]',
    'bottom',
  ),
  createBasicStep(
    'header-notifications',
    'Notifications',
    'All important alerts and updates appear here.',
    '[data-tour="header-notifications"]',
    'bottom',
  ),
  createBasicStep(
    'header-profile',
    'Profile & Settings',
    'Manage your account and preferences here.',
    '[data-tour="header-profile"]',
    'bottom',
  ),
];

/**
 * Create steps for sidebar navigation
 */
export const createSidebarSteps = (): TourStepConfig[] => [
  createBasicStep(
    'nav-dashboard',
    'Dashboard',
    'Your overview of activity, progress, and stats.',
    '[data-tour="nav-dashboard"]',
    'right',
  ),
  createBasicStep(
    'nav-market',
    'Marketplace',
    'Explore projects, opportunities, and listings.',
    '[data-tour="nav-market"]',
    'right',
  ),
  createBasicStep(
    'nav-chat',
    'Messages',
    'Communicate with clients and freelancers.',
    '[data-tour="nav-chat"]',
    'right',
  ),
];

/**
 * Combine multiple step groups
 */
export const combineSteps = (
  ...stepGroups: TourStepConfig[][]
): TourStepConfig[] => {
  return stepGroups.flat();
};

/**
 * Filter steps based on selector availability
 * Useful for handling optional UI elements
 */
export const filterAvailableSteps = (
  steps: TourStepConfig[],
): TourStepConfig[] => {
  return steps.filter((step) => {
    return document.querySelector(step.selector) !== null;
  });
};

/**
 * Example: Create a complete freelancer dashboard tour
 */
export const createFreelancerDashboardTourSteps = (): TourStepConfig[] => {
  return combineSteps(
    [
      createBasicStep(
        'profile-completion',
        'Profile Completion',
        'Complete your profile to unlock more features.',
        '[data-tour="profile-completion"]',
        'bottom',
      ),
      createBasicStep(
        'stats',
        'Stats Overview',
        'Track your progress and revenue here.',
        '[data-tour="stats"]',
        'bottom',
      ),
      createBasicStep(
        'recent-activity',
        'Recent Activity',
        'See your recent projects and transactions.',
        '[data-tour="recent-activity"]',
        'bottom',
      ),
    ],
    createHeaderSteps(),
    createSidebarSteps(),
  );
};
