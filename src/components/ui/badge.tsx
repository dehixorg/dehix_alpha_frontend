import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500', // Adjusted focus ring
  {
    variants: {
      variant: {
        default: // Subtle grey, Google Chat like
          'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200/80 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600/80',
        primary: // For a more prominent badge, using blue
          'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200/80 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600/80',
        secondary: // Another subtle grey, slightly different from default if needed
          'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200/80 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500/80',
        destructive:
          'border-transparent bg-red-100 text-red-700 hover:bg-red-200/80 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600/80',
        outline: 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600', // Simple outline
      },
    },
    defaultVariants: {
      variant: 'default', // Default is now the subtle grey
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
