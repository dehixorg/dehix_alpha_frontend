import React from 'react';
import {
  Users,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers,
  Info,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export type TalentRequirement = {
  roleTitle: string;
  skillDomain: string;
  reason: string;
  aiSuggestedCount: number;
  businessSelectedCount: number;
  minCount: number;
  maxCount: number;
  priority: 'required' | 'recommended' | 'optional';
};

interface TalentRequirementPlannerProps {
  idea?: string;
  analysis?: any;
  blueprint?: any;
  technicalAnswers?: Record<string, string>;
  requirements: TalentRequirement[];
  onChange: (requirements: TalentRequirement[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const TalentRequirementPlanner: React.FC<
  TalentRequirementPlannerProps
> = ({ requirements, onChange, onContinue, onBack }) => {
  const handleUpdateCount = (index: number, delta: number) => {
    const updated = [...requirements];
    const item = updated[index];
    if (!item) return;

    const newCount = Math.max(
      item.minCount ?? 0,
      Math.min(item.maxCount ?? 10, item.businessSelectedCount + delta),
    );
    updated[index] = {
      ...item,
      businessSelectedCount: newCount,
    };
    onChange(updated);
  };

  const totalSelectedTalents = requirements.reduce(
    (sum, r) => sum + (r.businessSelectedCount || 0),
    0,
  );
  const totalSuggestedTalents = requirements.reduce(
    (sum, r) => sum + (r.aiSuggestedCount || 0),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
            Phase 3 talent planning
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Talent Requirement Planner
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            AI estimated the team needed for this idea. Adjust the number of
            freelancers for each role before matching talent.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/90 to-card/40 p-5 backdrop-blur-md shadow-xs relative overflow-hidden">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2 font-bold">
            <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Users className="h-4 w-4" />
            </div>
            Required Roles
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
            {requirements.length}
          </div>
          <div className="text-xs text-muted-foreground/80 mt-1">
            Specialized team roles required
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card/50 to-card/20 p-5 backdrop-blur-md shadow-xs relative overflow-hidden">
          <div className="text-xs text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-2 font-bold">
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
              <Sparkles className="h-4 w-4" />
            </div>
            AI Suggested Team
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-500 tracking-tight">
            {totalSuggestedTalents}
          </div>
          <div className="text-xs text-muted-foreground/80 mt-1">
            Total freelancers recommended by AI
          </div>
        </div>

        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-card/30 p-5 backdrop-blur-md shadow-md relative overflow-hidden">
          <div className="text-xs text-primary uppercase tracking-wider mb-2 flex items-center gap-2 font-bold">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            Business Selected Team
          </div>
          <div className="text-3xl font-extrabold font-mono text-primary tracking-tight">
            {totalSelectedTalents}
          </div>
          <div className="text-xs text-muted-foreground/90 mt-1 flex items-center gap-1 font-medium">
            {totalSelectedTalents === totalSuggestedTalents ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Matches AI estimate
              </span>
            ) : totalSelectedTalents > totalSuggestedTalents ? (
              <span className="text-primary font-semibold">
                +{totalSelectedTalents - totalSuggestedTalents} more than AI
                suggested
              </span>
            ) : (
              <span className="text-amber-500 font-semibold">
                -{totalSuggestedTalents - totalSelectedTalents} fewer than AI
                suggested
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Team List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-primary" />
            Recommended Team
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Use <span className="font-mono text-foreground font-bold">[-]</span>{' '}
            and <span className="font-mono text-foreground font-bold">[+]</span>{' '}
            to adjust headcount per role
          </span>
        </div>

        {requirements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 p-8 text-center bg-card/20">
            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              No talent requirements estimated.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requirements.map((req, idx) => {
              const priorityBadgeClass =
                req.priority === 'required'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : req.priority === 'recommended'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                    : 'bg-muted/50 border-border/50 text-muted-foreground';

              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-background p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md space-y-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left Details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground tracking-tight">
                          {req.roleTitle}
                        </h3>
                        <span
                          className={`rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${priorityBadgeClass}`}
                        >
                          {req.priority}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/40 text-xs text-muted-foreground font-medium">
                        {req.skillDomain}
                      </div>
                    </div>

                    {/* Counter Controls */}
                    <div className="flex items-center gap-4 bg-background/80 border border-border/60 px-4 py-2.5 rounded-2xl shrink-0 self-start sm:self-center shadow-xs">
                      {/* AI Suggested Count Badge */}
                      <div className="text-right pr-4 border-r border-border/40">
                        <div className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider">
                          AI suggested
                        </div>
                        <div className="text-base font-mono font-extrabold text-amber-500">
                          {req.aiSuggestedCount}
                        </div>
                      </div>

                      {/* Business Selected Count Counter */}
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-foreground">
                          Business selected:
                        </div>
                        <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => handleUpdateCount(idx, -1)}
                            disabled={
                              req.businessSelectedCount <= (req.minCount ?? 0)
                            }
                            className="h-8 w-8 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center disabled:opacity-30 disabled:hover:bg-background transition-all font-bold cursor-pointer"
                            title="Decrease headcount"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="w-8 text-center font-mono font-extrabold text-base text-foreground">
                            {req.businessSelectedCount}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUpdateCount(idx, 1)}
                            disabled={
                              req.businessSelectedCount >= (req.maxCount ?? 10)
                            }
                            className="h-8 w-8 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center disabled:opacity-30 disabled:hover:bg-background transition-all font-bold cursor-pointer"
                            title="Increase headcount"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose / Reason Note */}
                  {req.reason && (
                    <div className="text-xs text-muted-foreground leading-relaxed bg-muted/20 rounded-xl p-3.5 border border-border/30 flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{req.reason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 h-11 px-5 font-semibold text-sm hover:bg-muted/60"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blueprint
        </Button>
        <Button
          onClick={onContinue}
          className="gap-2 h-11 px-7 font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
        >
          Continue to Milestones <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TalentRequirementPlanner;
