'use client';

import React from 'react';

import { cn } from '@/lib/utils';

type StatusDotProps = {
  status?: string | null;
  className?: string;
  size?: 'sm' | 'md';
};

const StatusDot: React.FC<StatusDotProps> = ({
  status,
  className,
  size = 'md',
}) => {
  if (!status) return null;

  const normalized = (status || '').toUpperCase();

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={cn(
        'rounded-full',
        sizeClasses[size],
        normalized === 'ACTIVE' &&
          'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]',
        normalized === 'PENDING' &&
          'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]',
        normalized === 'COMPLETED' &&
          'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]',
        !['ACTIVE', 'PENDING', 'COMPLETED'].includes(normalized) &&
          'bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.7)]',
        className,
      )}
    />
  );
};

export default StatusDot;
