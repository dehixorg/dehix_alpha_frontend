'use client';

import React from 'react';
import { Crown, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  expiresAt?: string | Date | null;
  onUpgradeClick?: () => void;
  compact?: boolean;
}

export default function SubscriptionStatusBadge({
  expiresAt,
  onUpgradeClick: _onUpgradeClick,
  compact = false,
}: SubscriptionStatusBadgeProps) {
  const formattedDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Crown className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>Live Room Pro</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-primary/10 border border-amber-500/25 dark:border-amber-500/20 rounded-xl p-3.5 md:p-4 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Live Room Pro Monthly Plan
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Premium business features enabled. Unlimited room creation & AI
            scoping.
          </p>
        </div>
      </div>

      {formattedDate && (
        <div className="flex items-center gap-2 self-end md:self-auto text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-lg border border-border/60">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>
            Renews on:{' '}
            <strong className="text-foreground font-semibold">
              {formattedDate}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
