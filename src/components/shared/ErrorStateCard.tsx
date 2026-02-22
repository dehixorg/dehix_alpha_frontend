'use client';
import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  type?: 'network' | 'server' | 'general';
}

const ErrorStateCard: React.FC<ErrorStateCardProps> = ({
  title = "Projects are temporarily unavailable. Please try again after 24 hours.",
  message = "Please check back in a few moments.",
  onRetry,
  isRetrying = false,
  className = "",
  type = 'general',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-8 w-8" />;
      case 'server':
        return <ServerCrash className="h-8 w-8" />;
      default:
        return <AlertTriangle className="h-8 w-8" />;
    }
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/20 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm animate-in fade-in-50 duration-500",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="relative flex flex-col items-center justify-center py-16 px-8 text-center">

        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 border border-blue-500/20">
            <div className="text-blue-500 dark:text-blue-400">
              {getIcon()}
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        <div className="space-y-3 mb-8 max-w-md">
          <h3 className="text-xl font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Retry Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            className="min-w-[140px] border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            size="sm"
          >
            <RefreshCw 
              className={cn(
                "h-4 w-4 mr-2 transition-transform duration-500",
                isRetrying ? 'animate-spin' : 'hover:rotate-180'
              )} 
            />
            {isRetrying ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
        
        {/* Subtle hint text */}
        <p className="mt-6 text-xs text-muted-foreground/60">
          If the problem persists, please check your connection and try again later.
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-gradient-to-br from-primary to-primary/50 rounded-full opacity-60" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-secondary to-secondary/50 rounded-full opacity-60" />
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br from-accent to-accent/50 rounded-full opacity-60" />
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-gradient-to-br from-muted to-muted/50 rounded-full opacity-60" />
    </div>
  );
};

export default ErrorStateCard;
