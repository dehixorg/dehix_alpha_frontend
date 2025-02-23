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
import { analyzeResume } from '@/utils/resumeAnalysis';
import { Button } from '@/components/ui/button';

// Register required Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ResumeScoreProps {
  name: string;
  resumeText: string;
  jobKeywords: string[];
}

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

  const handleAnalyzeResume = () => {
    const analysis = analyzeResume(resumeText, jobKeywords);

    setScore(analysis.totalScore);
    setCategories({
      grammar: analysis.grammarScore,
      brevity: analysis.brevityScore,
      impact: analysis.impactScore,
      sections: analysis.sectionsScore,
    });

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
          ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
          : ['#00000', '#00000', '#00000', '#00000'],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-3xl p-8 shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold mb-4">{`${name}'s Resume`}</h1>

        {score !== null && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gray-300">
              <span className="text-3xl text-black font-bold">{score}</span>
            </div>
            <p className="mt-4 text-lg">
              {`Your resume scored `}
              <span className="font-bold">{score} out of 100</span>
              {`. You're doing well, but a few tweaks can boost your score!`}
            </p>
          </div>
        )}

        <Button onClick={handleAnalyzeResume} className="mb-6">
          Analyze Resume
        </Button>

        {score !== null && (
          <div className="w-full h-66 flex items-center justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </Card>
    </div>
  );
};
