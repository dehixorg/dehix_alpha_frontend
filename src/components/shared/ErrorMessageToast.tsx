'use client';
import React, { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageToastProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  isVisible: boolean;
  onClose?: () => void;
  type?: 'network' | 'server' | 'general';
  autoClose?: boolean;
  duration?: number;
}

const ErrorMessageToast: React.FC<ErrorMessageToastProps> = ({
  message = 'Projects are temporarily unavailable. Please try again after 24 hours.',
  onRetry,
  isRetrying = false,
  isVisible,
  onClose,
  type = 'general',
  autoClose = true,
  duration = 5000,
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      if (autoClose && onClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShouldShow(false);
    }
  }, [isVisible, autoClose, onClose, duration]);

  const handleClose = () => {
    setShouldShow(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible && !shouldShow) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-md transition-all duration-300 ease-in-out',
        shouldShow ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
    >
      <div className="relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        <div className="relative flex items-start gap-3 p-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              {message}
            </h4>

            <div className="flex items-center gap-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  disabled={isRetrying}
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  {isRetrying ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {autoClose && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30">
            <div
              className="h-full bg-blue-500/60 transition-all ease-linear"
              style={{
                width: shouldShow ? '100%' : '0%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessageToast;
