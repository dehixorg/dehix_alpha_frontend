import React, { useState, useEffect } from 'react';
import {
  PackageOpen,
  Sparkles,
  CheckCircle,
  Calendar,
  Clock,
  AlertCircle,
  CalendarDays,
  Edit3,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import StoriesSection from '@/components/shared/StoriesSection';
import { Milestone, Story, MilestoneStatus } from '@/utils/types/Milestone';
import { Button } from '@/components/ui/button';

interface MilestoneReviewSectionProps {
  blueprint: Record<string, any>;
  onApproveAndFindTalent: () => void;
  onBack: () => void;
  isFindingTalent: boolean;
  openDateDialogOnMount?: boolean;
}

const MilestoneReviewSection: React.FC<MilestoneReviewSectionProps> = ({
  blueprint,
  onApproveAndFindTalent,
  onBack,
  isFindingTalent,
  openDateDialogOnMount = false,
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
    number | null
  >(0);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [dialogHasOpened, setDialogHasOpened] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [hasConfirmedDates, setHasConfirmedDates] = useState(false);

  // Validate dates: start and end date must both be filled, and start < end
  const isDateValid = Boolean(
    startDate &&
      endDate &&
      !isNaN(new Date(startDate).getTime()) &&
      !isNaN(new Date(endDate).getTime()) &&
      new Date(startDate) < new Date(endDate),
  );

  const isInvalidRange = Boolean(
    startDate &&
      endDate &&
      !isNaN(new Date(startDate).getTime()) &&
      !isNaN(new Date(endDate).getTime()) &&
      new Date(startDate) >= new Date(endDate),
  );

  useEffect(() => {
    if (openDateDialogOnMount && !dialogHasOpened) {
      setShowDateDialog(true);
      setDialogHasOpened(true);
    }
  }, [openDateDialogOnMount, dialogHasOpened]);

  // Initial milestone extraction or auto-open popup
  useEffect(() => {
    if (!blueprint || Object.keys(blueprint).length === 0) return;

    // Check if dates are already present in blueprint or local state
    if (milestones.length === 0 && !dialogHasOpened) {
      setShowDateDialog(true);
      setDialogHasOpened(true);
    }
  }, [blueprint]);

  // Keep selected index within bounds
  useEffect(() => {
    if (milestones.length === 0) return;
    if (
      selectedMilestoneIndex == null ||
      selectedMilestoneIndex >= milestones.length
    ) {
      setSelectedMilestoneIndex(0);
    }
  }, [milestones, selectedMilestoneIndex]);

  const fetchMilestones = () => {};

  const inferRoomIdFromLocation = () => {
    try {
      const m = window.location.pathname.match(/\/room\/(\w+)/);
      return m ? m[1] : '';
    } catch {
      return '';
    }
  };

  const applyPreset = (days: number) => {
    const start = startDate ? new Date(startDate) : new Date();
    const startStr = start.toISOString().split('T')[0];
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    const endStr = end.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const getDurationInfo = () => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime <= 0) return null;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = (diffDays / 7).toFixed(1);
    return { days: diffDays, weeks };
  };

  const generateLocalMilestonesFromDates = (startStr: string, endStr: string) => {
    const sDate = new Date(startStr);
    const eDate = new Date(endStr);
    const totalTimeSpan = eDate.getTime() - sDate.getTime();

    // Extract raw phases from blueprint
    let rawPhases: any[] = [];
    const possibleKeys = [
      'development_roadmap',
      'roadmap',
      'milestones',
      'phases',
    ];

    for (const key of possibleKeys) {
      if (blueprint[key]) {
        const val = blueprint[key];
        if (Array.isArray(val)) {
          rawPhases = val;
          break;
        } else if (typeof val === 'object' && val !== null) {
          if (Array.isArray(val.phases)) {
            rawPhases = val.phases;
            break;
          } else if (Array.isArray(val.steps)) {
            rawPhases = val.steps;
            break;
          } else {
            rawPhases = Object.values(val).filter(
              (v) => typeof v === 'object' && v !== null,
            );
            if (rawPhases.length > 0) break;
          }
        }
      }
    }

    // Fallback default phases if none in blueprint
    if (rawPhases.length === 0) {
      rawPhases = [
        {
          phase_name: 'Phase 1: Discovery & Architecture',
          description: 'Define technical requirements, design mockups, and setup infrastructure.',
          deliverables: ['System Architecture Document', 'Database Schema', 'UI/UX Prototypes'],
        },
        {
          phase_name: 'Phase 2: Core Feature Implementation',
          description: 'Develop core frontend components, API endpoints, and authentication.',
          deliverables: ['API Service Module', 'Frontend Components', 'Core User Flow Integration'],
        },
        {
          phase_name: 'Phase 3: Testing & Final Launch',
          description: 'Perform end-to-end testing, bug fixing, and production deployment.',
          deliverables: ['Security & Quality Audit', 'Deployment & CI/CD Pipeline', 'Final Delivery'],
        },
      ];
    }

    const generated: Milestone[] = [];
    const numPhases = rawPhases.length;

    rawPhases.forEach((p, idx) => {
      const phaseStart = new Date(sDate.getTime() + (idx / numPhases) * totalTimeSpan);
      const phaseEnd = new Date(sDate.getTime() + ((idx + 1) / numPhases) * totalTimeSpan);

      const deliverables = p.deliverables || p.tasks || p.milestones || p.key_tasks || [];

      const stories: Story[] = Array.isArray(deliverables)
        ? deliverables.map((d: any, dIdx: number) => ({
            _id: `story-${idx}-${dIdx}`,
            title:
              typeof d === 'string'
                ? d
                : d.title || d.name || d.task || `Task ${dIdx + 1}`,
            summary:
              typeof d === 'string' ? '' : d.description || d.purpose || '',
            storyStatus: 'NOT_STARTED',
            importantUrls: [],
            tasks: [],
          }))
        : [];

      generated.push({
        _id: `milestone-${idx}`,
        title: p.phase_name || p.name || p.title || `Phase ${idx + 1}`,
        description: p.description || p.purpose || p.duration || '',
        amount: 0,
        status: MilestoneStatus.NOT_STARTED,
        startDate: { expected: phaseStart.toISOString() },
        endDate: { expected: phaseEnd.toISOString() },
        stories: stories,
      } as Milestone);
    });

    return generated;
  };

  const handleGenerate = async () => {
    if (!isDateValid) return;
    setGenerating(true);

    const roomId = inferRoomIdFromLocation();

    try {
      let generatedMilestones: Milestone[] = [];
      const token = localStorage.getItem('dehix_token');

      if (roomId) {
        const res = await fetch(`/api/liveroom/rooms/${roomId}/milestones/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            blueprint,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) generatedMilestones = data;
          else if (data?.data) generatedMilestones = data.data;
        }
      }

      // If backend was not called or failed/returned empty, calculate locally with respect to tentative dates
      if (!generatedMilestones || generatedMilestones.length === 0) {
        generatedMilestones = generateLocalMilestonesFromDates(startDate, endDate);
      }

      setMilestones(generatedMilestones);
      setHasConfirmedDates(true);
      setShowDateDialog(false);
    } catch (err: any) {
      console.error('Milestone generation error:', err);
      // Fallback local generation on error
      const fallback = generateLocalMilestonesFromDates(startDate, endDate);
      setMilestones(fallback);
      setHasConfirmedDates(true);
      setShowDateDialog(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveClick = () => {
    if (!hasConfirmedDates && (milestones.length === 0 || !startDate || !endDate)) {
      setShowDateDialog(true);
      return;
    }
    onApproveAndFindTalent();
  };

  const handleStorySubmit = async (
    e: React.FormEvent,
    storyData: Story,
    updateMilestone: Milestone,
    isTask = false,
    newTask: any = null,
  ) => {
    e.preventDefault();
    setMilestones((prev) =>
      prev.map((m) => {
        if (m._id === updateMilestone._id) {
          let updatedStories = m.stories || [];
          if (isTask && newTask) {
            updatedStories = updatedStories.map((story) => {
              if (story._id === newTask.storyId) {
                return {
                  ...story,
                  tasks: [...(story.tasks || []), newTask.formData],
                };
              }
              return story;
            });
          } else {
            updatedStories = [...updatedStories, storyData];
          }
          return { ...m, stories: updatedStories };
        }
        return m;
      }),
    );
  };

  const durationInfo = getDurationInfo();

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Date Dialog Pop-up */}
      <Dialog open={showDateDialog} onOpenChange={(open) => {
        // Prevent closing if dates have not been configured yet
        if (!open && !hasConfirmedDates && milestones.length === 0) {
          return;
        }
        setShowDateDialog(open);
      }}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Project Tentative Timeline
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Please specify the tentative start and completion dates. AI will generate project milestones and user stories fitted to this timeframe.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Quick Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> Quick Select Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '2 Weeks', days: 14 },
                  { label: '1 Month', days: 30 },
                  { label: '2 Months', days: 60 },
                  { label: '3 Months', days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.days)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all text-center"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Tentative Start
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Tentative End
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="w-full rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Duration / Validation Banner */}
            {isInvalidRange && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Start date must be strictly before End date.</span>
              </div>
            )}

            {isDateValid && durationInfo && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                <span className="font-medium text-foreground">Calculated Duration:</span>
                <span className="font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30">
                  {durationInfo.days} Days ({durationInfo.weeks} Weeks)
                </span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end gap-2.5 mt-2 pt-2 border-t border-border/40">
              {hasConfirmedDates && (
                <button
                  type="button"
                  onClick={() => setShowDateDialog(false)}
                  disabled={generating}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!isDateValid || generating}
                style={
                  !isDateValid || generating
                    ? { pointerEvents: 'none', cursor: 'not-allowed' }
                    : undefined
                }
                className={
                  isDateValid && !generating
                    ? 'px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer'
                    : 'px-5 py-2.5 rounded-xl text-xs font-bold bg-muted text-muted-foreground opacity-40 shadow-none pointer-events-none cursor-not-allowed'
                }
              >
                {generating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-primary-foreground" />
                    Generating AI Milestones...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Milestones & Stories
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Review Layout Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/10 pb-4">
          <div className="max-w-xl">
            <div className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
              Phase 3 output
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Milestones & Timeline Review
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review AI-generated milestones and user stories mapped to your tentative project dates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFindingTalent}
              className="whitespace-nowrap"
            >
              Back to Talent Requirements
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDateDialog(true)}
              disabled={isFindingTalent || generating}
              className="whitespace-nowrap flex items-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {startDate && endDate ? 'Edit Tentative Dates' : 'Set Tentative Dates'}
            </Button>
            <Button
              onClick={handleApproveClick}
              disabled={isFindingTalent || milestones.length === 0}
              className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/25 font-bold whitespace-nowrap"
            >
              {isFindingTalent ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Finding Talent...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Find Talent
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Milestone Timeline & Stories View */}
        <div className="bg-card/40 border border-border/40 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm relative">
          <div className="p-6">
            {milestones.length > 0 ? (
              <div className="flex flex-col gap-6 w-full max-w-full">
                <div className="w-full">
                  <MilestoneTimeline
                    fetchMilestones={fetchMilestones}
                    milestones={milestones}
                    handleStorySubmit={handleStorySubmit}
                    selectedIndex={selectedMilestoneIndex}
                    onMilestoneSelect={(index) =>
                      setSelectedMilestoneIndex(index)
                    }
                  />
                </div>

                {selectedMilestoneIndex !== null && (
                  <div className="w-full mt-4">
                    <StoriesSection
                      key={
                        milestones[selectedMilestoneIndex]?._id ??
                        selectedMilestoneIndex
                      }
                      milestone={milestones[selectedMilestoneIndex]}
                      fetchMilestones={fetchMilestones}
                      handleStorySubmit={handleStorySubmit}
                      isFreelancer={false}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[40vh] w-full">
                <div className="text-center">
                  <PackageOpen
                    className="mx-auto text-muted-foreground/50 mb-4"
                    size="64"
                  />
                  <p className="text-muted-foreground font-medium">
                    No tentative dates or milestones generated yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2 mb-4">
                    Set project tentative dates to let AI build your milestone timeline and user stories.
                  </p>
                  <Button
                    onClick={() => setShowDateDialog(true)}
                    className="bg-primary text-primary-foreground font-bold"
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Set Project Tentative Dates
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneReviewSection;

