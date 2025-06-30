import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import { Card } from '@/components/ui/card';
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

  const getScoreColor = (score: number) => {
    if (score >= SCORE_THRESHOLDS.COLOR_GREEN) return 'bg-green-500';
    if (score >= SCORE_THRESHOLDS.COLOR_YELLOW) return 'bg-yellow-500';
    return 'bg-red-500';
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
    <div className="flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-3xl p-8 shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold mb-4">{`${name}'s Resume`}</h1>

        {score !== null && (
          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-32 h-32 flex items-center justify-center rounded-full ${getScoreColor(score)} text-white`}
            >
              <span className="text-3xl font-bold">{score}</span>
            </div>
            <p className="mt-4 text-lg">
              {`Your resume scored `}
              <span className="font-bold">{score} out of 100</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {getScoreMessage(score)}
            </p>
            {keywordInfo.total > 0 && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Keywords matched: {keywordInfo.matches}/{keywordInfo.total}
              </p>
            )}
          </div>
        )}

        {score === null ? (
          <Button onClick={handleAnalyzeResume} className="mb-6">
            Analyze Resume
          </Button>
        ) : (
          <div className="w-full h-66 flex items-center justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </Card>
    </div>
  );
};
