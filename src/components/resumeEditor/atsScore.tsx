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

    grammarIssues.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        score -= matches.length * 5;
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
    score -= capitalizationErrors * 3;

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
    if (avgWordsPerSentence > 25) {
      score -= (avgWordsPerSentence - 25) * 3;
    } else if (avgWordsPerSentence < 10) {
      score -= (10 - avgWordsPerSentence) * 2;
    }

    // Check for overly long words (jargon penalty)
    const longWords = words.filter((word) => word.length > 12);
    score -= longWords.length * 2;

    return Math.max(0, Math.min(100, score));
  })();

  // Impact analysis (action verbs and quantifiable achievements)
  const impactScore = (() => {
    const actionVerbs = [
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
    ];

    const numbers = text.match(/\d+(\.\d+)?[%$k]?/g) || [];
    const actionVerbMatches = actionVerbs.filter((verb) =>
      text.includes(verb),
    ).length;

    let score = 0;

    // Score for action verbs (up to 50 points)
    score += Math.min(50, actionVerbMatches * 5);

    // Score for quantifiable achievements (up to 50 points)
    score += Math.min(50, numbers.length * 8);

    return Math.min(100, score);
  })();

  // Sections analysis
  const sectionsScore = (() => {
    const requiredSections = ['experience', 'education', 'skills'];

    const optionalSections = [
      'summary',
      'objective',
      'projects',
      'certifications',
      'achievements',
      'awards',
      'volunteer',
    ];

    let score = 0;

    // Required sections (20 points each)
    requiredSections.forEach((section) => {
      if (text.includes(section)) {
        score += 20;
      }
    });

    // Optional sections (10 points each, up to 40 points)
    let optionalCount = 0;
    optionalSections.forEach((section) => {
      if (text.includes(section) && optionalCount < 4) {
        score += 10;
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

    return Math.min(20, (matchedKeywords.length / jobKeywords.length) * 20);
  })();

  // Calculate total score with weights
  const totalScore = Math.round(
    grammarScore * 0.2 +
      brevityScore * 0.2 +
      impactScore * 0.3 +
      sectionsScore * 0.25 +
      keywordScore * 0.05,
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
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 85) return 'Excellent! Your resume is well-optimized.';
    if (score >= 70) return 'Good job! A few tweaks can boost your score.';
    if (score >= 50) return 'Your resume needs some improvements.';
    return 'Your resume needs significant improvements.';
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
