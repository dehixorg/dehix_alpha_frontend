/* eslint-disable import/order, react/no-unescaped-entities, prefer-const, @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '../adapters/wouter';
import { liveRoomApiFetch as fetch } from '../api/runtime';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  Search,
  Sparkles,
  Send,
  MessageSquare,
  MapPin,
  Award,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  ArrowUp,
  X,
  Globe,
  Layers,
  Cpu,
  FileText,
  Layout,
  TrendingUp,
  Coins,
  Lightbulb,
  Activity,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

type WizardPhase =
  | 'idea'
  | 'analysis'
  | 'technical'
  | 'blueprint'
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
  prompt: string;
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
  recommendations: TalentRecommendation[];
};

type ChatMessage = {
  id: string;
  userId?: string;
  userName: string;
  message: string;
  isAi: boolean;
  createdAt?: string | Date;
};

const EXAMPLE_PROMPTS = [
  'A platform that helps small restaurants predict daily ingredient demand, reduce food waste, and auto-create purchase lists for suppliers.',
  'A marketplace where local fitness coaches can sell short video programs, manage paid communities, and track client progress.',
  'An AI assistant for real estate agents that qualifies leads, writes listing descriptions, schedules visits, and keeps client follow-ups organized.',
];

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

function formatPrimitive(value: unknown) {
  if (value === null || value === undefined) return 'Not available';
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
  return Array.isArray(value)
    ? value.map((item) => formatPrimitive(item)).filter(Boolean)
    : [];
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
    <div className="grid gap-3 md:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-lg border border-border/40 bg-background/35 p-3"
        >
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {humanizeKey(key)}
          </div>
          <div className="text-sm leading-6 text-foreground">
            {formatPrimitive(value)}
          </div>
        </div>
      ))}
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
}: {
  sections: ReportSection[];
  initialSectionId?: string;
  onSectionChange?: (section: ActiveReportSection) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(
    initialSectionId ?? sections[0]?.id ?? '',
  );
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
            <div className="border-b border-border/40 pb-5 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold uppercase tracking-wider mb-3 animate-fade-in">
                {getSectionIcon(selectedSection.id)}
                <span>Active Document Details</span>
              </div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                {selectedSection.title}
              </h2>
              {selectedSection.description && (
                <div className="relative mt-4 p-4 rounded-xl border border-primary/15 bg-primary/5/20 backdrop-blur-sm">
                  <span className="absolute top-2 left-2 text-primary/15 text-4xl font-serif leading-none select-none">
                    “
                  </span>
                  <p className="pl-6 text-xs text-muted-foreground leading-relaxed italic relative z-10">
                    {selectedSection.description}
                  </p>
                </div>
              )}
            </div>
            <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300 text-foreground/90 leading-relaxed text-sm">
              {selectedSection.body}
            </div>
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
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 rounded-2xl border border-primary/20 bg-card/45 backdrop-blur-md relative overflow-hidden shadow-2xl animate-in fade-in duration-500">
      {/* Animated Glowing Ambient Orbs */}
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Cybernetic Pulse Spinner */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
        <div
          className="absolute inset-2 rounded-full border border-blue-500/20 border-b-blue-500 animate-spin"
          style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
        />
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-primary text-lg font-bold font-mono">DX</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground tracking-tight text-center mb-2 animate-pulse">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
          {subtitle}
        </p>
      )}

      {/* Quote Container with Premium Fade */}
      <div className="border-t border-border/30 pt-6 w-full max-w-lg flex flex-col items-center min-h-[90px]">
        <div
          className={`transition-all duration-300 transform ${fade ? 'opacity-100 translate-y-0 animate-in fade-in' : 'opacity-0 translate-y-2'} text-center`}
        >
          <p className="text-sm italic text-foreground/80 leading-relaxed font-medium">
            "{currentQuote.text}"
          </p>
          <p className="text-xs text-primary/70 mt-2 font-mono">
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
            className="rounded-lg border border-border/40 bg-background/35 p-3"
          >
            <BlueprintValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(value as Record<string, unknown>).map(
          ([key, nestedValue]) => (
            <div
              key={key}
              className="space-y-1 rounded-lg border border-border/40 bg-background/35 p-3"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {humanizeKey(key)}
              </h4>
              <BlueprintValue value={nestedValue} />
            </div>
          ),
        )}
      </div>
    );
  }

  return null;
}

function renderRoadmap(value: unknown) {
  const roadmap = asRecord(value);
  const phases = Object.entries(roadmap);
  if (phases.length === 0)
    return <p className="text-xs text-muted-foreground">Not available</p>;

  return (
    <div className="relative border-l border-primary/25 pl-6 ml-3 space-y-6 py-2">
      {phases.map(([key, phase], idx) => {
        const data = asRecord(phase);
        return (
          <div key={key} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>

            <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-background/50 p-5 shadow-sm transition-all duration-200 hover:border-primary/20">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-3 mb-3">
                <div>
                  <span className="text-[9px] text-primary uppercase font-bold tracking-wider">
                    Phase {idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-foreground">
                    {humanizeKey(key)}
                  </h3>
                </div>
                {data.duration !== undefined && (
                  <span className="w-fit rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    ⏱️ {formatPrimitive(data.duration)}
                  </span>
                )}
              </div>
              <BulletList items={asStringList(data.deliverables)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderCostEstimation(value: unknown) {
  const cost = asRecord(value);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(cost)
          .filter(
            ([, item]) =>
              typeof item === 'object' && item !== null && !Array.isArray(item),
          )
          .map(([key, item]) => (
            <div
              key={key}
              className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-background p-4 shadow-sm"
            >
              <h3 className="mb-3 text-xs font-bold text-foreground uppercase tracking-tight border-b border-border/20 pb-2">
                {humanizeKey(key)}
              </h3>
              <KeyValueGrid data={asRecord(item)} />
            </div>
          ))}
      </div>
      {!!cost.major_cost_drivers && (
        <div className="rounded-xl border border-border/50 bg-background/25 p-4 space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-primary" />
            Major Cost Drivers
          </h3>
          <BulletList items={asStringList(cost.major_cost_drivers)} />
        </div>
      )}
    </div>
  );
}

function renderTeamRequirements(value: unknown) {
  const team = asRecord(value);
  const recommended = asRecordList(team.recommended_team);
  const minimum = asStringList(team.minimum_team);

  return (
    <div className="space-y-6">
      {recommended.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">
            Recommended Team Roles
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/10 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold text-foreground">
                    {formatPrimitive(item.role)}
                  </span>
                  <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase">
                    Required
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formatPrimitive(item.responsibilities)}
                </p>
              </div>
            ))}
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
      {Object.entries(risks).map(([key, list]) => (
        <div key={key} className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase border-b border-border/40 pb-2 tracking-tight">
            {humanizeKey(key)}
          </h3>
          <div className="space-y-3">
            {asRecordList(list).map((risk, index) => (
              <div
                key={index}
                className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 space-y-2.5 relative overflow-hidden"
              >
                <div className="absolute top-2.5 left-2.5 text-amber-500/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="pl-6">
                  <div className="text-xs font-bold text-foreground leading-relaxed">
                    {formatPrimitive(risk.risk)}
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                      Mitigation
                    </span>
                    {formatPrimitive(risk.mitigation)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
  const groups = asRecord(value);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Object.entries(groups).map(([key, item]) => (
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

function renderBlueprintSection(key: string, value: unknown): ReactNode {
  if (key === 'mvp_definition') return renderMvpDefinition(value);
  if (key === 'target_users') return renderTargetUsers(value);
  if (key === 'technical_architecture')
    return renderTechnicalArchitecture(value);
  if (key === 'development_roadmap') return renderRoadmap(value);
  if (key === 'team_requirements') return renderTeamRequirements(value);
  if (key === 'cost_estimation') return renderCostEstimation(value);
  if (key === 'risk_analysis') return renderRiskAnalysis(value);
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

function BlueprintReport({
  blueprint,
  onSectionChange,
}: {
  blueprint: BlueprintResult;
  onSectionChange?: (section: ActiveReportSection) => void;
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
    body: renderBlueprintSection(key, value),
  }));

  return (
    <ReportReader
      sections={sections}
      initialSectionId="executive_summary"
      onSectionChange={onSectionChange}
    />
  );
}

function AnalysisDetails({
  analysis,
  onSectionChange,
}: {
  analysis: AnalysisResult;
  onSectionChange?: (section: ActiveReportSection) => void;
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(SCORE_LABELS).map(([key, label]) => {
            const rawVal = scores[key];
            const numVal =
              typeof rawVal === 'number'
                ? rawVal
                : parseFloat(String(rawVal)) || 0;
            const displayVal = rawVal !== undefined ? rawVal : 'N/A';

            let colorClass =
              'text-amber-500 bg-amber-500/10 border-amber-500/20';
            let meterColor = 'bg-amber-500';
            let shadowGlow = 'shadow-[0_0_12px_rgba(245,158,11,0.12)]';
            if (numVal >= 8) {
              colorClass =
                'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
              meterColor = 'bg-emerald-500';
              shadowGlow = 'shadow-[0_0_12px_rgba(16,185,129,0.12)]';
            } else if (numVal < 5 && numVal > 0) {
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
                className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-card/85 to-card/35 p-4 transition-all duration-300 hover:border-primary/30 hover:${shadowGlow} group`}
              >
                <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />

                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate flex-1">
                    {label}
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border ${colorClass} shrink-0`}
                  >
                    {scoreIcon}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-black font-mono text-foreground tracking-tight">
                    {displayVal}
                  </span>
                  {rawVal !== undefined && (
                    <span className="text-xs text-muted-foreground/50">
                      /10
                    </span>
                  )}
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
            cost_estimation: research?.cost_estimation,
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
}: {
  phase: WizardPhase;
  activeReportSection: ActiveReportSection | null;
  activeQuestion: ActiveQuestion | null;
}): SmartSuggestion[] {
  if (phase === 'technical' && activeQuestion) {
    const prefix =
      activeQuestion.kind === 'mandatory'
        ? `Mandatory question ${activeQuestion.index + 1}`
        : `Optional question ${activeQuestion.index + 1}`;
    return [
      {
        label: 'Recommend answer',
        prompt: `${prefix}: "${activeQuestion.question}"\n\nRecommend a strong, practical answer for this business idea. Keep it specific and non-technical enough for a founder.`,
      },
      {
        label: 'Explain question',
        prompt: `${prefix}: "${activeQuestion.question}"\n\nExplain what this question means, why it matters for the build plan, and what details I should include.`,
      },
      {
        label: 'Improve my answer',
        prompt: `${prefix}: "${activeQuestion.question}"\n\nReview my current answer from the form context and rewrite it to be clearer, more complete, and more useful for generating the blueprint.`,
      },
    ];
  }

  if ((phase === 'analysis' || phase === 'blueprint') && activeReportSection) {
    const sectionName = activeReportSection.title;
    const base = `Current report section: ${sectionName}`;
    const sectionId = activeReportSection.id.toLowerCase();

    if (sectionId.includes('swot')) {
      return [
        {
          label: 'Summarize SWOT',
          prompt: `${base}\n\nSummarize this SWOT section in simple founder-friendly language.`,
        },
        {
          label: 'Turn into actions',
          prompt: `${base}\n\nConvert the SWOT section into prioritized next actions for the founder.`,
        },
        {
          label: 'Biggest weakness',
          prompt: `${base}\n\nWhich weakness or threat is the most urgent, and how should I handle it first?`,
        },
      ];
    }

    if (sectionId.includes('risk')) {
      return [
        {
          label: 'Prioritize risks',
          prompt: `${base}\n\nRank the risks by urgency and explain the first mitigation step for each.`,
        },
        {
          label: 'Reduce risk',
          prompt: `${base}\n\nGive me practical ways to reduce the most important risks before building.`,
        },
        {
          label: 'Investor concerns',
          prompt: `${base}\n\nWhat concerns would an investor or senior operator raise after reading this risk section?`,
        },
      ];
    }

    if (sectionId.includes('mvp')) {
      return [
        {
          label: 'Tighten MVP',
          prompt: `${base}\n\nSuggest a leaner MVP scope and explain what can be delayed without hurting launch quality.`,
        },
        {
          label: 'Feature priority',
          prompt: `${base}\n\nPrioritize these MVP features by user value, build effort, and launch dependency.`,
        },
        {
          label: 'Missing feature',
          prompt: `${base}\n\nIdentify any critical MVP feature that may be missing or underspecified.`,
        },
      ];
    }

    if (sectionId.includes('cost')) {
      return [
        {
          label: 'Explain budget',
          prompt: `${base}\n\nExplain the budget estimate in plain language and highlight the biggest cost drivers.`,
        },
        {
          label: 'Reduce cost',
          prompt: `${base}\n\nSuggest ways to reduce MVP cost without damaging the core product outcome.`,
        },
        {
          label: 'Budget risks',
          prompt: `${base}\n\nWhat budget assumptions are risky or need validation before hiring?`,
        },
      ];
    }

    if (sectionId.includes('team')) {
      return [
        {
          label: 'Hiring plan',
          prompt: `${base}\n\nTurn this team section into a practical hiring plan with role priority and sequencing.`,
        },
        {
          label: 'Minimum team',
          prompt: `${base}\n\nExplain the minimum team needed to ship the first usable version.`,
        },
        {
          label: 'Role tradeoffs',
          prompt: `${base}\n\nWhat role tradeoffs can we make if budget or timeline is tight?`,
        },
      ];
    }

    return [
      {
        label: `Summarize ${sectionName}`,
        prompt: `${base}\n\nSummarize this section into the key points I should remember.`,
      },
      {
        label: 'Next decisions',
        prompt: `${base}\n\nWhat decisions should I make based on this section before moving forward?`,
      },
      {
        label: 'Explain simply',
        prompt: `${base}\n\nExplain this section in simpler language and call out anything that needs validation.`,
      },
    ];
  }

  if (phase === 'idea') {
    return [
      {
        label: 'Improve idea',
        prompt:
          'Help me make this business idea clearer and stronger before analysis.',
      },
      {
        label: 'What details matter?',
        prompt:
          'What details should I include so Phase 1 can produce a better business analysis?',
      },
      {
        label: 'Check clarity',
        prompt:
          'Review my current idea input and tell me what is missing or vague.',
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingBlueprintPdf, setDownloadingBlueprintPdf] = useState(false);
  const [talentRecommendationReport, setTalentRecommendationReport] =
    useState<TalentRecommendationReport | null>(null);
  const [selectedTalentKeys, setSelectedTalentKeys] = useState<
    Record<string, boolean>
  >({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeReportSection, setActiveReportSection] =
    useState<ActiveReportSection | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(
    null,
  );
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [usedAiSuggest, setUsedAiSuggest] = useState<Record<string, boolean>>(
    {},
  );
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({});
  const [isChatOpen, setChatOpen] = useState(true);
  const [expandedRefineFields, setExpandedRefineFields] = useState<
    Record<string, boolean>
  >({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

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
      const prompt = `Recommend a strong, practical answer for this business idea.
Question: "${questionText}"
Please return ONLY the recommended answer itself, without any introductory or conversational text (no "Here is...", no markdown code blocks), so it can be inserted directly into the text input.`;

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
    }
    if (phase !== 'analysis' && phase !== 'blueprint') {
      setActiveReportSection(null);
    }
  }, [phase]);

  useEffect(() => {
    if (!launchJob?.sessionId) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

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
    intervalId = setInterval(pollStatus, 2500);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [launchJob?.sessionId, launchJob?.phase]);

  const askLaunchAi = async (suggestedMessage?: string) => {
    const message = (suggestedMessage ?? chatInput).trim();
    if (!message || aiLoading) return;
    if (!sessionData?._id) {
      toast.info(
        'Analyze the business idea first, then the AI can use the saved Phase 1 context.',
      );
      return;
    }

    setChatInput('');
    setAiLoading(true);
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      userId: user?._id,
      userName: user?.name ?? 'You',
      message,
      isAi: false,
      createdAt: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    scrollChatToBottom();

    try {
      const clientContext = [
        `Current frontend phase: ${phase}`,
        `Active report section:\n${activeReportSection ? `${activeReportSection.title} (${activeReportSection.id})` : 'No report section selected.'}`,
        `Focused Phase 2 question:\n${activeQuestion ? `${activeQuestion.kind} question ${activeQuestion.index + 1}: ${activeQuestion.question}\nCurrent answer: ${answers[activeQuestion.questionId]?.trim() || 'Not answered yet'}` : 'No Phase 2 question focused.'}`,
        `Current idea input:\n${description || 'Not available'}`,
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
      const aiMessage: ChatMessage = data.message ?? {
        id: `ai-${Date.now()}`,
        userName: 'DEHIX AI',
        message: data.reply ?? "I couldn't process that.",
        isAi: true,
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      scrollChatToBottom();
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
              {isRefineOpen ? 'Close Refine' : 'Refine with AI'}
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

  const downloadValidationPdf = async () => {
    if (!sessionData?._id || downloadingPdf) return;
    setDownloadingPdf(true);
    setError('');
    try {
      const res = await fetch(
        `/api/launch/${sessionData._id}/business-validation.pdf`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) {
        throw new Error(
          await readApiError(res, 'Failed to download analysis PDF'),
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `business-analysis-${sessionData._id}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to download analysis PDF';
      setError(msg);
      toast.error(msg);
    } finally {
      setDownloadingPdf(false);
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
        throw new Error(
          await readApiError(res, 'Failed to download blueprint PDF'),
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `business-blueprint-${sessionData._id}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
      const res = await fetch(
        `/api/launch/${sessionData._id}/talent-recommendations`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
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
      };
      setTalentRecommendationReport(report);
      setSelectedTalentKeys(buildDefaultSelectedTalentKeys(report));
      setPhase('recommendations');
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to generate talent recommendations';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const recommendationKey = (recommendation: TalentRecommendation) =>
    `${recommendation.talentId}:${recommendation.matchedRole.roleTitle}`;

  const buildDefaultSelectedTalentKeys = (
    report: TalentRecommendationReport,
  ) => {
    const defaults: Record<string, boolean> = {};
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
      const ordered = [
        ...(group.availableMatches ?? []),
        ...(group.topMatches ?? []),
        ...(group.unavailableMatches ?? []),
      ];
      const selected =
        ordered.find(
          (recommendation) =>
            !alreadyPickedTalentIds.has(String(recommendation.talentId)),
        ) ?? ordered[0];
      if (!selected) continue;
      alreadyPickedTalentIds.add(String(selected.talentId));
      defaults[recommendationKey(selected)] = true;
    }
    return defaults;
  };

  const groupedRecommendationTeams: RoleRecommendationGroup[] =
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

  const selectedTalentRecommendations = talentRecommendationReport
    ? talentRecommendationReport.recommendations.filter(
        (recommendation) =>
          selectedTalentKeys[recommendationKey(recommendation)],
      )
    : [];

  const enterRoomDashboard = async () => {
    if (!sessionData?._id || creatingRoom) return;
    const missing = mandatoryQuestions.filter(
      (question) => !answers[question._id]?.trim(),
    );
    if (missing.length > 0) {
      toast.error('Please answer all mandatory questions');
      setPhase('technical');
      return;
    }

    setCreatingRoom(true);
    setError('');
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
      navigate(`/room/${room._id}`);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to enter room dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setCreatingRoom(false);
    }
  };
  const research = analysis?.research_analysis;
  const smartSuggestions = buildSmartSuggestions({
    phase,
    activeReportSection,
    activeQuestion,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/90 backdrop-blur-sm">
        <div
          className={`${phase === 'idea' || !isChatOpen ? 'max-w-5xl' : 'max-w-[1400px]'} mx-auto px-6 h-14 flex items-center justify-between transition-all duration-300`}
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
                <span className="text-sm text-muted-foreground truncate max-w-[240px]">
                  {sessionData.projectTitle}
                </span>
              </>
            )}
          </div>
          {phase !== 'idea' && (
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
        className={`${phase === 'idea' || !isChatOpen ? 'max-w-5xl' : 'max-w-[1400px] grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'} mx-auto px-6 py-10 transition-all duration-300`}
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
                phase === key || (phase === 'blueprint' && key === 'technical');
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
                    Analyze the business idea first
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Describe the idea in normal language. Gemini AI will only
                    analyze the business side here: market, audience,
                    competitors, revenue, risks, score, and verdict.
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card overflow-hidden focus-within:border-primary/40 transition-colors">
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Example: I want to build a platform for local restaurants to predict demand and reduce ingredient waste..."
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/40 resize-none p-6 outline-none text-base leading-relaxed min-h-[190px]"
                    rows={7}
                  />
                  <div className="border-t border-border/40 px-6 py-3 flex items-center justify-between gap-3">
                    <span
                      className={`text-xs ${description.length < 20 ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}
                    >
                      {description.length} chars{' '}
                      {description.length < 20 && description.length > 0
                        ? '- add more detail'
                        : ''}
                    </span>
                    <Button
                      onClick={validateIdea}
                      disabled={validating || description.trim().length < 20}
                    >
                      Analyze business
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground/60 mb-2 uppercase tracking-wider font-medium">
                    Try an example
                  </div>
                  <div className="grid gap-2">
                    {EXAMPLE_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setDescription(prompt)}
                        className="w-full text-left text-xs text-muted-foreground/70 hover:text-muted-foreground border border-border/30 hover:border-border/60 rounded-lg px-4 py-3 transition-all leading-relaxed"
                      >
                        {prompt}
                      </button>
                    ))}
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
                      disabled={loadingQuestions || downloadingPdf}
                    >
                      Edit idea
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadValidationPdf}
                      disabled={downloadingPdf}
                    >
                      {downloadingPdf ? 'Preparing...' : 'Download PDF'}
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
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm ${
                            research.final_verdict
                              .toLowerCase()
                              .includes('viable')
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : research.final_verdict
                                    .toLowerCase()
                                    .includes('work')
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
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
                          <span>AI flagged this idea for clarification.</span>
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
                        We've generated the business requirements based on your
                        idea. Use the fields below to customize, adjust, or use
                        AI to refine specific values before generating the
                        technical blueprint.
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
                <div>
                  <div className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                    Phase 3 intake
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Answer blueprint questions
                  </h1>
                  <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                    The fixed questions are mandatory. The optional questions
                    are generated from the business idea and make the final
                    blueprint more specific.
                  </p>
                </div>

                <div className="space-y-6">
                  {mandatoryQuestions.map((question, index) => {
                    const isSuggestingThis = suggestingId === question._id;
                    const value = answers[question._id] || '';
                    const refineVal = refineInputs[question._id] || '';
                    const isRefineOpen =
                      expandedRefineFields[question._id] || false;

                    const hasSuggested = usedAiSuggest[question._id] || false;

                    return (
                      <div
                        key={question._id}
                        className="space-y-3 rounded-xl border border-border/30 bg-background/20 p-4 transition-all hover:border-border/50"
                      >
                        <div className="flex items-start justify-between gap-4 w-full">
                          <label className="text-sm font-semibold text-foreground flex-1 leading-relaxed">
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
                                handleAiSuggest(question._id, question.question)
                              }
                              disabled={suggestingId !== null || hasSuggested}
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
                                  : 'Refine with AI'}
                              </Button>
                            )}
                          </div>
                        </div>
                        <textarea
                          value={value}
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
                                textareaRefs.current[`refine_${question._id}`] =
                                  el;
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
                          These are based on your specific idea. Answer the ones
                          you can.
                        </p>
                      </div>
                      {optionalQuestions.map((question, index) => {
                        const isSuggestingThis = suggestingId === question._id;
                        const value = answers[question._id] || '';
                        const refineVal = refineInputs[question._id] || '';
                        const isRefineOpen =
                          expandedRefineFields[question._id] || false;

                        const hasSuggested =
                          usedAiSuggest[question._id] || false;

                        return (
                          <div
                            key={question._id}
                            className="space-y-3 rounded-xl border border-border/30 bg-background/20 p-4 transition-all hover:border-border/50"
                          >
                            <div className="flex items-start justify-between gap-4 w-full">
                              <label className="text-sm font-semibold text-foreground flex-1 leading-relaxed">
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
                                      : 'Refine with AI'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            <textarea
                              value={value}
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
                    <p className="text-muted-foreground max-w-2xl">
                      This report uses the Phase 2 analysis plus the mandatory
                      and optional Phase 3 answers.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => setPhase('analysis')}
                      disabled={
                        downloadingBlueprintPdf ||
                        creatingRoom ||
                        loadingRecommendations
                      }
                    >
                      Edit Phase 2
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPhase('technical')}
                      disabled={
                        downloadingBlueprintPdf ||
                        creatingRoom ||
                        loadingRecommendations
                      }
                    >
                      Edit answers
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadBlueprintPdf}
                      disabled={
                        downloadingBlueprintPdf ||
                        creatingRoom ||
                        loadingRecommendations
                      }
                    >
                      {downloadingBlueprintPdf
                        ? 'Preparing...'
                        : 'Download PDF'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={enterRoomDashboard}
                      disabled={creatingRoom || loadingRecommendations}
                    >
                      {creatingRoom ? 'Preparing room...' : 'Skip matches'}
                    </Button>
                    <Button
                      onClick={generateTalentRecommendations}
                      disabled={loadingRecommendations || creatingRoom}
                    >
                      {loadingRecommendations
                        ? 'Finding talent...'
                        : 'Generate phase 4 matches'}
                    </Button>
                  </div>
                </div>

                <BlueprintReport
                  blueprint={blueprint}
                  onSectionChange={setActiveReportSection}
                />
              </div>
            ))}

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
                      Recommended talent for this budget
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                      Candidates are ranked using verified reputation, previous
                      work, GitHub score, skill fit, availability, and budget
                      fit.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => setPhase('blueprint')}
                      disabled={creatingRoom || loadingRecommendations}
                    >
                      Back to blueprint
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
                      onClick={enterRoomDashboard}
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
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Detected MVP budget
                    </div>
                    <div className="text-2xl font-bold font-mono text-primary">
                      {formatCurrency(talentRecommendationReport.budgetUsd)}
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

                {talentRecommendationReport.recommendations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/50 p-10 text-center">
                    <h2 className="font-semibold mb-2">
                      No verified talent matched yet
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                      The room can still be created. Once more verified talent
                      credentials exist, this phase will rank them
                      automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedRecommendationTeams.map((group) => (
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
                                  .map((keyword) => (
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
                          <div className="text-xs text-muted-foreground md:text-right">
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
                          ['Available first', group.availableMatches],
                          ['Not available right now', group.unavailableMatches],
                        ].map(([label, matches]) =>
                          Array.isArray(matches) && matches.length > 0 ? (
                            <div key={String(label)} className="space-y-3">
                              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {String(label)}
                              </div>
                              <div className="grid gap-3">
                                {matches.map((recommendation) => {
                                  const key = recommendationKey(recommendation);
                                  const selected = !!selectedTalentKeys[key];
                                  return (
                                    <div
                                      key={key}
                                      className={`rounded-xl border p-4 transition-colors ${selected ? 'border-primary/50 bg-primary/10' : 'border-border/40 bg-background/35'}`}
                                    >
                                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-3 min-w-0">
                                          <button
                                            onClick={() =>
                                              setSelectedTalentKeys((prev) => ({
                                                ...prev,
                                                [key]: !prev[key],
                                              }))
                                            }
                                            className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border/60'}`}
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
                                                {recommendation.user.name}
                                              </h3>
                                              <span
                                                className={`text-[10px] rounded border px-2 py-0.5 ${(recommendation.user.availabilityRank ?? 0) >= 2 ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}
                                              >
                                                {recommendation.user
                                                  .availabilityLabel ??
                                                  (recommendation.user.isOnline
                                                    ? 'Available now'
                                                    : 'Not available rn')}
                                              </span>
                                              {recommendation.user.location && (
                                                <span className="text-[10px] rounded border border-border/40 px-2 py-0.5 text-muted-foreground">
                                                  {recommendation.user.location}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-sm text-primary mt-1">
                                              {
                                                recommendation.credential
                                                  .skillDomain
                                              }
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              L{recommendation.credential.level}{' '}
                                              -{' '}
                                              {
                                                recommendation.credential
                                                  .reputationScore
                                              }{' '}
                                              rep -{' '}
                                              {
                                                recommendation.credential
                                                  .projectsCompleted
                                              }{' '}
                                              projects - GitHub{' '}
                                              {
                                                recommendation.credential
                                                  .githubScore
                                              }
                                            </p>
                                            {recommendation.matchedKeywords
                                              ?.length ? (
                                              <div className="flex flex-wrap gap-1.5 mt-3">
                                                {recommendation.matchedKeywords
                                                  .slice(0, 8)
                                                  .map((keyword) => (
                                                    <span
                                                      key={keyword}
                                                      className="text-[10px] border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 rounded px-1.5 py-0.5"
                                                    >
                                                      {keyword}
                                                    </span>
                                                  ))}
                                              </div>
                                            ) : null}
                                            {recommendation.missingKeywords
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
                                              {recommendation.finalScore}
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
                                                selected ? 'default' : 'outline'
                                              }
                                              onClick={() =>
                                                setSelectedTalentKeys(
                                                  (prev) => ({
                                                    ...prev,
                                                    [key]: !prev[key],
                                                  }),
                                                )
                                              }
                                            >
                                              {selected ? 'Selected' : 'Select'}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() =>
                                                navigate(
                                                  `/talent/profile/${recommendation.talentId}`,
                                                )
                                              }
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
                                            recommendation.scoreBreakdown
                                              .skillMatchScore
                                          }
                                        />
                                        <ScorePill
                                          label="Availability"
                                          value={
                                            recommendation.scoreBreakdown
                                              .availabilityScore
                                          }
                                        />
                                        <ScorePill
                                          label="Budget fit"
                                          value={
                                            recommendation.scoreBreakdown
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
                    ))}
                  </div>
                )}
              </div>
            ))}
        </main>

        {phase !== 'idea' && isChatOpen && (
          <aside className="lg:sticky lg:top-20 h-[min(720px,calc(100vh-6rem))] rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 to-background/95 flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-300 relative">
            {/* Subtle decoration orb */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="shrink-0 border-b border-border/40 px-4 py-4 relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500" />
                    <h2 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 uppercase">
                      <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                      DEHIX AI
                    </h2>
                    <span className="shrink-0 text-[8px] rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-primary font-bold tracking-wider uppercase">
                      Live context
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">
                    {sessionData?._id
                      ? 'Personalized AI Launch Assistant'
                      : 'Available after Phase 1 analysis.'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
                  onClick={() => setChatOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
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
                        onClick={() => askLaunchAi(suggestion.prompt)}
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

      {phase !== 'idea' && !isChatOpen && (
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
          className={`fixed bottom-6 ${
            phase !== 'idea' && !isChatOpen ? 'right-20' : 'right-6'
          } h-12 w-12 rounded-full shadow-2xl flex items-center justify-center bg-card border border-border/80 text-foreground hover:bg-muted hover:scale-105 transition-all duration-200 z-50 animate-in fade-in zoom-in-50`}
          size="icon"
          variant="outline"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
