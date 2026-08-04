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
import { format } from 'date-fns';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import StoriesSection from '@/components/shared/StoriesSection';
import { Milestone, Story, MilestoneStatus } from '@/utils/types/Milestone';
import { Button } from '@/components/ui/button';

// ─── Date helpers ────────────────────────────────────────────────────────────

const parseDateString = (str?: string) => {
  if (!str) return undefined;
  const parts = str.split('-');
  if (parts.length !== 3) return undefined;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  return isNaN(date.getTime()) ? undefined : date;
};

const formatDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// ─── AI-contextual local story summary & task generator ──────────────────────

function generateLocalSummaryForStory(
  storyTitle: string,
  blueprint: Record<string, any>,
): string {
  const t = storyTitle.toLowerCase();
  const projName =
    blueprint?.project_title || blueprint?.title || 'the project';
  const stack = (blueprint?.technical_architecture?.recommended_stack ||
    {}) as Record<string, string>;
  const fe = stack.frontend || 'React';
  const be = stack.backend || 'Node.js';

  if (
    t.includes('auth') ||
    t.includes('login') ||
    t.includes('register') ||
    t.includes('sign in')
  ) {
    return `Implement user authentication, registration flows, session management, and security access controls using ${be} for ${projName}.`;
  }
  if (
    t.includes('design') ||
    t.includes('wireframe') ||
    t.includes('mockup') ||
    t.includes('ux') ||
    t.includes('figma')
  ) {
    return `Design responsive UI wireframes, user flow interactive prototypes, and design system components for ${projName} using ${fe}.`;
  }
  if (
    t.includes('api') ||
    t.includes('backend') ||
    t.includes('endpoint') ||
    t.includes('crud')
  ) {
    return `Develop RESTful API modules, controller routes, business logic layer, and database interactions on ${be}.`;
  }
  if (
    t.includes('dashboard') ||
    t.includes('ui') ||
    t.includes('frontend') ||
    t.includes('portal')
  ) {
    return `Build interactive web dashboard screens, data visualizations, responsive navigation layout, and state management in ${fe}.`;
  }
  if (
    t.includes('test') ||
    t.includes('qa') ||
    t.includes('quality') ||
    t.includes('audit')
  ) {
    return `Execute end-to-end user journey tests, security audits, code quality checks, and performance benchmark tests for ${projName}.`;
  }
  if (
    t.includes('deploy') ||
    t.includes('launch') ||
    t.includes('ci/cd') ||
    t.includes('cloud')
  ) {
    return `Configure production cloud deployment, CI/CD automated pipeline, environment configuration, and uptime monitoring for ${projName}.`;
  }
  return `Comprehensive feature implementation, technical setup, and acceptance verification for ${storyTitle} within ${projName}.`;
}

function generateLocalTasksForStory(
  storyTitle: string,
  blueprint: Record<string, any>,
): { title: string; summary: string; taskStatus: string }[] {
  const t = storyTitle.toLowerCase();
  const stack = (blueprint?.technical_architecture?.recommended_stack ||
    {}) as Record<string, string>;
  const fe = stack.frontend || 'React';
  const be = stack.backend || 'Node.js';
  const db = stack.database || 'the database';

  type T = { title: string; summary: string; taskStatus: string };
  let tasks: T[] = [];

  if (
    t.includes('design') ||
    t.includes('wireframe') ||
    t.includes('mockup') ||
    t.includes('ux') ||
    t.includes('figma')
  ) {
    tasks = [
      {
        title: 'Create user flow diagrams',
        summary:
          'Map out all key user journeys and interaction paths for this feature',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Design low-fidelity wireframes',
        summary:
          'Sketch wireframes for all screens in scope before high-fi design',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Build high-fidelity UI mockups',
        summary: `Design pixel-perfect mockups using ${fe} component patterns and design tokens`,
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Stakeholder review and iterations',
        summary: 'Present designs, collect feedback, and refine before handoff',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else if (
    t.includes('auth') ||
    t.includes('login') ||
    t.includes('register') ||
    t.includes('sign in') ||
    t.includes('password')
  ) {
    tasks = [
      {
        title: 'Implement user registration endpoint',
        summary: `Create POST /auth/register with input validation and secure hashing on ${be}`,
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Implement login and JWT issuance',
        summary:
          'Create login flow with access/refresh token generation and secure cookie handling',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Build auth middleware for protected routes',
        summary:
          'Verify JWT on every protected API route and return 401 on invalid tokens',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: `Build ${fe} login and registration screens`,
        summary:
          'Create forms with client-side validation, error messages, and loading states',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Write auth unit and integration tests',
        summary:
          'Cover registration, login, token refresh, and unauthorised access scenarios',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else if (
    t.includes('setup') ||
    t.includes('architecture') ||
    t.includes('infrastructure') ||
    t.includes('initializ') ||
    t.includes('scaffold')
  ) {
    tasks = [
      {
        title: `Initialize ${fe} project structure`,
        summary:
          'Bootstrap project with TypeScript, ESLint, Prettier, and folder conventions',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: `Configure ${be} server and API skeleton`,
        summary:
          'Set up server framework with middleware, health check endpoint, and routing structure',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: `Configure ${db} connection and base schemas`,
        summary:
          'Connect to database, define base models/entities, and run initial migrations',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Set up CI/CD pipeline and environments',
        summary:
          'Configure automated testing and deployment workflows for dev/staging/prod',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else if (
    t.includes('dashboard') ||
    t.includes('admin') ||
    t.includes('portal') ||
    t.includes('interface')
  ) {
    tasks = [
      {
        title: 'Build main layout and navigation component',
        summary:
          'Create primary page shell with sidebar/topbar navigation and route guards',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Implement key data tables and charts',
        summary:
          'Build data visualization components with sorting, filtering, and pagination',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Connect dashboard widgets to API endpoints',
        summary:
          'Wire up all display components to live backend data with react-query/SWR',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Add loading states, empty states, and error boundaries',
        summary:
          'Implement skeleton loaders and user-friendly error handling throughout',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else if (
    t.includes('api') ||
    t.includes('endpoint') ||
    t.includes('backend') ||
    t.includes('service') ||
    t.includes('rest')
  ) {
    tasks = [
      {
        title: 'Define API contracts and schemas',
        summary:
          'Document all endpoints with request/response types and validation rules',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Implement CRUD business logic',
        summary:
          'Build Create, Read, Update, Delete operations with proper validation and error handling',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Add request validation middleware',
        summary:
          'Validate all inputs server-side and return standardised error responses',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Write API integration tests',
        summary:
          'Test all endpoints with valid inputs, boundary cases, and invalid inputs',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else if (
    t.includes('test') ||
    t.includes('qa') ||
    t.includes('quality') ||
    t.includes('coverage')
  ) {
    tasks = [
      {
        title: 'Write unit tests for core business logic',
        summary:
          'Target ≥ 80% code coverage for critical modules and utility functions',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Implement end-to-end test scenarios',
        summary:
          'Cover critical user journeys with Playwright or Cypress E2E tests',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Cross-browser and device compatibility testing',
        summary:
          'Verify on Chrome, Firefox, Safari, and key mobile viewport sizes',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Performance and regression testing',
        summary:
          'Run load tests and ensure no performance regressions vs baseline',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else if (
    t.includes('deploy') ||
    t.includes('launch') ||
    t.includes('production') ||
    t.includes('release')
  ) {
    tasks = [
      {
        title: 'Configure production server and SSL',
        summary:
          'Set up production environment with domain, SSL certificates, and environment vars',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Set up monitoring and error tracking',
        summary:
          'Configure uptime monitoring, error logging (Sentry/similar), and performance alerts',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Run pre-launch security and QA checklist',
        summary:
          'Verify HTTPS, CORS, auth guards, and critical user paths in production',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Document deployment and rollback runbook',
        summary:
          'Write step-by-step deployment, rollback, and incident response procedures',
        taskStatus: 'NOT_STARTED',
      },
    ];
  } else {
    const short =
      storyTitle.length > 50 ? storyTitle.slice(0, 50) + '…' : storyTitle;
    tasks = [
      {
        title: `Analyse and document requirements`,
        summary: `Review requirements for "${short}", clarify edge cases, and define acceptance criteria`,
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Implement core feature logic',
        summary:
          'Build the main functionality as described in the story with clean, testable code',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Add input validation and error handling',
        summary:
          'Ensure all inputs are validated and errors surface clearly to the user',
        taskStatus: 'NOT_STARTED',
      },
      {
        title: 'Write unit and integration tests',
        summary: 'Verify correct behaviour and protect against regressions',
        taskStatus: 'NOT_STARTED',
      },
    ];
  }

  return tasks.slice(0, 5);
}

// ─── Date Picker ─────────────────────────────────────────────────────────────

function TimelineDatePicker({
  value,
  onChange,
  placeholder,
  minDateStr,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  minDateStr?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateString(value);
  const minDate = parseDateString(minDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (d < today) return true;
    if (minDate) {
      const minD = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate(),
      );
      if (d < minD) return true;
    }
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:bg-background cursor-pointer"
        >
          <span
            className={
              selectedDate
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            }
          >
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-[100]"
        align="start"
      >
        <CalendarUI
          mode="single"
          selected={selectedDate}
          showOutsideDays={false}
          disabled={isDateDisabled}
          onSelect={(date) => {
            if (date) {
              onChange(formatDateString(date));
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface MilestoneReviewSectionProps {
  blueprint: Record<string, any>;
  onApproveAndFindTalent: () => void;
  onBack: () => void;
  isFindingTalent: boolean;
  openDateDialogOnMount?: boolean;
  /** Session ID used to call AI task-generation endpoint */
  sessionId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const MilestoneReviewSection: React.FC<MilestoneReviewSectionProps> = ({
  blueprint,
  onApproveAndFindTalent,
  onBack,
  isFindingTalent,
  openDateDialogOnMount = false,
  sessionId,
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

  // AI Refine state
  const [_isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);

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

  useEffect(() => {
    if (!blueprint || Object.keys(blueprint).length === 0) return;
    if (milestones.length === 0 && !dialogHasOpened) {
      setShowDateDialog(true);
      setDialogHasOpened(true);
    }
  }, [blueprint]);

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

  // ── Local milestone + story generation (with contextual template tasks) ──

  const generateLocalMilestonesFromDates = (
    startStr: string,
    endStr: string,
  ): Milestone[] => {
    const sDate = new Date(startStr);
    const eDate = new Date(endStr);
    const totalTimeSpan = eDate.getTime() - sDate.getTime();

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

    if (rawPhases.length === 0) {
      rawPhases = [
        {
          phase_name: 'Phase 1: Discovery & Architecture',
          description:
            'Define technical requirements, design mockups, and set up infrastructure.',
          deliverables: [
            'System Architecture Document',
            'Database Schema',
            'UI/UX Prototypes',
          ],
        },
        {
          phase_name: 'Phase 2: Core Feature Implementation',
          description:
            'Develop core frontend components, API endpoints, and authentication.',
          deliverables: [
            'API Service Module',
            'Frontend Components',
            'Core User Flow Integration',
          ],
        },
        {
          phase_name: 'Phase 3: Testing & Final Launch',
          description:
            'Perform end-to-end testing, bug fixing, and production deployment.',
          deliverables: [
            'Security & Quality Audit',
            'Deployment & CI/CD Pipeline',
            'Final Delivery',
          ],
        },
      ];
    }

    const generated: Milestone[] = [];
    const numPhases = rawPhases.length;

    rawPhases.forEach((p, idx) => {
      const phaseStart = new Date(
        sDate.getTime() + (idx / numPhases) * totalTimeSpan,
      );
      const phaseEnd = new Date(
        sDate.getTime() + ((idx + 1) / numPhases) * totalTimeSpan,
      );

      const deliverables =
        p.deliverables || p.tasks || p.milestones || p.key_tasks || [];

      const stories: Story[] = Array.isArray(deliverables)
        ? deliverables.map((d: any, dIdx: number) => {
            const title =
              typeof d === 'string'
                ? d
                : d.title || d.name || d.task || `Task ${dIdx + 1}`;

            const summary =
              typeof d === 'string'
                ? generateLocalSummaryForStory(d, blueprint)
                : d.description ||
                  d.purpose ||
                  generateLocalSummaryForStory(
                    d.title || d.name || '',
                    blueprint,
                  );

            // Generate contextual template tasks immediately
            const localTasks = generateLocalTasksForStory(title, blueprint);
            return {
              _id: `story-${idx}-${dIdx}`,
              title,
              summary,
              storyStatus: 'NOT_STARTED',
              importantUrls: [],
              tasks: localTasks.map((t, tIdx) => ({
                _id: `task-${idx}-${dIdx}-${tIdx}`,
                ...t,
              })),
            };
          })
        : [];

      generated.push({
        _id: `milestone-${idx}`,
        title: p.phase_name || p.name || p.title || `Phase ${idx + 1}`,
        description: p.description || p.purpose || p.duration || '',
        amount: 0,
        status: MilestoneStatus.NOT_STARTED,
        startDate: { expected: phaseStart.toISOString() },
        endDate: { expected: phaseEnd.toISOString() },
        stories,
      } as Milestone);
    });

    return generated;
  };

  // ── Upgrade template tasks & summaries with AI-generated data from backend ──

  const enhanceWithAiTasks = async (
    mstones: Milestone[],
    instruction?: string,
  ): Promise<Milestone[]> => {
    if (!sessionId) return mstones;
    const allStories = mstones.flatMap((m) =>
      (m.stories ?? []).map((s) => ({
        title: s.title,
        summary: s.summary ?? '',
      })),
    );
    if (allStories.length === 0) return mstones;

    try {
      const token = localStorage.getItem('dehix_token');
      const res = await fetch(`/api/launch/${sessionId}/tasks/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stories: allStories, instruction }),
      });
      if (!res.ok) return mstones;
      const enhanced: any[] = await res.json();
      if (!Array.isArray(enhanced)) return mstones;

      let idx = 0;
      return mstones.map((m) => ({
        ...m,
        stories: (m.stories ?? []).map((s) => {
          const aiStory = enhanced[idx++];
          if (aiStory) {
            return {
              ...s,
              summary:
                aiStory.summary && typeof aiStory.summary === 'string'
                  ? aiStory.summary
                  : s.summary,
              tasks:
                Array.isArray(aiStory.tasks) && aiStory.tasks.length > 0
                  ? aiStory.tasks.slice(0, 5).map((t: any, tIdx: number) => ({
                      _id: `task-${s._id}-${tIdx}`,
                      title: String(t.title || ''),
                      summary: String(t.summary || t.description || ''),
                      taskStatus: 'NOT_STARTED',
                    }))
                  : s.tasks,
            };
          }
          return s;
        }),
      }));
    } catch {
      return mstones;
    }
  };

  // ── Refine with AI submission ──

  const _handleRefineSubmit = async () => {
    if (!refinePrompt.trim() || refineLoading) return;
    setRefineLoading(true);
    try {
      const updated = await enhanceWithAiTasks(milestones, refinePrompt);
      setMilestones(updated);
      setRefinePrompt('');
      setIsRefining(false);
      notifySuccess('Stories and tasks refined with AI!');
    } catch (err: any) {
      notifyError('Failed to refine milestones with AI.');
    } finally {
      setRefineLoading(false);
    }
  };

  // ── Generate milestones handler ──

  const handleGenerate = async () => {
    if (!isDateValid) return;
    setGenerating(true);
    const roomId = inferRoomIdFromLocation();

    try {
      let generatedMilestones: Milestone[] = [];
      const token = localStorage.getItem('dehix_token');

      if (roomId) {
        const res = await fetch(
          `/api/liveroom/rooms/${roomId}/milestones/generate`,
          {
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
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) generatedMilestones = data;
          else if (data?.data) generatedMilestones = data.data;
        }
      }

      // Fallback to local generation if backend unavailable / no room
      if (!generatedMilestones || generatedMilestones.length === 0) {
        generatedMilestones = generateLocalMilestonesFromDates(
          startDate,
          endDate,
        );
        generatedMilestones = await enhanceWithAiTasks(generatedMilestones);
      }

      setMilestones(generatedMilestones);
      setHasConfirmedDates(true);
      setShowDateDialog(false);
    } catch (err: any) {
      console.error('Milestone generation error:', err);
      const fallback = generateLocalMilestonesFromDates(startDate, endDate);
      setMilestones(fallback);
      setHasConfirmedDates(true);
      setShowDateDialog(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveClick = () => {
    if (
      !hasConfirmedDates &&
      (milestones.length === 0 || !startDate || !endDate)
    ) {
      setShowDateDialog(true);
      return;
    }
    onApproveAndFindTalent();
  };

  // ── Story / Task submit (adding new via dialog) ──

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
        if (m._id !== updateMilestone._id) return m;
        let updatedStories = m.stories || [];
        if (isTask && newTask) {
          updatedStories = updatedStories.map((story) => {
            if (story._id !== newTask.storyId) return story;
            if ((story.tasks ?? []).length >= 5) return story;
            return {
              ...story,
              tasks: [...(story.tasks || []), newTask.formData],
            };
          });
        } else {
          updatedStories = [...updatedStories, storyData];
        }
        return { ...m, stories: updatedStories };
      }),
    );
  };

  const durationInfo = getDurationInfo();

  const handleEditStory = (storyId: string, title: string, summary: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        const stories = (m.stories ?? []).map((s) =>
          s._id === storyId ? { ...s, title, summary } : s,
        );
        return { ...m, stories };
      }),
    );
    notifySuccess('Story updated successfully!');
  };

  const handleDeleteStory = (storyId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        const stories = (m.stories ?? []).filter((s) => s._id !== storyId);
        return { ...m, stories };
      }),
    );
    notifySuccess('Story deleted successfully!');
  };

  const handleEditTask = (
    storyId: string,
    taskIndex: number,
    title: string,
    summary: string,
  ) => {
    setMilestones((prev) =>
      prev.map((m) => {
        const stories = (m.stories ?? []).map((s) => {
          if (s._id !== storyId) return s;
          const tasks = [...(s.tasks ?? [])];
          if (taskIndex >= 0 && taskIndex < tasks.length) {
            tasks[taskIndex] = { ...tasks[taskIndex], title, summary };
          }
          return { ...s, tasks };
        });
        return { ...m, stories };
      }),
    );
    notifySuccess('Task updated successfully!');
  };

  const handleDeleteTask = (storyId: string, taskIndex: number) => {
    setMilestones((prev) =>
      prev.map((m) => {
        const stories = (m.stories ?? []).map((s) => {
          if (s._id !== storyId) return s;
          const tasks = (s.tasks ?? []).filter((_, i) => i !== taskIndex);
          return { ...s, tasks };
        });
        return { ...m, stories };
      }),
    );
    notifySuccess('Task deleted successfully!');
  };

  const handleRefineTask = async (
    storyId: string,
    taskIndex: number,
    instruction: string,
  ) => {
    let targetTaskTitle = '';
    let targetTaskSummary = '';

    milestones.forEach((m) => {
      (m.stories ?? []).forEach((s) => {
        if (s._id === storyId && s.tasks?.[taskIndex]) {
          targetTaskTitle = s.tasks[taskIndex].title;
          targetTaskSummary = s.tasks[taskIndex].summary;
        }
      });
    });

    let newTitle = targetTaskTitle;
    let newSummary = targetTaskSummary;

    // Use AI backend if session available
    if (sessionId) {
      try {
        const token = localStorage.getItem('dehix_token');
        const res = await fetch(`/api/launch/${sessionId}/tasks/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            stories: [
              {
                title: targetTaskTitle || 'Task',
                summary: targetTaskSummary,
              },
            ],
            instruction,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.tasks?.[0]) {
            newTitle = data[0].tasks[0].title || targetTaskTitle;
            newSummary = data[0].tasks[0].summary || targetTaskSummary;
          }
        }
      } catch {
        // Fallback to local refinement
      }
    }

    if (newSummary === targetTaskSummary) {
      newSummary = `${targetTaskSummary ? targetTaskSummary + ' ' : ''}[Refinement: ${instruction}]`;
    }

    setMilestones((prev) =>
      prev.map((m) => {
        const stories = (m.stories ?? []).map((s) => {
          if (s._id !== storyId) return s;
          const tasks = [...(s.tasks ?? [])];
          if (taskIndex >= 0 && taskIndex < tasks.length) {
            tasks[taskIndex] = {
              ...tasks[taskIndex],
              title: newTitle,
              summary: newSummary,
            };
          }
          return { ...s, tasks };
        });
        return { ...m, stories };
      }),
    );
    notifySuccess('Task refined with AI!');
  };

  // ── Render ──

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Date Dialog */}
      <Dialog
        open={showDateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDateDialog(false);
            onBack();
          }
        }}
      >
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
              Set the tentative start and completion dates. AI will generate
              milestones, stories with detailed descriptions, and up to&nbsp;
              <strong>5 tasks per story</strong> based on your blueprint.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Quick Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" /> Quick Select Duration
              </span>
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
                <span className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Tentative
                  Start
                </span>
                <TimelineDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Tentative
                  End
                </span>
                <TimelineDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  minDateStr={startDate}
                  placeholder="Select end date"
                />
              </div>
            </div>

            {isInvalidRange && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Start date must be strictly before End date.</span>
              </div>
            )}

            {isDateValid && durationInfo && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                <span className="font-medium text-foreground">
                  Calculated Duration:
                </span>
                <span className="font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30">
                  {durationInfo.days} Days ({durationInfo.weeks} Weeks)
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2.5 mt-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => {
                  setShowDateDialog(false);
                  onBack();
                }}
                disabled={generating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
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
                    Generating AI Milestones &amp; Tasks…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Milestones &amp; Stories
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Layout */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
          <div className="max-w-3xl">
            <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
              Phase 3 output
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Milestones &amp; Timeline Review
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
              Review AI-generated milestones, stories, and tasks. Edit stories
              or refine tasks with AI before finding talent.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isFindingTalent}
              className="whitespace-nowrap h-10 px-4 text-xs font-semibold"
            >
              Back to Talent Requirements
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDateDialog(true)}
              disabled={isFindingTalent || generating}
              className="whitespace-nowrap flex items-center gap-1.5 h-10 px-4 text-xs font-semibold"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {startDate && endDate
                ? 'Edit Tentative Dates'
                : 'Set Tentative Dates'}
            </Button>
            <Button
              onClick={handleApproveClick}
              disabled={isFindingTalent || milestones.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold whitespace-nowrap h-10 px-4 text-xs shadow-md flex items-center gap-2"
            >
              {isFindingTalent ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Finding Talent…
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Approve &amp; Find Talent
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Timeline & Stories */}
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
                      onEditStory={handleEditStory}
                      onDeleteStory={handleDeleteStory}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onRefineTask={handleRefineTask}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[40vh] w-full">
                <div className="text-center">
                  <PackageOpen
                    className="mx-auto text-muted-foreground/50 mb-4"
                    size={64}
                  />
                  <p className="text-muted-foreground font-medium">
                    No milestones generated yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2 mb-4">
                    Set project tentative dates to let AI build your milestone
                    timeline, stories, and tasks.
                  </p>
                  <Button
                    onClick={() => setShowDateDialog(true)}
                    className="bg-primary text-primary-foreground font-bold"
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Set Project Tentative
                    Dates
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
