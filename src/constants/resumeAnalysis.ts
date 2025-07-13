// constants/resumeAnalysis.ts

export const SCORE_MESSAGES = {
  EXCELLENT: 'Excellent! Your resume is well-optimized.',
  GOOD: 'Good job! A few tweaks can boost your score.',
  NEEDS_IMPROVEMENT: 'Your resume needs some improvements.',
  SIGNIFICANT_IMPROVEMENT: 'Your resume needs significant improvements.',
} as const;

export const ACTION_VERBS = [
  'achieved',
  'managed',
  'led',
  'developed',
  'created',
  'improved',
  'increased',
  'decreased',
  'optimized',
  'implemented',
  'designed',
  'built',
  'launched',
  'delivered',
  'executed',
  'streamlined',
  'coordinated',
  'supervised',
  'trained',
  'mentored',
  'analyzed',
  'solved',
  'reduced',
  'enhanced',
  'automated',
  'innovated',
] as const;

export const REQUIRED_SECTIONS = ['experience', 'education', 'skills'] as const;

export const OPTIONAL_SECTIONS = [
  'summary',
  'objective',
  'projects',
  'certifications',
  'achievements',
  'awards',
  'volunteer',
] as const;

export const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 50,
  COLOR_GREEN: 80,
  COLOR_YELLOW: 60,
} as const;

export const ANALYSIS_WEIGHTS = {
  GRAMMAR: 0.2,
  BREVITY: 0.2,
  IMPACT: 0.3,
  SECTIONS: 0.25,
  KEYWORDS: 0.05,
} as const;

export const SCORING_RULES = {
  FIRST_PERSON_PENALTY: 5,
  MULTIPLE_SPACES_PENALTY: 5,
  MULTIPLE_PERIODS_PENALTY: 5,
  MULTIPLE_EXCLAMATION_PENALTY: 5,
  CAPITALIZATION_PENALTY: 3,
  LONG_SENTENCE_PENALTY: 3,
  SHORT_SENTENCE_PENALTY: 2,
  LONG_WORD_PENALTY: 2,
  ACTION_VERB_POINTS: 5,
  QUANTIFIABLE_POINTS: 8,
  REQUIRED_SECTION_POINTS: 20,
  OPTIONAL_SECTION_POINTS: 10,
  MAX_OPTIONAL_SECTIONS: 4,
  IDEAL_SENTENCE_MIN: 10,
  IDEAL_SENTENCE_MAX: 25,
  LONG_WORD_THRESHOLD: 12,
  MAX_ACTION_VERB_SCORE: 50,
  MAX_QUANTIFIABLE_SCORE: 50,
  KEYWORD_BONUS_MAX: 20,
} as const;
