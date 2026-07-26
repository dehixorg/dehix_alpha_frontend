import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Search,
  Sparkles,
  Send,
  MessageSquare,
  MapPin,
  Award,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  ArrowUp,
  X,
  Globe,
  Edit3,
  Layers,
  Cpu,
  FileText,
  Layout,
  TrendingUp,
  Coins,
  Zap,
  Lightbulb,
  Activity,
  DollarSign,
  Users,
  Briefcase,
  Check,
  Clock,
  Github,
  Trash2,
  Plus,
  Hash,
  Database,
  Code2,
  Server,
  GripVertical,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLocation } from '../adapters/wouter';
import { liveRoomApiFetch as fetch } from '../api/runtime';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import MilestoneReviewSection from '../components/MilestoneReviewSection';
import TalentRequirementPlanner, {
  type TalentRequirement,
} from '../components/TalentRequirementPlanner';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../../../../components/ui/tooltip';

import ConnectsDialog from '@/components/shared/ConnectsDialog';
import { updateConnectsBalance } from '@/lib/updateConnects';

type WizardPhase =
  | 'idea'
  | 'analysis'
  | 'technical'
  | 'blueprint'
  | 'talent_requirements'
  | 'milestones'
  | 'recommendations';
type PhaseJobStatus = 'queued' | 'generating' | 'ready' | 'failed';
type LaunchJob = {
  phase: 'analysis' | 'blueprint';
  sessionId: string;
  status: PhaseJobStatus;
};
type ReportSection = {
  id: string;
  title: string;
  description?: string;
  keywords?: string;
  body: ReactNode;
};
type ActiveReportSection = Pick<ReportSection, 'id' | 'title' | 'description'>;
type ActiveQuestion = {
  questionId: string;
  question: string;
  kind: 'mandatory' | 'optional';
  index: number;
};
type SmartSuggestion = {
  label: string;
  displayText?: string;
  prompt: string;
  action?:
    | 'chat'
    | 'suggest_answer'
    | 'improve_answer'
    | 'explain_question'
    | 'blueprint_chat';
  targetQuestionId?: string;
  targetSectionId?: string;
};

type Question = {
  _id: string;
  question: string;
  required?: boolean;
};

type AnalysisResult = {
  needs_clarification?: boolean;
  clarifying_questions?: string[];
  region_used?: string;
  idea_summary?: string;
  business_confirmed_inputs?: Record<string, unknown>;
  research_analysis?: {
    market_demand?: string;
    target_audience?: string;
    competitor_analysis?: string;
    competitive_moat?: string;
    revenue_model?: string;
    unit_economics?: string;
    cost_estimation?: string;
    go_to_market_strategy?: string;
    risks?: string[];
    suggestions?: string[];
    assumptions?: string[];
    swot?: {
      strengths?: string[];
      weaknesses?: string[];
      opportunities?: string[];
      threats?: string[];
    };
    dimensional_scores?: Record<string, number>;
    overall_score?: number;
    final_verdict?: string;
    verdict_reasoning?: string;
  };
};

type Phase1ReviewForm = {
  region: string;
  ideaSummary: string;
  targetAudience: string;
  businessModel: string;
  competitors: string;
  marketDemand: string;
  goToMarket: string;
};

type BlueprintResult = Record<string, unknown>;

type TalentRecommendation = {
  talentId: string;
  user: {
    _id: string;
    name: string;
    email?: string | null;
    avatarUrl?: string | null;
    walletAddress?: string | null;
    isOnline?: boolean;
    availability?: string;
    availabilityLabel?: string;
    availabilityRank?: number;
    location?: string | null;
    rating?: number | null;
    completedProjects?: number;
  };
  matchedRole: {
    roleTitle: string;
    skillDomain: string;
    requiredLevel: 1 | 2;
    minReputation: number;
    estimatedHours: number;
    keywords?: string[];
  };
  credential: {
    skillDomain: string;
    level: 1 | 2;
    reputationScore: number;
    githubScore: number;
    interviewScore: number;
    projectsCompleted: number;
  };
  matchedKeywords?: string[];
  missingKeywords?: string[];
  finalScore: number;
  scoreBreakdown: {
    talentScore: number;
    skillMatchScore: number;
    budgetFitScore: number;
    availabilityScore: number;
    openSourceScore: number;
    previousWorkScore: number;
    reputationScore: number;
  };
  estimatedHourlyRateUsd: number;
  weeklyRateUsd?: number;
  monthlyRateUsd?: number;
  estimatedProjectCostUsd: number;
  reasons: string[];
};

type RoleRecommendationGroup = {
  role: TalentRecommendation['matchedRole'];
  availableMatches: TalentRecommendation[];
  unavailableMatches: TalentRecommendation[];
  topMatches: TalentRecommendation[];
};

type TalentRecommendationReport = {
  budgetUsd?: number | null;
  roleCount: number;
  recommendedTeams?: RoleRecommendationGroup[];
  groupedRecommendationTeams?: RoleRecommendationGroup[];
  groupedManualTeams?: RoleRecommendationGroup[];
  recommendations: TalentRecommendation[];
  manualFreelancers?: TalentRecommendation[];
};

type ChatMessage = {
  id: string;
  userId?: string;
  userName: string;
  message: string;
  isAi: boolean;
  createdAt?: string | Date;
};

const SCORE_LABELS: Record<string, string> = {
  market_opportunity: 'Market opportunity',
  problem_clarity: 'Problem clarity',
  solution_differentiation: 'Differentiation',
  execution_feasibility: 'Execution feasibility',
  revenue_potential: 'Revenue potential',
};

const FALLBACK_MANDATORY_QUESTIONS: Question[] = [
  {
    _id: 'primary_user_goal',
    question:
      'Who will use this product first, and what is the main thing they should be able to do on day one?',
    required: true,
  },
  {
    _id: 'first_platform',
    question:
      'Where should the first version launch: web app, mobile app, admin dashboard, API, or something else?',
    required: true,
  },
  {
    _id: 'must_have_features',
    question:
      'What are the top 3 must-have features for the first usable version?',
    required: true,
  },
  {
    _id: 'accounts_payments_data',
    question:
      'Will the product need user accounts, payments, file uploads, chat, maps, AI, blockchain, or third-party integrations?',
    required: true,
  },
  {
    _id: 'constraints',
    question:
      'Do you have any fixed timeline, budget range, compliance needs, or existing tools/data that the team must work with?',
    required: true,
  },
];
const BLUEPRINT_SECTION_ORDER = [
  'executive_summary',
  'problem_definition',
  'target_users',
  'product_strategy',
  'mvp_definition',
  'user_journey',
  'technical_architecture',
  'security_and_compliance',
  'development_roadmap',
  'team_requirements',
  'cost_estimation',
  'business_model',
  'go_to_market',
  'risk_analysis',
  'founder_recommendations',
  'final_verdict',
  'next_options',
];

function getToken() {
  return localStorage.getItem('dehix_token');
}

async function readApiError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('dehix_token');
    localStorage.removeItem('dehix_user');
    window.dispatchEvent(new Event('dehix:auth-cleared'));
  }
  return data?.error ?? fallback;
}

function humanizeKey(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPrimitive(value: unknown) {
  return (
    value === null || ['string', 'number', 'boolean'].includes(typeof value)
  );
}

function formatObjectToString(obj: unknown, depth = 0): string {
  if (obj === null || obj === undefined) return 'Not available';
  if (typeof obj !== 'object') return String(obj);

  if (Array.isArray(obj)) {
    return obj
      .map((item) =>
        typeof item === 'object'
          ? formatObjectToString(item, depth)
          : String(item),
      )
      .filter(Boolean)
      .join(', ');
  }

  const indent = '  '.repeat(depth);
  return Object.entries(obj as Record<string, unknown>)
    .map(([k, v]) => {
      const humanKey = k
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      if (typeof v === 'object' && v !== null) {
        return `${indent}${humanKey}:\n${formatObjectToString(v, depth + 1)}`;
      }
      return `${indent}${humanKey}: ${String(v)}`;
    })
    .join('\n');
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) return 'Not available';
  if (typeof value === 'object') {
    return formatObjectToString(value);
  }
  return String(value);
}

function formatCostEstimationToParagraph(value: unknown): string {
  if (!value) return 'Not available';
  if (typeof value === 'string') return value;

  if (typeof value === 'object' && value !== null) {
    const cost = value as Record<string, any>;

    // 1. Budget extraction
    let budgetStr = '';
    const budgetRange =
      cost.total_mvp_budget_range_usd ||
      cost.mvp_budget_range ||
      cost.budget_range;
    const singleBudget = cost.estimated_cost || cost.mvp_budget || cost.budget;

    if (budgetRange && typeof budgetRange === 'object') {
      const min = budgetRange.min ?? budgetRange.minimum;
      const max = budgetRange.max ?? budgetRange.maximum;
      if (min !== undefined && max !== undefined) {
        budgetStr = `The estimated MVP development budget is projected to range from $${Number(min).toLocaleString()} to $${Number(max).toLocaleString()} USD`;
      }
    } else if (singleBudget) {
      budgetStr = `The estimated MVP development budget is approximately $${String(singleBudget)} USD`;
    } else {
      budgetStr = 'The estimated MVP development budget';
    }

    // 2. Timeline extraction
    let timelineStr = '';
    const weeks =
      cost.timeline_weeks_estimate ||
      cost.timeline_weeks ||
      cost.weeks ||
      cost.duration_weeks ||
      cost.timeline;
    if (weeks) {
      timelineStr = `, spanning a timeline of approximately ${weeks} weeks`;
    }

    // 3. Roles extraction
    let rolesStr = '';
    const rolesRaw =
      cost.roles_required || cost.roles || cost.team_composition || cost.team;
    if (Array.isArray(rolesRaw) && rolesRaw.length > 0) {
      const roleTitles = rolesRaw
        .map((r: any) => {
          if (typeof r === 'string') return r;
          if (typeof r === 'object' && r !== null) {
            return r.role_title || r.title || r.role || r.name;
          }
          return '';
        })
        .filter(Boolean);

      if (roleTitles.length > 0) {
        if (roleTitles.length === 1) {
          rolesStr = ` The primary role required for this project is a ${roleTitles[0]}.`;
        } else if (roleTitles.length === 2) {
          rolesStr = ` Key roles required for this project include a ${roleTitles[0]} and a ${roleTitles[1]}.`;
        } else {
          const last = roleTitles.pop();
          rolesStr = ` Key roles required for this project include a ${roleTitles.join(', ')}, and a ${last}.`;
        }
      }
    }

    // Combine everything into a paragraph
    const combined = `${budgetStr}${timelineStr}.${rolesStr}`.trim();
    if (combined) return combined;
  }

  return String(value);
}

function formatBlueprintSectionToMarkdown(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    // Let's check if it is an MVP definition
    const rec = value as Record<string, any>;
    if (
      rec.must_have_features !== undefined ||
      rec.should_have_features !== undefined
    ) {
      let md = '';
      if (Array.isArray(rec.must_have_features)) {
        md += `### Must-Have Features (Core V1)\n`;
        rec.must_have_features.forEach((item: any) => {
          if (typeof item === 'string') md += `- ${item}\n`;
          else if (item && typeof item === 'object') {
            md += `- **${item.feature || item.name || ''}**: ${item.purpose || item.description || ''}\n`;
          }
        });
        md += `\n`;
      }
      if (Array.isArray(rec.should_have_features)) {
        md += `### Should-Have Features (Next V2)\n`;
        rec.should_have_features.forEach((item: any) => {
          if (typeof item === 'string') md += `- ${item}\n`;
          else if (item && typeof item === 'object') {
            md += `- **${item.feature || item.name || ''}**: ${item.purpose || item.description || ''}\n`;
          }
        });
        md += `\n`;
      }
      if (Array.isArray(rec.future_features)) {
        md += `### Nice-to-Have Features (Future V3)\n`;
        rec.future_features.forEach((item: any) => {
          if (typeof item === 'string') md += `- ${item}\n`;
          else if (item && typeof item === 'object') {
            md += `- **${item.feature || item.name || ''}**: ${item.purpose || item.description || ''}\n`;
          }
        });
        md += `\n`;
      }
      if (Array.isArray(rec.excluded_from_mvp)) {
        md += `### Deliberately Excluded\n`;
        rec.excluded_from_mvp.forEach((item: any) => {
          md += `- ${item}\n`;
        });
      }
      return md.trim();
    }

    // Check if it is Technical Architecture
    if (rec.recommended_stack !== undefined || rec.api_modules !== undefined) {
      let md = '';
      if (rec.recommended_stack) {
        md += `### Recommended Technology Stack\n`;
        Object.entries(rec.recommended_stack).forEach(([k, v]) => {
          const keyLabel = k
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
          md += `- **${keyLabel}**: ${Array.isArray(v) ? v.join(', ') : String(v)}\n`;
        });
        md += `\n`;
      }
      if (Array.isArray(rec.api_modules)) {
        md += `### Key API Modules\n`;
        rec.api_modules.forEach((item: any) => {
          if (typeof item === 'string') md += `- ${item}\n`;
          else if (item && typeof item === 'object') {
            md += `- **${item.module || item.name || ''}**: ${item.purpose || item.description || ''}\n`;
          }
        });
        md += `\n`;
      }
      if (Array.isArray(rec.data_models)) {
        md += `### Core Data Models\n`;
        rec.data_models.forEach((item: any) => {
          if (typeof item === 'string') md += `- ${item}\n`;
          else if (item && typeof item === 'object') {
            md += `- **${item.model || item.name || ''}**: ${item.fields ? item.fields.join(', ') : ''} - ${item.description || ''}\n`;
          }
        });
      }
      return md.trim();
    }

    // Check if it is Roadmap
    if (Array.isArray(rec.phases) || Array.isArray(rec.steps)) {
      let md = '';
      const phases = rec.phases || rec.steps || [];
      phases.forEach((p: any) => {
        md += `### ${p.phase_name || p.name || 'Phase'}\n`;
        if (p.duration) md += `*Duration: ${p.duration}*\n\n`;
        if (Array.isArray(p.tasks)) {
          p.tasks.forEach((t: any) => {
            md += `- ${t}\n`;
          });
        }
        md += `\n`;
      });
      return md.trim();
    }

    // Check if it is Team Requirements
    if (rec.recommended_team !== undefined || rec.minimum_team !== undefined) {
      let md = '';
      if (Array.isArray(rec.recommended_team)) {
        md += `### Recommended Team Composition\n`;
        rec.recommended_team.forEach((item: any) => {
          if (typeof item === 'string') md += `- ${item}\n`;
          else if (item && typeof item === 'object') {
            md += `- **${item.role || item.title || ''}** (${item.priority || 'Medium priority'}): ${item.purpose || ''}\n`;
          }
        });
        md += `\n`;
      }
      if (Array.isArray(rec.minimum_team)) {
        md += `### Minimum Viable Team\n`;
        rec.minimum_team.forEach((item: any) => {
          md += `- ${item}\n`;
        });
      }
      return md.trim();
    }

    // Default fallback: format as clean outline string
    return formatObjectToString(value);
  }

  return String(value);
}

function formatCurrency(value?: number | null) {
  if (!value || !Number.isFinite(value)) return 'Budget not found';
  return `$${Math.round(value).toLocaleString()}`;
}

function stringifyForSearch(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (['string', 'number', 'boolean'].includes(typeof value))
    return String(value);
  if (Array.isArray(value)) return value.map(stringifyForSearch).join(' ');
  if (typeof value === 'object')
    return Object.values(value as Record<string, unknown>)
      .map(stringifyForSearch)
      .join(' ');
  return '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item === null || item === undefined) return '';
    if (typeof item === 'object') return formatObjectToString(item);
    return String(item);
  });
}

function asRecordList(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? (value.filter(
        (item) =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      ) as Array<Record<string, unknown>>)
    : [];
}

function buildPhase1ReviewForm(
  analysis?: AnalysisResult | null,
): Phase1ReviewForm {
  const research = analysis?.research_analysis ?? {};
  return {
    region: analysis?.region_used?.trim() || 'India',
    ideaSummary: analysis?.idea_summary?.trim() || '',
    targetAudience: research.target_audience?.trim() || '',
    businessModel: research.revenue_model?.trim() || '',
    competitors: research.competitor_analysis?.trim() || '',
    marketDemand: research.market_demand?.trim() || '',
    goToMarket: research.go_to_market_strategy?.trim() || '',
  };
}

function TextBlock({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm leading-7 text-muted-foreground">{children}</p>;
}

function BulletList({ items }: { items?: string[] }) {
  if (!items || items.length === 0)
    return <p className="text-sm text-muted-foreground">Not available</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-2 text-sm leading-6 text-muted-foreground"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function KeyValueGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([, value]) =>
      value !== undefined && value !== null && !Array.isArray(value),
  );
  if (entries.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map(([key, value]) => {
        const titleLower = key.toLowerCase();
        let dotColorClass = 'bg-primary/65';

        if (
          titleLower.includes('revenue') ||
          titleLower.includes('economics') ||
          titleLower.includes('cost') ||
          titleLower.includes('budget')
        ) {
          dotColorClass = 'bg-emerald-500';
        } else if (
          titleLower.includes('market') ||
          titleLower.includes('demand') ||
          titleLower.includes('competitor') ||
          titleLower.includes('moat')
        ) {
          dotColorClass = 'bg-blue-500';
        } else if (
          titleLower.includes('audience') ||
          titleLower.includes('user') ||
          titleLower.includes('customer')
        ) {
          dotColorClass = 'bg-indigo-500';
        }

        return (
          <div
            key={key}
            className="rounded-xl border border-border/40 bg-card/35 p-4 hover:border-primary/20 hover:bg-card/45 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`}
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {humanizeKey(key)}
              </span>
            </div>

            <div className="text-xs sm:text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap pl-3.5">
              {formatPrimitive(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimpleTable({
  rows,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  columns: string[];
}) {
  if (rows.length === 0)
    return <p className="text-xs text-muted-foreground">Not available</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-background/30 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/40 text-xs">
          <thead className="bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground/90">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left font-bold text-[10px] tracking-wider"
                >
                  {humanizeKey(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-muted/5 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-3 align-top text-foreground/80 leading-relaxed font-medium"
                  >
                    {Array.isArray(row[column]) ? (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {asStringList(row[column]).map((str, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-semibold text-primary tracking-tight"
                          >
                            {str}
                          </span>
                        ))}
                      </div>
                    ) : (
                      formatPrimitive(row[column])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportReader({
  sections,
  initialSectionId,
  onSectionChange,
  isEditable = false,
  onSaveSection,
  onRefineSection,
  refineLoading = false,
  rawValues,
}: {
  sections: ReportSection[];
  initialSectionId?: string;
  onSectionChange?: (section: ActiveReportSection) => void;
  isEditable?: boolean;
  onSaveSection?: (sectionId: string, updatedValue: any) => void;
  onRefineSection?: (sectionId: string, instruction: string) => Promise<void>;
  refineLoading?: boolean;
  rawValues?: Record<string, any>;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(
    initialSectionId ?? sections[0]?.id ?? '',
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSections = normalizedQuery
    ? sections.filter((section) =>
        [section.title, section.description, section.keywords]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : sections;
  const selectedSection =
    filteredSections.find((section) => section.id === selectedId) ??
    filteredSections[0] ??
    sections[0];

  useEffect(() => {
    setIsEditing(false);
    setIsRefining(false);
  }, [selectedId]);

  useEffect(() => {
    if (selectedSection) {
      onSectionChange?.({
        id: selectedSection.id,
        title: selectedSection.title,
        description: selectedSection.description,
      });
    }
  }, [
    selectedSection?.id,
    selectedSection?.title,
    selectedSection?.description,
    onSectionChange,
  ]);

  const getSectionIcon = (id: string) => {
    const lowerId = id.toLowerCase();
    if (lowerId.includes('score'))
      return <Award className="h-4 w-4 shrink-0" />;
    if (lowerId.includes('market'))
      return <TrendingUp className="h-4 w-4 shrink-0" />;
    if (lowerId.includes('target_users') || lowerId.includes('users'))
      return <Globe className="h-4 w-4 shrink-0" />;
    if (
      lowerId.includes('business') ||
      lowerId.includes('revenue') ||
      lowerId.includes('cost') ||
      lowerId.includes('economic')
    )
      return <Coins className="h-4 w-4 shrink-0" />;
    if (
      lowerId.includes('risk') ||
      lowerId.includes('threat') ||
      lowerId.includes('weakness')
    )
      return <AlertCircle className="h-4 w-4 shrink-0" />;
    if (
      lowerId.includes('swot') ||
      lowerId.includes('suggest') ||
      lowerId.includes('recommend') ||
      lowerId.includes('next')
    )
      return <Sparkles className="h-4 w-4 shrink-0" />;
    if (lowerId.includes('assumption'))
      return <CheckCircle className="h-4 w-4 shrink-0" />;
    if (lowerId.includes('architecture') || lowerId.includes('tech'))
      return <Cpu className="h-4 w-4 shrink-0" />;
    if (lowerId.includes('summary'))
      return <FileText className="h-4 w-4 shrink-0" />;
    if (lowerId.includes('strategy') || lowerId.includes('plan'))
      return <Layout className="h-4 w-4 shrink-0" />;
    return <ArrowRight className="h-4 w-4 shrink-0" />;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto shadow-md">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search report sections..."
            className="h-10 w-full rounded-xl border border-border/40 bg-background/55 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-muted-foreground/45 focus:border-primary/45 focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <nav className="space-y-2">
          {filteredSections.map((section) => {
            const active = selectedSection?.id === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedId(section.id)}
                className={`group w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.01] ${
                  active
                    ? 'border-primary/30 bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm'
                    : 'border-transparent text-muted-foreground hover:border-border/30 hover:bg-background/40 hover:text-foreground'
                }`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-lg transition-colors duration-200 ${
                    active
                      ? 'bg-primary/25 text-primary border border-primary/20'
                      : 'bg-muted/40 text-muted-foreground/50 group-hover:bg-muted group-hover:text-foreground'
                  }`}
                >
                  {getSectionIcon(section.id)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold tracking-tight truncate">
                    {section.title}
                  </span>
                  {section.description && (
                    <span className="mt-1 block text-[10px] leading-relaxed opacity-75 truncate">
                      {section.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {filteredSections.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/50 px-3 py-8 text-center text-xs text-muted-foreground">
              No matching report sections
            </div>
          )}
        </nav>
      </aside>

      <section className="min-w-0 rounded-2xl border border-border/60 bg-gradient-to-br from-card/95 via-card/85 to-background/95 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
        {/* Dynamic ambient orb overlay */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-75 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {selectedSection ? (
          <div className="space-y-6 relative z-10">
            <div className="border-b border-border/40 pb-5 mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold uppercase tracking-wider mb-3 animate-fade-in">
                  {getSectionIcon(selectedSection.id)}
                  <span>Active Document Details</span>
                </div>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                  {selectedSection.title}
                </h2>
                {selectedSection.description && (
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed italic">
                    {selectedSection.description}
                  </p>
                )}
              </div>

              {isEditable && !isEditing && !isRefining && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold h-9 gap-1.5"
                    onClick={() => {
                      setEditVal(
                        formatBlueprintSectionToMarkdown(
                          rawValues?.[selectedSection.id],
                        ),
                      );
                      setIsEditing(true);
                    }}
                    disabled={refineLoading}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold h-9 gap-1.5 bg-primary/15 border-primary/20 text-primary hover:bg-primary/25"
                    onClick={() => {
                      setRefinePrompt('');
                      setIsRefining(true);
                    }}
                    disabled={refineLoading}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Refine with AI
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-xs text-muted-foreground mb-1 leading-relaxed">
                  Edit the section content below in normal language:
                </div>
                <textarea
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="w-full min-h-[300px] font-sans text-xs bg-background/55 text-foreground placeholder:text-muted-foreground/45 p-4 rounded-xl border border-border/40 outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/25 transition-all leading-relaxed whitespace-pre-wrap"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onSaveSection?.(selectedSection.id, editVal);
                      setIsEditing(false);
                      toast.success('Section updated successfully!');
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : isRefining ? (
              <div className="space-y-4 animate-in fade-in duration-200 bg-primary/5 border border-primary/15 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Refine with AI assistant
                  </span>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Describe what details you want to add, subtract, or rewrite in
                  this section (e.g., "Add user email verification to MVP, and
                  specify Node.js / PostgreSQL in stack").
                </div>
                <textarea
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="Enter details to modify..."
                  className="w-full min-h-[100px] bg-background/55 text-foreground placeholder:text-muted-foreground/45 p-3 rounded-lg border border-border/40 outline-none text-sm focus:border-primary/45 focus:ring-1 focus:ring-primary/25 transition-all"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRefining(false)}
                    disabled={refineLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!refinePrompt.trim() || refineLoading}
                    onClick={async () => {
                      await onRefineSection?.(selectedSection.id, refinePrompt);
                      setIsRefining(false);
                    }}
                  >
                    {refineLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border border-primary-foreground/40 border-t-primary-foreground animate-spin mr-1.5" />
                        Refining...
                      </>
                    ) : (
                      'Refine section'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300 text-foreground/90 leading-relaxed text-sm">
                {selectedSection.body}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center relative z-10">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-muted-foreground">
              Select a report section to read.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function JobProgressPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="flex items-start gap-4">
        <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full bg-primary/80 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumLoader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const quotes = [
    {
      text: 'The best way to predict the future is to create it.',
      author: 'Peter Drucker',
    },
    {
      text: 'Ideas are easy. Implementation is everything.',
      author: 'John Doerr',
    },
    {
      text: "If you are not embarrassed by the first version of your product, you've launched too late.",
      author: 'Reid Hoffman',
    },
    {
      text: 'Simplicity is the ultimate sophistication.',
      author: 'Leonardo da Vinci',
    },
    { text: 'Make something people want.', author: 'Paul Graham' },
    {
      text: 'Do not be embarrassed by your failures, learn from them and start again.',
      author: 'Richard Branson',
    },
    {
      text: "It's not about ideas. It's about making ideas happen.",
      author: 'Scott Belsky',
    },
    {
      text: 'First, solve the problem. Then, write the code.',
      author: 'John Johnson',
    },
    {
      text: 'Quality means doing it right when no one is looking.',
      author: 'Henry Ford',
    },
    {
      text: 'Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.',
      author: 'Mark Zuckerberg',
    },
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[quoteIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[460px] p-8 md:p-10 rounded-3xl border border-primary/20 bg-card/45 backdrop-blur-md relative overflow-hidden shadow-2xl animate-in fade-in duration-500">
      {/* Animated Glowing Ambient Orbs */}
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Cybernetic Pulse Spinner with new logo style */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-10 mt-2">
        <div className="w-14 h-14 rounded-xl bg-black dark:bg-white border border-neutral-800 dark:border-neutral-200 flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 relative z-10">
          <img
            src="/dehix.png"
            alt="Dehix"
            className="w-7 h-7 invert dark:invert-0 object-contain"
          />
        </div>
        {/* Radar Scanner Ring */}
        <div
          className="absolute inset-[-12px] rounded-2xl border border-primary/20 animate-ping opacity-60"
          style={{ animationDuration: '3s' }}
        />
        <div className="absolute inset-[-6px] rounded-2xl border border-blue-500/10 animate-pulse" />
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight text-center mb-3 animate-pulse">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Quote Container with Premium Fade */}
      <div className="border-t border-border/20 pt-6 w-full max-w-md flex flex-col items-center min-h-[90px] relative z-10">
        <div
          className={`transition-all duration-300 transform ${fade ? 'opacity-100 translate-y-0 animate-in fade-in' : 'opacity-0 translate-y-2'} text-center`}
        >
          <p className="text-xs italic text-foreground/80 leading-relaxed max-w-sm mx-auto">
            &quot;{currentQuote.text}&quot;
          </p>
          <p className="text-[10px] text-primary/70 mt-2.5 font-mono uppercase tracking-wider font-semibold">
            — {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/40 p-3">
      <div className="flex items-center justify-between gap-3 text-xs mb-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function MarkdownMini({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let currentList: ReactNode[] = [];
  let isNumberList = false;

  const parseInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] font-mono border border-primary/10"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      if (isNumberList) {
        elements.push(
          <ol
            key={`ol-${keyPrefix}`}
            className="list-decimal pl-5 space-y-1.5 my-2 text-xs"
          >
            {currentList}
          </ol>,
        );
      } else {
        elements.push(
          <ul
            key={`ul-${keyPrefix}`}
            className="list-disc pl-5 space-y-1.5 my-2 text-xs"
          >
            {currentList}
          </ul>,
        );
      }
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const isNumber = /^\d+\.\s/.test(trimmed);

    if (isBullet || isNumber) {
      if (currentList.length > 0 && isNumberList !== isNumber) {
        flushList(`switch-${i}`);
      }
      isNumberList = isNumber;
      const content = isBullet
        ? trimmed.substring(2)
        : trimmed.substring(trimmed.indexOf('.') + 1).trim();
      currentList.push(
        <li
          key={`li-${i}`}
          className="text-xs leading-relaxed text-foreground/90"
        >
          {parseInline(content)}
        </li>,
      );
    } else {
      flushList(`flush-${i}`);
      if (trimmed) {
        if (trimmed.startsWith('### ')) {
          elements.push(
            <h4
              key={i}
              className="text-xs font-bold text-foreground mt-3 mb-1 uppercase tracking-wide"
            >
              {parseInline(trimmed.substring(4))}
            </h4>,
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h3
              key={i}
              className="text-sm font-bold text-foreground mt-4 mb-1.5"
            >
              {parseInline(trimmed.substring(3))}
            </h3>,
          );
        } else {
          elements.push(
            <p
              key={i}
              className="my-1.5 leading-relaxed text-xs text-foreground/85"
            >
              {parseInline(trimmed)}
            </p>,
          );
        }
      }
    }
  }
  flushList('final');
  return <div className="space-y-1.5">{elements}</div>;
}

function SectionList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-sm text-muted-foreground leading-relaxed flex gap-2"
          >
            <span className="text-primary shrink-0">-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlockSectionList({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;

  const titleLower = title.toLowerCase();
  let themeClass = 'border-border/30 bg-background/20 hover:border-border/50';
  let itemBgClass = 'bg-background/40 border-border/20';
  let iconColor = 'text-primary';
  let borderLeftAccent = 'border-l-primary/45';

  if (titleLower.includes('strength')) {
    themeClass =
      'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 shadow-[0_2px_8px_rgba(16,185,129,0.02)]';
    itemBgClass = 'bg-emerald-500/10 border-emerald-500/15';
    iconColor = 'text-emerald-400';
    borderLeftAccent = 'border-l-emerald-500';
  } else if (titleLower.includes('weakness')) {
    themeClass =
      'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30 shadow-[0_2px_8px_rgba(244,63,94,0.02)]';
    itemBgClass = 'bg-rose-500/10 border-rose-500/15';
    iconColor = 'text-rose-400';
    borderLeftAccent = 'border-l-rose-500';
  } else if (
    titleLower.includes('opportunity') ||
    titleLower.includes('action') ||
    titleLower.includes('roadmap') ||
    titleLower.includes('module')
  ) {
    themeClass =
      'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/30 shadow-[0_2px_8px_rgba(59,130,246,0.02)]';
    itemBgClass = 'bg-blue-500/10 border-blue-500/15';
    iconColor = 'text-blue-400';
    borderLeftAccent = 'border-l-blue-500';
  } else if (
    titleLower.includes('threat') ||
    titleLower.includes('risk') ||
    titleLower.includes('warning')
  ) {
    themeClass =
      'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 shadow-[0_2px_8px_rgba(245,158,11,0.02)]';
    itemBgClass = 'bg-amber-500/10 border-amber-500/15';
    iconColor = 'text-amber-400';
    borderLeftAccent = 'border-l-amber-500';
  }

  return (
    <div
      className={`space-y-3 rounded-xl border p-4 transition-all duration-200 ${themeClass}`}
    >
      <h3
        className={`text-[10px] font-bold uppercase tracking-wider ${iconColor}`}
      >
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={`rounded-lg border p-3 text-xs leading-relaxed text-foreground/90 border-l-4 ${borderLeftAccent} ${itemBgClass} shadow-sm`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlueprintValue({ value }: { value: unknown }): ReactNode {
  if (isPrimitive(value)) {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed">
        {formatPrimitive(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-muted-foreground">Not available</p>;
    }

    if (value.every(isPrimitive)) {
      return (
        <ul className="space-y-1.5">
          {value.map((item, index) => (
            <li
              key={index}
              className="text-sm text-muted-foreground leading-relaxed flex gap-2"
            >
              <span className="text-primary shrink-0">-</span>
              <span>{formatPrimitive(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-border/40 bg-card/35 p-4 hover:border-primary/20 hover:bg-card/45 transition-all duration-200"
          >
            <BlueprintValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(value as Record<string, unknown>).map(
          ([key, nestedValue]) => {
            const titleLower = key.toLowerCase();
            let dotColorClass = 'bg-primary/65';

            if (
              titleLower.includes('cost') ||
              titleLower.includes('budget') ||
              titleLower.includes('price') ||
              titleLower.includes('revenue')
            ) {
              dotColorClass = 'bg-emerald-500';
            } else if (
              titleLower.includes('tech') ||
              titleLower.includes('db') ||
              titleLower.includes('database') ||
              titleLower.includes('stack') ||
              titleLower.includes('api') ||
              titleLower.includes('security')
            ) {
              dotColorClass = 'bg-blue-500';
            } else if (
              titleLower.includes('team') ||
              titleLower.includes('role') ||
              titleLower.includes('user') ||
              titleLower.includes('persona')
            ) {
              dotColorClass = 'bg-indigo-500';
            }

            return (
              <div
                key={key}
                className="rounded-xl border border-border/40 bg-card/35 p-4 hover:border-primary/20 hover:bg-card/45 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {humanizeKey(key)}
                  </span>
                </div>
                <div className="pl-3.5 mt-1 text-xs sm:text-sm leading-relaxed text-foreground/85">
                  <BlueprintValue value={nestedValue} />
                </div>
              </div>
            );
          },
        )}
      </div>
    );
  }

  return null;
}

function formatDurationResults(totalWeeks: number): {
  totalWeeks: number;
  totalMonths: string;
} {
  if (totalWeeks <= 0) {
    return { totalWeeks: 0, totalMonths: '0' };
  }

  const rawMonths = totalWeeks / 4.33;
  const lowerMonth = Math.floor(rawMonths);
  const upperMonth = Math.ceil(rawMonths);

  let formattedMonths = '';
  if (lowerMonth === upperMonth || lowerMonth === 0) {
    const singleMonth = Math.max(1, Math.round(rawMonths));
    formattedMonths = `${singleMonth}`;
  } else if (upperMonth - lowerMonth === 1) {
    const decimalPart = rawMonths - lowerMonth;
    if (decimalPart < 0.15) {
      formattedMonths = `${lowerMonth}`;
    } else if (decimalPart > 0.85) {
      formattedMonths = `${upperMonth}`;
    } else {
      formattedMonths = `${lowerMonth} - ${upperMonth}`;
    }
  } else {
    formattedMonths = `${lowerMonth} - ${upperMonth}`;
  }

  return {
    totalWeeks,
    totalMonths: formattedMonths,
  };
}

function calculateTotalRoadmapDuration(roadmapValue: unknown): {
  totalWeeks: number;
  totalMonths: string;
} {
  let phases: any[] = [];
  if (Array.isArray(roadmapValue)) {
    phases = roadmapValue;
  } else if (typeof roadmapValue === 'object' && roadmapValue !== null) {
    phases = Object.values(roadmapValue);
  } else if (typeof roadmapValue === 'string') {
    try {
      const parsed = JSON.parse(roadmapValue);
      return calculateTotalRoadmapDuration(parsed);
    } catch {
      const matches =
        roadmapValue.match(/(\d+(?:\.\d+)?)\s*(week|month|wks|mths|wk|mth)/gi) || [];
      let totalWeeksCount = 0;
      for (const m of matches) {
        const parts = m.split(/\s+/);
        const val = parseFloat(parts[0]);
        const unit = parts[1]?.toLowerCase() || '';
        if (!isNaN(val)) {
          if (unit.startsWith('month') || unit.startsWith('mth'))
            totalWeeksCount += val * 4.33;
          else totalWeeksCount += val;
        }
      }
      return formatDurationResults(Math.round(totalWeeksCount));
    }
  }

  let totalWeeks = 0;
  for (const phase of phases) {
    if (!phase) continue;
    const dur =
      typeof phase === 'object'
        ? (phase.estimated_weeks ?? phase.duration ?? phase.weeks ?? phase.time)
        : phase;
    if (dur !== undefined && dur !== null) {
      const str = String(dur).toLowerCase();
      const match = str.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num)) {
          if (str.includes('month') || str.includes('mth')) {
            totalWeeks += num * 4.33;
          } else if (str.includes('day')) {
            totalWeeks += num / 7;
          } else {
            totalWeeks += num;
          }
        }
      }
    }
  }

  return formatDurationResults(Math.round(totalWeeks));
}

function renderRoadmap(value: unknown): ReactNode {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed) return renderRoadmap(parsed);
    } catch (e) {
      return <MarkdownMini text={value} />;
    }
  }

  let phasesList: Array<{
    title: string;
    duration?: any;
    deliverables: string[];
  }> = [];

  if (Array.isArray(value)) {
    phasesList = value.map((item: any, idx: number) => {
      const rec = asRecord(item);
      const title = String(
        rec.phase_name ?? rec.name ?? rec.title ?? `Phase ${idx + 1}`,
      );
      const duration =
        rec.estimated_weeks ?? rec.duration ?? rec.weeks ?? rec.time;
      const deliverables = asStringList(
        rec.deliverables ?? rec.tasks ?? rec.milestones,
      );
      return { title, duration, deliverables };
    });
  } else if (typeof value === 'object' && value !== null) {
    phasesList = Object.entries(value as Record<string, unknown>).map(
      ([key, phase], idx) => {
        const rec = asRecord(phase);
        const title = String(
          rec.phase_name ?? rec.name ?? rec.title ?? humanizeKey(key),
        );
        const duration =
          rec.estimated_weeks ?? rec.duration ?? rec.weeks ?? rec.time;
        const deliverables = asStringList(
          rec.deliverables ?? rec.tasks ?? rec.milestones,
        );
        return { title, duration, deliverables };
      },
    );
  }

  if (phasesList.length === 0) {
    if (value && typeof value === 'string') {
      return <MarkdownMini text={value} />;
    }
    return <p className="text-xs text-muted-foreground">Not available</p>;
  }

  const durationData = calculateTotalRoadmapDuration(value);

  return (
    <div className="space-y-6">
      {durationData.totalWeeks > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Roadmap Overview
              </span>
              <h3 className="text-xs font-bold text-foreground">
                Phased Development Timeline
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card border border-primary/25 px-3 py-1.5 text-xs font-bold text-primary shrink-0 self-start sm:self-auto shadow-xs">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
            <span>
              Total Estimated Duration:{' '}
              <span className="text-foreground font-extrabold">
                {durationData.totalMonths} {durationData.totalMonths.includes('-') || Number(durationData.totalMonths) > 1 ? 'Months' : 'Month'}
              </span>{' '}
              ({durationData.totalWeeks} {durationData.totalWeeks === 1 ? 'Week' : 'Weeks'})
            </span>
          </div>
        </div>
      )}

      <div className="relative border-l border-primary/25 pl-6 ml-3 space-y-6 py-2">
        {phasesList.map((phase, idx) => {
          const rawTitle = phase.title.trim();
          const hasPhasePrefix = /^phase\s*\d+/i.test(rawTitle);
          const displayTitle = hasPhasePrefix
            ? rawTitle
            : `Phase ${idx + 1}: ${rawTitle}`;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </div>

              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-background/50 p-5 shadow-sm transition-all duration-200 hover:border-primary/20">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-3 mb-3">
                  <div>
                    {!hasPhasePrefix && (
                      <span className="text-[9px] text-primary uppercase font-bold tracking-wider block mb-0.5">
                        Phase {idx + 1}
                      </span>
                    )}
                    <h3 className="text-xs font-bold text-foreground">
                      {displayTitle}
                    </h3>
                  </div>
                  {phase.duration !== undefined && (
                    <span className="w-fit rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary shrink-0" />
                      {formatPrimitive(phase.duration)}{' '}
                      {typeof phase.duration === 'number' ||
                      !isNaN(Number(phase.duration))
                        ? Number(phase.duration) === 1
                          ? 'week'
                          : 'weeks'
                        : ''}
                    </span>
                  )}
                </div>
                <BulletList items={phase.deliverables} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CostEstimationViewer({
  value,
  region,
}: {
  value: unknown;
  region: string;
}) {
  const cost = asRecord(value);

  // Choose default currency based on region name
  const getInitialCurrency = (): 'USD' | 'INR' | 'EUR' | 'GBP' => {
    const regLower = region.toLowerCase();
    if (
      regLower.includes('india') ||
      regLower.includes('inr') ||
      regLower.includes('rupee') ||
      regLower.includes('â‚¹')
    ) {
      return 'INR';
    }
    if (
      regLower.includes('europe') ||
      regLower.includes('eur') ||
      regLower.includes('germany') ||
      regLower.includes('france') ||
      regLower.includes('italy') ||
      regLower.includes('spain')
    ) {
      return 'EUR';
    }
    if (
      regLower.includes('uk') ||
      regLower.includes('united kingdom') ||
      regLower.includes('gbp') ||
      regLower.includes('london') ||
      regLower.includes('england')
    ) {
      return 'GBP';
    }
    return 'USD';
  };

  const [selectedCurrency, setSelectedCurrency] = useState<
    'USD' | 'INR' | 'EUR' | 'GBP'
  >(getInitialCurrency);

  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0 },
    INR: { symbol: 'â‚¹', rate: 83.5 },
    EUR: { symbol: 'â‚¬', rate: 0.92 },
    GBP: { symbol: 'Â£', rate: 0.79 },
  };

  function parseAndConvert(
    valStr: unknown,
    targetCurrency: 'USD' | 'INR' | 'EUR' | 'GBP',
  ): string {
    if (valStr === null || valStr === undefined) return 'Not available';
    const strVal = String(valStr).trim();

    // 1. Detect base currency
    let baseCurrency: 'USD' | 'INR' | 'EUR' | 'GBP' = 'USD';
    const strLower = strVal.toLowerCase();
    const regLower = region.toLowerCase();

    if (
      strLower.includes('â‚¹') ||
      strLower.includes('inr') ||
      strLower.includes('rupee') ||
      strLower.includes('lakh') ||
      strLower.includes('crore')
    ) {
      baseCurrency = 'INR';
    } else if (
      strLower.includes('â‚¬') ||
      strLower.includes('eur') ||
      strLower.includes('euro')
    ) {
      baseCurrency = 'EUR';
    } else if (
      strLower.includes('Â£') ||
      strLower.includes('gbp') ||
      strLower.includes('pound')
    ) {
      baseCurrency = 'GBP';
    } else {
      // Fallback to region detection
      if (
        regLower.includes('india') ||
        regLower.includes('inr') ||
        regLower.includes('rupee') ||
        regLower.includes('â‚¹')
      ) {
        baseCurrency = 'INR';
      } else if (
        regLower.includes('europe') ||
        regLower.includes('eur') ||
        regLower.includes('germany') ||
        regLower.includes('france') ||
        regLower.includes('italy') ||
        regLower.includes('spain')
      ) {
        baseCurrency = 'EUR';
      } else if (
        regLower.includes('uk') ||
        regLower.includes('united kingdom') ||
        regLower.includes('gbp') ||
        regLower.includes('london') ||
        regLower.includes('england')
      ) {
        baseCurrency = 'GBP';
      }
    }

    // 2. Multi-currency translation rules
    const formatNumberClean = (num: number): string => {
      const rounded = Math.round(num * 100) / 100;
      return String(rounded);
    };

    // Regex to match numbers with commas/dots, optionally followed by multiplier words
    const pattern =
      /([\d,]+(?:\.\d+)?)\s*(lakh|crore|million|billion|k|m)?\b/gi;

    const result = strVal.replace(pattern, (match, numStr, unit) => {
      const num = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(num)) return match;

      let multiplier = 1;
      if (unit) {
        const unitLower = unit.toLowerCase();
        if (unitLower === 'lakh') {
          multiplier = 100000;
        } else if (unitLower === 'crore') {
          multiplier = 10000000;
        } else if (unitLower === 'k') {
          multiplier = 1000;
        } else if (unitLower === 'm' || unitLower === 'million') {
          multiplier = 1000000;
        } else if (unitLower === 'billion') {
          multiplier = 1000000000;
        }
      }

      const absoluteBaseVal = num * multiplier;
      const baseRate = CURRENCIES[baseCurrency].rate;
      const valInUsd = absoluteBaseVal / baseRate;

      const targetRate = CURRENCIES[targetCurrency].rate;
      const targetVal = valInUsd * targetRate;

      const targetSymbol = CURRENCIES[targetCurrency].symbol;

      if (targetCurrency === 'INR') {
        if (targetVal >= 10000000) {
          const crores = targetVal / 10000000;
          return `${targetSymbol}${formatNumberClean(crores)} crore`;
        } else if (targetVal >= 100000) {
          const lakhs = targetVal / 100000;
          return `${targetSymbol}${formatNumberClean(lakhs)} lakh`;
        } else if (targetVal >= 1000) {
          return `${targetSymbol}${formatNumberClean(targetVal / 1000)}k`;
        } else {
          return `${targetSymbol}${Math.round(targetVal).toLocaleString()}`;
        }
      } else {
        if (targetVal >= 1000000) {
          const millions = targetVal / 1000000;
          return `${targetSymbol}${formatNumberClean(millions)}M`;
        } else if (targetVal >= 1000) {
          const k = targetVal / 1000;
          return `${targetSymbol}${formatNumberClean(k)}k`;
        } else {
          return `${targetSymbol}${Math.round(targetVal).toLocaleString()}`;
        }
      }
    });

    let cleaned = result;
    cleaned = cleaned.replace(/[$â‚¹â‚¬Â£]\s*([$â‚¹â‚¬Â£])/g, '$1');

    if (targetCurrency === 'USD') {
      cleaned = cleaned
        .replace(/\b(inr|eur|gbp|rupees|euros|pounds)\b/gi, '')
        .trim();
    } else if (targetCurrency === 'INR') {
      cleaned = cleaned
        .replace(/\b(usd|eur|gbp|dollars|euros|pounds)\b/gi, '')
        .trim();
    } else if (targetCurrency === 'EUR') {
      cleaned = cleaned
        .replace(/\b(usd|inr|gbp|dollars|rupees|pounds)\b/gi, '')
        .trim();
    } else if (targetCurrency === 'GBP') {
      cleaned = cleaned
        .replace(/\b(usd|inr|eur|dollars|rupees|euros)\b/gi, '')
        .trim();
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  return (
    <div className="space-y-6">
      {/* Currency Selector Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/15 pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block leading-none mb-1">
              Cost & Budget Estimates
            </span>
            <span className="text-xs font-semibold text-foreground/75">
              Optimized for:{' '}
              <span className="text-primary font-bold">{region}</span>
            </span>
          </div>
        </div>

        {/* Switcher */}
        <div className="flex items-center bg-secondary/40 border border-border/40 p-1 rounded-xl gap-0.5 self-start sm:self-auto shadow-inner">
          {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map(
            (cur) => (
              <button
                key={cur}
                onClick={() => setSelectedCurrency(cur)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-all ${
                  selectedCurrency === cur
                    ? 'bg-card text-foreground shadow-sm border border-border/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cur}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(cost)
          .filter(
            ([key, item]) =>
              typeof item === 'object' &&
              item !== null &&
              !Array.isArray(item) &&
              key !== 'major_cost_drivers',
          )
          .map(([key, item]) => {
            const rawItemObj = asRecord(item);
            const convertedObj: Record<string, unknown> = {};
            Object.entries(rawItemObj).forEach(([k, v]) => {
              convertedObj[k] = parseAndConvert(v, selectedCurrency);
            });

            return (
              <div
                key={key}
                className="rounded-xl border border-border/40 bg-card/35 p-5 hover:border-primary/20 hover:bg-card/45 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-border/20 pb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
                    {humanizeKey(key)}
                  </h3>
                </div>
                <KeyValueGrid data={convertedObj} />
              </div>
            );
          })}
      </div>

      {!!cost.major_cost_drivers && (
        <div className="rounded-xl border border-border/40 bg-card/35 p-5 hover:border-primary/20 hover:bg-card/45 transition-all duration-200 space-y-3">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2.5">
            <Coins className="h-4 w-4 text-emerald-500 shrink-0" />
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
              Major Cost Drivers
            </h3>
          </div>
          <ul className="space-y-2.5 pl-1.5 mt-2">
            {asStringList(cost.major_cost_drivers).map((item, index) => {
              const convertedItem = parseAndConvert(item, selectedCurrency);
              return (
                <li
                  key={index}
                  className="text-xs sm:text-sm text-foreground/80 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="text-emerald-500 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{convertedItem}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderCostEstimation(value: unknown, region: string) {
  if (typeof value === 'string') {
    return <MarkdownMini text={value} />;
  }
  return <CostEstimationViewer value={value} region={region} />;
}

function renderTeamRequirements(value: unknown) {
  if (typeof value === 'string') {
    return <MarkdownMini text={value} />;
  }
  const team = asRecord(value);
  const recommendedTeamRaw =
    team.recommended_team ??
    team.recommended ??
    team.roles ??
    team.team_composition ??
    team.composition;
  const recommended = asRecordList(recommendedTeamRaw);

  const minimumTeamRaw =
    team.minimum_team ??
    team.minimum ??
    team.min_team ??
    team.viable_size ??
    team.minimum_viable_team ??
    team.core_team ??
    team.viable_team ??
    team.minimum_viable_team_size ??
    team.viable_team_size ??
    team.core_personnel ??
    team.key_personnel ??
    team.core_roles ??
    team.key_roles ??
    team.minimum_team_requirements ??
    team.essential_roles ??
    team.essential_team ??
    team.minimum_squad ??
    team.viable_squad;

  const minimum = Array.isArray(minimumTeamRaw)
    ? minimumTeamRaw
        .map((item: any) => {
          if (!item) return '';
          if (typeof item === 'string') return item;
          if (typeof item === 'object') {
            const title = String(
              item.role ||
                item.role_title ||
                item.title ||
                item.name ||
                item.position ||
                '',
            );
            const purpose = String(
              item.purpose || item.description || item.responsibilities || '',
            );
            const countVal = item.count ?? item.quantity ?? item.size;
            const countStr = countVal ? ` (Count: ${countVal})` : '';
            if (title && purpose) return `${title}${countStr} - ${purpose}`;
            if (title) return `${title}${countStr}`;
            if (purpose) return purpose;
          }
          return String(item);
        })
        .filter(Boolean)
    : minimumTeamRaw
      ? [String(minimumTeamRaw)]
      : [];

  if (recommended.length === 0 && minimum.length === 0) {
    if (value) {
      if (Array.isArray(value)) {
        const roles = asRecordList(value);
        if (roles.length > 0) {
          const first = roles[0];
          const hasRoleKey =
            first.role ||
            first.role_title ||
            first.title ||
            first.name ||
            first.position;
          if (hasRoleKey) {
            return (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
                  Recommended Team Roles
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {roles.map((item, idx) => {
                    const title =
                      item.role ??
                      item.role_title ??
                      item.title ??
                      item.name ??
                      item.position;
                    const desc =
                      item.responsibilities ?? item.description ?? item.details;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/10 transition-colors"
                      >
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <span className="text-xs font-bold text-foreground">
                            {formatPrimitive(title)}
                          </span>
                          <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase">
                            Required
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {formatPrimitive(desc)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        }
      }
      return (
        <MarkdownMini
          text={
            typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value)
          }
        />
      );
    }
    return <p className="text-xs text-muted-foreground">Not available</p>;
  }

  return (
    <div className="space-y-6">
      {recommended.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
            Recommended Team Roles
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((item, idx) => {
              const title =
                item.role ??
                item.role_title ??
                item.title ??
                item.name ??
                item.position;
              const desc =
                item.responsibilities ?? item.description ?? item.details;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/10 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold text-foreground">
                      {formatPrimitive(title)}
                    </span>
                    <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formatPrimitive(desc)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {minimum.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-background/25 p-4 space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
            Minimum Viable Team Size
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {minimum.map((item, idx) => (
              <li
                key={idx}
                className="text-xs text-muted-foreground flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderMvpDefinition(value: unknown) {
  const mvp = asRecord(value);
  const mustHaves = asRecordList(mvp.must_have_features);
  const shouldHaves = asRecordList(mvp.should_have_features);
  const futureFeatures = asRecordList(mvp.future_features);
  const excluded = asStringList(mvp.excluded_from_mvp);

  return (
    <div className="space-y-8">
      {mustHaves.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Must-Have Features (Core V1)
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mustHaves.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-1 w-16 bg-emerald-500" />
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {formatPrimitive(item.feature)}
                  </span>
                  {!!item.priority && (
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase font-bold text-emerald-400">
                      {formatPrimitive(item.priority)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrimitive(item.purpose)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {shouldHaves.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Should-Have Features (Next Priority)
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {shouldHaves.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2"
              >
                <span className="text-xs font-bold text-foreground block">
                  {formatPrimitive(item.feature)}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrimitive(item.purpose)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {futureFeatures.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Future Iterations (V2+)
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {futureFeatures.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-4 space-y-2"
              >
                <span className="text-xs font-bold text-muted-foreground block">
                  {formatPrimitive(item.feature)}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrimitive(item.reason)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {excluded.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-tight flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            Out of Scope for MVP
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2 pl-1">
            {excluded.map((item, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground flex items-start gap-2"
              >
                <span className="text-red-500 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderRiskAnalysis(value: unknown) {
  const risks = asRecord(value);
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {Object.entries(risks).map(([key, list]) => {
        const keyLower = key.toLowerCase();
        let headerIcon = (
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        );
        let hoverBorderClass = 'hover:border-amber-500/20';
        let iconColorClass = 'text-amber-500';

        if (keyLower.includes('technical')) {
          headerIcon = <Cpu className="h-4 w-4 text-blue-500 shrink-0" />;
          hoverBorderClass = 'hover:border-blue-500/25';
          iconColorClass = 'text-blue-500';
        } else if (keyLower.includes('market')) {
          headerIcon = <Globe className="h-4 w-4 text-purple-500 shrink-0" />;
          hoverBorderClass = 'hover:border-purple-500/25';
          iconColorClass = 'text-purple-500';
        } else if (keyLower.includes('business')) {
          headerIcon = (
            <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />
          );
          hoverBorderClass = 'hover:border-orange-500/25';
          iconColorClass = 'text-orange-500';
        }

        return (
          <div key={key} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/20 pb-2 mb-3">
              {headerIcon}
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
                {humanizeKey(key)}
              </h3>
            </div>
            <div className="space-y-3">
              {asRecordList(list).map((risk, index) => {
                const riskText = formatPrimitive(risk.risk);
                const mitigationText = formatPrimitive(risk.mitigation);
                if (!riskText && !mitigationText) return null;

                return (
                  <div
                    key={index}
                    className={`rounded-xl border border-border/40 bg-gradient-to-br from-card to-background/40 p-5 shadow-xs transition-all duration-200 ${hoverBorderClass} hover:bg-card/45 space-y-4`}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle
                        className={`h-4 w-4 ${iconColorClass} shrink-0 mt-0.5`}
                      />
                      <span className="text-xs sm:text-sm font-semibold text-foreground/90 leading-normal">
                        {riskText}
                      </span>
                    </div>

                    {mitigationText && (
                      <div className="mt-3 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-2 border-emerald-500/30 rounded-lg p-3 flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="grow">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                            Mitigation Strategy
                          </span>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {mitigationText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderTargetUsers(value: unknown) {
  const users = asRecord(value);
  const primary = asRecordList(users.primary_users);
  const secondary = asRecordList(users.secondary_users);

  return (
    <div className="space-y-6">
      {primary.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
            Primary Target Audience
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {primary.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {formatPrimitive(item.persona)}
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Primary Persona
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrimitive(item.description)}
                </p>
                {!!item.pain_points && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[9px] font-bold uppercase text-red-400 block mb-1">
                      Pain Points
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {formatPrimitive(item.pain_points)}
                    </p>
                  </div>
                )}
                {!!item.goals && (
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-1">
                      Goals
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {formatPrimitive(item.goals)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {secondary.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
            Secondary Audience
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {secondary.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-background/20 p-4 space-y-2"
              >
                <span className="text-xs font-bold text-foreground block">
                  {formatPrimitive(item.persona)}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrimitive(item.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderTechnicalArchitecture(value: unknown) {
  const architecture = asRecord(value);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xs font-bold text-foreground uppercase tracking-tight">
          Recommended Stack
        </h3>
        <KeyValueGrid data={asRecord(architecture.recommended_stack)} />
      </div>
      <div>
        <h3 className="mb-3 text-xs font-bold text-foreground uppercase tracking-tight">
          System Components
        </h3>
        <SimpleTable
          rows={asRecordList(architecture.system_components)}
          columns={['component', 'purpose']}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <SectionList
          title="API modules"
          items={asStringList(architecture.api_modules)}
        />
        <SectionList
          title="Database entities"
          items={asStringList(architecture.database_entities)}
        />
      </div>
    </div>
  );
}

function renderGroupedLists(value: unknown) {
  if (typeof value === 'string') {
    return <MarkdownMini text={value} />;
  }
  const groups = asRecord(value);
  const entries = Object.entries(groups);
  if (entries.length === 0) {
    if (value) {
      return (
        <MarkdownMini
          text={
            typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value)
          }
        />
      );
    }
    return <p className="text-xs text-muted-foreground">Not available</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {entries.map(([key, item]) => (
        <div key={key}>
          <SectionList
            title={humanizeKey(key)}
            items={
              Array.isArray(item) ? asStringList(item) : [formatPrimitive(item)]
            }
          />
        </div>
      ))}
    </div>
  );
}

function renderFinalVerdict(value: unknown) {
  if (!value)
    return <p className="text-xs text-muted-foreground">Not available</p>;

  let decision = '';
  let reasoning = '';
  let score: number | undefined = undefined;

  // Safely extract the fields, handling both object and string input formats
  if (typeof value === 'object' && value !== null) {
    const valObj = value as Record<string, unknown>;
    decision = String(
      valObj.build_now_or_not || valObj.decision || valObj.verdict || '',
    );
    reasoning = String(valObj.reasoning || valObj.verdict_reasoning || '');
    if (valObj.mvp_confidence_score !== undefined) {
      score = Number(valObj.mvp_confidence_score);
    }
  } else {
    const text = String(value).trim();
    if (text === 'undefined' || text === 'null' || text === '') {
      return <p className="text-xs text-muted-foreground">Not available</p>;
    }
    // If it's a short string, assume it's just the decision, otherwise reasoning
    if (text.length < 50) {
      decision = text;
    } else {
      reasoning = text;
    }
  }

  // Determine status classification
  const statusText = (decision || reasoning || '').toLowerCase();
  const isViable =
    statusText.includes('viable') ||
    statusText.includes('build now') ||
    statusText.includes('strong') ||
    statusText.includes('ready') ||
    statusText.includes('recommend');
  const isWarning =
    statusText.includes('risk') ||
    statusText.includes('concern') ||
    statusText.includes('caution') ||
    statusText.includes('validate') ||
    statusText.includes('further');
  const isNotRecommended =
    statusText.includes('not recommend') ||
    statusText.includes('avoid') ||
    statusText.includes('stop');

  let statusColor = 'emerald';
  let statusLabel = decision || 'Build Now';
  if (isNotRecommended) {
    statusColor = 'rose';
    statusLabel = decision || 'Not Recommended';
  } else if (isWarning || !isViable) {
    statusColor = 'amber';
    statusLabel = decision || 'Validate Further';
  }

  // Visual classes mapped to the status color
  let accentBorder = 'border-l-emerald-500';
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/25';
  let icon = <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />;

  if (statusColor === 'rose') {
    accentBorder = 'border-l-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
    badgeBg = 'bg-rose-500/10 border-rose-500/25';
    icon = <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />;
  } else if (statusColor === 'amber') {
    accentBorder = 'border-l-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
    badgeBg = 'bg-amber-500/10 border-amber-500/25';
    icon = <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/40 border-l-[4px] ${accentBorder} bg-gradient-to-br from-card to-background p-6 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/20 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${badgeBg}`}>{icon}</div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block leading-none mb-1">
              Final Verdict Decision
            </span>
            <span className={`text-base font-bold tracking-wide ${textColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {score !== undefined && !isNaN(score) && (
          <div className="flex items-center gap-3 bg-card/65 rounded-xl p-3 border border-border/40 shadow-xs self-start sm:self-auto min-w-[140px]">
            <div className="grow">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block leading-none mb-1.5">
                Confidence
              </span>
              <span className="text-base font-black text-foreground">
                {score}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  / 10
                </span>
              </span>
            </div>
            {/* Visual level track */}
            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full ${
                  statusColor === 'emerald'
                    ? 'bg-emerald-500'
                    : statusColor === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, score * 10)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {reasoning && (
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block leading-none mb-2">
            Verdict Reasoning & Strategic Context
          </span>
          <p className="text-xs sm:text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap pl-1">
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}

function renderBlueprintSection(
  key: string,
  value: unknown,
  region: string,
): ReactNode {
  if (typeof value === 'string') {
    return <MarkdownMini text={value} />;
  }
  if (key === 'mvp_definition') return renderMvpDefinition(value);
  if (key === 'target_users') return renderTargetUsers(value);
  if (key === 'technical_architecture')
    return renderTechnicalArchitecture(value);
  if (key === 'development_roadmap') return renderRoadmap(value);
  if (key === 'team_requirements') return renderTeamRequirements(value);
  if (key === 'cost_estimation') return renderCostEstimation(value, region);
  if (key === 'risk_analysis') return renderRiskAnalysis(value);
  if (key === 'final_verdict') return renderFinalVerdict(value);
  if (
    [
      'security_and_compliance',
      'business_model',
      'go_to_market',
      'founder_recommendations',
      'user_journey',
    ].includes(key)
  ) {
    return renderGroupedLists(value);
  }
  return <BlueprintValue value={value} />;
}

const BLUEPRINT_SECTION_DESCRIPTIONS: Record<string, string> = {
  executive_summary: 'The shortest business read of the blueprint.',
  problem_definition:
    'The customer problem and why current options fall short.',
  target_users: 'Primary and secondary users with their pains and goals.',
  product_strategy: 'Positioning, value proposition, and success metrics.',
  mvp_definition: 'What should be built now, later, and deliberately left out.',
  user_journey: 'How users enter, use, and return to the product.',
  technical_architecture: 'Stack, components, API modules, and data model.',
  security_and_compliance: 'Security, privacy, and compliance requirements.',
  development_roadmap: 'A practical phased build plan.',
  team_requirements: 'Recommended roles and minimum team composition.',
  cost_estimation: 'MVP budget, monthly costs, and major cost drivers.',
  business_model: 'Revenue streams and pricing direction.',
  go_to_market: 'Launch channels, acquisition, and early growth moves.',
  risk_analysis: 'Business, technical, and market risks with mitigations.',
  founder_recommendations:
    'Actions before building, during development, and before launch.',
  final_verdict: 'Build decision and confidence signal.',
};

function getBlueprintFieldValue(
  blueprint: any,
  sectionId: string,
  fieldKey: string,
): string {
  if (!blueprint) return '';
  const section = blueprint[sectionId];
  if (section === null || section === undefined) return '';

  if (fieldKey === sectionId) {
    if (typeof section === 'string') return section;
    return formatBlueprintSectionToMarkdown(section);
  }

  if (typeof section === 'string') {
    return '';
  }

  const val = section[fieldKey];
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;

  if (typeof val === 'object') {
    if (fieldKey === 'recommended_stack') {
      return Object.entries(val)
        .map(
          ([k, v]) =>
            `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${Array.isArray(v) ? v.join(', ') : String(v)}`,
        )
        .join('\n');
    }
    if (fieldKey === 'mvp_budget' || fieldKey === 'monthly_operational_cost') {
      return Object.entries(val)
        .map(
          ([k, v]) =>
            `${k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${String(v)}`,
        )
        .join('\n');
    }
    if (Array.isArray(val)) {
      return val
        .map((item) => {
          if (typeof item === 'string') return `- ${item}`;
          if (typeof item === 'object' && item !== null) {
            const title =
              item.feature ||
              item.name ||
              item.role ||
              item.title ||
              item.model ||
              '';
            const desc =
              item.purpose || item.description || item.fields?.join(', ') || '';
            const priority = item.priority ? ` (${item.priority})` : '';
            return `- **${title}**${priority}: ${desc}`;
          }
          return `- ${String(item)}`;
        })
        .join('\n');
    }
    return formatObjectToString(val);
  }

  return String(val);
}

function BlueprintReviewSection({
  blueprint,
  region,
  onUpdateField,
  onRefineField,
  isRefining,
  suggestingId,
  onConfirmFinal,
  setSuggestingId,
  setIsRefiningBlueprintSection,
  sessionData,
  activeTab,
  setActiveTab,
  onSectionChange,
}: {
  blueprint: BlueprintResult;
  region: string;
  onUpdateField: (sectionId: string, fieldKey: string, newValue: any) => void;
  onRefineField: (
    sectionId: string,
    fieldKey: string,
    prompt: string,
  ) => Promise<void>;
  isRefining: boolean;
  suggestingId: string | null;
  onConfirmFinal: () => void;
  setSuggestingId: (id: string | null) => void;
  setIsRefiningBlueprintSection: (val: boolean) => void;
  sessionData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSectionChange?: (section: ActiveReportSection) => void;
}) {
  const [refineTarget, setRefineTarget] = useState<{
    sectionId: string;
    fieldKey: string;
    label: string;
  } | null>(null);
  const [refinePromptText, setRefinePromptText] = useState('');

  const cardCls =
    'rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all duration-200';
  const labelCls = 'text-xs font-semibold text-muted-foreground tracking-wide';
  const inputCls =
    'w-full rounded-xl bg-background/60 border border-border/40 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40';
  const textareaCls = `${inputCls} resize-none leading-relaxed`;
  const sectionTitleCls = 'text-sm font-bold text-foreground tracking-tight';

  const getAutoRows = (text: string, min = 2, max = 50) => {
    if (!text) return min;
    const lines = text.split('\n').length;
    const chars = Math.ceil(text.length / 70);
    return Math.max(min, Math.min(max, Math.max(lines, chars)));
  };

  const baseTabs = [
    {
      id: 'executive_summary',
      title: 'Executive Summary',
      description: 'The shortest business read of the blueprint.',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 'target_users',
      title: 'Target Users',
      description: 'Primary and secondary users with their pains and goals.',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'mvp_definition',
      title: 'MVP Definition',
      description:
        'What should be built now, later, and deliberately left out.',
      icon: <Layout className="h-4 w-4" />,
    },
    {
      id: 'technical_architecture',
      title: 'Technical Architecture',
      description: 'Stack, components, API modules, and data model.',
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      id: 'development_roadmap',
      title: 'Development Roadmap',
      description: 'A practical phased build plan.',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      id: 'team_requirements',
      title: 'Team Requirements',
      description: 'Roles, skills, and effort required to execute the plan.',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'business_model',
      title: 'Business Model',
      description: 'Pricing strategy and revenue streams.',
      icon: <Coins className="h-4 w-4" />,
    },
    {
      id: 'go_to_market',
      title: 'Go-To-Market',
      description: 'Acquisition channels and launch plan.',
      icon: <Globe className="h-4 w-4" />,
    },
  ];

  const existingTabIds = baseTabs.map((t) => t.id);
  const TABS = [...baseTabs];
  Object.keys(blueprint).forEach((key) => {
    if (
      key !== 'step' &&
      key !== 'final_verdict' &&
      key !== 'cost_estimation' &&
      !existingTabIds.includes(key) &&
      blueprint[key] !== undefined &&
      blueprint[key] !== null
    ) {
      TABS.push({
        id: key,
        title: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: 'Details for this section.',
        icon: <FileText className="h-4 w-4" />,
      });
    }
  });

  const sectionHasContent = (id: string): boolean => {
    const val = blueprint[id];
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return true;
  };

  const renderRefinePanel = (sectionId: string, fieldKey: string) => {
    const isTarget =
      refineTarget?.sectionId === sectionId &&
      refineTarget?.fieldKey === fieldKey;
    if (!isTarget) return null;

    return (
      <div className="space-y-2 bg-card border border-border/40 rounded-lg p-2.5 mt-2 transition-all animate-in slide-in-from-top-1 duration-200">
        <textarea
          value={refinePromptText}
          onChange={(e) => {
            setRefinePromptText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          ref={(el) => {
            if (el) {
              el.style.height = 'auto';
              el.style.height = `${el.scrollHeight}px`;
            }
          }}
          placeholder="Refine text (e.g., 'make it B2B model', 'add competitor X')"
          rows={1}
          className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/45 outline-none px-2 resize-none min-h-[32px] leading-relaxed overflow-hidden"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (refinePromptText.trim()) {
                setIsRefiningBlueprintSection(true);
                setSuggestingId(`${sectionId}_${fieldKey}`);
                onRefineField(sectionId, fieldKey, refinePromptText)
                  .then(() => {
                    toast.success('Field refined successfully!');
                    setRefineTarget(null);
                    setRefinePromptText('');
                  })
                  .catch(() => toast.error('Refinement failed'))
                  .finally(() => {
                    setIsRefiningBlueprintSection(false);
                    setSuggestingId(null);
                  });
              }
            }
          }}
        />
        <div className="flex justify-end border-t border-border/20 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-3 text-xs text-primary bg-primary/5 hover:bg-primary/10 gap-1"
            onClick={() => {
              if (refinePromptText.trim()) {
                setIsRefiningBlueprintSection(true);
                setSuggestingId(`${sectionId}_${fieldKey}`);
                onRefineField(sectionId, fieldKey, refinePromptText)
                  .then(() => {
                    toast.success('Field refined successfully!');
                    setRefineTarget(null);
                    setRefinePromptText('');
                  })
                  .catch(() => toast.error('Refinement failed'))
                  .finally(() => {
                    setIsRefiningBlueprintSection(false);
                    setSuggestingId(null);
                  });
              }
            }}
            disabled={isRefining || !refinePromptText.trim()}
          >
            {isRefining && suggestingId === `${sectionId}_${fieldKey}` ? (
              <>
                <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                Refining...
              </>
            ) : (
              <>Refine</>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderRefineBtn = (
    sectionId: string,
    fieldKey: string,
    label: string,
  ) => {
    const isOpen =
      refineTarget?.sectionId === sectionId &&
      refineTarget?.fieldKey === fieldKey;
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
          isOpen
            ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20'
            : 'bg-primary/5 text-primary hover:bg-primary/10'
        }`}
        onClick={() => {
          if (isOpen) {
            setRefineTarget(null);
            setRefinePromptText('');
          } else {
            setRefineTarget({ sectionId, fieldKey, label });
            setRefinePromptText('');
          }
        }}
      >
        <Sparkles className="h-3 w-3" />
        {isOpen ? 'Close Refine' : 'Refine'}
      </Button>
    );
  };

  const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
      title="Remove"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );

  const AddBtn = ({
    onClick,
    label,
  }: {
    onClick: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/40 bg-transparent hover:bg-primary/[0.03] py-4 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );

  const SectionHeader = ({
    title,
    count,
  }: {
    title: string;
    count?: number;
  }) => (
    <div className="flex items-center gap-3 pb-2 mb-1">
      <h3 className={sectionTitleCls}>{title}</h3>
      {count !== undefined && (
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
    </div>
  );

  const NumberBadge = ({ num }: { num: number }) => (
    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
      {num}
    </div>
  );

  const isScoreField = (key: string): boolean => {
    return /score|rating|confidence|viability/i.test(key);
  };

  const renderExecutiveSummaryReview = () => {
    const summary = asRecord(blueprint.executive_summary);
    const fields: Array<{ key: string; label: string; refine: boolean }> = [
      {
        key: 'one_line_description',
        label: 'One-Line Description',
        refine: true,
      },
      { key: 'business_goal', label: 'Business Goal', refine: true },
      { key: 'target_market', label: 'Target Market', refine: true },
      {
        key: 'recommended_launch_strategy',
        label: 'Recommended Launch Strategy',
        refine: true,
      },
    ];

    return (
      <div className="space-y-5">
        <div className={cardCls}>
          <label className={labelCls}>Idea Name</label>
          <input
            value={String(summary.idea_name ?? '')}
            onChange={(e) =>
              onUpdateField('executive_summary', 'idea_name', e.target.value)
            }
            className={`${inputCls} mt-2 text-lg font-semibold`}
            placeholder="Your project name..."
          />
        </div>

        {fields.map(({ key, label, refine }) => {
          const val = String(summary[key] ?? '');
          return (
            <div key={key} className={cardCls}>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>{label}</label>
                {refine &&
                  val.trim() &&
                  renderRefineBtn('executive_summary', key, label)}
              </div>
              <textarea
                value={val}
                onChange={(e) =>
                  onUpdateField('executive_summary', key, e.target.value)
                }
                rows={getAutoRows(val)}
                className={textareaCls}
              />
              {renderRefinePanel('executive_summary', key)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderTargetUsersReview = () => {
    const users = asRecord(blueprint.target_users);
    const primary = asRecordList(users.primary_users);
    const secondary = asRecordList(users.secondary_users);

    const updatePersona = (
      field: 'primary_users' | 'secondary_users',
      idx: number,
      key: string,
      val: string,
    ) => {
      const list = asRecordList(users[field]);
      const updated = list.map((item, i) =>
        i === idx ? { ...item, [key]: val } : item,
      );
      onUpdateField('target_users', field, updated);
    };

    const addPersona = (field: 'primary_users' | 'secondary_users') => {
      const list = asRecordList(users[field]);
      onUpdateField('target_users', field, [
        ...list,
        { persona: 'New Persona', description: '', pain_points: '', goals: '' },
      ]);
    };

    const removePersona = (
      field: 'primary_users' | 'secondary_users',
      idx: number,
    ) => {
      const list = asRecordList(users[field]);
      onUpdateField(
        'target_users',
        field,
        list.filter((_, i) => i !== idx),
      );
    };

    const renderPersonaList = (
      field: 'primary_users' | 'secondary_users',
      label: string,
    ) => {
      const list = asRecordList(users[field]);
      return (
        <div className="space-y-4">
          <SectionHeader title={label} count={list.length} />
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No personas defined yet.
            </p>
          ) : (
            <div className="space-y-4">
              {list.map((item, idx) => {
                const persona = String(item.persona ?? '');
                const desc = String(item.description ?? '');
                const painPoints = String(item.pain_points ?? '');
                const goals = String(item.goals ?? '');

                return (
                  <div key={idx} className={`${cardCls} relative`}>
                    <div className="absolute top-4 right-4">
                      <DeleteBtn onClick={() => removePersona(field, idx)} />
                    </div>
                    <div className="space-y-3 pr-8">
                      <div>
                        <label className={labelCls}>Persona Name</label>
                        <input
                          value={persona}
                          onChange={(e) =>
                            updatePersona(field, idx, 'persona', e.target.value)
                          }
                          className={`${inputCls} mt-1 font-semibold`}
                          placeholder="e.g. Busy Office Managers"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className={labelCls}>Description</label>
                          {desc.trim() &&
                            renderRefineBtn(
                              'target_users',
                              `${field}__${idx}__description`,
                              `${persona} Description`,
                            )}
                        </div>
                        <textarea
                          value={desc}
                          onChange={(e) =>
                            updatePersona(
                              field,
                              idx,
                              'description',
                              e.target.value,
                            )
                          }
                          rows={getAutoRows(desc)}
                          className={`${textareaCls} mt-1`}
                          placeholder="Describe the target user..."
                        />
                        {renderRefinePanel(
                          'target_users',
                          `${field}__${idx}__description`,
                        )}
                      </div>
                      {field === 'primary_users' && (
                        <div className="grid gap-3 grid-cols-1">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className={labelCls}>Pain Points</label>
                              {painPoints.trim() &&
                                renderRefineBtn(
                                  'target_users',
                                  `${field}__${idx}__pain_points`,
                                  `${persona} Pain Points`,
                                )}
                            </div>
                            <textarea
                              value={painPoints}
                              onChange={(e) =>
                                updatePersona(
                                  field,
                                  idx,
                                  'pain_points',
                                  e.target.value,
                                )
                              }
                              rows={getAutoRows(painPoints)}
                              className={textareaCls}
                              placeholder="Pain points..."
                            />
                            {renderRefinePanel(
                              'target_users',
                              `${field}__${idx}__pain_points`,
                            )}
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className={labelCls}>
                                Goals / Motivations
                              </label>
                              {goals.trim() &&
                                renderRefineBtn(
                                  'target_users',
                                  `${field}__${idx}__goals`,
                                  `${persona} Goals`,
                                )}
                            </div>
                            <textarea
                              value={goals}
                              onChange={(e) =>
                                updatePersona(
                                  field,
                                  idx,
                                  'goals',
                                  e.target.value,
                                )
                              }
                              rows={getAutoRows(goals)}
                              className={textareaCls}
                              placeholder="Goals..."
                            />
                            {renderRefinePanel(
                              'target_users',
                              `${field}__${idx}__goals`,
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <AddBtn
            onClick={() => addPersona(field)}
            label={`Add ${field === 'primary_users' ? 'Primary' : 'Secondary'} Persona`}
          />
        </div>
      );
    };

    return (
      <div className="space-y-10">
        {renderPersonaList('primary_users', 'Primary Target Users')}
        {renderPersonaList('secondary_users', 'Secondary Target Users')}
      </div>
    );
  };

  const renderMvpDefinitionReview = () => {
    const mvp = asRecord(blueprint.mvp_definition);
    const excludedKey = mvp.excluded_from_mvp
      ? 'excluded_from_mvp'
      : mvp.excluded
        ? 'excluded'
        : mvp.out_of_scope
          ? 'out_of_scope'
          : 'excluded_from_mvp';
    const excluded = asStringList(mvp[excludedKey]);

    const updateFeature = (
      field: string,
      idx: number,
      key: string,
      val: string,
    ) => {
      const list = asRecordList(mvp[field]);
      const updated = list.map((item, i) =>
        i === idx ? { ...item, [key]: val } : item,
      );
      onUpdateField('mvp_definition', field, updated);
    };

    const removeFeature = (field: string, idx: number) => {
      const list = asRecordList(mvp[field]);
      onUpdateField(
        'mvp_definition',
        field,
        list.filter((_, i) => i !== idx),
      );
    };

    const renderFeatureList = (field: string, label: string) => {
      const rawList = mvp[field];
      if (
        Array.isArray(rawList) &&
        rawList.every((x) => typeof x === 'string')
      ) {
        return (
          <div className="space-y-4">
            <SectionHeader title={label} count={rawList.length} />
            {rawList.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 italic pl-1">
                No features defined yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {rawList.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                    <textarea
                      value={String(str)}
                      onChange={(e) => {
                        const updated = [...rawList];
                        updated[idx] = e.target.value;
                        onUpdateField('mvp_definition', field, updated);
                      }}
                      rows={getAutoRows(String(str))}
                      className={`${textareaCls} flex-1`}
                      placeholder="Feature description..."
                    />
                    <DeleteBtn
                      onClick={() => {
                        onUpdateField(
                          'mvp_definition',
                          field,
                          rawList.filter((_, i) => i !== idx),
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <AddBtn
              onClick={() =>
                onUpdateField('mvp_definition', field, [
                  ...(rawList || []),
                  'New Feature',
                ])
              }
              label="Add Feature"
            />
          </div>
        );
      }

      const list = asRecordList(rawList);
      return (
        <div className="space-y-4">
          <SectionHeader title={label} count={list.length} />
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No features defined yet.
            </p>
          ) : (
            <div className="space-y-3">
              {list.map((item, idx) => {
                const featureVal = String(
                  item.feature || item.name || item.title || '',
                );
                const purposeVal = String(
                  item.purpose ||
                    item.description ||
                    item.feature_description ||
                    item.rationale ||
                    item.benefit ||
                    item.details ||
                    item.value ||
                    Object.entries(item).find(
                      ([k, v]) =>
                        k !== 'feature' &&
                        k !== 'name' &&
                        k !== 'title' &&
                        typeof v === 'string',
                    )?.[1] ||
                    '',
                );

                const descKey =
                  item.purpose !== undefined
                    ? 'purpose'
                    : item.description !== undefined
                      ? 'description'
                      : item.feature_description !== undefined
                        ? 'feature_description'
                        : item.rationale !== undefined
                          ? 'rationale'
                          : item.benefit !== undefined
                            ? 'benefit'
                            : item.details !== undefined
                              ? 'details'
                              : 'purpose';

                return (
                  <div key={idx} className={`${cardCls} relative group`}>
                    <div className="flex items-start gap-3.5">
                      <NumberBadge num={idx + 1} />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={featureVal}
                            onChange={(e) =>
                              updateFeature(
                                field,
                                idx,
                                item.feature !== undefined
                                  ? 'feature'
                                  : item.name !== undefined
                                    ? 'name'
                                    : 'title',
                                e.target.value,
                              )
                            }
                            className={`${inputCls} font-semibold text-sm`}
                            placeholder="Feature name..."
                          />
                          <DeleteBtn
                            onClick={() => removeFeature(field, idx)}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className={`${labelCls} text-[11px]`}>
                              Description
                            </label>
                            {purposeVal.trim() &&
                              renderRefineBtn(
                                'mvp_definition',
                                `${field}__${idx}__${descKey}`,
                                `${featureVal} Description`,
                              )}
                          </div>
                          <textarea
                            value={purposeVal}
                            onChange={(e) =>
                              updateFeature(field, idx, descKey, e.target.value)
                            }
                            rows={getAutoRows(purposeVal)}
                            className={textareaCls}
                            placeholder="What does this feature do..."
                          />
                          {renderRefinePanel(
                            'mvp_definition',
                            `${field}__${idx}__${descKey}`,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <AddBtn
            onClick={() =>
              onUpdateField('mvp_definition', field, [
                ...list,
                {
                  feature: 'New Feature',
                  purpose: 'Describe what this feature does...',
                },
              ])
            }
            label={`Add Feature`}
          />
        </div>
      );
    };

    const updateExcludedString = (idx: number, val: string) => {
      const list = [...excluded];
      list[idx] = val;
      onUpdateField('mvp_definition', excludedKey, list);
    };
    const addExcludedString = () =>
      onUpdateField('mvp_definition', excludedKey, [...excluded, '']);
    const removeExcludedString = (idx: number) =>
      onUpdateField(
        'mvp_definition',
        excludedKey,
        excluded.filter((_, i) => i !== idx),
      );

    return (
      <div className="space-y-10">
        {renderFeatureList(
          'must_have_features',
          'Must-Have Features (Core V1)',
        )}
        {renderFeatureList('should_have_features', 'Should-Have Features (V2)')}
        {renderFeatureList('future_features', 'Future Iterations (V2+)')}

        <div className="space-y-4">
          <SectionHeader
            title="Deliberately Excluded"
            count={excluded.length}
          />
          <div className="space-y-2.5">
            {excluded.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                <textarea
                  value={item}
                  onChange={(e) => updateExcludedString(idx, e.target.value)}
                  rows={getAutoRows(item)}
                  className={`${textareaCls} flex-1`}
                  placeholder="Feature excluded from MVP..."
                />
                <DeleteBtn onClick={() => removeExcludedString(idx)} />
              </div>
            ))}
          </div>
          <AddBtn onClick={addExcludedString} label="Add Excluded Feature" />
        </div>
      </div>
    );
  };

  const renderTechnicalArchitectureReview = () => {
    const arch = asRecord(blueprint.technical_architecture);
    const stack = asRecord(arch.recommended_stack);

    // Key API modules: can be array of strings or array of records
    const apis = asRecordList(
      arch.api_modules || arch.key_api_modules || arch.apis,
    );
    const apiIsObjectList =
      apis.length > 0 && apis.some((item) => Object.keys(item).length > 0);
    const apiStringList = asStringList(
      arch.api_modules || arch.key_api_modules || arch.apis,
    );

    // Database entities: can be array of strings or array of records
    const dbEntities = asRecordList(
      arch.database_entities || arch.data_models || arch.core_data_models,
    );
    const dbIsObjectList =
      dbEntities.length > 0 &&
      dbEntities.some((item) => Object.keys(item).length > 0);
    const dbStringList = asStringList(
      arch.database_entities || arch.data_models || arch.core_data_models,
    );

    // System components
    const sysComponents = asRecordList(
      arch.system_components || arch.components || arch.key_components,
    );

    const updateStackKey = (key: string, val: string) => {
      onUpdateField('technical_architecture', 'recommended_stack', {
        ...stack,
        [key]: val,
      });
    };

    const apiFieldName = arch.api_modules
      ? 'api_modules'
      : arch.key_api_modules
        ? 'key_api_modules'
        : 'apis';
    const updateApiObject = (idx: number, key: string, val: string) => {
      const updated = apis.map((item, i) =>
        i === idx ? { ...item, [key]: val } : item,
      );
      onUpdateField('technical_architecture', apiFieldName, updated);
    };
    const updateApiString = (idx: number, val: string) => {
      const updated = [...apiStringList];
      updated[idx] = val;
      onUpdateField('technical_architecture', apiFieldName, updated);
    };

    const dbFieldName = arch.database_entities
      ? 'database_entities'
      : arch.data_models
        ? 'data_models'
        : 'core_data_models';
    const updateDbObject = (idx: number, key: string, val: any) => {
      const updated = dbEntities.map((item, i) =>
        i === idx ? { ...item, [key]: val } : item,
      );
      onUpdateField('technical_architecture', dbFieldName, updated);
    };
    const updateDbString = (idx: number, val: string) => {
      const updated = [...dbStringList];
      updated[idx] = val;
      onUpdateField('technical_architecture', dbFieldName, updated);
    };

    const sysComponentsFieldName = arch.system_components
      ? 'system_components'
      : arch.components
        ? 'components'
        : 'key_components';
    const updateSysComponent = (idx: number, key: string, val: string) => {
      const updated = sysComponents.map((item, i) =>
        i === idx ? { ...item, [key]: val } : item,
      );
      onUpdateField('technical_architecture', sysComponentsFieldName, updated);
    };

    const stackIconMap: Record<string, ReactNode> = {
      frontend: <Layout className="h-3.5 w-3.5" />,
      backend: <Server className="h-3.5 w-3.5" />,
      database: <Database className="h-3.5 w-3.5" />,
      hosting: <Globe className="h-3.5 w-3.5" />,
      ai_ml: <Cpu className="h-3.5 w-3.5" />,
      authentication: <ShieldCheck className="h-3.5 w-3.5" />,
    };

    return (
      <div className="space-y-10">
        {/* Recommended Stack */}
        <div className="space-y-4">
          <SectionHeader
            title="Recommended Stack"
            count={Object.keys(stack).length}
          />
          <div className="flex flex-col gap-3">
            {Object.keys(stack).map((key) => {
              const icon = stackIconMap[key] || (
                <Code2 className="h-3.5 w-3.5" />
              );
              const val = Array.isArray(stack[key])
                ? (stack[key] as string[]).join(', ')
                : String(stack[key] ?? '');
              return (
                <div key={key} className={cardCls}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        {icon}
                      </div>
                      <label className={`${labelCls} capitalize`}>
                        {key.replace(/_/g, ' ')}
                      </label>
                    </div>
                    {val.trim() &&
                      renderRefineBtn(
                        'technical_architecture',
                        `recommended_stack__${key}`,
                        key.replace(/_/g, ' ').toUpperCase(),
                      )}
                  </div>
                  <textarea
                    value={val}
                    onChange={(e) => updateStackKey(key, e.target.value)}
                    rows={getAutoRows(val)}
                    className={textareaCls}
                    placeholder={`${key.replace(/_/g, ' ')} technology...`}
                  />
                  {renderRefinePanel(
                    'technical_architecture',
                    `recommended_stack__${key}`,
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* System Components */}
        <div className="space-y-4">
          <SectionHeader
            title="System Components"
            count={sysComponents.length}
          />
          {sysComponents.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No system components defined. Add one below.
            </p>
          ) : (
            <div className="space-y-3">
              {sysComponents.map((item, idx) => {
                const compName = String(
                  item.component || item.name || item.title || '',
                );
                const compPurpose = String(
                  item.purpose || item.description || '',
                );
                const nameKey =
                  item.component !== undefined
                    ? 'component'
                    : item.name !== undefined
                      ? 'name'
                      : 'title';
                const purposeKey =
                  item.purpose !== undefined ? 'purpose' : 'description';

                return (
                  <div key={idx} className={`${cardCls} relative`}>
                    <div className="flex items-start gap-3.5">
                      <NumberBadge num={idx + 1} />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={compName}
                            onChange={(e) =>
                              updateSysComponent(idx, nameKey, e.target.value)
                            }
                            className={`${inputCls} font-semibold`}
                            placeholder="Component name..."
                          />
                          <DeleteBtn
                            onClick={() =>
                              onUpdateField(
                                'technical_architecture',
                                sysComponentsFieldName,
                                sysComponents.filter((_, i) => i !== idx),
                              )
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={labelCls}>
                              Purpose / Description
                            </label>
                            {compPurpose.trim() &&
                              renderRefineBtn(
                                'technical_architecture',
                                `${sysComponentsFieldName}__${idx}__${purposeKey}`,
                                `${compName} Description`,
                              )}
                          </div>
                          <textarea
                            value={compPurpose}
                            onChange={(e) =>
                              updateSysComponent(
                                idx,
                                purposeKey,
                                e.target.value,
                              )
                            }
                            rows={getAutoRows(compPurpose)}
                            className={textareaCls}
                            placeholder="Describe component functionality..."
                          />
                          {renderRefinePanel(
                            'technical_architecture',
                            `${sysComponentsFieldName}__${idx}__${purposeKey}`,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <AddBtn
            onClick={() =>
              onUpdateField('technical_architecture', sysComponentsFieldName, [
                ...sysComponents,
                { component: 'New Component', purpose: '' },
              ])
            }
            label="Add System Component"
          />
        </div>

        {/* API Modules */}
        <div className="space-y-4">
          <SectionHeader
            title="Key API Modules"
            count={apiIsObjectList ? apis.length : apiStringList.length}
          />
          {(!apiIsObjectList && apiStringList.length === 0) ||
          (apiIsObjectList && apis.length === 0) ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No API modules defined. Add one below.
            </p>
          ) : apiIsObjectList ? (
            <div className="space-y-3">
              {apis.map((item, idx) => {
                const modName = String(
                  item.module || item.name || item.title || '',
                );
                const modPurpose = String(
                  item.purpose || item.description || item.function || '',
                );
                const purposeKey =
                  item.purpose !== undefined
                    ? 'purpose'
                    : item.description !== undefined
                      ? 'description'
                      : 'function';
                const nameKey =
                  item.module !== undefined
                    ? 'module'
                    : item.name !== undefined
                      ? 'name'
                      : 'title';

                return (
                  <div key={idx} className={`${cardCls} relative`}>
                    <div className="flex items-start gap-3.5">
                      <NumberBadge num={idx + 1} />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={modName}
                            onChange={(e) =>
                              updateApiObject(idx, nameKey, e.target.value)
                            }
                            className={`${inputCls} font-semibold`}
                            placeholder="Module name..."
                          />
                          <DeleteBtn
                            onClick={() =>
                              onUpdateField(
                                'technical_architecture',
                                apiFieldName,
                                apis.filter((_, i) => i !== idx),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className={`${labelCls} mb-1 block`}>
                            Purpose
                          </label>
                          <textarea
                            value={modPurpose}
                            onChange={(e) =>
                              updateApiObject(idx, purposeKey, e.target.value)
                            }
                            rows={getAutoRows(modPurpose)}
                            className={textareaCls}
                            placeholder="Describe API capabilities..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {apiStringList.map((apiStr, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                  <textarea
                    value={apiStr}
                    onChange={(e) => updateApiString(idx, e.target.value)}
                    rows={getAutoRows(apiStr)}
                    className={`${textareaCls} flex-1`}
                    placeholder="e.g. Auth Module: handles logins..."
                  />
                  <DeleteBtn
                    onClick={() =>
                      onUpdateField(
                        'technical_architecture',
                        apiFieldName,
                        apiStringList.filter((_, i) => i !== idx),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
          <AddBtn
            onClick={() => {
              if (apiIsObjectList) {
                onUpdateField('technical_architecture', apiFieldName, [
                  ...apis,
                  { module: 'New API Module', purpose: '' },
                ]);
              } else {
                onUpdateField('technical_architecture', apiFieldName, [
                  ...apiStringList,
                  'New API Module: details...',
                ]);
              }
            }}
            label="Add API Module"
          />
        </div>

        {/* Database Entities */}
        <div className="space-y-4">
          <SectionHeader
            title="Core Data Models"
            count={dbIsObjectList ? dbEntities.length : dbStringList.length}
          />
          {(!dbIsObjectList && dbStringList.length === 0) ||
          (dbIsObjectList && dbEntities.length === 0) ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No data models defined. Add one below.
            </p>
          ) : dbIsObjectList ? (
            <div className="space-y-3">
              {dbEntities.map((item, idx) => {
                const modelName = String(
                  item.model || item.name || item.entity || '',
                );
                const modelDesc = String(
                  item.description || item.purpose || '',
                );
                const descKey =
                  item.description !== undefined ? 'description' : 'purpose';
                const nameKey =
                  item.model !== undefined
                    ? 'model'
                    : item.name !== undefined
                      ? 'name'
                      : 'entity';

                return (
                  <div key={idx} className={`${cardCls} relative`}>
                    <div className="flex items-start gap-3.5">
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/10 text-violet-500 shrink-0 mt-0.5">
                        <Database className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={modelName}
                            onChange={(e) =>
                              updateDbObject(idx, nameKey, e.target.value)
                            }
                            className={`${inputCls} font-semibold`}
                            placeholder="Model name..."
                          />
                          <DeleteBtn
                            onClick={() =>
                              onUpdateField(
                                'technical_architecture',
                                dbFieldName,
                                dbEntities.filter((_, i) => i !== idx),
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className={labelCls}>
                              Fields (comma-separated)
                            </label>
                            <input
                              value={
                                Array.isArray(item.fields)
                                  ? item.fields.join(', ')
                                  : String(item.fields ?? '')
                              }
                              onChange={(e) =>
                                updateDbObject(
                                  idx,
                                  'fields',
                                  e.target.value
                                    .split(',')
                                    .map((s: string) => s.trim()),
                                )
                              }
                              className={inputCls}
                              placeholder="id, email..."
                            />
                          </div>
                          <div>
                            <label className={`${labelCls} mb-1 block`}>
                              Description
                            </label>
                            <textarea
                              value={modelDesc}
                              onChange={(e) =>
                                updateDbObject(idx, descKey, e.target.value)
                              }
                              rows={getAutoRows(modelDesc)}
                              className={textareaCls}
                              placeholder="Model description..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {dbStringList.map((dbStr, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-violet-400/30 shrink-0" />
                  <textarea
                    value={dbStr}
                    onChange={(e) => updateDbString(idx, e.target.value)}
                    rows={getAutoRows(dbStr)}
                    className={`${textareaCls} flex-1`}
                    placeholder="e.g. Users: stores accounts..."
                  />
                  <DeleteBtn
                    onClick={() =>
                      onUpdateField(
                        'technical_architecture',
                        dbFieldName,
                        dbStringList.filter((_, i) => i !== idx),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
          <AddBtn
            onClick={() => {
              if (dbIsObjectList) {
                onUpdateField('technical_architecture', dbFieldName, [
                  ...dbEntities,
                  { model: 'NewModel', fields: [], description: '' },
                ]);
              } else {
                onUpdateField('technical_architecture', dbFieldName, [
                  ...dbStringList,
                  'NewModel: details...',
                ]);
              }
            }}
            label="Add Data Model"
          />
        </div>
      </div>
    );
  };

  const getRoadmapPhases = (): Array<Record<string, any>> => {
    const rawRoadmap = blueprint.development_roadmap;
    if (!rawRoadmap) return [];
    if (Array.isArray(rawRoadmap))
      return rawRoadmap.map((item) => asRecord(item));
    if (typeof rawRoadmap === 'object') {
      const candidate =
        (rawRoadmap as any).phases ||
        (rawRoadmap as any).steps ||
        (rawRoadmap as any).roadmap;
      if (Array.isArray(candidate))
        return candidate.map((item) => asRecord(item));
      return Object.entries(rawRoadmap).map(([key, val]) => {
        const rec = asRecord(val);
        if (!rec.phase_name && !rec.name && !rec.title)
          rec.phase_name = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
        return rec;
      });
    }
    return [];
  };

  const updateRoadmapPhases = (updated: Array<Record<string, any>>) => {
    const raw = blueprint.development_roadmap;
    if (Array.isArray(raw)) {
      onUpdateField('development_roadmap', 'development_roadmap', updated);
    } else if (raw && typeof raw === 'object') {
      if (Array.isArray((raw as any).phases))
        onUpdateField('development_roadmap', 'phases', updated);
      else if (Array.isArray((raw as any).steps))
        onUpdateField('development_roadmap', 'steps', updated);
      else {
        const rebuilt: Record<string, any> = {};
        updated.forEach((p, idx) => {
          const key = p.phase_name
            ? String(p.phase_name).toLowerCase().replace(/\s+/g, '_')
            : `phase_${idx + 1}`;
          rebuilt[key] = p;
        });
        onUpdateField('development_roadmap', 'development_roadmap', rebuilt);
      }
    } else {
      onUpdateField('development_roadmap', 'development_roadmap', updated);
    }
  };

  const renderDevelopmentRoadmapReview = () => {
    const rawRoadmap = blueprint.development_roadmap;

    if (typeof rawRoadmap === 'string') {
      return (
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Development Roadmap</label>
            {renderRefineBtn(
              'development_roadmap',
              'development_roadmap',
              'Development Roadmap',
            )}
          </div>
          <textarea
            value={rawRoadmap}
            onChange={(e) =>
              onUpdateField(
                'development_roadmap',
                'development_roadmap',
                e.target.value,
              )
            }
            rows={getAutoRows(rawRoadmap)}
            className={textareaCls}
          />
        </div>
      );
    }

    const parseDuration = (val: string) => {
      const trimmed = val.trim();
      const numMatch = trimmed.match(/^([\d\.\-]+)\s*([a-zA-Z]*)/);
      if (numMatch) {
        const num = numMatch[1];
        let unit = numMatch[2].toLowerCase();
        if (unit.startsWith('week')) unit = 'weeks';
        else if (unit.startsWith('month')) unit = 'months';
        else if (unit.startsWith('day')) unit = 'days';
        else unit = 'weeks';
        return { number: num, unit };
      }
      return { number: trimmed, unit: 'weeks' };
    };

    const cleanPhaseName = (rawName: string, index: number) => {
      return rawName.replace(/^Phase\s*\d+\s*[\-\:]?\s*/i, '');
    };

    const phases = getRoadmapPhases();

    const updatePhase = (idx: number, key: string, val: any) => {
      const updated = phases.map((item, i) => {
        if (i !== idx) return item;
        const copy = { ...item };
        if (key === 'phase_name') {
          copy.phase_name = val;
          copy.name = val;
          copy.title = val;
        } else if (key === 'duration') {
          copy.estimated_weeks = val;
          copy.duration = val;
          copy.weeks = val;
          copy.time = val;
        } else if (key === 'tasks') {
          copy.deliverables = val;
          copy.tasks = val;
          copy.milestones = val;
          copy.key_tasks = val;
        } else copy[key] = val;
        return copy;
      });
      updateRoadmapPhases(updated);
    };

    const addPhase = () =>
      updateRoadmapPhases([
        ...phases,
        {
          phase_name: `Phase ${phases.length + 1}`,
          duration: '4 weeks',
          tasks: [],
        },
      ]);
    const removePhase = (idx: number) =>
      updateRoadmapPhases(phases.filter((_, i) => i !== idx));

    return (
      <div className="space-y-5">
        <SectionHeader title="Development Phases" count={phases.length} />
        {phases.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 italic pl-1">
            No phases defined yet. Click below to add one.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent" />
            <div className="space-y-4">
              {phases.map((p, idx) => {
                const name = String(
                  p.phase_name || p.name || p.title || `Phase ${idx + 1}`,
                );
                const duration = String(
                  p.estimated_weeks ?? p.duration ?? p.weeks ?? p.time ?? '',
                );
                const tasksList = asStringList(
                  p.deliverables ?? p.tasks ?? p.milestones ?? p.key_tasks,
                );

                const parsed = parseDuration(duration);
                const handleNumberChange = (rawNum: string) => {
                  const cleanNum = rawNum.replace(/[^0-9.]/g, '');
                  if (!cleanNum) {
                    updatePhase(idx, 'duration', '');
                  } else {
                    updatePhase(idx, 'duration', `${cleanNum} ${parsed.unit}`);
                  }
                };
                const handleUnitChange = (unit: string) => {
                  if (!parsed.number) {
                    updatePhase(idx, 'duration', '');
                  } else {
                    updatePhase(idx, 'duration', `${parsed.number} ${unit}`);
                  }
                };

                return (
                  <div key={idx} className="relative pl-11">
                    <div className="absolute left-[11px] top-6 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background z-10" />
                    <div className={`${cardCls} relative`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 min-w-0 flex flex-col gap-3">
                          <div>
                            <label
                              className={`${labelCls} text-[11px] mb-1 block`}
                            >
                              Phase Name
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-muted-foreground/80 whitespace-nowrap bg-muted/40 px-2 py-1.5 rounded-lg select-none">
                                Phase {idx + 1}:
                              </span>
                              <textarea
                                value={cleanPhaseName(name, idx)}
                                onChange={(e) =>
                                  updatePhase(
                                    idx,
                                    'phase_name',
                                    `Phase ${idx + 1} - ${e.target.value}`,
                                  )
                                }
                                rows={getAutoRows(
                                  cleanPhaseName(name, idx),
                                  1,
                                  3,
                                )}
                                className={`${textareaCls} font-semibold flex-1 py-1.5 min-h-[38px]`}
                                placeholder="e.g. Discovery & template design..."
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              className={`${labelCls} text-[11px] mb-1 block`}
                            >
                              Duration
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                value={parsed.number}
                                onChange={(e) =>
                                  handleNumberChange(e.target.value)
                                }
                                className={`${inputCls} flex-1 min-w-[60px] text-center`}
                                placeholder="Num"
                              />
                              <select
                                value={parsed.unit}
                                onChange={(e) =>
                                  handleUnitChange(e.target.value)
                                }
                                className={`${inputCls} w-[100px] bg-background px-2 py-2.5`}
                              >
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="days">Days</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <DeleteBtn onClick={() => removePhase(idx)} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`${labelCls} text-[11px]`}>
                            Key Tasks & Deliverables
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              updatePhase(idx, 'tasks', [...tasksList, ''])
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            <Plus className="h-3 w-3" /> Add Task
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {tasksList.map((t, taskIdx) => (
                            <div
                              key={taskIdx}
                              className="flex items-start gap-2"
                            >
                              <div className="mt-3 h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                              <textarea
                                value={t}
                                onChange={(e) => {
                                  const updatedTasks = [...tasksList];
                                  updatedTasks[taskIdx] = e.target.value;
                                  updatePhase(idx, 'tasks', updatedTasks);
                                }}
                                rows={getAutoRows(t)}
                                className={`${inputCls} resize-none leading-relaxed flex-1 py-2`}
                                placeholder="Task description..."
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updatePhase(
                                    idx,
                                    'tasks',
                                    tasksList.filter((_, i) => i !== taskIdx),
                                  )
                                }
                                className="p-1 mt-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <AddBtn onClick={addPhase} label="Add Phase" />
      </div>
    );
  };

  const renderTeamRequirementsReview = () => {
    const team = asRecord(blueprint.team_requirements);
    const recommended = asRecordList(
      team.recommended_team || team.recommended || team.roles,
    );

    let rawMin =
      team.minimum_team ||
      team.minimum ||
      team.min_team ||
      team.viable_size ||
      team.minimum_viable_team ||
      team.core_team ||
      team.viable_team ||
      team.minimum_viable_team_size ||
      team.viable_team_size ||
      team.core_personnel ||
      team.key_personnel ||
      team.core_roles ||
      team.key_roles ||
      team.minimum_team_requirements ||
      team.essential_roles ||
      team.essential_team ||
      team.minimum_squad ||
      team.viable_squad ||
      // Root level fallback
      blueprint.minimum_team ||
      blueprint.minimum ||
      blueprint.min_team ||
      blueprint.viable_size ||
      blueprint.minimum_viable_team ||
      blueprint.core_team ||
      blueprint.viable_team ||
      blueprint.minimum_viable_team_size ||
      blueprint.viable_team_size ||
      blueprint.core_personnel ||
      blueprint.key_personnel ||
      blueprint.core_roles ||
      blueprint.key_roles ||
      blueprint.minimum_team_requirements ||
      blueprint.essential_roles ||
      blueprint.essential_team ||
      blueprint.minimum_squad ||
      blueprint.viable_squad;

    if (!rawMin) {
      const keys = Object.keys(team);
      const excludedKeys = [
        'recommended_team',
        'recommended',
        'roles',
        'recommended_roles',
      ];
      const candidateKey = keys.find(
        (k) =>
          !excludedKeys.includes(k) &&
          Array.isArray(team[k]) &&
          (k.includes('min') ||
            k.includes('viable') ||
            k.includes('core') ||
            k.includes('essential') ||
            k.includes('squad') ||
            k.includes('personnel')),
      );
      if (candidateKey) {
        rawMin = team[candidateKey];
      }
    }

    if (!rawMin) {
      const keys = Object.keys(blueprint);
      const excludedKeys = [
        'team_requirements',
        'recommended_team',
        'recommended',
        'roles',
        'recommended_roles',
      ];
      const candidateKey = keys.find(
        (k) =>
          !excludedKeys.includes(k) &&
          Array.isArray(blueprint[k]) &&
          (k.includes('min') ||
            k.includes('viable') ||
            k.includes('core') ||
            k.includes('essential') ||
            k.includes('squad') ||
            k.includes('personnel')),
      );
      if (candidateKey) {
        rawMin = blueprint[candidateKey];
      }
    }

    if (!rawMin) {
      const keys = Object.keys(team);
      const excludedKeys = [
        'recommended_team',
        'recommended',
        'roles',
        'recommended_roles',
      ];
      const anyOtherArrayKey = keys.find(
        (k) => !excludedKeys.includes(k) && Array.isArray(team[k]),
      );
      if (anyOtherArrayKey) {
        rawMin = team[anyOtherArrayKey];
      }
    }

    const parseRawMin = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) {
        return val
          .map((item) => {
            if (!item) return '';
            if (typeof item === 'string') return item;
            if (typeof item === 'object') {
              const obj = item as Record<string, unknown>;
              const title = String(
                obj.role ||
                  obj.role_title ||
                  obj.title ||
                  obj.name ||
                  obj.position ||
                  '',
              );
              const purpose = String(
                obj.purpose || obj.description || obj.responsibilities || '',
              );
              const countVal = obj.count ?? obj.quantity ?? obj.size;
              const countStr = countVal ? ` (Count: ${countVal})` : '';
              if (title && purpose) return `${title}${countStr} - ${purpose}`;
              if (title) return `${title}${countStr}`;
              if (purpose) return purpose;
            }
            return String(item);
          })
          .filter(Boolean);
      }
      if (typeof val === 'object') {
        return Object.entries(val).map(([k, v]) => `${k}: ${v}`);
      }
      return [String(val)];
    };

    const minimum = parseRawMin(rawMin);

    const getTeamFieldKey = () => {
      if (Array.isArray(team.recommended_team)) return 'recommended_team';
      if (Array.isArray(team.recommended)) return 'recommended';
      if (Array.isArray(team.roles)) return 'roles';
      return 'recommended_team';
    };

    const getMinFieldKey = () => {
      if (team.minimum_team !== undefined) return 'minimum_team';
      if (team.minimum !== undefined) return 'minimum';
      if (team.min_team !== undefined) return 'min_team';
      if (team.viable_size !== undefined) return 'viable_size';
      if (team.minimum_viable_team !== undefined) return 'minimum_viable_team';
      if (team.core_team !== undefined) return 'core_team';
      if (team.viable_team !== undefined) return 'viable_team';
      if (team.minimum_viable_team_size !== undefined)
        return 'minimum_viable_team_size';
      if (team.viable_team_size !== undefined) return 'viable_team_size';
      if (team.core_personnel !== undefined) return 'core_personnel';
      if (team.key_personnel !== undefined) return 'key_personnel';
      if (team.core_roles !== undefined) return 'core_roles';
      if (team.key_roles !== undefined) return 'key_roles';
      if (team.minimum_team_requirements !== undefined)
        return 'minimum_team_requirements';
      if (team.essential_roles !== undefined) return 'essential_roles';
      if (team.essential_team !== undefined) return 'essential_team';
      if (team.minimum_squad !== undefined) return 'minimum_squad';
      if (team.viable_squad !== undefined) return 'viable_squad';

      if (blueprint.minimum_team !== undefined) return 'minimum_team';
      if (blueprint.minimum !== undefined) return 'minimum';
      if (blueprint.min_team !== undefined) return 'min_team';
      if (blueprint.viable_size !== undefined) return 'viable_size';
      if (blueprint.minimum_viable_team !== undefined)
        return 'minimum_viable_team';
      if (blueprint.core_team !== undefined) return 'core_team';
      if (blueprint.viable_team !== undefined) return 'viable_team';
      if (blueprint.minimum_viable_team_size !== undefined)
        return 'minimum_viable_team_size';
      if (blueprint.viable_team_size !== undefined) return 'viable_team_size';
      if (blueprint.minimum_team_requirements !== undefined)
        return 'minimum_team_requirements';

      const keys = Object.keys(team);
      const excludedKeys = [
        'recommended_team',
        'recommended',
        'roles',
        'recommended_roles',
      ];
      const candidateKey = keys.find(
        (k) =>
          !excludedKeys.includes(k) &&
          Array.isArray(team[k]) &&
          (k.includes('min') ||
            k.includes('viable') ||
            k.includes('core') ||
            k.includes('essential') ||
            k.includes('squad') ||
            k.includes('personnel')),
      );
      if (candidateKey) return candidateKey;

      const anyOtherArrayKey = keys.find(
        (k) => !excludedKeys.includes(k) && Array.isArray(team[k]),
      );
      if (anyOtherArrayKey) return anyOtherArrayKey;

      return 'minimum_team';
    };

    const updateRole = (idx: number, key: string, val: string) => {
      const updated = recommended.map((item, i) => {
        if (i !== idx) return item;
        const copy = { ...item };
        if (key === 'role') {
          if (copy.role !== undefined) copy.role = val;
          if (copy.role_title !== undefined) copy.role_title = val;
          if (copy.title !== undefined) copy.title = val;
          if (copy.name !== undefined) copy.name = val;
          if (copy.position !== undefined) copy.position = val;
          if (
            copy.role === undefined &&
            copy.role_title === undefined &&
            copy.title === undefined &&
            copy.name === undefined &&
            copy.position === undefined
          )
            copy.role = val;
        } else if (key === 'purpose') {
          if (copy.purpose !== undefined) copy.purpose = val;
          if (copy.responsibilities !== undefined) copy.responsibilities = val;
          if (copy.description !== undefined) copy.description = val;
          if (
            copy.purpose === undefined &&
            copy.responsibilities === undefined &&
            copy.description === undefined
          )
            copy.purpose = val;
        } else {
          copy[key] = val;
        }
        return copy;
      });
      onUpdateField('team_requirements', getTeamFieldKey(), updated);
    };
    const addRole = () =>
      onUpdateField('team_requirements', getTeamFieldKey(), [
        ...recommended,
        { role: 'New Role', purpose: 'Role responsibilities...' },
      ]);
    const removeRole = (idx: number) =>
      onUpdateField(
        'team_requirements',
        getTeamFieldKey(),
        recommended.filter((_, i) => i !== idx),
      );

    const updateMinRole = (idx: number, val: string) => {
      const list = [...minimum];
      list[idx] = val;
      const minKey = getMinFieldKey();
      if (blueprint[minKey] !== undefined) {
        onUpdateField(minKey, minKey, list);
      } else {
        onUpdateField('team_requirements', minKey, list);
      }
    };
    const addMinRole = () => {
      const list = [...minimum, ''];
      const minKey = getMinFieldKey();
      if (blueprint[minKey] !== undefined) {
        onUpdateField(minKey, minKey, list);
      } else {
        onUpdateField('team_requirements', minKey, list);
      }
    };
    const removeMinRole = (idx: number) => {
      const list = minimum.filter((_, i) => i !== idx);
      const minKey = getMinFieldKey();
      if (blueprint[minKey] !== undefined) {
        onUpdateField(minKey, minKey, list);
      } else {
        onUpdateField('team_requirements', minKey, list);
      }
    };

    return (
      <div className="space-y-10">
        <div className="space-y-4">
          <SectionHeader
            title="Recommended Team Roles"
            count={recommended.length}
          />
          {recommended.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No recommended team roles. Click below to add one.
            </p>
          ) : (
            <div className="space-y-3">
              {recommended.map((item, idx) => {
                const roleName = String(
                  item.role ||
                    item.role_title ||
                    item.title ||
                    item.name ||
                    item.position ||
                    '',
                );
                const rolePurpose = String(
                  item.purpose ||
                    item.responsibilities ||
                    item.description ||
                    '',
                );
                const roleRefineFieldKey = `${getTeamFieldKey()}__${idx}__purpose`;

                return (
                  <div key={idx} className={`${cardCls} relative`}>
                    <div className="flex items-start gap-3.5">
                      <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={roleName}
                            onChange={(e) =>
                              updateRole(idx, 'role', e.target.value)
                            }
                            className={`${inputCls} font-semibold flex-1`}
                            placeholder="Role title..."
                          />
                          <DeleteBtn onClick={() => removeRole(idx)} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={`${labelCls} text-[11px]`}>
                              Responsibilities
                            </label>
                            {rolePurpose.trim() &&
                              renderRefineBtn(
                                'team_requirements',
                                roleRefineFieldKey,
                                `${roleName} Responsibilities`,
                              )}
                          </div>
                          <textarea
                            value={rolePurpose}
                            onChange={(e) =>
                              updateRole(idx, 'purpose', e.target.value)
                            }
                            rows={getAutoRows(rolePurpose)}
                            className={textareaCls}
                            placeholder="What this role is responsible for..."
                          />
                          {renderRefinePanel(
                            'team_requirements',
                            roleRefineFieldKey,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <AddBtn onClick={addRole} label="Add Role" />
        </div>
      </div>
    );
  };

  const renderCostEstimationReview = () => {
    const cost = asRecord(blueprint.cost_estimation);

    if (typeof blueprint.cost_estimation === 'string') {
      const val = String(blueprint.cost_estimation);
      return (
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Cost Estimation</label>
            {renderRefineBtn(
              'cost_estimation',
              'cost_estimation',
              'Cost Estimation',
            )}
          </div>
          <textarea
            value={val}
            onChange={(e) =>
              onUpdateField(
                'cost_estimation',
                'cost_estimation',
                e.target.value,
              )
            }
            rows={getAutoRows(val)}
            className={textareaCls}
          />
        </div>
      );
    }

    const budget = asRecord(
      cost.mvp_budget || cost.budget || cost.estimated_budget || cost.mvp_cost,
    );
    const monthly = asRecord(
      cost.monthly_operational_cost ||
        cost.monthly_cost ||
        cost.operational_costs ||
        cost.monthly_costs,
    );
    const drivers = asStringList(
      cost.major_cost_drivers || cost.cost_drivers || cost.key_cost_drivers,
    );

    const budgetFieldName = cost.mvp_budget
      ? 'mvp_budget'
      : cost.budget
        ? 'budget'
        : cost.estimated_budget
          ? 'estimated_budget'
          : 'mvp_cost';
    const updateBudget = (key: string, val: string) => {
      onUpdateField('cost_estimation', budgetFieldName, {
        ...budget,
        [key]: val,
      });
    };

    const monthlyFieldName = cost.monthly_operational_cost
      ? 'monthly_operational_cost'
      : cost.monthly_cost
        ? 'monthly_cost'
        : cost.operational_costs
          ? 'operational_costs'
          : 'monthly_costs';
    const updateMonthly = (key: string, val: string) => {
      onUpdateField('cost_estimation', monthlyFieldName, {
        ...monthly,
        [key]: val,
      });
    };

    const driverFieldName = cost.major_cost_drivers
      ? 'major_cost_drivers'
      : cost.cost_drivers
        ? 'cost_drivers'
        : 'key_cost_drivers';
    const updateDriver = (idx: number, val: string) => {
      const list = [...drivers];
      list[idx] = val;
      onUpdateField('cost_estimation', driverFieldName, list);
    };
    const addDriver = () =>
      onUpdateField('cost_estimation', driverFieldName, [...drivers, '']);
    const removeDriver = (idx: number) =>
      onUpdateField(
        'cost_estimation',
        driverFieldName,
        drivers.filter((_, i) => i !== idx),
      );

    const budgetFields: Array<{
      label: string;
      key: string;
      val: string;
      color: string;
      bg: string;
    }> = [];
    if (Object.keys(budget).length > 0) {
      Object.entries(budget).forEach(([k, v]) => {
        const isMin = /min|low|minimum/i.test(k);
        const isMax = /max|high|upper/i.test(k);
        budgetFields.push({
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          key: k,
          val: String(v ?? ''),
          color: isMin
            ? 'text-emerald-500'
            : isMax
              ? 'text-orange-500'
              : 'text-blue-500',
          bg: isMin
            ? 'bg-emerald-500/10'
            : isMax
              ? 'bg-orange-500/10'
              : 'bg-blue-500/10',
        });
      });
    }

    const monthlyFields: Array<{ label: string; key: string; val: string }> =
      [];
    if (Object.keys(monthly).length > 0) {
      Object.entries(monthly).forEach(([k, v]) => {
        monthlyFields.push({
          label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          key: k,
          val: String(v ?? ''),
        });
      });
    }

    const renderedKeys = new Set([
      'mvp_budget',
      'budget',
      'estimated_budget',
      'mvp_cost',
      'monthly_operational_cost',
      'monthly_cost',
      'operational_costs',
      'monthly_costs',
      'major_cost_drivers',
      'cost_drivers',
      'key_cost_drivers',
    ]);
    const extraFields = Object.entries(cost).filter(
      ([k]) => !renderedKeys.has(k),
    );

    return (
      <div className="space-y-10">
        {extraFields.map(([k, v]) => {
          const label = k
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const strVal =
            typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
          return (
            <div key={k} className={cardCls}>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>{label}</label>
                {typeof v === 'string' &&
                  v.length > 30 &&
                  renderRefineBtn('cost_estimation', k, label)}
              </div>
              {typeof v === 'string' ? (
                <textarea
                  value={strVal}
                  onChange={(e) =>
                    onUpdateField('cost_estimation', k, e.target.value)
                  }
                  rows={getAutoRows(strVal)}
                  className={textareaCls}
                />
              ) : (
                <input
                  value={strVal}
                  onChange={(e) =>
                    onUpdateField('cost_estimation', k, e.target.value)
                  }
                  className={inputCls}
                />
              )}
            </div>
          );
        })}

        {budgetFields.length > 0 && (
          <div className="space-y-4">
            <SectionHeader title="MVP Budget Estimates (USD)" />
            <div className="grid gap-3 sm:grid-cols-3">
              {budgetFields.map(({ label, key, val, color, bg }) => (
                <div key={key} className={cardCls}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`p-1.5 rounded-lg ${bg}`}>
                      <DollarSign className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <label className={labelCls}>{label}</label>
                  </div>
                  <input
                    value={val}
                    onChange={(e) => updateBudget(key, e.target.value)}
                    className={`${inputCls} font-semibold`}
                    placeholder="$0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {monthlyFields.length > 0 && (
          <div className="space-y-4">
            <SectionHeader title="Monthly Operational Costs (USD)" />
            <div className="grid gap-3 sm:grid-cols-3">
              {monthlyFields.map(({ label, key, val }) => (
                <div key={key} className={cardCls}>
                  <label className={`${labelCls} mb-2.5 block`}>{label}</label>
                  <input
                    value={val}
                    onChange={(e) => updateMonthly(key, e.target.value)}
                    className={inputCls}
                    placeholder="$0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <SectionHeader title="Major Cost Drivers" count={drivers.length} />
          {drivers.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 italic pl-1">
              No cost drivers defined yet. Add one below.
            </p>
          ) : (
            <div className="space-y-2.5">
              {drivers.map((driverStr, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-orange-400/40 shrink-0" />
                  <textarea
                    value={driverStr}
                    onChange={(e) => updateDriver(idx, e.target.value)}
                    rows={getAutoRows(driverStr)}
                    className={`${textareaCls} flex-1`}
                    placeholder="e.g. High API costs for AI inference..."
                  />
                  <DeleteBtn onClick={() => removeDriver(idx)} />
                </div>
              ))}
            </div>
          )}
          <AddBtn onClick={addDriver} label="Add Cost Driver" />
        </div>
      </div>
    );
  };

  const renderDynamicReviewGroup = (
    sectionId: 'business_model' | 'go_to_market',
    placeholderText: string,
  ) => {
    const rawVal = blueprint[sectionId];

    // Fallback: If it's a string, just render a single text area for the whole section
    if (typeof rawVal === 'string') {
      return (
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>
              {sectionId.replace(/_/g, ' ').toUpperCase()}
            </label>
            {sectionId !== 'business_model' &&
              rawVal.length > 40 &&
              renderRefineBtn(
                sectionId,
                sectionId,
                sectionId.replace(/_/g, ' ').toUpperCase(),
              )}
          </div>
          <textarea
            value={rawVal}
            onChange={(e) =>
              onUpdateField(sectionId, sectionId, e.target.value)
            }
            rows={getAutoRows(rawVal)}
            className={textareaCls}
            placeholder={placeholderText}
          />
          {sectionId !== 'business_model' &&
            renderRefinePanel(sectionId, sectionId)}
        </div>
      );
    }

    const obj = { ...asRecord(rawVal) };

    // Resolve specific keys for specific tabs
    let primaryKey = '';

    if (sectionId === 'business_model') {
      primaryKey =
        obj.primary_revenue_streams !== undefined
          ? 'primary_revenue_streams'
          : obj.primary_revenue !== undefined
            ? 'primary_revenue'
            : obj.revenue_model !== undefined
              ? 'revenue_model'
              : obj.primary_revenue_model !== undefined
                ? 'primary_revenue_model'
                : obj.revenue_streams !== undefined
                  ? 'revenue_streams'
                  : 'primary_revenue_streams';
      if (obj[primaryKey] === undefined) obj[primaryKey] = [];

      delete obj.secondary_revenue_streams;
      delete obj.secondary_revenue;
      delete obj.secondary_revenue_model;
    } else if (sectionId === 'go_to_market') {
      delete obj.acquisition_channels;
      delete obj.acquisition;
      delete obj.marketing_channels;
      delete obj.early_growth_strategy;
      delete obj.early_growth;
      delete obj.growth_strategy;
      delete obj.early_growth_strategies;
    }

    const orderedKeys = [primaryKey].filter((k) => k && obj[k] !== undefined);
    const otherKeys = Object.keys(obj).filter((k) => !orderedKeys.includes(k));
    const allKeysToRender = [...orderedKeys, ...otherKeys];

    return (
      <div className="space-y-8">
        {allKeysToRender.map((key) => {
          const item = obj[key];
          const humanLabel = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const isPricingStrategyField =
            sectionId === 'business_model' &&
            (key.toLowerCase().includes('pricing') ||
              key === 'pricing_strategy');
          const isLaunchChannelsField =
            sectionId === 'go_to_market' &&
            (key === 'launch_channels' ||
              key.toLowerCase().includes('launch_channel'));
          const shouldShowRefine =
            (sectionId !== 'business_model' && !isLaunchChannelsField) ||
            isPricingStrategyField;

          if (Array.isArray(item) || item === undefined || item === null) {
            const list = asStringList(item);
            return (
              <div key={key} className="space-y-4">
                <SectionHeader title={humanLabel} count={list.length} />
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 italic pl-1">
                    No items defined yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {list.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary/30 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <textarea
                            value={str}
                            onChange={(e) => {
                              const updated = [...list];
                              updated[idx] = e.target.value;
                              onUpdateField(sectionId, key, updated);
                            }}
                            rows={getAutoRows(str)}
                            className={`${textareaCls} w-full`}
                            placeholder="List item..."
                          />
                          {shouldShowRefine &&
                            renderRefinePanel(sectionId, `${key}__${idx}`)}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {shouldShowRefine &&
                            str.trim() &&
                            renderRefineBtn(
                              sectionId,
                              `${key}__${idx}`,
                              `${humanLabel} Item`,
                            )}
                          <DeleteBtn
                            onClick={() => {
                              onUpdateField(
                                sectionId,
                                key,
                                list.filter((_, i) => i !== idx),
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <AddBtn
                  onClick={() => onUpdateField(sectionId, key, [...list, ''])}
                  label={`Add ${humanLabel} Item`}
                />
              </div>
            );
          }

          // If item is string/number
          const strVal = String(item ?? '');
          return (
            <div key={key} className={cardCls}>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>{humanLabel}</label>
                {shouldShowRefine &&
                  strVal.length > 40 &&
                  renderRefineBtn(sectionId, key, humanLabel)}
              </div>
              <textarea
                value={strVal}
                onChange={(e) => onUpdateField(sectionId, key, e.target.value)}
                rows={getAutoRows(strVal)}
                className={textareaCls}
                placeholder={`Enter details for ${humanLabel.toLowerCase()}...`}
              />
              {shouldShowRefine && renderRefinePanel(sectionId, key)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBusinessModelReview = () => {
    return renderDynamicReviewGroup(
      'business_model',
      'Describe the pricing and revenue models...',
    );
  };

  const renderGoToMarketReview = () => {
    return renderDynamicReviewGroup(
      'go_to_market',
      'Describe launch, acquisition, and early growth strategies...',
    );
  };

  const renderGenericReview = () => {
    const val = blueprint[activeTab];

    const renderValue = (
      sectionId: string,
      key: string,
      value: unknown,
      label: string,
      depth: number = 0,
    ): ReactNode => {
      if (value === null || value === undefined) return null;

      if (isScoreField(key)) {
        const displayVal =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        return (
          <div key={key} className={depth === 0 ? cardCls : 'space-y-1.5'}>
            <label className={labelCls}>{label}</label>
            <div className="rounded-xl bg-muted/40 px-4 py-2.5 text-sm text-foreground/80 font-medium">
              {displayVal}
            </div>
          </div>
        );
      }

      if (typeof value === 'string') {
        return (
          <div key={key} className={depth === 0 ? cardCls : 'space-y-1.5'}>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>{label}</label>
              {depth === 0 &&
                value.length > 40 &&
                renderRefineBtn(sectionId, key, label)}
            </div>
            <textarea
              value={value}
              onChange={(e) => onUpdateField(sectionId, key, e.target.value)}
              rows={getAutoRows(value)}
              className={textareaCls}
            />
            {renderRefinePanel(sectionId, key)}
          </div>
        );
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return (
          <div key={key} className={depth === 0 ? cardCls : 'space-y-1.5'}>
            <label className={`${labelCls} mb-2 block`}>{label}</label>
            <input
              value={String(value)}
              onChange={(e) => onUpdateField(sectionId, key, e.target.value)}
              className={inputCls}
            />
          </div>
        );
      }

      if (
        Array.isArray(value) &&
        value.every((v) => typeof v === 'string' || typeof v === 'number')
      ) {
        return (
          <div
            key={key}
            className={depth === 0 ? `${cardCls} space-y-3` : 'space-y-2'}
          >
            <SectionHeader title={label} count={value.length} />
            <div className="space-y-2">
              {value.map((item, idx) => {
                const strVal = String(item);
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    <textarea
                      value={strVal}
                      onChange={(e) => {
                        const updated = [...value];
                        updated[idx] = e.target.value;
                        onUpdateField(sectionId, key, updated);
                      }}
                      rows={getAutoRows(strVal)}
                      className={`${textareaCls} flex-1`}
                    />
                    <DeleteBtn
                      onClick={() =>
                        onUpdateField(
                          sectionId,
                          key,
                          value.filter((_: any, i: number) => i !== idx),
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
            <AddBtn
              onClick={() => onUpdateField(sectionId, key, [...value, ''])}
              label="Add Item"
            />
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <div key={key} className="space-y-4">
            <SectionHeader title={label} count={value.length} />
            <div className="space-y-3">
              {value.map((item, idx) => {
                if (typeof item !== 'object' || item === null) {
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <NumberBadge num={idx + 1} />
                      <textarea
                        value={String(item)}
                        onChange={(e) => {
                          const u = [...value];
                          u[idx] = e.target.value;
                          onUpdateField(sectionId, key, u);
                        }}
                        rows={getAutoRows(String(item))}
                        className={`${textareaCls} flex-1`}
                      />
                      <DeleteBtn
                        onClick={() =>
                          onUpdateField(
                            sectionId,
                            key,
                            value.filter((_: any, i: number) => i !== idx),
                          )
                        }
                      />
                    </div>
                  );
                }
                return (
                  <div key={idx} className={`${cardCls} relative`}>
                    <div className="flex items-start gap-3.5">
                      <NumberBadge num={idx + 1} />
                      <div className="flex-1 min-w-0 space-y-3">
                        {Object.entries(item as Record<string, unknown>).map(
                          ([subKey, subVal]) => {
                            const subLabel = subKey
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase());
                            if (isScoreField(subKey)) {
                              return (
                                <div key={subKey}>
                                  <label
                                    className={`${labelCls} text-[11px] mb-1 block`}
                                  >
                                    {subLabel}
                                  </label>
                                  <div className="rounded-xl bg-muted/40 px-4 py-2 text-sm text-foreground/80">
                                    {String(subVal)}
                                  </div>
                                </div>
                              );
                            }
                            if (
                              typeof subVal === 'string' ||
                              typeof subVal === 'number'
                            ) {
                              const strSub = String(subVal);
                              return (
                                <div key={subKey}>
                                  <div className="flex items-center justify-between mb-1">
                                    <label
                                      className={`${labelCls} text-[11px]`}
                                    >
                                      {subLabel}
                                    </label>
                                    {(strSub.length > 20 ||
                                      sectionId === 'risk_analysis' ||
                                      key.toLowerCase().includes('risk')) &&
                                      renderRefineBtn(
                                        sectionId,
                                        `${key}__${idx}__${subKey}`,
                                        `${label.replace(/s$/, '')} ${subLabel}`,
                                      )}
                                  </div>
                                  <textarea
                                    value={strSub}
                                    onChange={(e) => {
                                      const u = [...value];
                                      u[idx] = {
                                        ...item,
                                        [subKey]: e.target.value,
                                      };
                                      onUpdateField(sectionId, key, u);
                                    }}
                                    rows={getAutoRows(strSub)}
                                    className={textareaCls}
                                  />
                                  {renderRefinePanel(
                                    sectionId,
                                    `${key}__${idx}__${subKey}`,
                                  )}
                                </div>
                              );
                            }
                            if (Array.isArray(subVal)) {
                              return (
                                <div key={subKey}>
                                  <label
                                    className={`${labelCls} text-[11px] mb-1 block`}
                                  >
                                    {subLabel}
                                  </label>
                                  <textarea
                                    value={(subVal as any[])
                                      .map((v) =>
                                        typeof v === 'string'
                                          ? v
                                          : JSON.stringify(v),
                                      )
                                      .join('\n')}
                                    onChange={(e) => {
                                      const u = [...value];
                                      u[idx] = {
                                        ...item,
                                        [subKey]: e.target.value.split('\n'),
                                      };
                                      onUpdateField(sectionId, key, u);
                                    }}
                                    rows={getAutoRows(
                                      (subVal as any[]).join('\n'),
                                    )}
                                    className={textareaCls}
                                    placeholder="One item per line..."
                                  />
                                </div>
                              );
                            }
                            return null;
                          },
                        )}
                      </div>
                      <DeleteBtn
                        onClick={() =>
                          onUpdateField(
                            sectionId,
                            key,
                            value.filter((_: any, i: number) => i !== idx),
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <AddBtn
              onClick={() => {
                const sample = value[0];
                const template =
                  sample && typeof sample === 'object' && !Array.isArray(sample)
                    ? Object.keys(sample).reduce(
                        (acc, k) => ({ ...acc, [k]: '' }),
                        {},
                      )
                    : key.includes('risk')
                      ? { risk: '', mitigation: '' }
                      : {};
                onUpdateField(sectionId, key, [...value, template]);
              }}
              label={`Add ${label.replace(/s$/, '')}`}
            />
          </div>
        );
      }

      if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>);
        return (
          <div
            key={key}
            className={
              depth === 0
                ? `${cardCls} space-y-4`
                : 'space-y-3 pl-3 border-l-2 border-border/20'
            }
          >
            {depth === 0 && <h4 className={sectionTitleCls}>{label}</h4>}
            {entries.map(([subKey, subVal]) => {
              const subLabel = subKey
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return renderValue(
                sectionId,
                subKey,
                subVal,
                subLabel,
                depth + 1,
              );
            })}
          </div>
        );
      }
      return null;
    };

    if (typeof val === 'string') {
      return (
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Section Content</label>
            {val.length > 40 &&
              renderRefineBtn(
                activeTab,
                activeTab,
                activeTab
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase()),
              )}
          </div>
          <textarea
            value={val}
            onChange={(e) =>
              onUpdateField(activeTab, activeTab, e.target.value)
            }
            rows={getAutoRows(val)}
            className={textareaCls}
          />
        </div>
      );
    }

    if (val && typeof val === 'object') {
      const entries = Object.entries(val as Record<string, unknown>);
      return (
        <div className="space-y-5">
          {entries.map(([k, v]) => {
            const label = k
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            return renderValue(activeTab, k, v, label, 0);
          })}
        </div>
      );
    }

    return (
      <div className={cardCls}>
        <label className={`${labelCls} mb-2 block`}>Section Content</label>
        <input
          value={String(val ?? '')}
          onChange={(e) => onUpdateField(activeTab, activeTab, e.target.value)}
          className={inputCls}
        />
      </div>
    );
  };

  const renderActiveTabContent = () => {
    const tabInfo = TABS.find((t) => t.id === activeTab);
    const content = (() => {
      if (activeTab === 'executive_summary')
        return renderExecutiveSummaryReview();
      if (activeTab === 'target_users') return renderTargetUsersReview();
      if (activeTab === 'mvp_definition') return renderMvpDefinitionReview();
      if (activeTab === 'technical_architecture')
        return renderTechnicalArchitectureReview();
      if (activeTab === 'development_roadmap')
        return renderDevelopmentRoadmapReview();
      if (activeTab === 'team_requirements')
        return renderTeamRequirementsReview();
      if (activeTab === 'cost_estimation') return renderCostEstimationReview();
      if (activeTab === 'business_model') return renderBusinessModelReview();
      if (activeTab === 'go_to_market') return renderGoToMarketReview();
      return renderGenericReview();
    })();

    return (
      <div className="space-y-6">
        <div className="mb-2 p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {tabInfo?.icon || <FileText className="h-4 w-4" />}
              </div>
              {tabInfo?.title}
            </h2>
            {activeTab === 'development_roadmap' && (() => {
              const { totalWeeks, totalMonths } = calculateTotalRoadmapDuration(blueprint.development_roadmap);
              if (totalWeeks === 0) return null;
              return (
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-3 py-1.5 text-xs font-bold text-primary shrink-0 self-start sm:self-auto shadow-xs">
                  <Clock className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                  <span>
                    Total Estimated Duration:{' '}
                    <span className="text-foreground font-extrabold">
                      {totalMonths} {totalMonths.includes('-') || Number(totalMonths) > 1 ? 'Months' : 'Month'}
                    </span>{' '}
                    ({totalWeeks} {totalWeeks === 1 ? 'Week' : 'Weeks'})
                  </span>
                </div>
              );
            })()}
          </div>
          {/* @ts-ignore */}
          {tabInfo?.description && (
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed ml-11 relative z-10">
              {/* @ts-ignore */}
              {tabInfo.description}
            </p>
          )}
        </div>
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto shadow-lg">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Blueprint Sections
            </span>
          </div>
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const hasContent = sectionHasContent(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    onSectionChange?.({
                      id: tab.id,
                      title: tab.title,
                    });
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 text-[13px] font-semibold group ${
                    active
                      ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary shadow-sm ring-1 ring-primary/15'
                      : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground/60 group-hover:bg-muted group-hover:text-muted-foreground'}`}
                  >
                    {tab.icon}
                  </div>
                  <span className="truncate flex-1">{tab.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="space-y-5">{renderActiveTabContent()}</div>
        </section>
      </div>
    </div>
  );
}

function BlueprintReport({
  blueprint,
  onSectionChange,
  region,
  onUpdateBlueprint,
  isRefining,
  onRefineSection,
  isEditable = true,
}: {
  blueprint: BlueprintResult;
  onSectionChange?: (section: ActiveReportSection) => void;
  region: string;
  onUpdateBlueprint?: (updated: BlueprintResult) => void;
  isRefining?: boolean;
  onRefineSection?: (sectionId: string, prompt: string) => Promise<void>;
  isEditable?: boolean;
}) {
  const orderedSections = BLUEPRINT_SECTION_ORDER.filter(
    (key) => blueprint[key] !== undefined,
  ).map((key) => [key, blueprint[key]] as const);
  const remainingSections = Object.entries(blueprint).filter(
    ([key]) => !BLUEPRINT_SECTION_ORDER.includes(key) && key !== 'step',
  );
  const sections: ReportSection[] = [
    ...orderedSections,
    ...remainingSections,
  ].map(([key, value]) => ({
    id: key,
    title: humanizeKey(key),
    description:
      BLUEPRINT_SECTION_DESCRIPTIONS[key] ??
      'Additional generated report detail.',
    keywords: stringifyForSearch(value),
    body: renderBlueprintSection(key, value, region),
  }));

  const handleSaveSection = (sectionId: string, updatedValue: any) => {
    onUpdateBlueprint?.({
      ...blueprint,
      [sectionId]: updatedValue,
    });
  };

  return (
    <ReportReader
      sections={sections}
      initialSectionId={sections[0]?.id || 'executive_summary'}
      onSectionChange={onSectionChange}
      isEditable={isEditable}
      onSaveSection={handleSaveSection}
      onRefineSection={onRefineSection}
      refineLoading={isRefining}
      rawValues={blueprint}
    />
  );
}

function AnalysisDetails({
  analysis,
  onSectionChange,
  isChatOpen,
}: {
  analysis: AnalysisResult;
  onSectionChange?: (section: ActiveReportSection) => void;
  isChatOpen: boolean;
}) {
  const research = analysis.research_analysis;
  const scores = research?.dimensional_scores ?? {};
  const sections: ReportSection[] = [
    {
      id: 'scores',
      title: 'Scores',
      description: 'A quick read on how the idea performed.',
      keywords: stringifyForSearch(scores),
      body: (
        <div
          className={`grid gap-4 ${
            isChatOpen
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
          }`}
        >
          {Object.entries(SCORE_LABELS).map(([key, label]) => {
            const rawVal = scores[key];
            const numVal =
              typeof rawVal === 'number'
                ? rawVal
                : parseFloat(String(rawVal)) || 0;
            const displayVal = rawVal !== undefined ? rawVal : 'N/A';

            let textColor = 'text-amber-600 dark:text-amber-400';
            let colorClass =
              'text-amber-500 bg-amber-500/10 border-amber-500/20';
            let meterColor = 'bg-amber-500';
            let shadowGlow = 'shadow-[0_0_12px_rgba(245,158,11,0.12)]';
            if (numVal >= 8) {
              textColor = 'text-emerald-600 dark:text-emerald-400';
              colorClass =
                'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
              meterColor = 'bg-emerald-500';
              shadowGlow = 'shadow-[0_0_12px_rgba(16,185,129,0.12)]';
            } else if (numVal < 5 && numVal > 0) {
              textColor = 'text-rose-600 dark:text-rose-400';
              colorClass = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
              meterColor = 'bg-rose-500';
              shadowGlow = 'shadow-[0_0_12px_rgba(244,63,94,0.12)]';
            }

            let scoreIcon = <Award className="h-4 w-4 shrink-0" />;
            if (key === 'market_opportunity')
              scoreIcon = <TrendingUp className="h-4 w-4 shrink-0" />;
            else if (key === 'problem_clarity')
              scoreIcon = <Lightbulb className="h-4 w-4 shrink-0" />;
            else if (key === 'solution_differentiation')
              scoreIcon = <Sparkles className="h-4 w-4 shrink-0" />;
            else if (key === 'execution_feasibility')
              scoreIcon = <Activity className="h-4 w-4 shrink-0" />;
            else if (key === 'revenue_potential')
              scoreIcon = <DollarSign className="h-4 w-4 shrink-0" />;

            return (
              <div
                key={key}
                className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-card/85 to-card/35 p-4 transition-all duration-300 hover:border-primary/30 hover:${shadowGlow} group flex flex-col justify-between min-h-[145px]`}
              >
                <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />

                <div className="relative z-10 flex flex-col h-full justify-between gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`p-1.5 rounded-lg border ${colorClass} shrink-0`}
                    >
                      {scoreIcon}
                    </div>
                    <div className="flex items-baseline gap-0.5 text-right">
                      <span
                        className={`text-2xl font-black font-mono tracking-tight ${textColor}`}
                      >
                        {displayVal}
                      </span>
                      {rawVal !== undefined && (
                        <span className="text-[10px] font-bold text-muted-foreground/50">
                          /10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground tracking-wide leading-tight min-h-[28px] flex items-center break-words">
                      {label}
                    </div>

                    {rawVal !== undefined && (
                      <div className="space-y-1">
                        <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${meterColor}`}
                            style={{ width: `${numVal * 10}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-muted-foreground/45">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: 'market',
      title: 'Market',
      description: 'Demand, audience, competitors, and moat.',
      keywords: [
        research?.market_demand,
        research?.target_audience,
        research?.competitor_analysis,
        research?.competitive_moat,
      ].join(' '),
      body: (
        <div className="space-y-5">
          <KeyValueGrid
            data={{
              market_demand: research?.market_demand,
              target_audience: research?.target_audience,
              competitor_analysis: research?.competitor_analysis,
              competitive_moat: research?.competitive_moat,
            }}
          />
          <div>
            <h3 className="mb-2 text-sm font-semibold">Go-to-market read</h3>
            <TextBlock>{research?.go_to_market_strategy}</TextBlock>
          </div>
        </div>
      ),
    },
    {
      id: 'business',
      title: 'Business Model',
      description: 'Revenue, economics, and expected cost shape.',
      keywords: [
        research?.revenue_model,
        research?.unit_economics,
        research?.cost_estimation,
      ].join(' '),
      body: (
        <KeyValueGrid
          data={{
            revenue_model: research?.revenue_model,
            unit_economics: research?.unit_economics,
            cost_estimation: formatCostEstimationToParagraph(
              research?.cost_estimation,
            ),
          }}
        />
      ),
    },
    {
      id: 'risks',
      title: 'Risks and Suggestions',
      description: 'What can go wrong and what to do next.',
      keywords: [
        ...(research?.risks ?? []),
        ...(research?.suggestions ?? []),
      ].join(' '),
      body: (
        <div className="grid gap-6 md:grid-cols-2">
          <BlockSectionList title="Top risks" items={research?.risks} />
          <BlockSectionList
            title="Recommended actions"
            items={research?.suggestions}
          />
        </div>
      ),
    },
    {
      id: 'swot',
      title: 'SWOT',
      description: 'Strengths, weaknesses, opportunities, and threats.',
      keywords: stringifyForSearch(research?.swot),
      body: (
        <div className="grid gap-6 md:grid-cols-2">
          <BlockSectionList
            title="Strengths"
            items={research?.swot?.strengths}
          />
          <BlockSectionList
            title="Weaknesses"
            items={research?.swot?.weaknesses}
          />
          <BlockSectionList
            title="Opportunities"
            items={research?.swot?.opportunities}
          />
          <BlockSectionList title="Threats" items={research?.swot?.threats} />
        </div>
      ),
    },
    {
      id: 'assumptions',
      title: 'Assumptions',
      description: 'Unknowns the analysis depends on.',
      keywords: (research?.assumptions ?? []).join(' '),
      body: <BulletList items={research?.assumptions} />,
    },
  ];

  return (
    <ReportReader
      sections={sections}
      initialSectionId="scores"
      onSectionChange={onSectionChange}
    />
  );
}

function buildSmartSuggestions({
  phase,
  activeReportSection,
  activeQuestion,
  idea,
  region,
  totalQuestions,
  answers,
  usedAiSuggest,
  improveAnswerCounts,
  activeReportSectionData,
}: {
  phase: WizardPhase;
  activeReportSection: ActiveReportSection | null;
  activeQuestion: ActiveQuestion | null;
  idea?: string;
  region?: string;
  totalQuestions?: number;
  answers?: Record<string, string>;
  usedAiSuggest?: Record<string, boolean>;
  improveAnswerCounts?: Record<string, number>;
  activeReportSectionData?: unknown;
}): SmartSuggestion[] {
  if (phase === 'technical' && activeQuestion) {
    const questionText = activeQuestion.question;
    const index = activeQuestion.index + 1;
    const total = totalQuestions || 5;
    const kind = activeQuestion.kind === 'mandatory' ? 'Mandatory' : 'Optional';
    const currentAnswer =
      (answers && activeQuestion.questionId && answers[activeQuestion.questionId]) || '';
    const hasBeenSuggestedOrAnswered =
      (usedAiSuggest && activeQuestion.questionId && usedAiSuggest[activeQuestion.questionId]) ||
      Boolean(currentAnswer.trim());
    const improveCount =
      (improveAnswerCounts && improveAnswerCounts[activeQuestion.questionId]) ||
      0;

    const sharedContextBlock = `You are DEHIX AI, a startup technical advisor helping a non-technical founder answer a build-planning question.
Business idea: "${idea || ''}"
Region: ${region || 'India'}
Question ${index} of ${total} [${kind}]: "${questionText}"
Current answer (may be empty): "${currentAnswer}"

Rules:
- Ground every suggestion in the specific business idea above — no generic startup advice.
- Never invent facts about the business that aren't stated or reasonably inferable from the idea/region.
- Plain text only. No markdown headers, no bullet symbols unless the answer is inherently a list.
- Max 120 words unless the question explicitly requires more (e.g. a feature list).`;

    const suggestions: SmartSuggestion[] = [];

    if (!hasBeenSuggestedOrAnswered) {
      suggestions.push({
        label: 'Recommend answer',
        displayText: `Recommend answer for Question ${index}`,
        action: 'suggest_answer',
        targetQuestionId: activeQuestion.questionId,
        prompt: `${sharedContextBlock}

Task: Recommend a strong, practical answer to this question, written as if the founder wrote it themselves.
Keep it specific, concrete, and free of jargon a non-technical founder wouldn't use.
If the question is Optional and doesn't clearly apply to this idea, say so briefly and suggest the founder skip it — do not force a fabricated answer.
Output: the answer text only, no preamble like "Here's a suggestion:".`,
      });
    }

    suggestions.push({
      label: 'Explain question',
      displayText: `Explain Question ${index}`,
      action: 'explain_question',
      targetQuestionId: activeQuestion.questionId,
      prompt: `${sharedContextBlock}

Task: In 2-3 short paragraphs, explain:
1. What this question is really asking, in plain language.
2. Why it matters for the technical blueprint/build plan that gets generated later.
3. What specific details the founder should include to get a useful blueprint.
Output: explanation text only, no preamble.`,
    });

    if (improveCount < 2) {
      suggestions.push({
        label: 'Improve my answer',
        displayText: `Improve my answer for Question ${index}`,
        action: 'improve_answer',
        targetQuestionId: activeQuestion.questionId,
        prompt: `${sharedContextBlock}

Task:
- If Current answer is non-empty: rewrite it to be clearer, more complete, and more useful for blueprint generation. Preserve the founder's original intent and any concrete facts they included — do not change their meaning.
- If Current answer is empty: say "There's no answer yet to improve — want me to draft one instead?" and stop there (do not fabricate an answer under this option).
Output: rewritten answer only (or the fallback line above), no preamble, no diff/before-after formatting.`,
      });
    }

    return suggestions;
  }

  if ((phase === 'analysis' || phase === 'blueprint') && activeReportSection) {
    const sectionName = activeReportSection.title;
    const sectionDataText =
      activeReportSectionData === undefined || activeReportSectionData === null
        ? 'No structured section data is available. Use the known launch context.'
        : typeof activeReportSectionData === 'string'
          ? activeReportSectionData
          : JSON.stringify(activeReportSectionData, null, 2);
    const base = `You are DEHIX AI, a concise Dehix product advisor.
Business idea: "${idea || ''}"
Region: ${region || 'India'}
Current report section: ${sectionName} (${activeReportSection.id})
Section data:
${sectionDataText}

Rules:
- Use the section data above; do not answer from the title alone.
- Be specific to this business idea and section.
- No robotic preambles like "Sure" or "Here is".
- Do not end with vague offers like "if you want".
- Keep the answer concise and actionable.`;
    const sectionId = activeReportSection.id.toLowerCase();

    if (sectionId.includes('executive') || sectionId.includes('summary')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain Executive Summary simply',
          prompt: `${base}\n\nExplain this Executive Summary in simple language for a non-technical founder.`,
        },
        {
          label: 'Key takeaways',
          displayText: 'Key takeaways from summary',
          prompt: `${base}\n\nWhat are the 3 most important takeaways from this Executive Summary?`,
        },
        {
          label: 'Pitch deck summary',
          displayText: 'Summarize for pitch deck',
          prompt: `${base}\n\nHow should I summarize this vision for pitch deck slides?`,
        },
        {
          label: 'Highlight strengths',
          displayText: 'Highlight core strengths',
          prompt: `${base}\n\nWhat are the core strengths highlighted in this summary?`,
        },
      ];
    }

    if (sectionId.includes('problem')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain problem simply',
          prompt: `${base}\n\nExplain this problem definition in simple, clear terms.`,
        },
        {
          label: 'Validate problem',
          displayText: 'How to validate problem',
          prompt: `${base}\n\nSuggest 3 practical ways to validate this problem with target users.`,
        },
        {
          label: 'Sharpen pain point',
          displayText: 'Sharpen pain point statement',
          prompt: `${base}\n\nHow can we refine this problem statement to make it more compelling?`,
        },
        {
          label: 'Root causes',
          displayText: 'Analyze root causes',
          prompt: `${base}\n\nWhat are the root causes driving this user problem?`,
        },
      ];
    }

    if (sectionId.includes('user_journey') || sectionId.includes('journey')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain user journey simply',
          prompt: `${base}\n\nExplain this user journey step-by-step in simple language.`,
        },
        {
          label: 'Friction points',
          displayText: 'Identify friction points',
          prompt: `${base}\n\nWhere are the potential friction points or drop-offs in this user journey?`,
        },
        {
          label: 'Onboarding flow',
          displayText: 'Optimize onboarding flow',
          prompt: `${base}\n\nHow can we optimize the user onboarding flow for maximum activation?`,
        },
        {
          label: 'Retention triggers',
          displayText: 'Identify retention triggers',
          prompt: `${base}\n\nWhat specific steps in this journey encourage recurring user retention?`,
        },
      ];
    }

    if (sectionId.includes('user') || sectionId.includes('target') || sectionId.includes('persona')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain target users simply',
          prompt: `${base}\n\nExplain these target user personas in simple language.`,
        },
        {
          label: 'Validate personas',
          displayText: 'Ways to validate personas',
          prompt: `${base}\n\nSuggest 3 quick ways to validate these user personas in the real market.`,
        },
        {
          label: 'User pain points',
          displayText: 'Analyze user pain points',
          prompt: `${base}\n\nWhat critical pain points or objections might these users have?`,
        },
        {
          label: 'Persona marketing',
          displayText: 'Tailor messaging for personas',
          prompt: `${base}\n\nHow can we tailor our messaging to appeal to these specific personas?`,
        },
      ];
    }

    if (sectionId.includes('product_strategy') || sectionId.includes('strategy')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain product strategy simply',
          prompt: `${base}\n\nExplain this product strategy in simple founder-friendly language.`,
        },
        {
          label: 'Competitive moat',
          displayText: 'Analyze competitive moat',
          prompt: `${base}\n\nWhat is our unique competitive advantage or moat in this strategy?`,
        },
        {
          label: 'Growth loops',
          displayText: 'Identify growth loops',
          prompt: `${base}\n\nWhat growth mechanisms or acquisition loops are built into this product strategy?`,
        },
        {
          label: 'Strategic risks',
          displayText: 'Identify strategic risks',
          prompt: `${base}\n\nWhat strategic risks or market shifts could impact this product strategy?`,
        },
      ];
    }

    if (sectionId.includes('mvp')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain MVP scope simply',
          prompt: `${base}\n\nExplain the MVP scope and feature choices in simple language.`,
        },
        {
          label: 'Tighten MVP',
          displayText: 'Suggest leaner MVP scope',
          prompt: `${base}\n\nSuggest a leaner MVP scope and explain what can be delayed without hurting launch quality.`,
        },
        {
          label: 'Feature priority',
          displayText: 'Prioritize MVP features',
          prompt: `${base}\n\nPrioritize these MVP features by user value, build effort, and launch dependency.`,
        },
        {
          label: 'Missing feature',
          displayText: 'Identify missing features',
          prompt: `${base}\n\nIdentify any critical MVP feature that may be missing or underspecified.`,
        },
      ];
    }

    if (sectionId.includes('arch') || sectionId.includes('technical')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain architecture simply',
          prompt: `${base}\n\nExplain this technical architecture and tech stack in simple language for a founder.`,
        },
        {
          label: 'Scale stack',
          displayText: 'Analyze stack scalability',
          prompt: `${base}\n\nHow well does this recommended tech stack scale, and what bottleneck should we monitor?`,
        },
        {
          label: 'Security review',
          displayText: 'Review architecture security',
          prompt: `${base}\n\nWhat are the key security and privacy practices we should implement for this architecture?`,
        },
        {
          label: 'Simplify build',
          displayText: 'Simplify build components',
          prompt: `${base}\n\nAre there components or technologies in this stack we can simplify to speed up launch?`,
        },
      ];
    }

    if (sectionId.includes('security') || sectionId.includes('compliance') || sectionId.includes('privacy')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain security & compliance simply',
          prompt: `${base}\n\nExplain the security and compliance requirements in plain language.`,
        },
        {
          label: 'Data protection',
          displayText: 'Data protection requirements',
          prompt: `${base}\n\nWhat essential data privacy and data protection measures should we enforce?`,
        },
        {
          label: 'Auth setup',
          displayText: 'Authentication & permissions',
          prompt: `${base}\n\nWhat best practices should we follow for user authentication and authorization?`,
        },
        {
          label: 'Compliance checklist',
          displayText: 'Pre-launch compliance checklist',
          prompt: `${base}\n\nGive me a practical compliance checklist before launching this application.`,
        },
      ];
    }

    if (sectionId.includes('roadmap') || sectionId.includes('development')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain roadmap simply',
          prompt: `${base}\n\nExplain this development roadmap and timeline in simple language.`,
        },
        {
          label: 'Compress timeline',
          displayText: 'Suggest faster roadmap timeline',
          prompt: `${base}\n\nAnalyze the phase breakdown and suggest practical ways to compress the overall roadmap timeline without compromising core MVP quality.`,
        },
        {
          label: 'Explain phases',
          displayText: 'Explain phase sequencing',
          prompt: `${base}\n\nExplain the rationale behind this phase breakdown and why each milestone is ordered this way.`,
        },
        {
          label: 'Critical path risks',
          displayText: 'Identify critical path risks in roadmap',
          prompt: `${base}\n\nWhat are the biggest delivery risks or dependency bottlenecks in this development roadmap?`,
        },
      ];
    }

    if (sectionId.includes('team')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain team plan simply',
          prompt: `${base}\n\nExplain the required team roles and hiring plan in simple language.`,
        },
        {
          label: 'Hiring plan',
          displayText: 'Practical hiring plan',
          prompt: `${base}\n\nTurn this team section into a practical hiring plan with role priority and sequencing.`,
        },
        {
          label: 'Minimum team',
          displayText: 'Minimum viable team',
          prompt: `${base}\n\nExplain the minimum team needed to ship the first usable version.`,
        },
        {
          label: 'Role tradeoffs',
          displayText: 'Role tradeoffs for budget',
          prompt: `${base}\n\nWhat role tradeoffs can we make if budget or timeline is tight?`,
        },
      ];
    }

    if (sectionId.includes('cost') || sectionId.includes('budget')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain budget simply',
          prompt: `${base}\n\nExplain the budget estimate in plain language and highlight the biggest cost drivers.`,
        },
        {
          label: 'Explain budget',
          displayText: 'Analyze budget drivers',
          prompt: `${base}\n\nExplain the budget estimate in plain language and highlight the biggest cost drivers.`,
        },
        {
          label: 'Reduce cost',
          displayText: 'Ways to reduce cost',
          prompt: `${base}\n\nSuggest ways to reduce MVP cost without damaging the core product outcome.`,
        },
        {
          label: 'Budget risks',
          displayText: 'Risky budget assumptions',
          prompt: `${base}\n\nWhat budget assumptions are risky or need validation before hiring?`,
        },
      ];
    }

    if (
      sectionId.includes('business') ||
      sectionId.includes('model') ||
      sectionId.includes('revenue')
    ) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain business model simply',
          prompt: `${base}\n\nExplain this business and revenue model in simple language.`,
        },
        {
          label: 'Price strategy',
          displayText: 'Recommend pricing strategy',
          prompt: `${base}\n\nRecommend a starting pricing structure or tier based on these revenue streams.`,
        },
        {
          label: 'LTV/CAC analysis',
          displayText: 'Analyze LTV & CAC assumptions',
          prompt: `${base}\n\nWhat are the biggest assumptions regarding user acquisition cost (CAC) and lifetime value (LTV) here?`,
        },
        {
          label: 'Alternative models',
          displayText: 'Suggest alternative monetization',
          prompt: `${base}\n\nSuggest 2 alternative monetization strategies that could work alongside these.`,
        },
      ];
    }

    if (
      sectionId.includes('market') ||
      sectionId.includes('go_to') ||
      sectionId.includes('gtm')
    ) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain go-to-market simply',
          prompt: `${base}\n\nExplain this go-to-market strategy in simple language.`,
        },
        {
          label: 'Growth hack ideas',
          displayText: 'Suggest low-cost growth hacks',
          prompt: `${base}\n\nSuggest 3 low-cost growth hacks or viral loops for early acquisition.`,
        },
        {
          label: 'First 100 users',
          displayText: 'First 100 users playbook',
          prompt: `${base}\n\nGive me a step-by-step launch playbook to acquire our first 100 paying customers.`,
        },
        {
          label: 'Challenger channels',
          displayText: 'Alternative acquisition channels',
          prompt: `${base}\n\nWhich acquisition channels are secondary or experimental but worth testing?`,
        },
      ];
    }

    if (sectionId.includes('swot') || sectionId.includes('risk')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain risks simply',
          prompt: `${base}\n\nExplain these risks and mitigations in simple, clear language.`,
        },
        {
          label: 'Prioritize risks',
          displayText: 'Rank risks by urgency',
          prompt: `${base}\n\nRank the risks by urgency and explain the first mitigation step for each.`,
        },
        {
          label: 'Reduce risk',
          displayText: 'Practical ways to reduce risk',
          prompt: `${base}\n\nGive me practical ways to reduce the most important risks before building.`,
        },
        {
          label: 'Investor concerns',
          displayText: 'Investor concern analysis',
          prompt: `${base}\n\nWhat concerns would an investor or senior operator raise after reading this risk section?`,
        },
      ];
    }

    if (sectionId.includes('founder') || sectionId.includes('recommendation')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain founder recommendations simply',
          prompt: `${base}\n\nExplain founder recommendations in simple language.`,
        },
        {
          label: 'Top 3 priorities',
          displayText: 'Founder top 3 priorities',
          prompt: `${base}\n\nWhat top 3 decisions or actions should the founder prioritize first?`,
        },
        {
          label: 'Common pitfalls',
          displayText: 'Avoid execution pitfalls',
          prompt: `${base}\n\nWhat common execution pitfalls should the founder avoid at this stage?`,
        },
        {
          label: 'Resource allocation',
          displayText: 'Time & resource allocation',
          prompt: `${base}\n\nHow should time and resources be allocated between build and growth right now?`,
        },
      ];
    }

    if (sectionId.includes('verdict') || sectionId.includes('final')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain final verdict simply',
          prompt: `${base}\n\nExplain the final verdict in simple, actionable terms.`,
        },
        {
          label: 'Go / No-Go factors',
          displayText: 'Go / No-Go decision factors',
          prompt: `${base}\n\nWhat are the key Go / No-Go factors to evaluate before starting build?`,
        },
        {
          label: 'Success metrics',
          displayText: 'Define success metrics',
          prompt: `${base}\n\nWhat key performance metrics indicate we are ready for scaling?`,
        },
      ];
    }

    if (sectionId.includes('next') || sectionId.includes('option')) {
      return [
        {
          label: 'Explain simply',
          displayText: 'Explain next options simply',
          prompt: `${base}\n\nExplain next steps and options simply.`,
        },
        {
          label: 'Immediate tasks',
          displayText: 'Tasks for this week',
          prompt: `${base}\n\nWhat exact tasks should be done this week to prepare for developer onboarding?`,
        },
        {
          label: 'Team briefing',
          displayText: 'How to brief developers',
          prompt: `${base}\n\nHow should we brief the hired developers using this blueprint?`,
        },
      ];
    }

    return [
      {
        label: 'Explain simply',
        displayText: `Explain ${sectionName} simply`,
        prompt: `${base}\n\nExplain this section in simpler language and call out anything that needs validation.`,
      },
      {
        label: `Summarize ${sectionName}`,
        prompt: `${base}\n\nSummarize this section into the key points I should remember.`,
      },
      {
        label: 'Next decisions',
        prompt: `${base}\n\nWhat decisions should I make based on this section before moving forward?`,
      },
    ];
  }

  return [
    {
      label: 'What next?',
      prompt:
        'Based on the current launch flow context, what should I do next?',
    },
    {
      label: 'Explain status',
      prompt:
        'Explain where I am in the launch flow and what the next decision is.',
    },
    {
      label: 'Find gaps',
      prompt:
        'Find the most important gaps or unanswered questions in the current launch context.',
    },
  ];
}

function calculateSmartRoleCount(
  title: string,
  purpose: string,
  itemCount: any,
  blueprint: BlueprintResult | null,
  analysis?: AnalysisResult | null,
): number {
  if (typeof itemCount === 'number' && itemCount > 0) {
    return itemCount;
  }
  if (typeof itemCount === 'string') {
    const parsed = parseInt(itemCount, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  const titleLower = title.toLowerCase();
  const purposeLower = purpose.toLowerCase();
  const roadmapStr = JSON.stringify(blueprint?.development_roadmap ?? '').toLowerCase();
  const mvpStr = JSON.stringify(blueprint?.mvp_definition ?? '').toLowerCase();
  const archStr = JSON.stringify(blueprint?.technical_architecture ?? '').toLowerCase();
  const scopeText = `${titleLower} ${purposeLower} ${roadmapStr} ${mvpStr} ${archStr}`;

  const isHeavyScope =
    scopeText.includes('complex') ||
    scopeText.includes('marketplace') ||
    scopeText.includes('realtime') ||
    scopeText.includes('video') ||
    scopeText.includes('streaming') ||
    scopeText.includes('enterprise') ||
    scopeText.includes('multi-tenant') ||
    scopeText.includes('mobile and web');

  if (
    titleLower.includes('front') ||
    titleLower.includes('ui/ux dev') ||
    titleLower.includes('web dev') ||
    titleLower.includes('react') ||
    titleLower.includes('client') ||
    titleLower.includes('frontend')
  ) {
    return isHeavyScope ? 3 : 2;
  }

  if (
    titleLower.includes('back') ||
    titleLower.includes('api') ||
    titleLower.includes('server') ||
    titleLower.includes('node') ||
    titleLower.includes('database') ||
    titleLower.includes('backend')
  ) {
    return isHeavyScope ? 2 : 1;
  }

  if (titleLower.includes('full') || titleLower.includes('stack')) {
    return isHeavyScope ? 3 : 2;
  }

  if (
    titleLower.includes('mobile') ||
    titleLower.includes('ios') ||
    titleLower.includes('android') ||
    titleLower.includes('react native') ||
    titleLower.includes('flutter') ||
    titleLower.includes('app dev')
  ) {
    return 2;
  }

  if (
    titleLower.includes('qa') ||
    titleLower.includes('test') ||
    titleLower.includes('quality') ||
    titleLower.includes('automation')
  ) {
    return isHeavyScope ? 2 : 1;
  }

  if (
    titleLower.includes('design') ||
    titleLower.includes('ux') ||
    titleLower.includes('ui designer') ||
    titleLower.includes('product designer') ||
    titleLower.includes('figma')
  ) {
    return 1;
  }

  if (
    titleLower.includes('devops') ||
    titleLower.includes('cloud') ||
    titleLower.includes('infra') ||
    titleLower.includes('sre') ||
    titleLower.includes('sysadmin')
  ) {
    return 1;
  }

  if (
    titleLower.includes('ai') ||
    titleLower.includes('ml') ||
    titleLower.includes('data') ||
    titleLower.includes('machine learning') ||
    titleLower.includes('nlp')
  ) {
    return isHeavyScope ? 2 : 1;
  }

  if (
    titleLower.includes('lead') ||
    titleLower.includes('architect') ||
    titleLower.includes('pm') ||
    titleLower.includes('manager') ||
    titleLower.includes('scrum')
  ) {
    return 1;
  }

  return isHeavyScope ? 2 : 1;
}

function estimateTalentRequirements(
  blueprint: BlueprintResult | null,
  analysis?: AnalysisResult | null,
): TalentRequirement[] {
  const requirements: TalentRequirement[] = [];

  if (blueprint) {
    const team = asRecord(blueprint.team_requirements);
    const recTeam = asRecordList(
      team.recommended_team ??
        team.recommended ??
        team.roles ??
        blueprint.team_requirements,
    );

    if (recTeam.length > 0) {
      recTeam.forEach((item, idx) => {
        const title = String(
          item.role ??
            item.role_title ??
            item.title ??
            item.name ??
            item.position ??
            `Role ${idx + 1}`,
        );
        const purpose = String(
          item.purpose ?? item.description ?? item.responsibilities ?? '',
        );
        const priorityStr = String(item.priority ?? '').toLowerCase();
        const priority: 'required' | 'recommended' | 'optional' =
          priorityStr.includes('opt')
            ? 'optional'
            : priorityStr.includes('rec')
              ? 'recommended'
              : 'required';

        const countVal =
          item.count ?? item.quantity ?? item.size ?? item.aiSuggestedCount;
        const count = calculateSmartRoleCount(
          title,
          purpose,
          countVal,
          blueprint,
          analysis,
        );

        let skillDomain = 'Full-Stack / Product Development';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('front') || titleLower.includes('ui'))
          skillDomain = 'React / Next.js / TypeScript';
        else if (titleLower.includes('back') || titleLower.includes('api'))
          skillDomain = 'Node.js / Express / Database';
        else if (titleLower.includes('design') || titleLower.includes('ux'))
          skillDomain = 'Figma / Product Design';
        else if (titleLower.includes('qa') || titleLower.includes('test'))
          skillDomain = 'QA Automation / Playwright';
        else if (titleLower.includes('devops') || titleLower.includes('cloud'))
          skillDomain = 'AWS / Docker / CI/CD';

        requirements.push({
          roleTitle: title,
          skillDomain: item.skillDomain
            ? String(item.skillDomain)
            : skillDomain,
          reason: purpose || `AI recommended role for ${title}`,
          aiSuggestedCount: count,
          businessSelectedCount: count,
          minCount: priority === 'required' ? 1 : 0,
          maxCount: Math.max(count + 2, 5),
          priority,
        });
      });
    }
  }

  if (requirements.length === 0) {
    return [
      {
        roleTitle: 'Frontend Developer',
        skillDomain: 'React / Next.js / TypeScript',
        reason:
          'The MVP has dashboards, authentication, marketplace views, and LiveRoom UI.',
        aiSuggestedCount: 2,
        businessSelectedCount: 2,
        minCount: 1,
        maxCount: 4,
        priority: 'required',
      },
      {
        roleTitle: 'Backend Developer',
        skillDomain: 'Node.js / API / Database',
        reason:
          'The product needs APIs, auth, data models, and room/project workflows.',
        aiSuggestedCount: 1,
        businessSelectedCount: 1,
        minCount: 1,
        maxCount: 3,
        priority: 'required',
      },
      {
        roleTitle: 'UI/UX Designer',
        skillDomain: 'Figma / Design Systems',
        reason:
          'Needed for user journey flows, wireframes, and component layout consistency.',
        aiSuggestedCount: 1,
        businessSelectedCount: 1,
        minCount: 0,
        maxCount: 2,
        priority: 'recommended',
      },
      {
        roleTitle: 'QA Tester',
        skillDomain: 'Automated & E2E Testing',
        reason: 'Optional role for quality assurance and release validation.',
        aiSuggestedCount: 0,
        businessSelectedCount: 0,
        minCount: 0,
        maxCount: 2,
        priority: 'optional',
      },
    ];
  }

  return requirements;
}

export default function CreateRoom() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [phase, setPhase] = useState<WizardPhase>('idea');
  const [description, setDescription] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [phase1Review, setPhase1Review] = useState<Phase1ReviewForm>(() =>
    buildPhase1ReviewForm(null),
  );
  const [phase1ReviewTouched, setPhase1ReviewTouched] = useState(false);
  const [blueprint, setBlueprint] = useState<BlueprintResult | null>(null);
  const [talentRequirements, setTalentRequirements] = useState<
    TalentRequirement[]
  >([]);
  const [showMilestoneDateDialogOnEnter, setShowMilestoneDateDialogOnEnter] =
    useState(false);
  const [activeTab, setActiveTab] = useState('executive_summary');
  const [mandatoryQuestions, setMandatoryQuestions] = useState<Question[]>([]);
  const [optionalQuestions, setOptionalQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [savingPhase1Review, setSavingPhase1Review] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);
  const [launchJob, setLaunchJob] = useState<LaunchJob | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showTalentChoiceModal, setShowTalentChoiceModal] = useState(false);

  const [downloadingBlueprintPdf, setDownloadingBlueprintPdf] = useState(false);
  const [isFinalBlueprint, setIsFinalBlueprint] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [isRefiningBlueprintSection, setIsRefiningBlueprintSection] =
    useState(false);
  const [finalizingBlueprint, setFinalizingBlueprint] = useState(false);
  const [talentRecommendationReport, setTalentRecommendationReport] =
    useState<TalentRecommendationReport | null>(null);
  const [selectedTalentKeys, setSelectedTalentKeys] = useState<
    Record<string, boolean>
  >({});
  const [talentMatchingTab, _setTalentMatchingTab] = useState<'ai' | 'manual'>(
    'manual',
  );
  const [talentRoleFilter, setTalentRoleFilter] = useState<string>('all');
  const [talentAvailabilityFilter, setTalentAvailabilityFilter] =
    useState<string>('all');
  const [talentSortFilter, setTalentSortFilter] = useState<string>('score');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeReportSection, setActiveReportSection] =
    useState<ActiveReportSection | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(
    null,
  );
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [suggestingAll, setSuggestingAll] = useState(false);
  const [usedAiSuggest, setUsedAiSuggest] = useState<Record<string, boolean>>(
    {},
  );
  const [improveAnswerCounts, setImproveAnswerCounts] = useState<
    Record<string, number>
  >({});
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({});
  const [isChatOpen, setChatOpen] = useState(true);
  const [expandedRefineFields, setExpandedRefineFields] = useState<
    Record<string, boolean>
  >({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showConnectsConfirm, setShowConnectsConfirm] = useState(false);
  const [pendingCreationType, setPendingCreationType] = useState<
    'manual' | 'ai' | null
  >(null);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const canUseChat =
    Boolean(sessionData?._id) && phase !== 'idea' && phase !== 'analysis';
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const blueprintReportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-resize all textareas when values change to eliminate scrollbars
    Object.keys(textareaRefs.current).forEach((key) => {
      const el = textareaRefs.current[key];
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, [answers, phase1Review, refineInputs, expandedRefineFields]);

  const scrollChatToBottom = () => {
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50,
    );
  };

  const handleAiSuggest = async (questionId: string, questionText: string) => {
    if (suggestingId) return;
    setSuggestingId(questionId);
    try {
      const allQuestions = [...mandatoryQuestions, ...optionalQuestions];
      const qIndex = allQuestions.findIndex((q) => q._id === questionId);
      const isMandatory = mandatoryQuestions.some((q) => q._id === questionId);
      const index = qIndex >= 0 ? qIndex + 1 : 1;
      const total = allQuestions.length || 5;
      const kind = isMandatory ? 'Mandatory' : 'Optional';
      const currentAnswer = answers[questionId]?.trim() || '';

      const region = phase1Review.region || analysis?.region_used || 'India';
      const targetAudience =
        phase1Review.targetAudience ||
        analysis?.research_analysis?.target_audience ||
        String((analysis as any)?.target_audience || 'Target startup users');
      const coreFeatures = String(
        (analysis as any)?.core_features ||
          (analysis as any)?.coreFeatures ||
          'Core MVP features',
      );

      const prompt = `You are DEHIX AI, a senior CTO and startup product architect helping a founder build their startup.

Context:
- Business Idea: "${description || sessionData?.rawIdea || ''}"
- Target Region: "${region}"
- Target Audience: "${targetAudience}"
- Core Features: "${coreFeatures}"

Question ${index} of ${total} [${kind}]: "${questionText}"
Current answer draft: "${currentAnswer}"

Rules:
- Directly answer the question as if written by the founder themselves.
- Ground every detail in the business idea, target audience, and core features above.
- Tone: Conversational, precise, and practical. Avoid robotic preambles like "Here's a suggestion:".
- Never end with vague teaser offers like "Let me know if you want me to write X" or "I can also help with Y". Answer fully now.
- Keep it concise (max 110 words) and free of jargon a non-technical founder wouldn't use.
- If this is an Optional question that does not apply to this startup, state clearly in 1 sentence why it can be skipped.

Output: the final answer text only.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: prompt,
          launchSessionId: sessionData?._id,
          clientContext: `Business idea: ${description || sessionData?.rawIdea || ''} | Region: ${region} | Features: ${coreFeatures}`,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      let reply = data.reply || '';
      reply = reply
        .replace(/```[a-zA-Z]*\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();

      setAnswers((prev) => ({
        ...prev,
        [questionId]: reply,
      }));
      setUsedAiSuggest((prev) => ({
        ...prev,
        [questionId]: true,
      }));
      toast.success('Suggested answer generated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate suggestion');
    } finally {
      setSuggestingId(null);
    }
  };

  const handleAiSuggestForAll = async () => {
    if (suggestingId || suggestingAll) return;
    setSuggestingAll(true);
    toast.info('Generating suggestions for all unanswered questions...');
    try {
      const allQuestions = [...mandatoryQuestions, ...optionalQuestions];
      const unanswered = allQuestions.filter((q) => !answers[q._id]?.trim());
      if (unanswered.length === 0) {
        toast.info('All questions are already answered.');
        setSuggestingAll(false);
        return;
      }

      const region = phase1Review.region || analysis?.region_used || 'India';
      const targetAudience =
        phase1Review.targetAudience ||
        analysis?.research_analysis?.target_audience ||
        String((analysis as any)?.target_audience || 'Target startup users');
      const coreFeatures = String(
        (analysis as any)?.core_features ||
          (analysis as any)?.coreFeatures ||
          'Core MVP features',
      );

      await Promise.all(
        unanswered.map(async (question) => {
          try {
            const qIndex = allQuestions.findIndex((q) => q._id === question._id);
            const isMandatory = mandatoryQuestions.some((q) => q._id === question._id);
            const index = qIndex >= 0 ? qIndex + 1 : 1;
            const total = allQuestions.length || 5;
            const kind = isMandatory ? 'Mandatory' : 'Optional';
            const currentAnswer = answers[question._id]?.trim() || '';

            const prompt = `You are DEHIX AI, a senior CTO and startup product architect helping a founder build their startup.

Context:
- Business Idea: "${description || sessionData?.rawIdea || ''}"
- Target Region: "${region}"
- Target Audience: "${targetAudience}"
- Core Features: "${coreFeatures}"

Question ${index} of ${total} [${kind}]: "${question.question}"
Current answer draft: "${currentAnswer}"

Rules:
- Directly answer the question as if written by the founder themselves.
- Ground every detail in the business idea, target audience, and core features above.
- Tone: Conversational, precise, and practical. Avoid robotic preambles like "Here's a suggestion:".
- Never end with vague teaser offers like "Let me know if you want me to write X" or "I can also help with Y". Answer fully now.
- Keep it concise (max 110 words) and free of jargon a non-technical founder wouldn't use.
- If this is an Optional question that does not apply to this startup, state clearly in 1 sentence why it can be skipped.

Output: the final answer text only.`;

            const res = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify({
                message: prompt,
                launchSessionId: sessionData?._id,
                clientContext: `Business idea: ${description || sessionData?.rawIdea || ''} | Region: ${region} | Features: ${coreFeatures}`,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              let reply = data.reply || '';
              reply = reply
                .replace(/```[a-zA-Z]*\n?/g, '')
                .replace(/\n?```/g, '')
                .trim();

              setAnswers((prev) => ({
                ...prev,
                [question._id]: reply,
              }));
              setUsedAiSuggest((prev) => ({
                ...prev,
                [question._id]: true,
              }));
            }
          } catch (e) {
            console.error(
              `Failed to suggest answer for question ${question._id}:`,
              e,
            );
          }
        }),
      );
      toast.success('Suggested answers generated for all questions!');
    } catch (err: any) {
      toast.error('Failed to generate suggestions for all');
    } finally {
      setSuggestingAll(false);
    }
  };

  const _handleRefineBlueprintSection = async (
    sectionId: string,
    promptText: string,
  ) => {
    if (!blueprint) return;
    setIsRefiningBlueprintSection(true);
    try {
      const sectionValue = blueprint[sectionId];
      const prompt = `You are a technical product assistant. Here is the current JSON data for the blueprint section "${sectionId}":
${JSON.stringify(sectionValue, null, 2)}

The user wants to refine this specific section based on this instruction: "${promptText}"

Return ONLY a valid raw JSON object matching the exact schema as the original object above. Do not wrap in markdown code blocks, do not include any other conversational text or explanations.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: prompt,
          launchSessionId: sessionData?._id,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      let text = data.reply || '';
      text = text
        .replace(/^```json\s*/i, '')
        .replace(/```$/, '')
        .trim();
      const updatedValue = JSON.parse(text);

      setBlueprint((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          [sectionId]: updatedValue,
        };
        return updated;
      });
      toast.success('Section refined successfully!');
      setShowFinalConfirmation(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to refine section');
    } finally {
      setIsRefiningBlueprintSection(false);
    }
  };

  const _saveBlueprintToServer = async (updatedBlueprint: any) => {
    setBlueprint(updatedBlueprint);
  };

  const handleUpdateBlueprintField = (
    sectionId: string,
    fieldKey: string,
    newValue: any,
  ) => {
    if (!blueprint) return;
    let nextBlueprint: any = null;
    if (fieldKey === sectionId) {
      nextBlueprint = {
        ...blueprint,
        [sectionId]: newValue,
      };
    } else {
      const section = (blueprint as any)[sectionId];
      const sectionObj =
        section && typeof section === 'object' && !Array.isArray(section)
          ? { ...section }
          : ({} as any);
      sectionObj[fieldKey] = newValue;
      nextBlueprint = {
        ...blueprint,
        [sectionId]: sectionObj,
      };
    }
    setBlueprint(nextBlueprint);
  };

  const handleRefineBlueprintField = async (
    sectionId: string,
    fieldKey: string,
    promptText: string,
  ) => {
    if (!blueprint) return;
    setSuggestingId(`${sectionId}_${fieldKey}`);
    setIsRefiningBlueprintSection(true);
    try {
      const currentSection = ((blueprint as any)[sectionId] ?? {}) as any;

      let currentValue: any = currentSection;
      let pathParts: string[] = [];
      if (fieldKey.includes('__')) {
        pathParts = fieldKey.split('__');
        if (pathParts.length === 2) {
          const [parentKey, childKey] = pathParts;
          if (!isNaN(Number(childKey))) {
            const idx = parseInt(childKey, 10);
            currentValue = Array.isArray(currentSection[parentKey])
              ? currentSection[parentKey][idx]
              : undefined;
          } else {
            currentValue = currentSection[parentKey]
              ? currentSection[parentKey][childKey]
              : undefined;
          }
        } else if (pathParts.length === 3) {
          const [parentKey, idxStr, childKey] = pathParts;
          const idx = parseInt(idxStr, 10);
          const item = Array.isArray(currentSection[parentKey])
            ? currentSection[parentKey][idx]
            : {};
          currentValue = item ? item[childKey] : undefined;
        }
      } else {
        currentValue =
          typeof currentSection === 'object' && currentSection !== null
            ? currentSection[fieldKey]
            : currentSection;
      }

      const prompt = `You are a technical product assistant. Here is the current value of the blueprint section "${sectionId}" under the field "${fieldKey}":
${typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : String(currentValue ?? '')}

The user wants to refine/modify this specific field value based on this instruction: "${promptText}"

Please return ONLY the refined value.
- If the original value was a simple string list or paragraph, return the refined text/markdown directly (no code blocks).
- If the original value was a JSON object/array, return ONLY a valid raw JSON object/array matching the schema, with NO conversational text or code block markdown wrappers.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: prompt,
          launchSessionId: sessionData?._id,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      let text = data.reply || '';
      text = text
        .replace(/^```json\s*/i, '')
        .replace(/```$/, '')
        .trim();

      let parsedValue: any = text;
      try {
        if (text.startsWith('[') || text.startsWith('{')) {
          parsedValue = JSON.parse(text);
        }
      } catch (e) {
        // Fallback to string if JSON parsing fails
      }

      const nextBlueprint = { ...blueprint } as any;
      const section = nextBlueprint[sectionId];
      const sectionObj =
        section && typeof section === 'object' && !Array.isArray(section)
          ? { ...section }
          : ({} as any);

      if (pathParts.length > 0) {
        if (pathParts.length === 2) {
          const [parentKey, childKey] = pathParts;
          if (!isNaN(Number(childKey))) {
            const idx = parseInt(childKey, 10);
            const list = Array.isArray(sectionObj[parentKey])
              ? [...sectionObj[parentKey]]
              : [];
            list[idx] = parsedValue;
            sectionObj[parentKey] = list;
          } else {
            const obj =
              typeof sectionObj[parentKey] === 'object' &&
              sectionObj[parentKey] !== null
                ? { ...sectionObj[parentKey] }
                : {};
            obj[childKey] = parsedValue;
            sectionObj[parentKey] = obj;
          }
        } else if (pathParts.length === 3) {
          const [parentKey, idxStr, childKey] = pathParts;
          const idx = parseInt(idxStr, 10);
          const list = Array.isArray(sectionObj[parentKey])
            ? [...sectionObj[parentKey]]
            : [];
          const item =
            typeof list[idx] === 'object' && list[idx] !== null
              ? { ...list[idx] }
              : {};
          item[childKey] = parsedValue;
          list[idx] = item;
          sectionObj[parentKey] = list;
        }
      } else {
        if (fieldKey === sectionId) {
          nextBlueprint[sectionId] = parsedValue;
        } else {
          sectionObj[fieldKey] = parsedValue;
          nextBlueprint[sectionId] = sectionObj;
        }
      }

      if (fieldKey !== sectionId) {
        nextBlueprint[sectionId] = sectionObj;
      }

      setBlueprint(nextBlueprint);
      toast.success('Field refined successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to refine field');
    } finally {
      setIsRefiningBlueprintSection(false);
      setSuggestingId(null);
    }
  };

  const handleConfirmFinal = async () => {
    if (!sessionData?._id || !blueprint || finalizingBlueprint) return;
    setFinalizingBlueprint(true);
    try {
      const res = await fetch(`/api/launch/${sessionData._id}/blueprint`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ blueprint }),
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(res, 'Failed to save blueprint modifications'),
        );
      }
      const data = await res.json();
      if (data.session) {
        setSessionData(data.session);
      }

      setIsFinalBlueprint(true);
      setShowFinalConfirmation(false);
      toast.success(
        'Blueprint finalized successfully! Please review the final output.',
      );
    } catch (err: any) {
      toast.error(
        err?.message || 'Failed to finalize blueprint. Please try again.',
      );
    } finally {
      setFinalizingBlueprint(false);
    }
  };

  const handleAiRefine = async (questionId: string, questionText: string) => {
    const currentAnswer = answers[questionId]?.trim();
    const instruction = refineInputs[questionId]?.trim();
    if (!instruction) {
      toast.error('Please enter refinement instructions');
      return;
    }
    if (!currentAnswer) {
      toast.error('No answer to refine. Suggest or write one first.');
      return;
    }
    if (suggestingId) return;
    setSuggestingId(questionId);
    try {
      const prompt = `Modify the current answer for the question based on this instruction: "${instruction}".
Question: "${questionText}"
Current Answer: "${currentAnswer}"
Please return ONLY the modified answer itself, without any introductory or conversational text (no "Here is...", no markdown code blocks), so it can replace the current input.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: prompt,
          launchSessionId: sessionData?._id,
          clientContext: `Business idea: ${sessionData?.rawIdea || ''}`,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      let reply = data.reply || '';
      reply = reply
        .replace(/```[a-zA-Z]*\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();

      setAnswers((prev) => ({
        ...prev,
        [questionId]: reply,
      }));
      setRefineInputs((prev) => ({
        ...prev,
        [questionId]: '',
      }));
      toast.success('Answer refined!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to refine answer');
    } finally {
      setSuggestingId(null);
    }
  };

  const loadLaunchChatHistory = async (launchSessionId: string) => {
    try {
      const res = await fetch(
        `/api/ai/chat-history?launchSessionId=${encodeURIComponent(launchSessionId)}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      scrollChatToBottom();
    } catch {
      // Chat history is helpful, but the launch flow should not fail if it cannot load.
    }
  };

  useEffect(() => {
    if (sessionData?._id) {
      loadLaunchChatHistory(sessionData._id);
    }
  }, [sessionData?._id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (analysis && !phase1ReviewTouched) {
      setPhase1Review(buildPhase1ReviewForm(analysis));
    }
  }, [analysis, phase1ReviewTouched]);

  useEffect(() => {
    if (phase !== 'technical') {
      setActiveQuestion(null);
    } else {
      setChatOpen(true);
      if (!activeQuestion && mandatoryQuestions.length > 0) {
        setActiveQuestion({
          questionId: mandatoryQuestions[0]._id,
          question: mandatoryQuestions[0].question,
          kind: 'mandatory',
          index: 0,
        });
      }
    }
    if (phase !== 'analysis' && phase !== 'blueprint') {
      setActiveReportSection(null);
    } else if (phase === 'blueprint' && !activeReportSection) {
      setActiveReportSection({
        id: activeTab,
        title: humanizeKey(activeTab),
      });
    }
  }, [phase, mandatoryQuestions, activeQuestion, activeReportSection, activeTab]);

  useEffect(() => {
    if (!launchJob?.sessionId) return;

    let cancelled = false;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/launch/${launchJob.sessionId}/status`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) {
          throw new Error(
            await readApiError(res, 'Failed to check generation status'),
          );
        }
        const data = await res.json();
        if (cancelled) return;

        if (data.session) setSessionData(data.session);
        if (data.analysis) setAnalysis(data.analysis);
        if (data.blueprint) setBlueprint(data.blueprint);

        const status: PhaseJobStatus =
          launchJob.phase === 'analysis'
            ? (data.phase1Status ?? (data.analysis ? 'ready' : 'generating'))
            : (data.phase2Status ?? (data.blueprint ? 'ready' : 'generating'));

        setLaunchJob((current) => (current ? { ...current, status } : current));

        if (status === 'ready') {
          setLaunchJob(null);
          setValidating(false);
          setGeneratingBlueprint(false);
          setPhase(launchJob.phase);
          toast.success(
            launchJob.phase === 'analysis'
              ? 'Business analysis is ready'
              : 'Blueprint report is ready',
          );
        }

        if (status === 'failed') {
          const msg =
            launchJob.phase === 'analysis'
              ? (data.phase1Error ?? 'Business analysis failed')
              : (data.phase2Error ?? 'Blueprint generation failed');
          setLaunchJob(null);
          setValidating(false);
          setGeneratingBlueprint(false);
          setError(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message ?? 'Failed to check generation status';
        setLaunchJob(null);
        setValidating(false);
        setGeneratingBlueprint(false);
        setError(msg);
        toast.error(msg);
      }
    };

    pollStatus();
    const intervalId = setInterval(pollStatus, 2500);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [launchJob?.sessionId, launchJob?.phase]);

  const askLaunchAi = async (
    suggestedMessage?: string,
    userDisplayText?: string,
  ) => {
    const message = (suggestedMessage ?? chatInput).trim();
    if (!message || aiLoading) return;
    if (!sessionData?._id) {
      toast.info(
        'Analyze the business idea first, then the AI can use the saved Phase 1 context.',
      );
      return;
    }

    const displayMsg = (userDisplayText ?? chatInput).trim() || message;

    setChatInput('');
    setAiLoading(true);
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      userId: user?._id,
      userName: user?.name ?? 'You',
      message: displayMsg,
      isAi: false,
      createdAt: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    scrollChatToBottom();

    try {
      const region = phase1Review.region || analysis?.region_used || 'India';
      const targetAudience =
        phase1Review.targetAudience ||
        analysis?.research_analysis?.target_audience ||
        String((analysis as any)?.target_audience || 'Target startup users');
      const coreFeatures = String(
        (analysis as any)?.core_features ||
          (analysis as any)?.coreFeatures ||
          'Core MVP features',
      );

      const clientContext = [
        `SYSTEM PERSONA: You are DEHIX AI, a senior CTO and startup product architect assisting a non-technical founder.`,
        `BEHAVIOR & TONE RULES:\n- Warm, conversational, precise, and practical. Avoid robotic preambles like "Sure!", "As DEHIX AI...", "Certainly!".\n- ADAPTIVE LENGTH: Answer direct queries in 2-3 concise sentences or 3 short bullet points (max 90 words). Provide longer breakdowns only when explicitly requested.\n- DIRECT RESPONSE: Answer the question completely in this turn. NEVER end responses with vague teaser offers like "Let me know if you want me to write X" or "I can also provide Y".`,
        `CONTEXT GROUNDING:\n- Business Idea: "${description || sessionData?.rawIdea || ''}"\n- Target Region: "${region}"\n- Target Audience: "${targetAudience}"\n- Core MVP Features: "${coreFeatures}"\n- Current frontend phase: ${phase}`,
        `Active report section:\n${activeReportSection ? `${activeReportSection.title} (${activeReportSection.id})` : 'No report section selected.'}`,
        `Focused Phase 2 question:\n${activeQuestion ? `${activeQuestion.kind} question ${activeQuestion.index + 1}: ${activeQuestion.question}\nCurrent answer: ${answers[activeQuestion.questionId]?.trim() || 'Not answered yet'}` : 'No Phase 2 question focused.'}`,
        `Mandatory Phase 2 questions and currently typed answers:\n${
          mandatoryQuestions
            .map((question, index) => {
              const answer = answers[question._id]?.trim();
              return `${index + 1}. ${question.question}\nAnswer: ${answer || 'Not answered yet'}`;
            })
            .join('\n\n') || 'Mandatory questions not loaded yet.'
        }`,
        `Optional AI questions and currently typed answers:\n${
          optionalQuestions
            .map((question, index) => {
              const answer = answers[question._id]?.trim();
              return `${index + 1}. ${question.question}\nAnswer: ${answer || 'Not answered yet'}`;
            })
            .join('\n\n') || 'Optional questions not loaded yet.'
        }`,
      ].join('\n\n');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message,
          launchSessionId: sessionData._id,
          clientContext,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'AI request failed');
      const textReply = (data.reply || data.message?.message || '').trim();
      const aiMessage: ChatMessage = data.message ?? {
        id: `ai-${Date.now()}`,
        userName: 'DEHIX AI',
        message: textReply || "I couldn't process that.",
        isAi: true,
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      scrollChatToBottom();

      if (
        phase === 'technical' &&
        activeQuestion?.questionId &&
        textReply &&
        !textReply.toLowerCase().includes("there's no answer yet to improve") &&
        !textReply.toLowerCase().includes('i am dehix ai')
      ) {
        const lowerMsg = (message + ' ' + displayMsg).toLowerCase();
        const isExplanation =
          lowerMsg.includes('explain') ||
          lowerMsg.includes('what does') ||
          lowerMsg.includes('what is') ||
          lowerMsg.includes('meaning') ||
          lowerMsg.includes('why');

        const isAnswerUpdate =
          !isExplanation &&
          (lowerMsg.includes('improve') ||
            lowerMsg.includes('suggest') ||
            lowerMsg.includes('recommend') ||
            lowerMsg.includes('rewrite') ||
            lowerMsg.includes('current answer is non-empty') ||
            lowerMsg.includes('write answer') ||
            lowerMsg.includes('fill answer') ||
            lowerMsg.includes('give answer') ||
            lowerMsg.includes('better answer') ||
            lowerMsg.includes('task: recommend'));

        if (isAnswerUpdate) {
          const cleanAnswer = textReply
            .replace(/```[a-zA-Z]*\n?/g, '')
            .replace(/\n?```/g, '')
            .replace(/^["']|["']$/g, '')
            .trim();
          setAnswers((prev) => ({
            ...prev,
            [activeQuestion.questionId]: cleanAnswer,
          }));
          setUsedAiSuggest((prev) => ({
            ...prev,
            [activeQuestion.questionId]: true,
          }));
          toast.success(
            `Answer updated for Question ${activeQuestion.index + 1}!`,
          );
        }
      }
    } catch (err: any) {
      const aiMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        userName: 'DEHIX AI',
        message: err?.message ?? 'AI request failed',
        isAi: true,
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      scrollChatToBottom();
    } finally {
      setAiLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'business') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Business account required</p>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </div>
    );
  }

  const validateIdea = async () => {
    if (!description.trim() || description.length < 20 || validating) return;
    setValidating(true);
    setError('');
    setPhase1ReviewTouched(false);
    try {
      const title =
        description.trim().slice(0, 60) +
        (description.length > 60 ? '...' : '');
      const res = await fetch('/api/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          rawIdea: description.trim(),
          projectTitle: title,
        }),
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(
            res,
            'Gemini AI failed to analyze the business idea',
          ),
        );
      }
      const data = await res.json();
      setSessionData(data.session);
      setAnalysis(data.analysis ?? null);
      if (data.analysis) {
        setPhase1Review(buildPhase1ReviewForm(data.analysis));
      }
      setBlueprint(null);
      setTalentRecommendationReport(null);
      setPhase('analysis');
      if (data.analysis) {
        setValidating(false);
      } else if (data.session?._id) {
        setLaunchJob({
          phase: 'analysis',
          sessionId: data.session._id,
          status: data.phase1Status ?? 'generating',
        });
      } else {
        setValidating(false);
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to analyze idea';
      setError(msg);
      toast.error(msg);
      setValidating(false);
    }
  };

  const updatePhase1ReviewField = (
    field: keyof Phase1ReviewForm,
    value: string,
  ) => {
    setPhase1ReviewTouched(true);
    setPhase1Review((current) => ({ ...current, [field]: value }));
  };

  const handlePhase1FieldRefine = async (
    field: keyof Phase1ReviewForm,
    fieldLabel: string,
  ) => {
    const currentVal = phase1Review[field]?.trim();
    const instruction = refineInputs[field]?.trim();
    if (!instruction) {
      toast.error('Please enter refinement instructions');
      return;
    }
    if (!currentVal) {
      toast.error('No content to refine. Write some first.');
      return;
    }
    if (suggestingId) return;
    setSuggestingId(field);
    try {
      const prompt = `Modify the current text for the business review field "${fieldLabel}" based on this instruction: "${instruction}".
Current Text: "${currentVal}"
Business Idea: "${sessionData?.rawIdea || description || ''}"
Please return ONLY the modified text itself, without any introductory or conversational text (no "Here is...", no markdown code blocks), so it can replace the current input.`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: prompt,
          launchSessionId: sessionData?._id,
          clientContext: `Business idea: ${sessionData?.rawIdea || ''}`,
        }),
      });

      if (!res.ok) throw new Error('AI refinement failed');
      const data = await res.json();
      let reply = data.reply || '';
      reply = reply
        .replace(/```[a-zA-Z]*\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();

      setPhase1Review((prev) => ({
        ...prev,
        [field]: reply,
      }));
      setPhase1ReviewTouched(true);
      setRefineInputs((prev) => ({
        ...prev,
        [field]: '',
      }));
      toast.success(`Refined ${fieldLabel}!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to refine');
    } finally {
      setSuggestingId(null);
    }
  };

  const renderPhase1ReviewField = (
    field: keyof Phase1ReviewForm,
    label: string,
    placeholder: string,
    isTextarea: boolean = true,
  ) => {
    const value = phase1Review[field] || '';
    const refineVal = refineInputs[field] || '';
    const isRefiningThis = suggestingId === field;
    const isRefineOpen = expandedRefineFields[field] || false;

    return (
      <div className="space-y-2 rounded-xl border border-border/30 bg-background/20 p-4 transition-all hover:border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{label}</span>

          {field !== 'region' && value.trim() && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                isRefineOpen
                  ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20'
                  : 'bg-primary/5 text-primary hover:bg-primary/10'
              }`}
              onClick={() => {
                setExpandedRefineFields((prev) => ({
                  ...prev,
                  [field]: !prev[field],
                }));
              }}
            >
              <Sparkles className="h-3 w-3" />
              {isRefineOpen ? 'Close Refine' : 'Refine'}
            </Button>
          )}
        </div>

        {isTextarea ? (
          <textarea
            value={value}
            onChange={(event) => {
              updatePhase1ReviewField(field, event.target.value);
              event.target.style.height = 'auto';
              event.target.style.height = `${event.target.scrollHeight}px`;
            }}
            ref={(el) => {
              textareaRefs.current[field] = el;
              if (el) {
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
            placeholder={placeholder}
            className="w-full min-h-[96px] bg-background/55 text-foreground placeholder:text-muted-foreground/45 resize-none p-3 rounded-lg border border-border/40 outline-none text-sm focus:border-primary/45 focus:ring-1 focus:ring-primary/25 transition-all leading-relaxed overflow-hidden"
          />
        ) : (
          <input
            value={value}
            onChange={(event) =>
              updatePhase1ReviewField(field, event.target.value)
            }
            placeholder={placeholder}
            className="h-11 w-full bg-background/55 text-foreground placeholder:text-muted-foreground/45 px-3 rounded-lg border border-border/40 outline-none text-sm focus:border-primary/45 focus:ring-1 focus:ring-primary/25 transition-all"
          />
        )}

        {field !== 'region' && value.trim() && isRefineOpen && (
          <div className="space-y-2 bg-card border border-border/40 rounded-lg p-2.5 transition-all animate-in slide-in-from-top-1 duration-200">
            <textarea
              value={refineVal}
              onChange={(e) => {
                setRefineInputs({ ...refineInputs, [field]: e.target.value });
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              ref={(el) => {
                textareaRefs.current[`refine_${field}`] = el;
                if (el) {
                  el.style.height = 'auto';
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
              placeholder="Refine text (e.g., 'make it B2B model', 'add competitor X')"
              rows={1}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/45 outline-none px-2 resize-none min-h-[32px] leading-relaxed overflow-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePhase1FieldRefine(field, label);
                }
              }}
            />
            <div className="flex justify-end border-t border-border/20 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="h-7 px-3 text-xs text-primary bg-primary/5 hover:bg-primary/10 gap-1"
                onClick={() => handlePhase1FieldRefine(field, label)}
                disabled={suggestingId !== null || !refineVal.trim()}
              >
                {isRefiningThis ? (
                  <>
                    <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>Refine</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const confirmPhase1Review = async () => {
    if (!sessionData?._id || savingPhase1Review) return false;
    setSavingPhase1Review(true);
    setError('');
    try {
      const payload: Phase1ReviewForm = {
        ...phase1Review,
        region: phase1Review.region.trim() || 'India',
      };
      const res = await fetch(
        `/api/launch/${sessionData._id}/phase1-confirmation`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        throw new Error(
          await readApiError(res, 'Failed to save Phase 1 edits'),
        );
      }
      const data = await res.json();
      if (data.session) setSessionData(data.session);
      if (data.analysis) {
        setAnalysis(data.analysis);
        setPhase1Review(buildPhase1ReviewForm(data.analysis));
      }
      setBlueprint(data.blueprint ?? null);
      setTalentRecommendationReport(null);
      setPhase1ReviewTouched(false);
      return true;
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to save Phase 1 edits';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setSavingPhase1Review(false);
    }
  };

  const downloadBlueprintPdf = async () => {
    if (!sessionData?._id || downloadingBlueprintPdf) return;
    setDownloadingBlueprintPdf(true);
    setError('');
    try {
      const res = await fetch(
        `/api/launch/${sessionData._id}/business-blueprint.pdf`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          text ? JSON.parse(text).error : 'Failed to download blueprint PDF',
        );
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `business-blueprint-${sessionData._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to download blueprint PDF';
      setError(msg);
      toast.error(msg);
    } finally {
      setDownloadingBlueprintPdf(false);
    }
  };

  const loadTechnicalQuestions = async (sessionId = sessionData?._id) => {
    if (!sessionId || loadingQuestions) return;
    setLoadingQuestions(true);
    setError('');
    setMandatoryQuestions(FALLBACK_MANDATORY_QUESTIONS);
    setOptionalQuestions([]);
    try {
      const res = await fetch(`/api/launch/${sessionId}/technical-questions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(
            res,
            'Gemini AI failed to prepare technical questions',
          ),
        );
      }
      const data = await res.json();
      const fetchedMandatoryQuestions =
        Array.isArray(data.mandatoryQuestions) &&
        data.mandatoryQuestions.length > 0
          ? data.mandatoryQuestions
          : FALLBACK_MANDATORY_QUESTIONS;
      setMandatoryQuestions(fetchedMandatoryQuestions);
      setOptionalQuestions(
        Array.isArray(data.optionalQuestions) ? data.optionalQuestions : [],
      );
      if (data.optionalQuestionError) {
        toast.warning(data.optionalQuestionError);
      }
      setPhase('technical');
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to prepare technical questions';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const confirmPhase1AndLoadQuestions = async () => {
    if (!sessionData?._id || savingPhase1Review || loadingQuestions) return;
    const saved = await confirmPhase1Review();
    if (saved) {
      toast.success('Phase 1 assumptions saved');
      await loadTechnicalQuestions(sessionData._id);
    }
  };

  const generateBlueprint = async () => {
    if (!sessionData?._id || generatingBlueprint) return;
    const missing = mandatoryQuestions.filter(
      (question) => !answers[question._id]?.trim(),
    );
    if (missing.length > 0) {
      toast.error('Please answer all mandatory questions');
      return;
    }

    setGeneratingBlueprint(true);
    setError('');
    try {
      const allQuestions = [...mandatoryQuestions, ...optionalQuestions];
      const answersPayload = allQuestions
        .map((question) => ({
          questionId: question._id,
          answer: answers[question._id]?.trim() ?? '',
        }))
        .filter((item) => item.answer);

      const res = await fetch(`/api/launch/${sessionData._id}/blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(res, 'Gemini AI failed to generate the blueprint'),
        );
      }
      const data = await res.json();
      setBlueprint(data.blueprint ?? null);
      setTalentRequirements([]);
      if (data.session) {
        setSessionData(data.session);
      }
      setPhase('blueprint');
      if (data.blueprint) {
        setGeneratingBlueprint(false);
      } else if (data.session?._id) {
        setLaunchJob({
          phase: 'blueprint',
          sessionId: data.session._id,
          status: data.phase2Status ?? 'generating',
        });
      } else {
        setGeneratingBlueprint(false);
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to generate blueprint';
      setError(msg);
      toast.error(msg);
      setGeneratingBlueprint(false);
    }
  };

  const generateTalentRecommendations = async () => {
    if (!sessionData?._id || loadingRecommendations) return;
    setLoadingRecommendations(true);
    setError('');
    try {
      const currentReqs =
        talentRequirements.length > 0
          ? talentRequirements
          : estimateTalentRequirements(blueprint, analysis);
      const payload = {
        talentRequirements: currentReqs.map((r) => ({
          roleTitle: r.roleTitle,
          businessSelectedCount: r.businessSelectedCount,
          aiSuggestedCount: r.aiSuggestedCount,
          skillDomain: r.skillDomain,
        })),
      };

      const res = await fetch(
        `/api/launch/${sessionData._id}/talent-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        throw new Error(
          await readApiError(res, 'Failed to generate talent recommendations'),
        );
      }
      const data = await res.json();
      const report: TalentRecommendationReport = {
        budgetUsd: data.budgetUsd ?? null,
        roleCount: data.roleCount ?? 0,
        recommendedTeams: Array.isArray(data.recommendedTeams)
          ? data.recommendedTeams
          : undefined,
        recommendations: Array.isArray(data.recommendations)
          ? data.recommendations
          : [],
        manualFreelancers: Array.isArray(data.manualFreelancers)
          ? data.manualFreelancers
          : [],
      };
      setTalentRecommendationReport(report);
      setSelectedTalentKeys(
        buildDefaultSelectedTalentKeys(report, currentReqs),
      );
      setPhase('recommendations');
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to generate talent recommendations';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const recommendationKey = (
    recommendation: TalentRecommendation,
    mode?: 'ai' | 'manual',
  ) => {
    const prefix = mode || (talentMatchingTab === 'ai' ? 'ai' : 'manual');
    return `${prefix}:${recommendation.talentId}:${recommendation.matchedRole.roleTitle}`;
  };

  const toggleTalentSelection = (
    recommendation: TalentRecommendation,
    mode?: 'ai' | 'manual',
  ) => {
    const key = recommendationKey(recommendation, mode);
    setSelectedTalentKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const buildDefaultSelectedTalentKeys = (
    report: TalentRecommendationReport,
    activeReqs?: TalentRequirement[],
  ) => {
    const defaults: Record<string, boolean> = {};
    const reqsList = activeReqs || talentRequirements;
    const groups =
      Array.isArray(report.recommendedTeams) &&
      report.recommendedTeams.length > 0
        ? report.recommendedTeams
        : Object.values(
            report.recommendations.reduce<
              Record<string, RoleRecommendationGroup>
            >((acc, recommendation) => {
              const key = recommendation.matchedRole.roleTitle;
              if (!acc[key]) {
                acc[key] = {
                  role: recommendation.matchedRole,
                  availableMatches: [],
                  unavailableMatches: [],
                  topMatches: [],
                };
              }
              acc[key].topMatches.push(recommendation);
              if (
                (recommendation.user.availabilityRank ??
                  (recommendation.user.isOnline ? 4 : 0)) >= 2
              ) {
                acc[key].availableMatches.push(recommendation);
              } else {
                acc[key].unavailableMatches.push(recommendation);
              }
              return acc;
            }, {}),
          );

    const alreadyPickedTalentIds = new Set<string>();
    for (const group of groups) {
      const roleTitle = group.role?.roleTitle;
      const matchingReq = reqsList.find(
        (r) =>
          r.roleTitle.toLowerCase() === roleTitle?.toLowerCase() ||
          r.roleTitle.toLowerCase().includes(roleTitle?.toLowerCase() || '') ||
          (roleTitle || '').toLowerCase().includes(r.roleTitle.toLowerCase()),
      );
      const targetCount = matchingReq ? matchingReq.businessSelectedCount : 1;

      const ordered = [
        ...(group.availableMatches ?? []),
        ...(group.topMatches ?? []),
        ...(group.unavailableMatches ?? []),
      ];

      let pickedForGroup = 0;
      for (const recommendation of ordered) {
        if (pickedForGroup >= targetCount) break;
        const key = String(recommendation.talentId);
        if (!alreadyPickedTalentIds.has(key)) {
          alreadyPickedTalentIds.add(key);
          defaults[recommendationKey(recommendation, 'ai')] = true;
          defaults[recommendationKey(recommendation, 'manual')] = true;
          pickedForGroup++;
        }
      }
    }
    return defaults;
  };

  const _groupedRecommendationTeams: RoleRecommendationGroup[] =
    talentRecommendationReport?.recommendedTeams?.length
      ? talentRecommendationReport.recommendedTeams
      : talentRecommendationReport
        ? Object.values(
            talentRecommendationReport.recommendations.reduce<
              Record<string, RoleRecommendationGroup>
            >((groups, recommendation) => {
              const key = recommendation.matchedRole.roleTitle;
              if (!groups[key]) {
                groups[key] = {
                  role: recommendation.matchedRole,
                  availableMatches: [],
                  unavailableMatches: [],
                  topMatches: [],
                };
              }
              groups[key].topMatches.push(recommendation);
              if (
                (recommendation.user.availabilityRank ??
                  (recommendation.user.isOnline ? 4 : 0)) >= 2
              ) {
                groups[key].availableMatches.push(recommendation);
              } else {
                groups[key].unavailableMatches.push(recommendation);
              }
              return groups;
            }, {}),
          )
        : [];

  const _groupedManualTeams: RoleRecommendationGroup[] =
    talentRecommendationReport?.manualFreelancers
      ? Object.values(
          talentRecommendationReport.manualFreelancers.reduce<
            Record<string, RoleRecommendationGroup>
          >((groups, recommendation) => {
            const key = recommendation.matchedRole.roleTitle;
            if (!groups[key]) {
              groups[key] = {
                role: recommendation.matchedRole,
                availableMatches: [],
                unavailableMatches: [],
                topMatches: [],
              };
            }
            groups[key].topMatches.push(recommendation);
            if (
              (recommendation.user.availabilityRank ??
                (recommendation.user.isOnline ? 4 : 0)) >= 2
            ) {
              groups[key].availableMatches.push(recommendation);
            } else {
              groups[key].unavailableMatches.push(recommendation);
            }
            return groups;
          }, {}),
        )
      : [];

  const selectedTalentRecommendations = talentRecommendationReport
    ? talentMatchingTab === 'ai'
      ? talentRecommendationReport.recommendations.filter(
          (recommendation) =>
            selectedTalentKeys[recommendationKey(recommendation, 'ai')],
        )
      : (talentRecommendationReport.manualFreelancers || []).filter(
          (recommendation) =>
            selectedTalentKeys[recommendationKey(recommendation, 'manual')],
        )
    : [];

  const enterRoomDashboard = async () => {
    if (!sessionData?._id || creatingRoom || isRedirecting) return;
    const missing = mandatoryQuestions.filter(
      (question) => !answers[question._id]?.trim(),
    );
    if (missing.length > 0) {
      toast.error('Please answer all mandatory questions');
      setPhase('technical');
      return;
    }

    if (talentRequirements.length > 0) {
      for (const req of talentRequirements) {
        if (req.businessSelectedCount > 0) {
          const selectedForRole = selectedTalentRecommendations.filter(
            (t) =>
              t.matchedRole?.roleTitle?.toLowerCase() ===
                req.roleTitle.toLowerCase() ||
              t.matchedRole?.roleTitle
                ?.toLowerCase()
                .includes(req.roleTitle.toLowerCase()) ||
              req.roleTitle
                .toLowerCase()
                .includes(t.matchedRole?.roleTitle?.toLowerCase() || ''),
          ).length;
          if (selectedForRole < req.businessSelectedCount) {
            toast.warning(
              `${req.roleTitle} requires ${req.businessSelectedCount} talents. You selected ${selectedForRole}.`,
            );
          }
        }
      }
    }

    setCreatingRoom(true);
    setCreationError(null);
    setIsRedirecting(false);
    setError('');
    let shouldResetState = true;

    try {
      const allQuestions = [...mandatoryQuestions, ...optionalQuestions];
      const answersPayload = allQuestions
        .map((question) => ({
          questionId: question._id,
          answer: answers[question._id]?.trim() ?? '',
        }))
        .filter((item) => item.answer);

      const res = await fetch(`/api/launch/${sessionData._id}/scope`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          answers: answersPayload,
          selectedTalentRecommendations,
        }),
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(
            res,
            'Gemini AI failed to create the room dashboard',
          ),
        );
      }
      const room = await res.json();
      if (typeof room?.remainingConnects === 'number') {
        updateConnectsBalance(room.remainingConnects);
      } else {
        const currentConnects = parseInt(
          localStorage.getItem('DHX_CONNECTS') || '0',
          10,
        );
        updateConnectsBalance(Math.max(0, currentConnects - 150));
      }

      shouldResetState = false;
      setIsRedirecting(true);
      navigate(`/room/${room._id}`);
    } catch (err: any) {
      const msg =
        err?.message ??
        'Room creation failed. No connects were deducted if the room was not created.';
      setError(msg);
      toast.error(msg);
      setCreationError(msg);
    } finally {
      if (shouldResetState) {
        setCreatingRoom(false);
        setIsRedirecting(false);
      }
    }
  };

  const handleDirectAiTalentSelection = async () => {
    if (!sessionData?._id || creatingRoom || isRedirecting) return;
    setShowTalentChoiceModal(false);
    setCreatingRoom(true);
    setCreationError(null);
    setIsRedirecting(false);
    setError('');
    let shouldResetState = true;

    try {
      // 1. Fetch talent recommendations using selected headcount per role
      const currentReqs =
        talentRequirements.length > 0
          ? talentRequirements
          : estimateTalentRequirements(blueprint, analysis);
      const payload = {
        talentRequirements: currentReqs.map((r) => ({
          roleTitle: r.roleTitle,
          businessSelectedCount: r.businessSelectedCount,
          aiSuggestedCount: r.aiSuggestedCount,
          skillDomain: r.skillDomain,
        })),
      };

      const recommendationsRes = await fetch(
        `/api/launch/${sessionData._id}/talent-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!recommendationsRes.ok) {
        throw new Error(
          await readApiError(
            recommendationsRes,
            'Failed to generate talent recommendations',
          ),
        );
      }
      const data = await recommendationsRes.json();

      const recommendationsList = Array.isArray(data.recommendations)
        ? data.recommendations
        : [];

      // 2. Prepare scoping and create the room with all recommendations
      const allQuestions = [...mandatoryQuestions, ...optionalQuestions];
      const answersPayload = allQuestions
        .map((question) => ({
          questionId: question._id,
          answer: answers[question._id]?.trim() ?? '',
        }))
        .filter((item) => item.answer);

      const res = await fetch(`/api/launch/${sessionData._id}/scope`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          answers: answersPayload,
          selectedTalentRecommendations: recommendationsList,
          isAiSelected: true,
        }),
      });
      if (!res.ok) {
        throw new Error(
          await readApiError(res, 'Failed to create the room dashboard'),
        );
      }
      const room = await res.json();
      if (typeof room?.remainingConnects === 'number') {
        updateConnectsBalance(room.remainingConnects);
      } else {
        const currentConnects = parseInt(
          localStorage.getItem('DHX_CONNECTS') || '0',
          10,
        );
        updateConnectsBalance(Math.max(0, currentConnects - 150));
      }

      shouldResetState = false;
      setIsRedirecting(true);
      navigate(`/room/${room._id}`);
    } catch (err: any) {
      const msg =
        err?.message ??
        'Room creation failed. No connects were deducted if the room was not created.';
      setError(msg);
      toast.error(msg);
      setCreationError(msg);
    } finally {
      if (shouldResetState) {
        setCreatingRoom(false);
        setIsRedirecting(false);
      }
    }
  };
  const research = analysis?.research_analysis;
  const allQuestionsList = [...mandatoryQuestions, ...optionalQuestions];
  const allSuggestedOrAnswered =
    allQuestionsList.length > 0 &&
    allQuestionsList.every(
      (q) =>
        usedAiSuggest[q._id] ||
        (answers[q._id] && String(answers[q._id]).trim().length > 0),
    );

  const isLoaderActive =
    validating ||
    generatingBlueprint ||
    Boolean(launchJob) ||
    creatingRoom ||
    loadingQuestions ||
    loadingRecommendations ||
    savingPhase1Review ||
    aiLoading ||
    isRedirecting ||
    finalizingBlueprint ||
    downloadingBlueprintPdf ||
    isRefiningBlueprintSection;

  const activeReportSectionForSuggestions =
    activeReportSection ||
    ((phase === 'blueprint' || phase === 'analysis') && activeTab
      ? {
          id: activeTab,
          title: activeTab
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        }
      : null);

  const smartSuggestions = isLoaderActive
    ? []
    : buildSmartSuggestions({
        phase,
        activeReportSection: activeReportSectionForSuggestions,
        activeQuestion,
        idea: description || sessionData?.rawIdea || '',
        region: phase1Review.region || analysis?.region_used || 'India',
        totalQuestions:
          (mandatoryQuestions.length || 5) + (optionalQuestions.length || 0),
        answers,
        usedAiSuggest,
      });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/90 backdrop-blur-sm">
        <div
          className={`${!canUseChat || !isChatOpen ? 'max-w-5xl' : 'max-w-[1400px]'} mx-auto px-6 h-14 flex items-center justify-between transition-all duration-300`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/business/dashboard')}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors shrink-0"
            >
              Back to dashboard
            </button>
            <span className="text-border shrink-0">/</span>
            <span className="text-sm font-medium shrink-0">New Live Room</span>
            {sessionData?.projectTitle && (
              <>
                <span className="text-border shrink-0">/</span>
                <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
                  {sessionData.projectTitle}
                </span>
              </>
            )}
          </div>
          {canUseChat && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 font-medium transition-all"
              onClick={() => {
                setChatOpen(!isChatOpen);
                if (!isChatOpen) {
                  scrollChatToBottom();
                }
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              {isChatOpen ? 'Hide Chat' : 'Show Chat'}
            </Button>
          )}
        </div>
      </div>

      <div
        className={`${
          !canUseChat || !isChatOpen
            ? 'max-w-5xl'
            : 'max-w-[1400px] grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'
        } mx-auto px-6 py-10 transition-all duration-300`}
      >
        <main className="min-w-0">
          <div className="mb-8 grid gap-2 text-xs sm:grid-cols-4">
            {[
              ['idea', '1', 'Idea input'],
              ['analysis', '2', 'Business analysis'],
              ['technical', '3', 'Blueprint report'],
              ['recommendations', '4', 'Talent matches'],
            ].map(([key, number, label]) => {
              const active =
                phase === key ||
                (phase === 'blueprint' && key === 'technical') ||
                (phase === 'talent_requirements' && key === 'technical') ||
                (phase === 'milestones' && key === 'technical');
              return (
                <div
                  key={key}
                  className={`rounded-lg border px-3 py-2 ${
                    active
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border/40 bg-card/40 text-muted-foreground'
                  }`}
                >
                  <span className="font-mono mr-2">{number}</span>
                  {label}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {creatingRoom ? (
            <PremiumLoader
              title="Assembling Your Live Room"
              subtitle="Creating your dashboard, setting up team channels, deducting 150 connects, and launching workspace..."
            />
          ) : (
            <>
              {phase === 'idea' &&
                (validating ? (
                  <PremiumLoader
                    title="Validating Business Idea"
                    subtitle="Evaluating market demand, defining target audience personas, examining competitors, scoring potential, and framing the initial business concept..."
                  />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                        Phase 1
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight mb-3">
                        Shape your project vision
                      </h1>
                      <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                        Describe your business idea or product vision in your
                        own words. We will evaluate the market potential, define
                        target personas, map competitors, and frame the initial
                        business model to kickstart your launch room.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card overflow-hidden focus-within:border-primary/40 transition-colors">
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            if (!validating && description.trim().length >= 20) {
                              validateIdea();
                            }
                          }
                        }}
                        placeholder="Example: I want to build a platform for local restaurants to predict demand and reduce ingredient waste..."
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/40 resize-none p-6 outline-none text-base leading-relaxed min-h-[190px]"
                        rows={7}
                      />
                      <div className="border-t border-border/40 px-6 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span
                            className={
                              description.length < 20
                                ? 'text-muted-foreground/40'
                                : 'text-muted-foreground font-medium'
                            }
                          >
                            {description.length} chars{' '}
                            {description.length < 20 && description.length > 0
                              ? '- add more detail'
                              : ''}
                          </span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/75 font-medium">
                            Press{' '}
                            <kbd className="px-1.5 py-0.5 rounded-md bg-muted/60 border border-border/70 font-mono text-[10px] text-foreground font-semibold shadow-2xs">
                              Ctrl + Enter
                            </kbd>{' '}
                            to analyze
                          </span>
                        </div>
                        <Button
                          onClick={validateIdea}
                          disabled={
                            validating || description.trim().length < 20
                          }
                          className="font-semibold shadow-sm px-5"
                        >
                          Analyze business
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

              {phase === 'analysis' && !analysis && (
                <PremiumLoader
                  title="Generating Business Analysis"
                  subtitle="Market, audience, competitor, revenue, risk, SWOT, scores, and verdict sections are being produced in the background..."
                />
              )}

              {phase === 'analysis' &&
                analysis &&
                (savingPhase1Review || loadingQuestions ? (
                  <PremiumLoader
                    title={
                      savingPhase1Review
                        ? 'Saving Business Review'
                        : 'Preparing Blueprint Questions'
                    }
                    subtitle={
                      savingPhase1Review
                        ? 'Updating launch session with your confirmed assumptions, target audiences, and market configurations...'
                        : 'Formulating targeted mandatory and optional technical scoping questions for your blueprint...'
                    }
                  />
                ) : (
                  <div className="space-y-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                          Phase 2 output
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                          Business analysis result
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                          {analysis.idea_summary}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => setPhase('idea')}
                          disabled={loadingQuestions}
                        >
                          Edit idea
                        </Button>
                      </div>
                    </div>

                    {/* Redesigned Metrics Grid */}
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Verdict Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-background p-6 shadow-md transition-all duration-300 hover:border-primary/30">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Analysis Verdict
                          </span>
                          {research?.final_verdict && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                research.final_verdict
                                  .toLowerCase()
                                  .includes('ready') ||
                                research.final_verdict
                                  .toLowerCase()
                                  .includes('viable')
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                  : research.final_verdict
                                        .toLowerCase()
                                        .includes('scoping') ||
                                      research.final_verdict
                                        .toLowerCase()
                                        .includes('work')
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                    : 'bg-red-500/10 text-red-500 border border-red-500/25'
                              }`}
                            >
                              {research.final_verdict}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-foreground">
                            {research?.final_verdict
                              ?.toLowerCase()
                              .includes('viable')
                              ? 'Strong Potential'
                              : 'Needs Refinement'}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {research?.verdict_reasoning ??
                              'The initial analysis is complete. Review the suggestions and warnings before proceeding.'}
                          </p>
                        </div>
                      </div>

                      {/* Overall Score Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-background p-6 shadow-md flex items-center gap-6 transition-all duration-300 hover:border-primary/30">
                        <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-muted/10"
                              fill="transparent"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-primary transition-all duration-1000 ease-out"
                              strokeDasharray={2 * Math.PI * 40}
                              strokeDashoffset={
                                2 *
                                Math.PI *
                                40 *
                                (1 - (research?.overall_score ?? 0) / 10)
                              }
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-extrabold font-mono text-foreground leading-none">
                              {research?.overall_score ?? 'N/A'}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              / 10
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Overall Score
                          </span>
                          <h3 className="text-xl font-bold text-foreground">
                            Idea Viability
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Composite score based on market size, feasibility,
                            demand & competitive advantage.
                          </p>
                        </div>
                      </div>

                      {/* Region Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-background p-6 shadow-md transition-all duration-300 hover:border-primary/30">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Target Region
                          </span>
                          <MapPin className="h-5 w-5 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                            {analysis.region_used ?? 'Global'}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Analysis calibrated for local demographics, regional
                            regulations, and specific market dynamics.
                          </p>
                          {analysis.needs_clarification && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>
                                AI flagged this idea for clarification.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Redesigned Business Review Form */}
                    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-card/80 to-card/40 p-6 space-y-6 shadow-lg">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              Business Review
                            </span>
                            {sessionData?.phase1ConfirmedAt && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-500">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Confirmed
                              </span>
                            )}
                          </div>
                          <h2 className="mt-1 text-xl font-bold text-foreground">
                            Confirm Phase 2 Inputs & Assumptions
                          </h2>
                          <p className="mt-1 max-w-2xl text-xs text-muted-foreground leading-relaxed">
                            We&apos;ve generated the business requirements based
                            on your idea. Use the fields below to customize,
                            adjust, or use AI to refine specific values before
                            generating the technical blueprint.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {renderPhase1ReviewField(
                          'region',
                          'Region',
                          'e.g., India, USA, Global',
                          false,
                        )}
                        {renderPhase1ReviewField(
                          'targetAudience',
                          'Target Customers',
                          'Who the business will serve',
                          true,
                        )}
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        {renderPhase1ReviewField(
                          'businessModel',
                          'Business Model',
                          'Subscription, commission, B2B SaaS, etc.',
                        )}
                        {renderPhase1ReviewField(
                          'competitors',
                          'Competitor Context',
                          'Known competitors, alternatives, or market category',
                        )}
                      </div>
                      <div className="w-full">
                        {renderPhase1ReviewField(
                          'ideaSummary',
                          'Idea Summary',
                          'Short corrected description of the business idea',
                        )}
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        {renderPhase1ReviewField(
                          'marketDemand',
                          'Market Demand Notes',
                          'What demand, pain, or opportunity should Phase 2 consider?',
                        )}
                        {renderPhase1ReviewField(
                          'goToMarket',
                          'Go-to-market Notes',
                          'Launch channel, sales motion, geography-specific GTM',
                        )}
                      </div>
                    </div>

                    {analysis.needs_clarification &&
                      analysis.clarifying_questions &&
                      analysis.clarifying_questions.length > 0 && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                          <h3 className="text-sm font-semibold text-amber-300 mb-2">
                            Clarifying questions from AI
                          </h3>
                          <ul className="space-y-1.5">
                            {analysis.clarifying_questions.map(
                              (question, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-amber-100/80"
                                >
                                  {index + 1}. {question}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    <AnalysisDetails
                      analysis={analysis}
                      onSectionChange={setActiveReportSection}
                      isChatOpen={isChatOpen}
                    />

                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <Button
                        className="flex-1 h-12 text-base font-semibold"
                        onClick={confirmPhase1AndLoadQuestions}
                        disabled={loadingQuestions || savingPhase1Review}
                      >
                        Confirm Phase 2 and continue
                      </Button>
                    </div>
                  </div>
                ))}

              {phase === 'technical' &&
                (generatingBlueprint ? (
                  <PremiumLoader
                    title="Generating Tech Blueprint"
                    subtitle="Creating system architecture, database models, API flows, development stages, and pricing estimations..."
                  />
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/10 pb-4">
                      <div>
                        <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                          Phase 3 intake
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                          Answer blueprint questions
                        </h1>
                        <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
                          The fixed questions are mandatory. The optional
                          questions are generated from the business idea and
                          make the final blueprint more specific.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className={`shrink-0 h-10 px-4 text-xs font-bold gap-2 self-start sm:self-center transition-all ${
                          allSuggestedOrAnswered
                            ? 'bg-muted border border-border text-muted-foreground opacity-75'
                            : 'bg-primary/10 border border-primary/25 text-primary hover:bg-primary/25'
                        }`}
                        onClick={handleAiSuggestForAll}
                        disabled={
                          suggestingId !== null ||
                          suggestingAll ||
                          allSuggestedOrAnswered
                        }
                      >
                        {suggestingAll ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                            Suggesting...
                          </>
                        ) : mandatoryQuestions.length > 0 &&
                          mandatoryQuestions.every(
                            (q) => usedAiSuggest[q._id],
                          ) ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                            Suggested for All
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Suggest for All
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {mandatoryQuestions.map((question, index) => {
                        const isSuggestingThis = suggestingId === question._id;
                        const value = answers[question._id] || '';
                        const refineVal = refineInputs[question._id] || '';
                        const isRefineOpen =
                          expandedRefineFields[question._id] || false;

                        const hasSuggested =
                          usedAiSuggest[question._id] || false;

                        const isSelected =
                          activeQuestion?.questionId === question._id;

                        return (
                          <div
                            key={question._id}
                            onClick={() =>
                              setActiveQuestion({
                                questionId: question._id,
                                question: question.question,
                                kind: 'mandatory',
                                index,
                              })
                            }
                            className={`space-y-3 rounded-xl border p-4 transition-all ${
                              isSelected
                                ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                                : 'border-border/30 bg-background/20 hover:border-border/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 w-full">
                              <label className="text-sm font-semibold text-foreground flex-1 leading-relaxed cursor-pointer">
                                {index + 1}. {question.question}{' '}
                                <span className="text-primary">*</span>
                              </label>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2.5 text-xs text-primary bg-primary/5 hover:bg-primary/10 gap-1.5"
                                  onClick={() =>
                                    handleAiSuggest(
                                      question._id,
                                      question.question,
                                    )
                                  }
                                  disabled={
                                    suggestingId !== null || hasSuggested
                                  }
                                >
                                  {isSuggestingThis ? (
                                    <>
                                      <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                                      Suggesting...
                                    </>
                                  ) : hasSuggested ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 text-muted-foreground/60" />
                                      Suggested
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-3 w-3" />
                                      AI Suggest
                                    </>
                                  )}
                                </Button>
                                {value.trim() && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                                      isRefineOpen
                                        ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20'
                                        : 'bg-primary/5 text-primary hover:bg-primary/10'
                                    }`}
                                    onClick={() => {
                                      setExpandedRefineFields((prev) => ({
                                        ...prev,
                                        [question._id]: !prev[question._id],
                                      }));
                                    }}
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    {isRefineOpen ? 'Close Refine' : 'Refine'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <textarea
                              value={value}
                              onFocus={() =>
                                setActiveQuestion({
                                  questionId: question._id,
                                  question: question.question,
                                  kind: 'mandatory',
                                  index,
                                })
                              }
                              onChange={(event) => {
                                setAnswers({
                                  ...answers,
                                  [question._id]: event.target.value,
                                });
                                event.target.style.height = 'auto';
                                event.target.style.height = `${event.target.scrollHeight}px`;
                              }}
                              ref={(el) => {
                                textareaRefs.current[question._id] = el;
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = `${el.scrollHeight}px`;
                                }
                              }}
                              placeholder="Answer in plain language..."
                              className="w-full min-h-[92px] bg-background/55 text-foreground placeholder:text-muted-foreground/45 resize-none p-3 rounded-lg border border-border/40 outline-none text-sm focus:border-primary/45 focus:ring-1 focus:ring-primary/25 transition-all leading-relaxed overflow-hidden"
                            />

                            {value.trim() && isRefineOpen && (
                              <div className="space-y-2 bg-card border border-border/40 rounded-lg p-2.5 transition-all animate-in slide-in-from-top-1 duration-200">
                                <textarea
                                  value={refineVal}
                                  onChange={(e) => {
                                    setRefineInputs({
                                      ...refineInputs,
                                      [question._id]: e.target.value,
                                    });
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                  }}
                                  ref={(el) => {
                                    textareaRefs.current[
                                      `refine_${question._id}`
                                    ] = el;
                                    if (el) {
                                      el.style.height = 'auto';
                                      el.style.height = `${el.scrollHeight}px`;
                                    }
                                  }}
                                  placeholder="Refine this answer (e.g. 'make it shorter', 'add Solidity details')"
                                  rows={1}
                                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/45 outline-none px-2 resize-none min-h-[32px] leading-relaxed overflow-hidden"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAiRefine(
                                        question._id,
                                        question.question,
                                      );
                                    }
                                  }}
                                />
                                <div className="flex justify-end border-t border-border/20 pt-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-7 px-3 text-xs text-primary bg-primary/5 hover:bg-primary/10 gap-1"
                                    onClick={() =>
                                      handleAiRefine(
                                        question._id,
                                        question.question,
                                      )
                                    }
                                    disabled={
                                      suggestingId !== null || !refineVal.trim()
                                    }
                                  >
                                    {isSuggestingThis ? (
                                      <>
                                        <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                                        Refining...
                                      </>
                                    ) : (
                                      <>Refine</>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {optionalQuestions.length > 0 && (
                        <div className="pt-6 border-t border-border/40 space-y-4">
                          <div>
                            <h2 className="text-base font-bold text-foreground">
                              Optional AI questions
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              These are based on your specific idea. Answer the
                              ones you can.
                            </p>
                          </div>
                          {optionalQuestions.map((question, index) => {
                            const isSuggestingThis =
                              suggestingId === question._id;
                            const value = answers[question._id] || '';
                            const refineVal = refineInputs[question._id] || '';
                            const isRefineOpen =
                              expandedRefineFields[question._id] || false;

                            const hasSuggested =
                              usedAiSuggest[question._id] || false;

                            const isSelected =
                              activeQuestion?.questionId === question._id;

                            return (
                              <div
                                key={question._id}
                                onClick={() =>
                                  setActiveQuestion({
                                    questionId: question._id,
                                    question: question.question,
                                    kind: 'optional',
                                    index,
                                  })
                                }
                                className={`space-y-3 rounded-xl border p-4 transition-all ${
                                  isSelected
                                    ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border/30 bg-background/20 hover:border-border/50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4 w-full">
                                  <label className="text-sm font-semibold text-foreground flex-1 leading-relaxed cursor-pointer">
                                    {index + 1}. {question.question}
                                  </label>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2.5 text-xs text-primary bg-primary/5 hover:bg-primary/10 gap-1.5"
                                      onClick={() =>
                                        handleAiSuggest(
                                          question._id,
                                          question.question,
                                        )
                                      }
                                      disabled={
                                        suggestingId !== null || hasSuggested
                                      }
                                    >
                                      {isSuggestingThis ? (
                                        <>
                                          <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                                          Suggesting...
                                        </>
                                      ) : hasSuggested ? (
                                        <>
                                          <CheckCircle className="h-3 w-3 text-muted-foreground/60" />
                                          Suggested
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="h-3 w-3" />
                                          AI Suggest
                                        </>
                                      )}
                                    </Button>
                                    {value.trim() && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                                          isRefineOpen
                                            ? 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/20'
                                            : 'bg-primary/5 text-primary hover:bg-primary/10'
                                        }`}
                                        onClick={() => {
                                          setExpandedRefineFields((prev) => ({
                                            ...prev,
                                            [question._id]: !prev[question._id],
                                          }));
                                        }}
                                      >
                                        <Sparkles className="h-3 w-3" />
                                        {isRefineOpen
                                          ? 'Close Refine'
                                          : 'Refine'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <textarea
                                  value={value}
                                  onFocus={() =>
                                    setActiveQuestion({
                                      questionId: question._id,
                                      question: question.question,
                                      kind: 'optional',
                                      index,
                                    })
                                  }
                                  onChange={(event) => {
                                    setAnswers({
                                      ...answers,
                                      [question._id]: event.target.value,
                                    });
                                    event.target.style.height = 'auto';
                                    event.target.style.height = `${event.target.scrollHeight}px`;
                                  }}
                                  ref={(el) => {
                                    textareaRefs.current[question._id] = el;
                                    if (el) {
                                      el.style.height = 'auto';
                                      el.style.height = `${el.scrollHeight}px`;
                                    }
                                  }}
                                  placeholder="Optional answer..."
                                  className="w-full min-h-[92px] bg-background/55 text-foreground placeholder:text-muted-foreground/45 resize-none p-3 rounded-lg border border-border/40 outline-none text-sm focus:border-primary/45 focus:ring-1 focus:ring-primary/25 transition-all leading-relaxed overflow-hidden"
                                />

                                {value.trim() && isRefineOpen && (
                                  <div className="space-y-2 bg-card border border-border/40 rounded-lg p-2.5 transition-all animate-in slide-in-from-top-1 duration-200">
                                    <textarea
                                      value={refineVal}
                                      onChange={(e) => {
                                        setRefineInputs({
                                          ...refineInputs,
                                          [question._id]: e.target.value,
                                        });
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                      }}
                                      ref={(el) => {
                                        textareaRefs.current[
                                          `refine_${question._id}`
                                        ] = el;
                                        if (el) {
                                          el.style.height = 'auto';
                                          el.style.height = `${el.scrollHeight}px`;
                                        }
                                      }}
                                      placeholder="Refine this answer (e.g. 'make it shorter')"
                                      rows={1}
                                      className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/45 outline-none px-2 resize-none min-h-[32px] leading-relaxed overflow-hidden"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAiRefine(
                                            question._id,
                                            question.question,
                                          );
                                        }
                                      }}
                                    />
                                    <div className="flex justify-end border-t border-border/20 pt-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-7 px-3 text-xs text-primary bg-primary/5 hover:bg-primary/10 gap-1"
                                        onClick={() =>
                                          handleAiRefine(
                                            question._id,
                                            question.question,
                                          )
                                        }
                                        disabled={
                                          suggestingId !== null ||
                                          !refineVal.trim()
                                        }
                                      >
                                        {isSuggestingThis ? (
                                          <>
                                            <span className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
                                            Refining...
                                          </>
                                        ) : (
                                          <>Refine</>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <Button
                        variant="outline"
                        className="h-12"
                        onClick={() => setPhase('analysis')}
                        disabled={generatingBlueprint}
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-semibold"
                        onClick={generateBlueprint}
                        disabled={generatingBlueprint}
                      >
                        Generate Tech Blueprint
                      </Button>
                    </div>
                  </div>
                ))}

              {phase === 'blueprint' && !blueprint && (
                <PremiumLoader
                  title="Generating Blueprint Report"
                  subtitle="Executive summary, MVP scope, architecture, roadmap, team, budget, GTM, risks, and recommendations are being prepared in the background..."
                />
              )}

              {phase === 'blueprint' &&
                blueprint &&
                (creatingRoom || loadingRecommendations ? (
                  <PremiumLoader
                    title={
                      creatingRoom
                        ? 'Assembling Your Live Room'
                        : 'Scouting Talent Matches'
                    }
                    subtitle={
                      creatingRoom
                        ? 'Creating dashboard, compiling documents, setting up workspaces, and preparing the workspace...'
                        : 'Scanning verified developer profiles, evaluating skill matches, reputation scores, budget fits, and availability...'
                    }
                  />
                ) : !isFinalBlueprint ? (
                  <div className="space-y-7 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                          Phase 3 review
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                          Review & Edit Blueprint
                        </h1>
                        <p className="text-muted-foreground max-w-4xl text-sm leading-relaxed">
                          Edit any field below in plain language. Use the{' '}
                          <span className="inline-flex items-center gap-0.5 text-primary font-medium">
                            <Sparkles className="h-3 w-3" />
                            Refine
                          </span>{' '}
                          buttons to improve content with AI.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => setPhase('analysis')}
                          disabled={creatingRoom || loadingRecommendations}
                        >
                          Edit Phase 2
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPhase('technical')}
                          disabled={creatingRoom || loadingRecommendations}
                        >
                          Edit answers
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleConfirmFinal}
                          disabled={
                            creatingRoom ||
                            loadingRecommendations ||
                            finalizingBlueprint
                          }
                          className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/25 font-bold"
                        >
                          {finalizingBlueprint
                            ? 'Finalizing...'
                            : 'Approve and Finalize'}
                        </Button>
                      </div>
                    </div>

                    <BlueprintReviewSection
                      blueprint={blueprint}
                      region={phase1Review.region}
                      onUpdateField={handleUpdateBlueprintField}
                      onRefineField={handleRefineBlueprintField}
                      isRefining={isRefiningBlueprintSection}
                      suggestingId={suggestingId}
                      onConfirmFinal={handleConfirmFinal}
                      setSuggestingId={setSuggestingId}
                      setIsRefiningBlueprintSection={
                        setIsRefiningBlueprintSection
                      }
                      sessionData={sessionData}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      onSectionChange={setActiveReportSection}
                    />
                  </div>
                ) : (
                  <div className="space-y-7 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                          Phase 3 output
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                          Business and development blueprint
                        </h1>
                        <p className="text-muted-foreground max-w-4xl text-sm leading-relaxed">
                          This report uses the Phase 2 analysis plus the
                          mandatory and optional Phase 3 answers.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => setIsFinalBlueprint(false)}
                          disabled={creatingRoom || loadingRecommendations}
                          className="gap-1.5"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit Blueprint
                        </Button>
                        <Button
                          variant="outline"
                          onClick={downloadBlueprintPdf}
                          disabled={
                            downloadingBlueprintPdf ||
                            creatingRoom ||
                            loadingRecommendations
                          }
                          className="bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20 font-bold"
                        >
                          {downloadingBlueprintPdf
                            ? 'Preparing...'
                            : 'Download PDF'}
                        </Button>

                        <Button
                          onClick={() => {
                            const missing = mandatoryQuestions.filter(
                              (question) => !answers[question._id]?.trim(),
                            );
                            if (missing.length > 0) {
                              toast.error(
                                'Please answer all mandatory questions',
                              );
                              setPhase('technical');
                              return;
                            }
                            if (talentRequirements.length === 0) {
                              setTalentRequirements(
                                estimateTalentRequirements(blueprint, analysis),
                              );
                            }
                            setPhase('talent_requirements');
                          }}
                          disabled={loadingRecommendations || creatingRoom}
                          className="gap-1.5 font-bold"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Talent Requirement Planner
                        </Button>
                      </div>
                    </div>

                    <div data-blueprint-report-capture ref={blueprintReportRef}>
                      <BlueprintReport
                        blueprint={blueprint}
                        onSectionChange={setActiveReportSection}
                        region={phase1Review.region}
                        isEditable={false}
                      />
                    </div>
                  </div>
                ))}

              {phase === 'talent_requirements' && (
                <TalentRequirementPlanner
                  idea={description || sessionData?.rawIdea || ''}
                  analysis={analysis}
                  blueprint={blueprint}
                  technicalAnswers={answers}
                  requirements={
                    talentRequirements.length > 0
                      ? talentRequirements
                      : estimateTalentRequirements(blueprint, analysis)
                  }
                  onChange={setTalentRequirements}
                  onContinue={() => {
                    setPhase('milestones');
                    setShowMilestoneDateDialogOnEnter(true);
                  }}
                  onBack={() => setPhase('blueprint')}
                />
              )}

              {phase === 'milestones' && (
                <MilestoneReviewSection
                  blueprint={blueprint || {}}
                  onApproveAndFindTalent={() => setShowTalentChoiceModal(true)}
                  onBack={() => setPhase('talent_requirements')}
                  isFindingTalent={loadingRecommendations}
                  openDateDialogOnMount={showMilestoneDateDialogOnEnter}
                />
              )}

              {phase === 'recommendations' &&
                talentRecommendationReport &&
                (creatingRoom || loadingRecommendations ? (
                  <PremiumLoader
                    title={
                      creatingRoom
                        ? 'Assembling Your Live Room'
                        : 'Scouting Talent Matches'
                    }
                    subtitle={
                      creatingRoom
                        ? 'Creating dashboard, compiling documents, setting up workspaces, and preparing the workspace...'
                        : 'Scanning verified developer profiles, evaluating skill matches, reputation scores, budget fits, and availability...'
                    }
                  />
                ) : (
                  <div className="space-y-7 animate-in fade-in duration-300">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                          Phase 4 output
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                          Recommended talent matches
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                          Candidates are ranked using verified reputation,
                          previous work, GitHub score, skill fit, and
                          availability.
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => setPhase('milestones')}
                          disabled={creatingRoom || loadingRecommendations}
                        >
                          Back to milestones
                        </Button>
                        <Button
                          variant="outline"
                          onClick={generateTalentRecommendations}
                          disabled={loadingRecommendations || creatingRoom}
                        >
                          {loadingRecommendations
                            ? 'Refreshing...'
                            : 'Refresh matches'}
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingCreationType('manual');
                            setShowConnectsConfirm(true);
                          }}
                          disabled={creatingRoom || loadingRecommendations}
                        >
                          {creatingRoom
                            ? 'Preparing room...'
                            : selectedTalentRecommendations.length > 0
                              ? `Create room with ${selectedTalentRecommendations.length} selected`
                              : 'Enter room dashboard'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-border/50 bg-card p-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Zap
                            className="h-3.5 w-3.5 text-amber-500"
                            strokeWidth={2.2}
                          />{' '}
                          Required connects
                        </div>
                        <div className="text-2xl font-bold font-mono text-amber-500 flex items-center gap-1.5">
                          <Zap
                            className="h-5 w-5 text-amber-500"
                            strokeWidth={2.2}
                          />{' '}
                          150{' '}
                          <span className="text-xs font-normal text-muted-foreground font-sans">
                            connects
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Deducted upon room creation
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card p-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Roles considered
                        </div>
                        <div className="text-2xl font-bold font-mono">
                          {talentRecommendationReport.roleCount}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card p-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Recommended talents
                        </div>
                        <div className="text-2xl font-bold font-mono">
                          {talentRecommendationReport.recommendations.length}
                        </div>
                        {selectedTalentRecommendations.length > 0 && (
                          <div className="text-xs text-primary mt-1">
                            {selectedTalentRecommendations.length} selected
                          </div>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const activeGroups: RoleRecommendationGroup[] =
                        talentMatchingTab === 'ai'
                          ? talentRecommendationReport.groupedRecommendationTeams ||
                            talentRecommendationReport.recommendedTeams ||
                            []
                          : talentRecommendationReport.groupedManualTeams ||
                            talentRecommendationReport.recommendedTeams ||
                            [];

                      const availableRoleTitles = Array.from(
                        new Set(
                          activeGroups
                            .map(
                              (g: RoleRecommendationGroup) => g.role?.roleTitle,
                            )
                            .filter((t: string | undefined): t is string =>
                              Boolean(t),
                            ),
                        ),
                      );

                      const filteredGroups = activeGroups.filter(
                        (g: RoleRecommendationGroup) => {
                          if (talentRoleFilter === 'all') return true;
                          return g.role?.roleTitle === talentRoleFilter;
                        },
                      );

                      const sortMatches = (matches: any[]) => {
                        const list = [...matches];
                        if (talentSortFilter === 'score') {
                          list.sort(
                            (a, b) => (b.finalScore || 0) - (a.finalScore || 0),
                          );
                        } else if (talentSortFilter === 'reputation') {
                          list.sort(
                            (a, b) =>
                              (b.credential?.reputationScore || 0) -
                              (a.credential?.reputationScore || 0),
                          );
                        } else if (talentSortFilter === 'rate_asc') {
                          list.sort(
                            (a, b) =>
                              (a.estimatedHourlyRateUsd || 0) -
                              (b.estimatedHourlyRateUsd || 0),
                          );
                        } else if (talentSortFilter === 'rate_desc') {
                          list.sort(
                            (a, b) =>
                              (b.estimatedHourlyRateUsd || 0) -
                              (a.estimatedHourlyRateUsd || 0),
                          );
                        }
                        return list;
                      };

                      const showAvailable =
                        talentAvailabilityFilter === 'all' ||
                        talentAvailabilityFilter === 'available';
                      const showUnavailable =
                        talentAvailabilityFilter === 'all' ||
                        talentAvailabilityFilter === 'unavailable';

                      const mode = talentMatchingTab === 'ai' ? 'ai' : 'manual';
                      const noTalents =
                        activeGroups.length === 0 ||
                        activeGroups.every(
                          (g: RoleRecommendationGroup) =>
                            (!g.availableMatches ||
                              g.availableMatches.length === 0) &&
                            (!g.unavailableMatches ||
                              g.unavailableMatches.length === 0),
                        );

                      if (noTalents) {
                        return (
                          <div className="rounded-xl border border-dashed border-border/50 p-10 text-center">
                            <h2 className="font-semibold mb-2">
                              No talent matches available
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                              {talentMatchingTab === 'ai'
                                ? 'The room can still be created. Once more verified talent credentials exist, this phase will rank them automatically.'
                                : 'There are no active freelancers in the talent pool at this time.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          {/* Filter Bar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/80 border border-border/50 rounded-xl p-3.5 shadow-xs">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <Filter className="h-3.5 w-3.5 text-primary" />{' '}
                                Filter by:
                              </div>

                              {/* Role Dropdown */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">
                                  Role:
                                </label>
                                <select
                                  value={talentRoleFilter}
                                  onChange={(e) =>
                                    setTalentRoleFilter(e.target.value)
                                  }
                                  className="h-8 rounded-lg bg-background border border-border/50 px-2.5 text-xs text-foreground font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                  <option value="all">
                                    All Roles (
                                    {talentRecommendationReport.recommendations
                                      ?.length || 0}
                                    )
                                  </option>
                                  {availableRoleTitles.map((roleTitle) => (
                                    <option key={roleTitle} value={roleTitle}>
                                      {roleTitle}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Availability Dropdown */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">
                                  Availability:
                                </label>
                                <select
                                  value={talentAvailabilityFilter}
                                  onChange={(e) =>
                                    setTalentAvailabilityFilter(e.target.value)
                                  }
                                  className="h-8 rounded-lg bg-background border border-border/50 px-2.5 text-xs text-foreground font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                  <option value="all">All Availability</option>
                                  <option value="available">
                                    Available Now
                                  </option>
                                  <option value="unavailable">
                                    Not Available RN
                                  </option>
                                </select>
                              </div>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />{' '}
                                Sort:
                              </div>
                              <select
                                value={talentSortFilter}
                                onChange={(e) =>
                                  setTalentSortFilter(e.target.value)
                                }
                                className="h-8 rounded-lg bg-background border border-border/50 px-2.5 text-xs text-foreground font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                              >
                                <option value="score">
                                  Highest Match Score
                                </option>
                                <option value="reputation">
                                  Highest Reputation
                                </option>
                                <option value="rate_asc">
                                  Hourly Rate: Low to High
                                </option>
                                <option value="rate_desc">
                                  Hourly Rate: High to Low
                                </option>
                              </select>
                            </div>
                          </div>

                          {filteredGroups.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/50 p-8 text-center text-sm text-muted-foreground">
                              No matches found for the selected role filter.
                            </div>
                          ) : (
                            filteredGroups.map(
                              (group: RoleRecommendationGroup) => {
                                const availMatches = showAvailable
                                  ? sortMatches(group.availableMatches || [])
                                  : [];
                                const unavailMatches = showUnavailable
                                  ? sortMatches(group.unavailableMatches || [])
                                  : [];

                                if (
                                  availMatches.length === 0 &&
                                  unavailMatches.length === 0
                                )
                                  return null;

                                return (
                                  <section
                                    key={group.role.roleTitle}
                                    className="rounded-xl border border-border/50 bg-card p-5 space-y-4"
                                  >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                      <div>
                                        <div className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                                          Role match group
                                        </div>
                                        <h2 className="text-xl font-semibold">
                                          {group.role.roleTitle}
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {group.role.skillDomain}
                                        </p>
                                        {group.role.keywords?.length ? (
                                          <div className="flex flex-wrap gap-1.5 mt-3">
                                            {group.role.keywords
                                              .slice(0, 9)
                                              .map((keyword: string) => (
                                                <span
                                                  key={keyword}
                                                  className="text-[10px] border border-primary/20 bg-primary/10 text-primary rounded-full px-2 py-0.5"
                                                >
                                                  {keyword}
                                                </span>
                                              ))}
                                          </div>
                                        ) : null}
                                      </div>
                                      <div className="text-xs text-muted-foreground md:text-right space-y-1.5">
                                        {(() => {
                                          const matchingReq =
                                            talentRequirements.find(
                                              (r) =>
                                                r.roleTitle.toLowerCase() ===
                                                  group.role.roleTitle.toLowerCase() ||
                                                r.roleTitle
                                                  .toLowerCase()
                                                  .includes(
                                                    group.role.roleTitle.toLowerCase(),
                                                  ) ||
                                                group.role.roleTitle
                                                  .toLowerCase()
                                                  .includes(
                                                    r.roleTitle.toLowerCase(),
                                                  ),
                                            );
                                          const requiredCount = matchingReq
                                            ? matchingReq.businessSelectedCount
                                            : 1;

                                          const allMatches = [
                                            ...(group.availableMatches || []),
                                            ...(group.unavailableMatches || []),
                                            ...(group.topMatches || []),
                                          ];
                                          const uniqueMatchesMap = new Map();
                                          allMatches.forEach((m) =>
                                            uniqueMatchesMap.set(
                                              recommendationKey(m, mode),
                                              m,
                                            ),
                                          );

                                          let selectedForRoleCount = 0;
                                          uniqueMatchesMap.forEach((m, key) => {
                                            if (selectedTalentKeys[key])
                                              selectedForRoleCount++;
                                          });

                                          const isUnder =
                                            selectedForRoleCount <
                                            requiredCount;

                                          return (
                                            <div
                                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                isUnder
                                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                              }`}
                                            >
                                              Selected {selectedForRoleCount} /
                                              Required {requiredCount}
                                            </div>
                                          );
                                        })()}
                                        <div>
                                          <span className="font-mono text-foreground">
                                            {group.availableMatches.length}
                                          </span>{' '}
                                          available
                                        </div>
                                        <div>
                                          <span className="font-mono text-foreground">
                                            {group.unavailableMatches.length}
                                          </span>{' '}
                                          not available rn
                                        </div>
                                      </div>
                                    </div>

                                    {[
                                      ['Available first', availMatches],
                                      [
                                        'Not available right now',
                                        unavailMatches,
                                      ],
                                    ].map(([label, matches]) =>
                                      Array.isArray(matches) &&
                                      matches.length > 0 ? (
                                        <div
                                          key={String(label)}
                                          className="space-y-3"
                                        >
                                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            {String(label)}
                                          </div>
                                          <div className="grid gap-3">
                                            {matches.map((recommendation) => {
                                              const key = recommendationKey(
                                                recommendation,
                                                mode,
                                              );
                                              const selected =
                                                !!selectedTalentKeys[key];
                                              return (
                                                <div
                                                  key={key}
                                                  onClick={() =>
                                                    toggleTalentSelection(
                                                      recommendation,
                                                      mode,
                                                    )
                                                  }
                                                  className={`rounded-xl border p-4 transition-all cursor-pointer hover:border-primary/60 hover:shadow-md ${
                                                    selected
                                                      ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30'
                                                      : 'border-border/40 bg-background/35 hover:bg-background/60'
                                                  }`}
                                                >
                                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          toggleTalentSelection(
                                                            recommendation,
                                                            mode,
                                                          );
                                                        }}
                                                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                          selected
                                                            ? 'bg-primary border-primary text-primary-foreground'
                                                            : 'border-border/60 hover:border-primary'
                                                        }`}
                                                        title="Select talent"
                                                      >
                                                        {selected ? '✓' : ''}
                                                      </button>
                                                      <div className="w-11 h-11 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                                                        <span className="text-primary font-bold">
                                                          {recommendation.user.name?.[0]?.toUpperCase() ??
                                                            'T'}
                                                        </span>
                                                      </div>
                                                      <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          <h3 className="text-base font-semibold truncate">
                                                            {
                                                              recommendation
                                                                .user.name
                                                            }
                                                          </h3>
                                                          <span
                                                            className={`text-[10px] rounded border px-2 py-0.5 ${(recommendation.user.availabilityRank ?? 0) >= 2 ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}
                                                          >
                                                            {recommendation.user
                                                              .availabilityLabel ??
                                                              (recommendation
                                                                .user.isOnline
                                                                ? 'Available now'
                                                                : 'Not available rn')}
                                                          </span>
                                                          {recommendation.user
                                                            .location && (
                                                            <span className="text-[10px] rounded border border-border/40 px-2 py-0.5 text-muted-foreground">
                                                              {
                                                                recommendation
                                                                  .user.location
                                                              }
                                                            </span>
                                                          )}
                                                        </div>
                                                        <p className="text-sm text-primary mt-1">
                                                          {
                                                            recommendation
                                                              .credential
                                                              .skillDomain
                                                          }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                          L
                                                          {
                                                            recommendation
                                                              .credential.level
                                                          }{' '}
                                                          -{' '}
                                                          {
                                                            recommendation
                                                              .credential
                                                              .reputationScore
                                                          }{' '}
                                                          rep -{' '}
                                                          {
                                                            recommendation
                                                              .credential
                                                              .projectsCompleted
                                                          }{' '}
                                                          projects - GitHub{' '}
                                                          {
                                                            recommendation
                                                              .credential
                                                              .githubScore
                                                          }
                                                        </p>
                                                        {recommendation
                                                          .matchedKeywords
                                                          ?.length ? (
                                                          <div className="flex flex-wrap gap-1.5 mt-3">
                                                            {recommendation.matchedKeywords
                                                              .slice(0, 8)
                                                              .map(
                                                                (
                                                                  keyword: string,
                                                                ) => (
                                                                  <span
                                                                    key={
                                                                      keyword
                                                                    }
                                                                    className="text-[10px] border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 rounded px-1.5 py-0.5"
                                                                  >
                                                                    {keyword}
                                                                  </span>
                                                                ),
                                                              )}
                                                          </div>
                                                        ) : null}
                                                        {recommendation
                                                          .missingKeywords
                                                          ?.length ? (
                                                          <p className="text-[10px] text-muted-foreground/70 mt-2">
                                                            Missing/weak:{' '}
                                                            {recommendation.missingKeywords
                                                              .slice(0, 5)
                                                              .join(', ')}
                                                          </p>
                                                        ) : null}
                                                      </div>
                                                    </div>
                                                    <div className="shrink-0 text-left lg:text-right space-y-2">
                                                      <div>
                                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                                          Score
                                                        </div>
                                                        <div className="text-3xl font-bold font-mono text-primary">
                                                          {
                                                            recommendation.finalScore
                                                          }
                                                        </div>
                                                      </div>
                                                      <div className="text-xs text-muted-foreground">
                                                        <div>
                                                          $
                                                          {
                                                            recommendation.estimatedHourlyRateUsd
                                                          }
                                                          /hr
                                                        </div>
                                                        <div>
                                                          {formatCurrency(
                                                            recommendation.weeklyRateUsd ??
                                                              recommendation.estimatedHourlyRateUsd *
                                                                40,
                                                          )}
                                                          /week
                                                        </div>
                                                        <div>
                                                          {formatCurrency(
                                                            recommendation.monthlyRateUsd ??
                                                              (recommendation.weeklyRateUsd ??
                                                                recommendation.estimatedHourlyRateUsd *
                                                                  40) * 4,
                                                          )}
                                                          /month
                                                        </div>
                                                      </div>
                                                      <div className="flex gap-2 lg:justify-end">
                                                        <Button
                                                          size="sm"
                                                          variant={
                                                            selected
                                                              ? 'default'
                                                              : 'outline'
                                                          }
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTalentSelection(
                                                              recommendation,
                                                              mode,
                                                            );
                                                          }}
                                                        >
                                                          {selected
                                                            ? 'Selected'
                                                            : 'Select'}
                                                        </Button>
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(
                                                              `/talent/profile/${recommendation.talentId}`,
                                                            );
                                                          }}
                                                        >
                                                          Profile
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className="grid gap-2 md:grid-cols-3 mt-4">
                                                    <ScorePill
                                                      label="Keyword match"
                                                      value={
                                                        recommendation
                                                          .scoreBreakdown
                                                          .skillMatchScore
                                                      }
                                                    />
                                                    <ScorePill
                                                      label="Availability"
                                                      value={
                                                        recommendation
                                                          .scoreBreakdown
                                                          .availabilityScore
                                                      }
                                                    />
                                                    <ScorePill
                                                      label="Budget fit"
                                                      value={
                                                        recommendation
                                                          .scoreBreakdown
                                                          .budgetFitScore
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : null,
                                    )}
                                  </section>
                                );
                              },
                            )
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
            </>
          )}
        </main>

        {canUseChat && isChatOpen && (
          <aside className="lg:sticky lg:top-20 h-[min(720px,calc(100vh-6rem))] rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 to-background/95 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300 relative">
            <div className="shrink-0 border-b border-border/40 bg-background px-4 py-3.5 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-foreground text-background font-bold text-xs shrink-0">
                    AI
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground tracking-tight">
                        DEHIX AI
                      </h2>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Live Context
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {sessionData?._id
                        ? 'Personalized AI Launch Assistant'
                        : 'Available after Phase 1 analysis'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                  onClick={() => setChatOpen(false)}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-thin">
              {chatMessages.length === 0 && (
                <div className="text-center py-10 px-4">
                  <Sparkles className="h-5 w-5 text-primary/30 mx-auto mb-2.5 animate-bounce" />
                  <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                    Ask about validations, warnings, MVP scope, team sizes, tech
                    stacks, or roadmap phases.
                  </p>
                </div>
              )}

              {chatMessages.map((msg) => {
                const isAi = msg.isAi;
                return (
                  <div key={msg.id} className="flex flex-col space-y-1">
                    {isAi ? (
                      <div className="flex items-start gap-2.5 max-w-[90%] mr-auto animate-in slide-in-from-left-2 duration-200">
                        <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 shadow-sm">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="rounded-2xl rounded-tl-none border border-primary/15 bg-primary/5/30 backdrop-blur-sm px-3.5 py-2.5 text-xs text-foreground/95 leading-relaxed shadow-sm">
                            <MarkdownMini text={msg.message} />
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-primary/80 px-1">
                            DEHIX AI
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end space-y-1 max-w-[85%] ml-auto animate-in slide-in-from-right-2 duration-200">
                        <div className="rounded-2xl rounded-tr-none bg-primary px-3.5 py-2 text-xs text-primary-foreground leading-relaxed shadow-sm">
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/75 px-1">
                          You
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {aiLoading && (
                <div className="flex items-start gap-2.5 max-w-[90%] mr-auto animate-pulse">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                    <Sparkles
                      className="h-3.5 w-3.5 text-primary animate-spin"
                      style={{ animationDuration: '3s' }}
                    />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-primary/15 bg-primary/5/20 px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="shrink-0 border-t border-border/40 p-4 bg-background/40 backdrop-blur-md relative z-10">
              {sessionData?._id && smartSuggestions.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-border/10 pb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/85">
                      Smart Suggestions
                    </span>
                    {(activeQuestion || activeReportSection) && (
                      <span className="max-w-[170px] truncate text-[9px] font-bold uppercase tracking-wider text-primary">
                        {activeQuestion
                          ? `Q${activeQuestion.index + 1}`
                          : activeReportSection?.title}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {smartSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() =>
                          askLaunchAi(
                            suggestion.prompt,
                            suggestion.displayText || suggestion.label,
                          )
                        }
                        disabled={aiLoading}
                        className="rounded-lg border border-border/50 bg-background/55 px-2.5 py-1.5 text-left text-[10px] font-semibold text-foreground/80 transition-all hover:border-primary/45 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.01]"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative border border-border/50 rounded-xl bg-background/60 focus-within:border-primary/45 focus-within:ring-1 focus-within:ring-primary/10 transition-all p-2">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      askLaunchAi();
                    }
                  }}
                  placeholder={
                    sessionData?._id
                      ? 'Ask AI about this launch...'
                      : 'Analyze the idea first...'
                  }
                  className="w-full resize-none bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/45 min-h-[50px] max-h-[120px] leading-relaxed p-1.5"
                  disabled={!sessionData?._id || aiLoading}
                />
                <div className="flex items-center justify-between border-t border-border/20 pt-2 mt-1 px-1.5">
                  <span className="text-[9px] text-muted-foreground/60 font-medium">
                    Press Enter to send
                  </span>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs gap-1.5"
                    onClick={() => askLaunchAi()}
                    disabled={
                      !sessionData?._id || !chatInput.trim() || aiLoading
                    }
                  >
                    {aiLoading ? (
                      <span className="w-3 h-3 rounded-full border border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {canUseChat && !isChatOpen && (
        <Button
          onClick={() => {
            setChatOpen(true);
            scrollChatToBottom();
          }}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-2xl flex items-center justify-center bg-primary text-primary-foreground hover:scale-105 transition-all duration-200 z-50 animate-in zoom-in-50 duration-200"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {showBackToTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed h-12 w-12 rounded-full shadow-2xl flex items-center justify-center bg-card border border-border/80 text-foreground hover:bg-muted hover:scale-105 transition-all duration-200 z-50 animate-in fade-in zoom-in-50 ${
            canUseChat && isChatOpen
              ? 'bottom-6 left-6 md:left-auto md:right-[412px]'
              : canUseChat && !isChatOpen
                ? 'bottom-6 right-20'
                : 'bottom-6 right-6'
          }`}
          size="icon"
          variant="outline"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      {showFinalConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-gradient-to-b from-card to-background p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Confirm Blueprint Report
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Action required to unlock download options
                  </p>
                </div>
              </div>

              <div className="text-sm text-foreground/80 leading-relaxed bg-muted/40 rounded-xl p-4 border border-border/40">
                Is this the final blueprint? Confirming will lock the blueprint
                version and enable the PDF download option. You can always
                revert to make changes later.
              </div>

              <div className="flex gap-2.5 justify-end mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFinalBlueprint(false);
                    setShowFinalConfirmation(false);
                  }}
                  className="font-medium text-xs h-9 px-4"
                >
                  No, not yet
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmFinal}
                  disabled={finalizingBlueprint}
                  className="font-bold text-xs h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {finalizingBlueprint ? 'Finalizing...' : 'Yes, this is final'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTalentChoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-primary/20 bg-gradient-to-b from-card via-card to-background p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Glowing orb overlays */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                      Choose Talent Matching Method
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select how you want to match freelancers for your planned
                      team requirements.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                  onClick={() => setShowTalentChoiceModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-2">
                {/* AI Auto-Match Card */}
                <button
                  onClick={() => {
                    setShowTalentChoiceModal(false);
                    setPendingCreationType('ai');
                    setShowConnectsConfirm(true);
                  }}
                  className="group relative flex flex-col justify-between text-left rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-card/50 p-6 shadow-md transition-all duration-300 hover:border-primary/60 hover:scale-[1.02] focus:outline-none hover:shadow-primary/5 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                      <div className="h-10 w-10 rounded-xl bg-primary/25 border border-primary/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                        Recommended
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                        AI Auto-Match
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Auto-selects top verified freelancers for each role
                        based on your team headcount from the Talent Requirement
                        Planner.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform relative z-10">
                    <span>Use AI Selection</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>

                {/* Manual Selection Card */}
                <button
                  onClick={() => {
                    setShowTalentChoiceModal(false);
                    generateTalentRecommendations();
                  }}
                  className="group relative flex flex-col justify-between text-left rounded-2xl border border-border/60 bg-gradient-to-br from-card to-background p-6 shadow-md transition-all duration-300 hover:border-primary/20 hover:bg-card/70 hover:scale-[1.02] focus:outline-none"
                >
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                      <Edit3 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary/80 transition-colors duration-200">
                        Manual Selection List
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Browse candidate profiles, inspect technical skills,
                        past work, and manually choose freelancers for your
                        planned roles.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-muted-foreground group-hover:text-foreground transition-all">
                    <span>Use Manual Selection</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTalentChoiceModal(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConnectsConfirm && (
        <ConnectsDialog
          externalOpen={showConnectsConfirm}
          setExternalOpen={(open) => {
            if (!creatingRoom) {
              setShowConnectsConfirm(open);
              if (!open) setCreationError(null);
            }
          }}
          loading={creatingRoom}
          setLoading={setCreatingRoom}
          requiredConnects={150}
          userId={sessionData?.businessId || (user as any)?._id || ''}
          userType="business"
          resourceName="LiveRoom"
          hideTrigger={true}
          skipRedirect={true}
          processingTitle="Creating Your LiveRoom"
          processingSubtitle={
            pendingCreationType === 'ai'
              ? 'Deducting 150 connects, selecting verified talent, and preparing your workspace. You will be redirected automatically.'
              : 'Deducting 150 connects, inviting selected talent, and preparing your workspace. You will be redirected automatically.'
          }
          isRedirecting={isRedirecting}
          errorMessage={creationError}
          onRetry={async () => {
            setCreationError(null);
            if (pendingCreationType === 'ai') {
              await handleDirectAiTalentSelection();
            } else if (pendingCreationType === 'manual') {
              await enterRoomDashboard();
            }
          }}
          onSubmit={async () => {
            setCreationError(null);
            if (pendingCreationType === 'ai') {
              await handleDirectAiTalentSelection();
            } else if (pendingCreationType === 'manual') {
              await enterRoomDashboard();
            }
          }}
        />
      )}
    </div>
  );
}
