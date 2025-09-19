import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type StatusVariant = 'pending' | 'verified' | 'rejected' | string;

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  customText?: string;
}

const statusVariants = {
  verified: {
    text: 'Verified',
    icon: CheckCircle2,
    className:
      'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20',
    iconClass: 'text-green-500',
  },
  pending: {
    text: 'Pending',
    icon: Clock,
    className:
      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
    iconClass: 'text-yellow-500',
  },
  rejected: {
    text: 'Rejected',
    icon: XCircle,
    className:
      'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    iconClass: 'text-red-500',
  },
} as const;

export function StatusBadge({
  status,
  className,
  size = 'md',
  showIcon = true,
  customText,
}: StatusBadgeProps) {
  const statusConfig =
    statusVariants[status as keyof typeof statusVariants] ||
    statusVariants.pending;
  const StatusIcon = statusConfig.icon;

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-7 px-2.5 text-xs',
    lg: 'h-8 px-3 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        sizeClasses[size],
        statusConfig.className,
        className,
      )}
    >
      {showIcon && (
        <StatusIcon
          className={cn('h-3.5 w-3.5 flex-shrink-0', statusConfig.iconClass)}
        />
      )}
      {customText || statusConfig.text}
    </span>
  );
}
