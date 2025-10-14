import React from 'react';

import { cn } from '@/lib/utils';

type ColorVariant = 'blue' | 'green' | 'amber' | 'default';

interface BaseStatItemProps {
  /** Main value to display */
  value: React.ReactNode;
  /** Label text */
  label: string;
  /** Additional class names */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'card';
  /** Color variant */
  color?: ColorVariant;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional text class */
  text_class?: string;
  /** Optional container class for the text block */
  content_class?: string;
  /** Optional class for the label */
  label_class?: string;
  /** Optional class for the value */
  value_class?: string;
}

interface DefaultVariantProps extends BaseStatItemProps {
  variant?: 'default';
  /** Icon component (required for default variant) */
  icon: React.ReactNode;
}

interface CardVariantProps extends BaseStatItemProps {
  variant: 'card';
  /** Optional icon component (not required for card variant) */
  icon?: React.ReactNode;
}

export type StatItemProps = DefaultVariantProps | CardVariantProps;

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  default: {
    bg: 'bg-muted/20',
    iconBg: '',
    iconColor: '',
  },
} as const;

const StatItem: React.FC<StatItemProps> = ({
  icon,
  label,
  value,
  className = '',
  variant = 'default',
  color = 'default',
  text_class = 'text-2xl',
  content_class = '',
  label_class = '',
  value_class = '',
}) => {
  const colors = colorMap[color] || colorMap.default;

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'border shadow-sm rounded-lg overflow-hidden',
          colors.bg,
          className,
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn('p-2 rounded-lg', colors.iconBg)}>
                {React.cloneElement(icon as React.ReactElement, {
                  className: cn(
                    'h-5 w-5',
                    colors.iconColor,
                    (icon as React.ReactElement)?.props?.className,
                  ),
                })}
              </div>
            )}
            <div className={cn('min-w-0', content_class)}>
              <p className={cn('text-sm text-muted-foreground', label_class)}>
                {label}
              </p>
              <p className={cn(text_class, value_class)}>{value}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-3 py-2',
        colors.bg,
        className,
      )}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className={cn(content_class)}>
        <p className={cn('text-xs text-muted-foreground', label_class)}>
          {label}
        </p>
        <p className={cn('text-sm font-medium', value_class)}>{value}</p>
      </div>
    </div>
  );
};

export default StatItem;
