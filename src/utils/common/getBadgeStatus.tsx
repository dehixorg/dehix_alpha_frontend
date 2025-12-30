// Single source of truth for both solid and outline styles
type StatusStyle = { solid: string; outline: string };

const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
  // Green family
  active: {
    solid: 'bg-green-500 text-white',
    outline:
      'border-green-700/40 text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60',
  },
  verified: {
    solid: 'bg-green-500 text-white',
    outline:
      'border-green-700/40 text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60',
  },
  added: {
    solid: 'bg-green-500 text-white',
    outline:
      'border-green-700/40 text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60',
  },
  approved: {
    solid: 'bg-green-500 text-black',
    outline:
      'border-green-700/40 text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60',
  },

  // Yellow family
  pending: {
    solid: 'bg-yellow-500 text-black',
    outline:
      'border-yellow-700/40 text-yellow-600 bg-yellow-100 hover:bg-yellow-300 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/50',
  },
  ongoing: {
    solid: 'bg-yellow-500 text-black',
    outline:
      'border-yellow-700/40 text-yellow-600 bg-yellow-100 hover:bg-yellow-300 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/50',
  },

  // Red family
  rejected: {
    solid: 'bg-red-500 text-black',
    outline:
      'border-red-700/40 text-red-600 bg-red-100 hover:bg-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/60',
  },

  // Purple family
  mastery: {
    solid: 'bg-purple-600 text-white',
    outline:
      'border-purple-700/40 text-purple-600 bg-purple-100 hover:bg-purple-300 dark:bg-purple-900/20 dark:hover:bg-purple-900/60',
  },

  // Blue family
  proficient: {
    solid: 'bg-blue-500 text-white',
    outline:
      'border-blue-700/40 text-blue-600 bg-blue-100 hover:bg-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/60',
  },

  // Dehix talent expertise levels
  intermediate: {
    solid: 'bg-sky-500 text-white',
    outline:
      'border-sky-700/40 text-sky-600 bg-sky-100 hover:bg-sky-300 dark:bg-sky-900/20 dark:hover:bg-sky-900/60',
  },
  advanced: {
    solid: 'bg-indigo-500 text-white',
    outline:
      'border-indigo-700/40 text-indigo-600 bg-indigo-100 hover:bg-indigo-300 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/60',
  },
  expert: {
    solid: 'bg-purple-700 text-white',
    outline:
      'border-purple-800/40 text-purple-700 bg-purple-100 hover:bg-purple-300 dark:bg-purple-900/30 dark:hover:bg-purple-900/70',
  },

  // Green-light family
  beginner: {
    solid: 'bg-green-400 text-white',
    outline:
      'border-green-700/40 text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60',
  },

  // Neutral/gray fallback-like status (explicitly include completed for convenience)
  completed: {
    solid: 'bg-gray-500 text-white',
    outline:
      'border-gray-700/40 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900/20 dark:hover:bg-gray-900/40',
  },

  // Profile types
  freelancer: {
    solid: 'bg-blue-500 text-white',
    outline:
      'border-blue-700/40 text-blue-600 bg-blue-100 hover:bg-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/60',
  },
  consultant: {
    solid: 'bg-purple-600 text-white',
    outline:
      'border-purple-700/40 text-purple-600 bg-purple-100 hover:bg-purple-300 dark:bg-purple-900/20 dark:hover:bg-purple-900/60',
  },
};

const FALLBACK: StatusStyle = {
  solid: 'bg-gray-500 text-white',
  outline: 'border-muted-foreground/30 text-foreground bg-muted/30',
};

// Uppercase status aliases to map to our lowercase keys for BC
const STATUS_ALIASES: Record<string, string> = {
  PENDING: 'pending',
  ACTIVE: 'active',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  VERIFIED: 'verified',
  ADDED: 'added',
  MASTERY: 'mastery',
  PROFICIENT: 'proficient',
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  COMPLETED: 'completed',
  FREELANCER: 'freelancer',
  CONSULTANT: 'consultant',
};

const resolveKey = (status?: string) => {
  const raw = (status || '').trim();
  if (!raw) return '';
  const upper = raw.toUpperCase();
  if (STATUS_ALIASES[upper]) return STATUS_ALIASES[upper];
  return raw.toLowerCase();
};

// Backward-compatible exports
export const getBadgeColor = (status: string) => {
  const key = resolveKey(status);
  return (STATUS_STYLE_MAP[key] || FALLBACK).solid;
};

export const statusOutlineClasses = (s?: string) => {
  const key = resolveKey(s);
  return (STATUS_STYLE_MAP[key] || FALLBACK).outline;
};

// Profile type outline classes (Freelancer vs Consultant)
export const profileTypeOutlineClasses = (profileType?: string) => {
  const upper = (profileType || '').toUpperCase();
  const key =
    upper === 'CONSULTANT'
      ? 'consultant'
      : upper === 'FREELANCER'
        ? 'freelancer'
        : 'freelancer';
  return (STATUS_STYLE_MAP[key] || STATUS_STYLE_MAP.freelancer).outline;
};
