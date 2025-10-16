import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import { Gauge, ClipboardList, Sparkles } from 'lucide-react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SCORE_MESSAGES,
  ACTION_VERBS,
  REQUIRED_SECTIONS,
  OPTIONAL_SECTIONS,
  SCORE_THRESHOLDS,
  ANALYSIS_WEIGHTS,
  SCORING_RULES,
} from '@/constants/resumeAnalysis';

// Register required Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ResumeScoreProps {
  name: string;
  resumeText: string;
  jobKeywords: string[];
}

// Improved resume analysis function
const analyzeResume = (resumeText: string, jobKeywords: string[] = []) => {
  const text = resumeText.toLowerCase();

  // Grammar and formatting analysis
  const grammarScore = (() => {
    let score = 100;

    // Check for common grammar issues
    const grammarIssues = [
      /\b(i|me|my)\b/g, // First person pronouns (should be avoided)
      /\s{2,}/g, // Multiple spaces
      /[.]{2,}/g, // Multiple periods
      /[!]{2,}/g, // Multiple exclamation marks
    ];

    const penalties = [
      SCORING_RULES.FIRST_PERSON_PENALTY,
      SCORING_RULES.MULTIPLE_SPACES_PENALTY,
      SCORING_RULES.MULTIPLE_PERIODS_PENALTY,
      SCORING_RULES.MULTIPLE_EXCLAMATION_PENALTY,
    ];

    grammarIssues.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        score -= matches.length * penalties[index];
      }
    });

    // Check for proper capitalization after periods
    const sentences = text.split('.');
    let capitalizationErrors = 0;
    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase()) {
        capitalizationErrors++;
      }
    });
    score -= capitalizationErrors * SCORING_RULES.CAPITALIZATION_PENALTY;

    return Math.max(0, Math.min(100, score));
  })();

  // Brevity analysis
  const brevityScore = (() => {
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    if (sentences.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;

    // Ideal range: 15-20 words per sentence
    let score = 100;
    if (avgWordsPerSentence > SCORING_RULES.IDEAL_SENTENCE_MAX) {
      score -=
        (avgWordsPerSentence - SCORING_RULES.IDEAL_SENTENCE_MAX) *
        SCORING_RULES.LONG_SENTENCE_PENALTY;
    } else if (avgWordsPerSentence < SCORING_RULES.IDEAL_SENTENCE_MIN) {
      score -=
        (SCORING_RULES.IDEAL_SENTENCE_MIN - avgWordsPerSentence) *
        SCORING_RULES.SHORT_SENTENCE_PENALTY;
    }

    // Check for overly long words (jargon penalty)
    const longWords = words.filter(
      (word) => word.length > SCORING_RULES.LONG_WORD_THRESHOLD,
    );
    score -= longWords.length * SCORING_RULES.LONG_WORD_PENALTY;

    return Math.max(0, Math.min(100, score));
  })();

  // Impact analysis (action verbs and quantifiable achievements)
  const impactScore = (() => {
    const numbers = text.match(/\d+(\.\d+)?[%$k]?/g) || [];
    const actionVerbMatches = ACTION_VERBS.filter((verb) =>
      text.includes(verb),
    ).length;

    let score = 0;

    // Score for action verbs (up to 50 points)
    score += Math.min(
      SCORING_RULES.MAX_ACTION_VERB_SCORE,
      actionVerbMatches * SCORING_RULES.ACTION_VERB_POINTS,
    );

    // Score for quantifiable achievements (up to 50 points)
    score += Math.min(
      SCORING_RULES.MAX_QUANTIFIABLE_SCORE,
      numbers.length * SCORING_RULES.QUANTIFIABLE_POINTS,
    );

    return Math.min(100, score);
  })();

  // Sections analysis
  const sectionsScore = (() => {
    let score = 0;

    // Required sections
    REQUIRED_SECTIONS.forEach((section) => {
      if (text.includes(section)) {
        score += SCORING_RULES.REQUIRED_SECTION_POINTS;
      }
    });

    // Optional sections (up to max allowed)
    let optionalCount = 0;
    OPTIONAL_SECTIONS.forEach((section) => {
      if (
        text.includes(section) &&
        optionalCount < SCORING_RULES.MAX_OPTIONAL_SECTIONS
      ) {
        score += SCORING_RULES.OPTIONAL_SECTION_POINTS;
        optionalCount++;
      }
    });

    return Math.min(100, score);
  })();

  // Keyword matching bonus
  const keywordScore = (() => {
    if (jobKeywords.length === 0) return 0;

    const matchedKeywords = jobKeywords.filter((keyword) =>
      text.includes(keyword.toLowerCase()),
    );

    return Math.min(
      SCORING_RULES.KEYWORD_BONUS_MAX,
      (matchedKeywords.length / jobKeywords.length) *
        SCORING_RULES.KEYWORD_BONUS_MAX,
    );
  })();

  // Calculate total score with weights
  const totalScore = Math.round(
    grammarScore * ANALYSIS_WEIGHTS.GRAMMAR +
      brevityScore * ANALYSIS_WEIGHTS.BREVITY +
      impactScore * ANALYSIS_WEIGHTS.IMPACT +
      sectionsScore * ANALYSIS_WEIGHTS.SECTIONS +
      keywordScore * ANALYSIS_WEIGHTS.KEYWORDS,
  );

  return {
    totalScore: Math.max(0, Math.min(100, totalScore)),
    grammarScore: Math.round(grammarScore),
    brevityScore: Math.round(brevityScore),
    impactScore: Math.round(impactScore),
    sectionsScore: Math.round(sectionsScore),
    keywordMatches:
      jobKeywords.length > 0
        ? jobKeywords.filter((keyword) => text.includes(keyword.toLowerCase()))
            .length
        : 0,
    totalKeywords: jobKeywords.length,
  };
};

// Simple SVG circular progress to visualize the score
const CircleProgress: React.FC<{ value: number }> = ({ value }) => {
  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);
  const color =
    clamped >= SCORE_THRESHOLDS.COLOR_GREEN
      ? '#22c55e' // green-500
      : clamped >= SCORE_THRESHOLDS.COLOR_YELLOW
        ? '#eab308' // yellow-500
        : '#ef4444'; // red-500

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={
          typeof window !== 'undefined' &&
          document?.documentElement?.classList.contains('dark')
            ? '#374151'
            : '#E5E7EB'
        }
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{ fontSize: '28px', fontWeight: 700, fill: color }}
      >
        {clamped}
      </text>
    </svg>
  );
};

export const AtsScore: React.FC<ResumeScoreProps> = ({
  name,
  resumeText,
  jobKeywords = [],
}) => {
  const [score, setScore] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [categories, setCategories] = useState({
    grammar: 0,
    brevity: 0,
    impact: 0,
    sections: 0,
  });
  const [keywordInfo, setKeywordInfo] = useState({ matches: 0, total: 0 });

  const handleAnalyzeResume = () => {
    const analysis = analyzeResume(resumeText, jobKeywords);

    setScore(analysis.totalScore);
    setCategories({
      grammar: analysis.grammarScore,
      brevity: analysis.brevityScore,
      impact: analysis.impactScore,
      sections: analysis.sectionsScore,
    });
    setKeywordInfo({
      matches: analysis.keywordMatches,
      total: analysis.totalKeywords,
    });
  };

  const getScoreMessage = (score: number) => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return SCORE_MESSAGES.EXCELLENT;
    if (score >= SCORE_THRESHOLDS.GOOD) return SCORE_MESSAGES.GOOD;
    if (score >= SCORE_THRESHOLDS.FAIR) return SCORE_MESSAGES.NEEDS_IMPROVEMENT;
    return SCORE_MESSAGES.SIGNIFICANT_IMPROVEMENT;
  };

  const chartData = {
    labels: ['Grammar', 'Brevity', 'Impact', 'Sections'],
    datasets: [
      {
        label: 'Score',
        data: [
          categories.grammar,
          categories.brevity,
          categories.impact,
          categories.sections,
        ],
        backgroundColor: isDarkMode
          ? ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
          : ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
        borderColor: isDarkMode
          ? ['#1d4ed8', '#047857', '#d97706', '#7c3aed']
          : ['#2563eb', '#059669', '#f59e0b', '#8b5cf6'],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#ffffff' : '#000000',
        bodyColor: isDarkMode ? '#ffffff' : '#000000',
        borderColor: isDarkMode ? '#374151' : '#d1d5db',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2 justify-center">
            <Gauge className="h-6 w-6" /> ATS Score
          </CardTitle>
          <CardDescription>
            {name
              ? `${name}'s resume analysis`
              : 'Analyze your resume quality and structure'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {score === null ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="h-10 w-10" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-md text-center">
                Click Analyze to get grammar, brevity, impact, and section
                completeness scores. Optionally provide keywords to check for
                job match.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <CircleProgress value={score} />
                <p className="mt-3 text-base sm:text-lg">
                  Your resume scored{' '}
                  <span className="font-semibold">{score} / 100</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getScoreMessage(score)}
                </p>
                {keywordInfo.total > 0 && (
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-2">
                    Keywords matched: {keywordInfo.matches}/{keywordInfo.total}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Grammar</div>
                  <div className="text-lg font-semibold">
                    {categories.grammar}
                  </div>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Brevity</div>
                  <div className="text-lg font-semibold">
                    {categories.brevity}
                  </div>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Impact</div>
                  <div className="text-lg font-semibold">
                    {categories.impact}
                  </div>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Sections</div>
                  <div className="text-lg font-semibold">
                    {categories.sections}
                  </div>
                </div>
              </div>

              <div className="w-full pt-2">
                <div className="w-full h-66 flex items-center justify-center">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-3">
          {score === null ? (
            <Button onClick={handleAnalyzeResume} className="">
              <Sparkles className="mr-2 h-4 w-4" /> Analyze Resume
            </Button>
          ) : (
            <Button onClick={handleAnalyzeResume} variant="outline">
              <Sparkles className="mr-2 h-4 w-4" /> Analyze Again
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
