'use client';

import React from 'react';
import {
  GitBranch,
  Star,
  Users,
  GitCommit,
  Code2,
  Calendar,
  ExternalLink,
  Unplug,
  Loader2,
  AlertCircle,
  GitFork,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GitHubStats } from '@/hooks/useGitHubStats';

// GitHub SVG Icon component
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}

function StatCard({ icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-background/50 p-3 backdrop-blur-sm transition-colors hover:bg-muted/30"
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-lg font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </motion.div>
  );
}

interface GitHubStatsCardProps {
  stats: GitHubStats | null;
  isLoading: boolean;
  error: string | null;
  onDisconnect: () => void;
  disconnecting?: boolean;
}

export default function GitHubStatsCard({
  stats,
  isLoading,
  error,
  onDisconnect,
  disconnecting = false,
}: GitHubStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading GitHub stats...
          </span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 py-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Failed to load GitHub stats</p>
            <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onDisconnect}>
            <Unplug className="h-3.5 w-3.5 mr-1.5" />
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-border/60">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0d1117] to-[#161b22] p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              {stats.avatarUrl ? (
                <Image
                  src={stats.avatarUrl}
                  alt={stats.username}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full ring-2 ring-green-500/30 ring-offset-2 ring-offset-[#0d1117]"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/30">
                  <GitHubIcon className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    {stats.username}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-green-500/40 bg-green-500/10 text-green-400 text-[10px] px-1.5 py-0"
                  >
                    Connected
                  </Badge>
                </div>
                {stats.bio && (
                  <p className="mt-0.5 text-xs text-gray-400 line-clamp-1 max-w-[280px]">
                    {stats.bio}
                  </p>
                )}
                {stats.memberSince && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Member since {stats.memberSince}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() =>
                  window.open(stats.profileUrl, '_blank', 'noopener')
                }
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={onDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Unplug className="h-3.5 w-3.5 mr-1" />
                )}
                Disconnect
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              icon={<GitBranch className="h-3.5 w-3.5" />}
              label="Repos"
              value={stats.publicRepos}
              delay={0.05}
            />
            <StatCard
              icon={<Star className="h-3.5 w-3.5" />}
              label="Stars"
              value={stats.totalStars}
              delay={0.1}
            />
            <StatCard
              icon={<GitFork className="h-3.5 w-3.5" />}
              label="Forks"
              value={stats.totalForks}
              delay={0.15}
            />
            <StatCard
              icon={<GitCommit className="h-3.5 w-3.5" />}
              label="Commits"
              value={stats.totalCommits}
              delay={0.2}
            />
            <StatCard
              icon={<Users className="h-3.5 w-3.5" />}
              label="Followers"
              value={stats.followers}
              delay={0.25}
            />
            <StatCard
              icon={<Code2 className="h-3.5 w-3.5" />}
              label="Recent"
              value={stats.recentCommits}
              delay={0.3}
            />
          </div>

          {/* Top Languages */}
          {stats.topLanguages.length > 0 && (
            <>
              <Separator className="my-4 bg-border/40" />
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Top Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {stats.topLanguages.map((lang, index) => (
                    <motion.div
                      key={lang.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="gap-1.5 px-2.5 py-1 text-xs font-medium"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: lang.color }}
                        />
                        {lang.name}
                        <span className="text-muted-foreground font-normal">
                          {lang.count}
                        </span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
