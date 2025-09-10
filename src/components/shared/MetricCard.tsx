import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <div className="text-gray-600 dark:text-gray-400">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
};