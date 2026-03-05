import { axiosInstance } from '@/lib/axiosinstance';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CategoryScore {
  score: number;
  feedback: string;
}

export interface AiTip {
  issue: string;
  fix: string;
}

export interface AiTipsResult {
  strengths: string[];
  improvements: AiTip[];
  suggestedKeywords: string[];
}

export interface RuleBasedResult {
  overallScore: number;
  isBaseline: boolean; // true when resume has structure but lacks content depth
  categories: {
    formatting: CategoryScore;
    contentQuality: CategoryScore;
    impact: CategoryScore;
    completeness: CategoryScore;
    keywordDensity: CategoryScore;
  };
}

// ─── Resume input shape (mirrors what editor.tsx passes as JSON) ──────────────

interface PersonalEntry {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  linkedin?: string;
  github?: string;
}

interface WorkEntry {
  jobTitle?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface EducationEntry {
  degree?: string;
  school?: string;
  startDate?: string;
  endDate?: string;
}

interface SkillEntry {
  skillName?: string;
  name?: string;
  label?: string;
}

interface ProjectEntry {
  title?: string;
  description?: string;
}

interface AchievementEntry {
  achievementName?: string;
}

interface ParsedResume {
  personalData: PersonalEntry[];
  workExperienceData: WorkEntry[];
  educationData: EducationEntry[];
  skills: Array<SkillEntry | string>;
  achievements: AchievementEntry[];
  summaryData: string[];
  projectData: ProjectEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_VERBS = new Set([
  'achieved',
  'architected',
  'automated',
  'built',
  'collaborated',
  'coordinated',
  'created',
  'decreased',
  'delivered',
  'deployed',
  'designed',
  'developed',
  'drove',
  'enhanced',
  'established',
  'executed',
  'facilitated',
  'generated',
  'implemented',
  'improved',
  'increased',
  'initiated',
  'innovated',
  'launched',
  'led',
  'maintained',
  'managed',
  'mentored',
  'migrated',
  'negotiated',
  'optimized',
  'orchestrated',
  'pioneered',
  'reduced',
  'refactored',
  'resolved',
  'shipped',
  'spearheaded',
  'streamlined',
  'supervised',
  'trained',
  'transformed',
  'upgraded',
]);

// Weights must sum to 1.0
// Formatting & Completeness are hygiene — they gate quality but shouldn't
// inflate score. Impact and KeywordDensity are the real differentiators.
const WEIGHTS = {
  formatting: 0.15, // hygiene gate — penalises bad patterns but shouldn't dominate
  contentQuality: 0.1, // length/brevity sanity
  impact: 0.35, // core differentiator — action verbs + quantified results
  completeness: 0.15, // hygiene gate — missing sections
  keywordDensity: 0.25, // ATS pass-rate driver
} as const;

// Baseline floor: applied when the resume has real structure (name + experience
// OR education present) but low depth scores would otherwise produce a
// discouraging sub-50 result on a first scan.
const BASELINE_FLOOR = 55;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escapes regex special chars and matches as a whole word / phrase boundary. */
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordMatch = (text: string, kw: string): boolean =>
  new RegExp(`(^|\\W)${escRe(kw)}(\\W|$)`).test(text);

function parseInput(resumeText: string): ParsedResume {
  const empty: ParsedResume = {
    personalData: [],
    workExperienceData: [],
    educationData: [],
    skills: [],
    achievements: [],
    summaryData: [],
    projectData: [],
  };

  if (!resumeText || !resumeText.trim()) return empty;

  try {
    const parsed = JSON.parse(resumeText.trim());
    return {
      personalData: Array.isArray(parsed.personalData)
        ? parsed.personalData
        : [],
      workExperienceData: Array.isArray(parsed.workExperienceData)
        ? parsed.workExperienceData
        : [],
      educationData: Array.isArray(parsed.educationData)
        ? parsed.educationData
        : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
        : [],
      summaryData: Array.isArray(parsed.summaryData) ? parsed.summaryData : [],
      projectData: Array.isArray(parsed.projectData) ? parsed.projectData : [],
    };
  } catch {
    return empty;
  }
}

function getSkillNames(skills: Array<SkillEntry | string>): string[] {
  const names = skills
    .map((s) => {
      if (typeof s === 'string') return s;
      return s?.label || s?.skillName || s?.name || '';
    })
    .filter(Boolean)
    .map((s) => s.toLowerCase().trim());
  return Array.from(new Set(names));
}

function getAllText(r: ParsedResume): string {
  const parts: string[] = [];
  r.personalData.forEach((p) => {
    parts.push(p.firstName || '', p.lastName || '', p.email || '');
  });
  r.summaryData.forEach((s) => {
    parts.push(s);
  });
  r.workExperienceData.forEach((w) => {
    parts.push(w.jobTitle || '', w.company || '', w.description || '');
  });
  r.educationData.forEach((e) => {
    parts.push(e.degree || '', e.school || '');
  });
  parts.push(...getSkillNames(r.skills));
  r.projectData.forEach((p) => {
    parts.push(p.title || '', p.description || '');
  });
  r.achievements.forEach((a) => {
    parts.push(a.achievementName || '');
  });
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// ─── Scoring functions (each returns 0-100 + feedback) ───────────────────────

function scoreFormatting(r: ParsedResume): CategoryScore {
  let score = 100;
  const issues: string[] = [];

  const allText = getAllText(r);
  const wordCount = allText.split(/\s+/).filter(Boolean).length;

  // Content depth gate — can't claim "perfect formatting" with barely any text
  if (wordCount < 50) {
    score = Math.min(score, 55);
    issues.push(
      'Not enough content to evaluate formatting. Add detailed descriptions to your roles.',
    );
  } else if (wordCount < 120) {
    score = Math.min(score, 75);
    issues.push(
      'Formatting improves with more substance. Flesh out your descriptions.',
    );
  }

  // First-person pronouns in descriptions
  const descriptions = [
    ...r.workExperienceData.map((w) => w.description || ''),
    ...r.projectData.map((p) => p.description || ''),
    ...r.summaryData,
  ]
    .join(' ')
    .toLowerCase();

  const firstPersonMatches = (
    descriptions.match(
      /\b(i(?:'m| am)?|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi,
    ) || []
  ).length;
  if (firstPersonMatches > 0) {
    score -= Math.min(25, firstPersonMatches * 5);
    issues.push(
      'Avoid first-person pronouns (I, me, my) in bullet points and descriptions.',
    );
  }

  // Check date consistency across experience and education
  const allDates: string[] = [];
  r.workExperienceData.forEach((w) => {
    if (w.startDate) allDates.push(w.startDate);
    if (w.endDate) allDates.push(w.endDate);
  });
  r.educationData.forEach((e) => {
    if (e.startDate) allDates.push(e.startDate);
    if (e.endDate) allDates.push(e.endDate);
  });
  if (allDates.length === 0 && r.workExperienceData.length > 0) {
    score -= 15;
    issues.push('Add start and end dates to your work experience entries.');
  }

  // Multiple spaces or double periods in descriptions (formatting noise)
  const noiseMatches = (allText.match(/\s{2,}|\.{2,}/g) || []).length;
  if (noiseMatches > 3) {
    score -= 10;
    issues.push(
      'Clean up extra spaces or repeated punctuation in your descriptions.',
    );
  }

  const hasContact =
    r.personalData.length > 0 &&
    !!(r.personalData[0].email && r.personalData[0].phoneNumber);
  if (!hasContact) {
    score -= 20;
    issues.push('Ensure contact information (email and phone) is present.');
  }

  if (issues.length === 0) {
    return {
      score: clamp(score),
      feedback:
        'Clean formatting with proper structure and no ATS-unfriendly patterns.',
    };
  }
  return { score: clamp(score), feedback: issues.join(' ') };
}

function scoreContentQuality(r: ParsedResume): CategoryScore {
  let score = 0;
  const issues: string[] = [];

  if (r.workExperienceData.length === 0 && r.summaryData.length === 0) {
    return { score: 0, feedback: 'No content found to evaluate.' };
  }

  // Depth score: total description word count across all work entries
  const totalDescWords = r.workExperienceData.reduce(
    (sum, w) => sum + (w.description?.split(/\s+/).filter(Boolean).length || 0),
    0,
  );

  // Earn points based on actual content depth (max 50 from depth)
  if (totalDescWords >= 80) score += 50;
  else if (totalDescWords >= 50) score += 40;
  else if (totalDescWords >= 30) score += 25;
  else if (totalDescWords >= 15) score += 15;
  else if (totalDescWords > 0) score += 5;
  else
    issues.push(
      '[Work Experience] Add descriptions to your roles explaining what you did.',
    );

  // Summary quality (max 30 from summary)
  if (r.summaryData.length === 0) {
    issues.push(
      '[Summary] Missing. Add a professional summary at the top of your resume.',
    );
  } else {
    const summaryWords = r.summaryData
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
    if (summaryWords >= 40) {
      score += 30; // 40+ words is good — no arbitrary upper cap penalty
    } else if (summaryWords >= 20) {
      score += 20;
    } else if (summaryWords > 0) {
      score += 8;
      issues.push(
        `[Summary] Only ${summaryWords} word(s) — too short. Aim for 40-80 words.`,
      );
    } else {
      issues.push(
        '[Summary] Empty. Write 40-80 words about your experience and goals.',
      );
    }
  }

  // Description quality penalties (max 20 from quality)
  // Threshold: >200 words per role is a wall-of-text; <10 words is useless.
  // Real detailed descriptions are 60-180 words — that's fine.
  let qualityScore = 20;
  let longDescriptionCount = 0;
  let shortDescriptionCount = 0;
  r.workExperienceData.forEach((w) => {
    if (!w.description) return;
    const wordCount = w.description.split(/\s+/).filter(Boolean).length;
    if (wordCount > 200) longDescriptionCount++;
    if (wordCount < 10 && wordCount > 0) shortDescriptionCount++;
  });

  if (longDescriptionCount > 0) {
    qualityScore -= longDescriptionCount * 6;
    issues.push(
      `[Work Experience] ${longDescriptionCount} description(s) exceed 200 words. Break them into concise bullet points.`,
    );
  }
  if (shortDescriptionCount > 0) {
    qualityScore -= shortDescriptionCount * 4;
    issues.push(
      `[Work Experience] ${shortDescriptionCount} description(s) are under 10 words. Add more detail about what you did.`,
    );
  }
  score += Math.max(0, qualityScore);

  const finalScore = clamp(score);

  if (issues.length === 0) {
    // Honest feedback based on actual score achieved
    const depthHint =
      totalDescWords < 80
        ? ` Add detail to Work Experience descriptions (${totalDescWords}→80+ words).`
        : '';
    const feedback =
      finalScore >= 90
        ? 'Well-structured content with appropriate length and detail.'
        : `Good structure, but there is room to improve.${depthHint}`;
    return { score: finalScore, feedback };
  }
  return { score: finalScore, feedback: issues.join(' ') };
}

function scoreImpact(r: ParsedResume): CategoryScore {
  const issues: string[] = [];

  if (r.workExperienceData.length === 0) {
    return {
      score: 0,
      feedback: 'No work experience found to evaluate impact.',
    };
  }

  // Action verb analysis — check first word of each description (used for context below)

  const allDescText = [
    ...r.workExperienceData.map((w) => w.description || ''),
    ...r.projectData.map((p) => p.description || ''),
    ...r.summaryData,
    ...r.achievements.map((a) => a.achievementName || ''),
  ]
    .join(' ')
    .toLowerCase();

  // Action verbs anywhere in all text (whole-word match only)
  let actionVerbCount = 0;
  ACTION_VERBS.forEach((verb) => {
    if (wordMatch(allDescText, verb)) actionVerbCount++;
  });

  // Quantified achievements — numbers with context
  const quantifiedMatches = (
    allDescText.match(
      /\d+\s*(%|percent|k\b|m\b|x\b|\+|million|thousand|\$|users|customers|requests|ms|seconds|minutes|hours|days|weeks|months|years)/gi,
    ) || []
  ).length;
  const bareNumbers = (allDescText.match(/\b\d{2,}\b/g) || []).length;
  const totalQuantified = quantifiedMatches + Math.floor(bareNumbers * 0.3);

  // Score calculation
  let score = 0;

  // 50% from action verbs
  const verbRatio = Math.min(1, actionVerbCount / 8);
  score += verbRatio * 50;

  // 50% from quantified results
  const quantRatio = Math.min(1, totalQuantified / 5);
  score += quantRatio * 50;

  if (actionVerbCount < 4) {
    issues.push(
      `Only ${actionVerbCount} action verbs found. Start bullet points with verbs like "Developed", "Reduced", "Led".`,
    );
  }
  if (totalQuantified < 2) {
    issues.push(
      'Few or no quantified achievements found. Add numbers, percentages, or scale (e.g. "Reduced load time by 40%").',
    );
  }
  if (issues.length === 0) {
    return {
      score: clamp(score),
      feedback: `Strong use of ${actionVerbCount} action verbs and ${totalQuantified} quantified results.`,
    };
  }
  return { score: clamp(score), feedback: issues.join(' ') };
}

function scoreCompleteness(r: ParsedResume): CategoryScore {
  const missing: string[] = [];
  let score = 0;

  // Required sections (20 pts each = 100 total for 5)
  const p = r.personalData[0];
  const hasEmail = !!p?.email;
  const hasPhone = !!p?.phoneNumber;
  const hasLinkedin = !!p?.linkedin;
  const hasName = !!p?.firstName;

  if (hasEmail) score += 12;
  else missing.push('email address');

  if (hasPhone) score += 8;
  else missing.push('phone number');

  if (hasLinkedin) score += 5;
  // linkedin is optional but good

  if (hasName) score += 5;

  if (r.summaryData.length > 0 && r.summaryData.join('').trim().length > 0) {
    score += 15;
  } else {
    missing.push('professional summary');
  }

  if (r.workExperienceData.length > 0) {
    score += 20;
    if (r.workExperienceData.length >= 2) score += 5; // bonus for multiple roles
  } else {
    missing.push('work experience');
  }

  if (r.educationData.length > 0) {
    score += 15;
  } else {
    missing.push('education');
  }

  const skillNames = getSkillNames(r.skills);
  if (skillNames.length > 0) {
    score += 10;
    if (skillNames.length >= 5) score += 5; // bonus for breadth
  } else {
    missing.push('skills');
  }

  if (r.projectData.length > 0) score += 5;
  if (r.achievements.length > 0) score += 5;

  if (missing.length === 0) {
    return {
      score: clamp(score),
      feedback: 'All key resume sections are present and populated.',
    };
  }
  return {
    score: clamp(score),
    feedback: `Missing sections or fields: ${missing.join(', ')}. Add these to improve completeness.`,
  };
}

function scoreKeywordDensity(r: ParsedResume): CategoryScore {
  const skillNames = getSkillNames(r.skills);
  const allText = getAllText(r);

  if (skillNames.length === 0 && allText.length < 100) {
    return {
      score: 0,
      feedback: 'Not enough content to evaluate keyword density.',
    };
  }

  // Tech keyword set that most ATS systems scan for
  const techKeywords = [
    'javascript',
    'typescript',
    'python',
    'java',
    'react',
    'angular',
    'vue',
    'node',
    'express',
    'django',
    'flask',
    'spring',
    'sql',
    'nosql',
    'mongodb',
    'postgresql',
    'mysql',
    'redis',
    'aws',
    'azure',
    'gcp',
    'docker',
    'kubernetes',
    'git',
    'ci/cd',
    'rest',
    'api',
    'graphql',
    'html',
    'css',
    'linux',
    'agile',
    'scrum',
    'machine learning',
    'deep learning',
    'data science',
    'cloud',
    'devops',
    'microservices',
    'testing',
    'unit test',
    'integration',
  ];

  let foundCount = 0;
  const foundKeywords: string[] = [];
  techKeywords.forEach((kw) => {
    if (wordMatch(allText, kw)) {
      foundCount++;
      foundKeywords.push(kw);
    }
  });

  // Skill coverage breadth
  const skillBreadthScore = Math.min(40, skillNames.length * 4);

  // Keyword presence in descriptions (not just skills section)
  const descriptionText = [
    ...r.workExperienceData.map((w) => w.description || ''),
    ...r.projectData.map((p) => p.description || ''),
    ...r.summaryData,
  ]
    .join(' ')
    .toLowerCase();

  let keywordsInDescriptions = 0;
  skillNames.forEach((skill) => {
    if (wordMatch(descriptionText, skill)) keywordsInDescriptions++;
  });
  const contextScore = Math.min(30, keywordsInDescriptions * 6);

  // Tech keyword density
  const techScore = Math.min(30, foundCount * 2);

  const total = skillBreadthScore + contextScore + techScore;

  if (skillNames.length < 5) {
    return {
      score: clamp(total),
      feedback: `Only ${skillNames.length} skills listed. Add more to improve keyword coverage.`,
    };
  }
  if (keywordsInDescriptions === 0) {
    return {
      score: clamp(total),
      feedback:
        'Skills are listed but not mentioned in your job descriptions. Weave them into your experience.',
    };
  }
  return {
    score: clamp(total),
    feedback: `Good keyword coverage with ${skillNames.length} skills. ${keywordsInDescriptions} appear in descriptions for context.`,
  };
}

// ─── Main rule-based scoring function (synchronous, instant) ─────────────────

export function scoreResume(resumeText: string): RuleBasedResult {
  const r = parseInput(resumeText);

  const formatting = scoreFormatting(r);
  const contentQuality = scoreContentQuality(r);
  const impact = scoreImpact(r);
  const completeness = scoreCompleteness(r);
  const keywordDensity = scoreKeywordDensity(r);

  const raw = clamp(
    formatting.score * WEIGHTS.formatting +
      contentQuality.score * WEIGHTS.contentQuality +
      impact.score * WEIGHTS.impact +
      completeness.score * WEIGHTS.completeness +
      keywordDensity.score * WEIGHTS.keywordDensity,
  );

  // Baseline detection: resume has real structure but hasn't been optimised yet.
  // Conditions: parsing succeeded + (name present) + (experience OR education exists).
  // This is NOT fake inflation — it means "the structure is valid, content depth
  // is what's missing" and prevents a 30/100 that demoralises first-time users.
  const hasName = !!r.personalData[0]?.firstName;
  const hasCoreContent =
    r.workExperienceData.length > 0 || r.educationData.length > 0;
  const isLowDepth = impact.score < 30 || keywordDensity.score < 20;
  const isBaseline =
    hasName && hasCoreContent && isLowDepth && raw < BASELINE_FLOOR;

  const overallScore = isBaseline ? Math.max(raw, BASELINE_FLOOR) : raw;

  return {
    overallScore,
    isBaseline,
    categories: {
      formatting,
      contentQuality,
      impact,
      completeness,
      keywordDensity,
    },
  };
}

// ─── Backend AI tips call (async, optional) ───────────────────────────────────

export async function fetchAiTips(
  resumeId: string,
  currentResumeText?: string,
): Promise<AiTipsResult> {
  const body: Record<string, unknown> = {};

  // Send the current form data so the backend can analyze live edits
  // instead of stale database content
  if (currentResumeText) {
    try {
      const parsed = JSON.parse(currentResumeText) as ParsedResume;
      body.resumeSnapshot = {
        personalInfo: parsed.personalData?.[0]
          ? {
              firstName: parsed.personalData[0].firstName || '',
              lastName: parsed.personalData[0].lastName || '',
            }
          : undefined,
        workExperience: (parsed.workExperienceData || []).map((w) => ({
          jobTitle: w.jobTitle || '',
          company: w.company || '',
          startDate: w.startDate || '',
          endDate: w.endDate || '',
          description: w.description || '',
        })),
        education: (parsed.educationData || []).map((e) => ({
          degree: e.degree || '',
          school: e.school || '',
          startDate: e.startDate || '',
          endDate: e.endDate || '',
        })),
        skills: getSkillNames(parsed.skills || []),
        projects: (parsed.projectData || []).map((p) => ({
          title: p.title || '',
          description: p.description || '',
        })),
        achievements: (parsed.achievements || []).map((a) => ({
          achievementDescription: a.achievementName || '',
        })),
        professionalSummary: (parsed.summaryData || []).join(' '),
      };
    } catch {
      // If parsing fails, backend will fall back to DB data
    }
  }

  const response = await axiosInstance.post(
    `/resume/${resumeId}/analyze`,
    body,
  );

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'AI analysis failed');
  }

  const data = response.data.data;
  return {
    strengths: Array.isArray(data?.strengths) ? data.strengths : [],
    improvements: Array.isArray(data?.improvements) ? data.improvements : [],
    suggestedKeywords: Array.isArray(data?.suggestedKeywords)
      ? data.suggestedKeywords
      : [],
  };
}
