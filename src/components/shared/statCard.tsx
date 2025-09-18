import React from 'react';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

type TrendType = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  additionalInfo?: string;
  trend?: {
    value: string;
    type: TrendType;
    label?: string;
  };
  className?: string;
  variant?: 'default' | 'secondary' | 'accent';
}

export default function StatCard({
  title,
  value,
  icon,
  additionalInfo,
  trend,
  className,
  variant = 'default',
}: StatCardProps) {
  const trendIcons = {
    up: <ArrowUp className="h-3.5 w-3.5 text-green-500" />,
    down: <ArrowDown className="h-3.5 w-3.5 text-red-500" />,
    neutral: <ArrowRight className="h-3.5 w-3.5 text-gray-400" />,
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const variantClasses = {
    default: 'bg-card border',
    secondary: 'bg-secondary/50 border',
    accent: 'bg-primary/5 border border-primary/20',
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-md overflow-hidden',
        'h-full flex flex-col',
        variantClasses[variant],
        className,
      )}
    >
      <CardHeader className="pb-3 flex-1">
        <div className="flex justify-between items-start h-full">
          <div className="space-y-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              {title}
            </CardDescription>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {value}
            </CardTitle>
            {additionalInfo && (
              <p className="text-sm text-muted-foreground mt-1">
                {additionalInfo}
              </p>
            )}
          </div>
          {icon}
        </div>
      </CardHeader>
      {trend && (
        <CardFooter className="pt-0 mt-auto">
          <div className="flex items-center text-sm">
            <span
              className={cn(
                'flex items-center font-medium',
                trendColors[trend.type],
              )}
            >
              {trendIcons[trend.type]}
              <span className="ml-1">{trend.value}</span>
            </span>
            {trend.label && (
              <span className="text-muted-foreground ml-2">{trend.label}</span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
