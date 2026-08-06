'use client';

import React from 'react';
import {
  Crown,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  expiresAt?: string | Date | null;
  onUpgradeClick?: () => void;
  compact?: boolean;
  /** Number of rooms created in the current cycle */
  roomsCreated?: number;
  /** Total rooms allowed per cycle */
  roomLimit?: number;
}

export default function SubscriptionStatusBadge({
  expiresAt,
  onUpgradeClick: _onUpgradeClick,
  compact = false,
  roomsCreated = 0,
  roomLimit = 2,
}: SubscriptionStatusBadgeProps) {
  const formattedDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const now = new Date();
  const expiry = expiresAt ? new Date(expiresAt) : null;
  const daysLeft =
    expiry && !isNaN(expiry.getTime())
      ? Math.max(
          0,
          Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : null;

  const roomsRemaining = Math.max(0, roomLimit - roomsCreated);
  const usagePercent =
    roomLimit > 0 ? Math.round((roomsCreated / roomLimit) * 100) : 0;

  const isLimitReached = roomsRemaining === 0;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;

  // ── Compact variant ────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Crown className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>Live Room Pro</span>
        {roomsRemaining !== undefined && (
          <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/15 rounded-full text-[10px] font-bold">
            {roomsRemaining}/{roomLimit} left
          </span>
        )}
      </div>
    );
  }

  // ── Full variant ───────────────────────────────────────────────────────────
  return (
    <div
      className={`w-full border rounded-xl p-3.5 md:p-4 mb-6 shadow-sm flex flex-col gap-3 backdrop-blur-sm transition-colors ${
        isLimitReached
          ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/30 dark:border-amber-500/25'
          : isExpiringSoon
            ? 'bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10 border-orange-500/30 dark:border-orange-500/25'
            : 'bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-primary/10 border-amber-500/25 dark:border-amber-500/20'
      }`}
    >
      {/* Top row: icon + info + expiry */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-md shrink-0 ${
              isLimitReached
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : 'bg-gradient-to-br from-amber-400 to-amber-600'
            } text-white`}
          >
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Live Room Pro Monthly Plan
                {!isLimitReached ? (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    Limit Reached
                  </span>
                )}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              {isLimitReached
                ? "You've used all room credits for this cycle. Purchase a new subscription."
                : 'Premium business features enabled. AI scoping & talent matching active.'}
            </p>
          </div>
        </div>

        {/* Expiry chip */}
        {formattedDate && (
          <div
            className={`flex items-center gap-2 self-end md:self-auto text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-lg border whitespace-nowrap ${
              isExpiringSoon
                ? 'border-orange-500/30 text-orange-600 dark:text-orange-400'
                : 'border-border/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>
              Expires:{' '}
              <strong
                className={
                  isExpiringSoon
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-foreground font-semibold'
                }
              >
                {formattedDate}
              </strong>
            </span>
            {daysLeft !== null && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isExpiringSoon
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {daysLeft}d left
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Credit usage bar ─────────────────────────────────────────────────── */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              Project credits:{' '}
              <strong
                className={
                  isLimitReached
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                }
              >
                {roomsCreated}/{roomLimit} used
              </strong>
            </span>
          </div>
          <span
            className={`text-xs font-bold ${
              isLimitReached
                ? 'text-amber-600 dark:text-amber-400'
                : roomsRemaining === 1
                  ? 'text-orange-500'
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isLimitReached
              ? 'No credits remaining'
              : `${roomsRemaining} credit${roomsRemaining !== 1 ? 's' : ''} remaining`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/30">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              usagePercent >= 100
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : usagePercent >= 50
                  ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            }`}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>

        {/* Individual credit dots */}
        <div className="flex items-center gap-2 mt-2">
          {Array.from({ length: roomLimit }).map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={`h-2.5 w-2.5 rounded-full border transition-all ${
                  i < roomsCreated
                    ? 'bg-amber-500 border-amber-600'
                    : 'bg-transparent border-border/50'
                }`}
              />
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                Project {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
