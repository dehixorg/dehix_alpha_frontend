'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Gauge,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Tag,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  scoreResume,
  fetchAiTips,
  type RuleBasedResult,
  type AiTipsResult,
} from '@/utils/resumeAnalysis';

interface ResumeScoreProps {
  name: string;
  resumeText: string;
  resumeId?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ value: number; isBaseline?: boolean }> = ({
  value,
  isBaseline,
}) => {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);
  const color =
    clamped >= 80 ? '#22c55e' : clamped >= 60 ? '#eab308' : '#ef4444';
  const label =
    clamped >= 80
      ? 'Excellent'
      : clamped >= 60
        ? 'Good'
        : isBaseline
          ? 'Good Start'
          : 'Needs Work';

  return (
    <div className="flex flex-col items-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        <text
          x="50%"
          y="46%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontSize: '32px', fontWeight: 800, fill: color }}
        >
          {clamped}
        </text>
        <text
          x="50%"
          y="65%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          / 100
        </text>
      </svg>
      <span className="mt-1 text-sm font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
};

const ScoreBar: React.FC<{
  label: string;
  score: number;
  feedback: string;
}> = ({ label, score, feedback }) => {
  const [open, setOpen] = useState(false);
  const color =
    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums w-6 text-right">
            {score}
          </span>
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-700 ease-out`}
          style={{
            width: `${score}%`,
            borderRadius: score >= 100 ? '9999px' : '9999px 0 0 9999px',
          }}
        />
      </div>
      {open && (
        <p className="text-xs text-muted-foreground pt-0.5 leading-relaxed">
          {feedback}
        </p>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const AtsScore: React.FC<ResumeScoreProps> = ({
  name,
  resumeText,
  resumeId,
}) => {
  const [scores, setScores] = useState<RuleBasedResult | null>(null);
  const [aiTips, setAiTips] = useState<AiTipsResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Recompute scores whenever resumeText changes
  useEffect(() => {
    if (!resumeText?.trim()) {
      setScores(null);
      return;
    }
    try {
      setScores(scoreResume(resumeText));
    } catch {
      setScores(null);
    }
  }, [resumeText]);

  // AI fetch — sends current form state so AI sees unsaved edits
  const runAiFetch = useCallback(
    async (text: string) => {
      if (!resumeId) {
        setAiError('Save your resume first to get AI tips.');
        return;
      }
      setAiLoading(true);
      setAiError(null);
      setAiTips(null);
      try {
        setAiTips(await fetchAiTips(resumeId, text));
      } catch (err: unknown) {
        const axiosMsg: string =
          (err as any)?.response?.data?.message ||
          (err instanceof Error ? err.message : 'Failed to get AI tips.');
        if (
          axiosMsg.includes('invalid or expired') ||
          axiosMsg.includes('INVALID_API_KEY')
        ) {
          setAiError(
            'Gemini API key is invalid or expired. Ask your admin to update GEMINI_API_KEY on the server.',
          );
        } else if (
          axiosMsg.includes('not configured') ||
          axiosMsg.includes('SERVICE_UNAVAILABLE')
        ) {
          setAiError('AI service is not configured on the server.');
        } else if (
          axiosMsg.includes('429') ||
          axiosMsg.includes('rate') ||
          axiosMsg.includes('RATE_LIMITED')
        ) {
          setAiError('AI is rate-limited. Wait 30 seconds and try again.');
        } else {
          setAiError('Failed to analyze resume. Please try again.');
          console.error('[AI Tips Error]:', axiosMsg);
        }
      } finally {
        setAiLoading(false);
      }
    },
    [resumeId],
  );

  const handleGetAiTips = useCallback(
    () => runAiFetch(resumeText),
    [runAiFetch, resumeText],
  );

  // Refresh: re-score immediately + re-fetch AI tips
  const handleRefresh = useCallback(() => {
    if (resumeText?.trim()) {
      try {
        setScores(scoreResume(resumeText));
      } catch {
        /* keep existing */
      }
    }
    if (resumeId) runAiFetch(resumeText);
  }, [runAiFetch, resumeText, resumeId]);

  if (!scores) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Gauge className="h-14 w-14 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground max-w-xs">
          Add content to your resume to see your ATS score.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Rule-based Score Card ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Gauge className="h-5 w-5" /> ATS Score
              </CardTitle>
              <CardDescription className="mt-0.5">
                {name ? `${name}'s resume` : 'Resume analysis'}
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={aiLoading}
              title="Re-check score and refresh AI tips"
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {aiLoading ? 'Analyzing…' : 'Refresh'}
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing
              value={scores.overallScore}
              isBaseline={scores.isBaseline}
            />
            <div className="flex-1 space-y-3 w-full">
              <ScoreBar
                label="Formatting & Structure"
                score={scores.categories.formatting.score}
                feedback={scores.categories.formatting.feedback}
              />
              <ScoreBar
                label="Content Quality"
                score={scores.categories.contentQuality.score}
                feedback={scores.categories.contentQuality.feedback}
              />
              <ScoreBar
                label="Impact & Achievements"
                score={scores.categories.impact.score}
                feedback={scores.categories.impact.feedback}
              />
              <ScoreBar
                label="Section Completeness"
                score={scores.categories.completeness.score}
                feedback={scores.categories.completeness.feedback}
              />
              <ScoreBar
                label="Keyword Density"
                score={scores.categories.keywordDensity.score}
                feedback={scores.categories.keywordDensity.feedback}
              />
            </div>
          </div>

          {scores.isBaseline && (
            <p className="text-xs text-center text-muted-foreground">
              Structure looks good. To break 80+, add quantified achievements
              and weave your skills into job descriptions.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── AI Tips Card ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" /> AI Tips
          </CardTitle>
          <CardDescription>
            {resumeId
              ? 'Get specific feedback powered by Gemini AI based on your current edits.'
              : 'Save your resume first to unlock AI tips.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {aiError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/8 p-3 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Gemini is analyzing your current resume…
            </div>
          )}

          {aiTips && !aiLoading && (
            <div className="space-y-4">
              {aiTips.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                  </p>
                  {aiTips.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 px-3 py-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-green-800 dark:text-green-300">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {aiTips.improvements.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Improvements
                  </p>
                  {aiTips.improvements.map((imp, i) => (
                    <div key={i} className="rounded border px-3 py-2 space-y-1">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-xs font-medium">{imp.issue}</span>
                      </div>
                      <div className="flex items-start gap-2 ml-5">
                        <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {imp.fix}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aiTips.suggestedKeywords.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Suggested Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiTips.suggestedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleGetAiTips}
            disabled={aiLoading || !resumeId}
            variant={aiTips ? 'outline' : 'default'}
            size="sm"
            className="w-full"
          >
            {aiLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Analyzing…
              </>
            ) : aiTips ? (
              <>
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Refresh AI Tips
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Get AI Tips
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
