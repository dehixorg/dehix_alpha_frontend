'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  GraduationCap,
  Handshake,
  Search,
  Table,
  TrendingUp,
  Users2,
  UserRoundCheck,
} from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import InterviewItemCard from '@/components/freelancer/interview/InterviewItemCard';
import { axiosInstance } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { notifyError } from '@/utils/toastMessage';

type InterviewApiRole = 'interviewer' | 'interviewee';

type CurrentComponentProps = {
  apiRole?: InterviewApiRole;
  hideIds?: boolean;
  showTodaySummary?: boolean;
  enableViewToggle?: boolean;
};

export default function CurrentComponent({
  apiRole = 'interviewer',
  hideIds = false,
  showTodaySummary = false,
  enableViewToggle = false,
}: CurrentComponentProps) {
  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>(
    'All',
  );
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [tableSort, setTableSort] = useState<'dateAsc' | 'dateDesc'>('dateAsc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const user = useSelector((state: RootState) => state.user);

  interface InterviewItem {
    _id: string;
    interviewerId?: string;
    intervieweeId?: string;
    creatorId?: string;
    interviewType?: string;
    interviewStatus?: string;
    talentType?: string;
    talentId?: string;
    name?: string;
    talentName?: string;
    interviewDate?: string;
    description?: string;
    meetingLink?: string;
    intervieweeDateTimeAgreement?: boolean;
    createdAt?: string;
    updatedAt?: string;
    transaction?: {
      transactionId?: string;
      status?: string;
      fee?: string;
    };
  }

  type GroupedInterviews = Record<string, InterviewItem[]>;

  const [grouped, setGrouped] = useState<GroupedInterviews>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        if (!user?.uid) return;

        setIsLoading(true);
        const response = await axiosInstance.get(`/interview/${apiRole}`, {
          params: {
            interviewStatus: 'current',
          },
        });

        const data: GroupedInterviews = response?.data?.data || {};
        setGrouped(data);
      } catch (err: any) {
        if (
          err.response?.status === 404 ||
          err.response?.data?.code === 'NOT_FOUND'
        ) {
          setGrouped({});
        } else {
          notifyError('Something went wrong. Please try again.', 'Error');
          console.error('Failed to load data. Please try again.', err);
          setGrouped({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [user?.uid, apiRole]);

  const matchesFilter = (item: InterviewItem) => {
    const t = String(item?.talentType || '').toUpperCase();
    if (filter === 'All') return true;
    if (filter === 'Skills') return t === 'SKILL';
    if (filter === 'Domain') return t === 'DOMAIN';
    return true;
  };

  const matchesSearch = (item: InterviewItem) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      item?._id,
      item?.interviewType,
      item?.interviewStatus,
      item?.talentType,
      item?.talentId,
      item?.name,
      item?.talentName,
      item?.description,
      item?.meetingLink,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  };

  const normalizeList = (list: InterviewItem[] | undefined) => {
    const items = Array.isArray(list) ? list : [];
    return items.filter(matchesFilter).filter(matchesSearch);
  };

  const isToday = (iso: string | undefined) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const sections = [
    {
      key: 'TALENT',
      title: 'Talent',
      description: 'Interviews from your Dehix Talent profile',
      icon: GraduationCap,
      iconClassName: 'bg-blue-500/10 text-blue-600',
    },
    {
      key: 'INTERVIEWER',
      title: 'Interviewer',
      description: 'Interviews related to your interviewer profile',
      icon: UserRoundCheck,
      iconClassName: 'bg-violet-500/10 text-violet-600',
    },
    {
      key: 'PROJECT',
      title: 'Projects',
      description: 'Interviews scheduled for your projects',
      icon: Briefcase,
      iconClassName: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      key: 'PEERTOPEER',
      title: 'Peer to Peer',
      description: 'Peer-to-peer interviews and mock sessions',
      icon: Users2,
      iconClassName: 'bg-sky-500/10 text-sky-600',
    },
    {
      key: 'HIRE',
      title: 'Hire',
      description: 'Hiring interviews and related processes',
      icon: Handshake,
      iconClassName: 'bg-amber-500/10 text-amber-600',
    },
    {
      key: 'GROWTH',
      title: 'Growth',
      description: 'Growth interviews and mentorship sessions',
      icon: TrendingUp,
      iconClassName: 'bg-pink-500/10 text-pink-600',
    },
  ] as const;

  const renderInterviewCard = (item: InterviewItem) => {
    return <InterviewItemCard key={item._id} item={item} hideIds={hideIds} />;
  };

  const getAllItems = () => {
    const getTime = (iso: string | undefined) => {
      if (!iso) return Number.POSITIVE_INFINITY;
      const d = new Date(iso);
      const t = d.getTime();
      return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
    };

    const direction = tableSort === 'dateAsc' ? 1 : -1;

    const rows = sections.flatMap((s) =>
      normalizeList(grouped[s.key]).map((item) => ({ item, section: s })),
    );

    return rows
      .slice()
      .sort(
        (a, b) =>
          (getTime(a.item?.interviewDate) - getTime(b.item?.interviewDate)) *
          direction,
      );
  };

  const renderTable = () => {
    const rows = getAllItems();

    const getStatusBadge = (statusRaw: string) => {
      const status = String(statusRaw || '')
        .toUpperCase()
        .trim();
      const base =
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

      if (status === 'APPROVED')
        return {
          label: status,
          className: `${base} bg-emerald-500/10 text-emerald-600`,
        };
      if (status === 'APPLIED')
        return {
          label: status,
          className: `${base} bg-amber-500/10 text-amber-700`,
        };
      if (status === 'PENDING')
        return {
          label: status,
          className: `${base} bg-slate-500/10 text-slate-700`,
        };
      if (status === 'REJECTED' || status === 'CANCELLED')
        return {
          label: status,
          className: `${base} bg-red-500/10 text-red-600`,
        };
      if (status === 'COMPLETED')
        return {
          label: status,
          className: `${base} bg-blue-500/10 text-blue-600`,
        };

      return {
        label: status || '-',
        className: `${base} bg-muted text-muted-foreground`,
      };
    };

    const getTypeBadgeClassName = (iconClassName: string) => {
      const base =
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
      return `${base} ${iconClassName}`;
    };

    if (isLoading) {
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Talent</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Meeting</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-4 py-3 min-w-[220px]">
                    <Skeleton className="h-5 w-56" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-9 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <EmptyState
          className="py-8"
          title="No interviews found"
          description="Try adjusting your search or filters."
        />
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Talent</th>
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={() =>
                    setTableSort((prev) =>
                      prev === 'dateAsc' ? 'dateDesc' : 'dateAsc',
                    )
                  }
                  className="inline-flex items-center gap-1 hover:underline"
                  aria-label="Sort by date and time"
                >
                  Date
                  {tableSort === 'dateAsc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Meeting</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, section }) => {
              const d = item?.interviewDate
                ? new Date(item.interviewDate)
                : undefined;
              const dateLabel =
                d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : '-';
              const meetingLink = String(item?.meetingLink || '').trim();
              const rowTalentName = String(
                item?.name || item?.talentName || '',
              ).trim();
              const rowTalentTypeLabel = String(item?.talentType || '-')
                .toUpperCase()
                .trim();
              const statusBadge = getStatusBadge(
                String(item?.interviewStatus || ''),
              );

              return (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={getTypeBadgeClassName(section.iconClassName)}
                    >
                      {section.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[220px]">
                    {hideIds
                      ? `${rowTalentTypeLabel}${rowTalentName ? ` - ${rowTalentName}` : ''}`
                      : `${rowTalentTypeLabel} / ${item?.talentId || '-'}${rowTalentName ? ` (${rowTalentName})` : ''}`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{dateLabel}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={statusBadge.className}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {meetingLink ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            meetingLink,
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        Open
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-48">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Skills">Skills</SelectItem>
                  <SelectItem value="Domain">Domain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search interviews..."
                value={searchQuery}
                ref={inputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {enableViewToggle ? (
              <>
                <Button
                  onClick={() => setView('table')}
                  variant={view === 'table' ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 gap-2"
                  type="button"
                >
                  <Table className="h-4 w-4" />
                  Table
                </Button>
                <Button
                  onClick={() => setView('cards')}
                  variant={view === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 gap-2"
                  type="button"
                >
                  <BoxModelIcon className="h-4 w-4" />
                  Cards
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {showTodaySummary
          ? (() => {
              const todayItems = sections
                .flatMap((s) => normalizeList(grouped[s.key]))
                .filter((item) => isToday(item.interviewDate))
                .sort((a, b) =>
                  String(a.interviewDate || '').localeCompare(
                    String(b.interviewDate || ''),
                  ),
                );

              const preview = todayItems.slice(0, 3);

              return (
                <Card className="overflow-hidden">
                  <CardHeader className="gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">Today</CardTitle>
                        <CardDescription className="text-xs">
                          {new Date().toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                      <div className="shrink-0 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground">
                        {todayItems.length}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="h-9 w-28 sm:shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : todayItems.length === 0 ? (
                      <EmptyState
                        className="py-8"
                        title="No interviews found"
                      />
                    ) : (
                      <div className="space-y-2">
                        {preview.map((item) => {
                          const d = item?.interviewDate
                            ? new Date(item.interviewDate)
                            : undefined;
                          const timeLabel = d
                            ? d.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-';
                          const meetingLink = String(
                            item?.meetingLink || '',
                          ).trim();
                          const talentName = String(
                            item?.name || item?.talentName || '',
                          ).trim();

                          return (
                            <div
                              key={item._id}
                              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium">
                                  {timeLabel} •{' '}
                                  {String(
                                    item?.interviewType || 'INTERVIEW',
                                  ).toUpperCase()}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {talentName
                                    ? talentName
                                    : String(
                                        item?.talentType || '-',
                                      ).toUpperCase()}
                                </div>
                              </div>
                              {meetingLink ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="sm:shrink-0"
                                  onClick={() =>
                                    window.open(
                                      meetingLink,
                                      '_blank',
                                      'noopener,noreferrer',
                                    )
                                  }
                                >
                                  Open meeting
                                </Button>
                              ) : null}
                            </div>
                          );
                        })}

                        {todayItems.length > preview.length ? (
                          <div className="text-xs text-muted-foreground">
                            Showing {preview.length} of {todayItems.length}.
                          </div>
                        ) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()
          : null}

        {!enableViewToggle || view === 'cards' ? (
          <Accordion type="single" collapsible defaultValue={sections[0].key}>
            {sections.map((section, idx) => {
              const items = normalizeList(grouped[section.key]);
              const Icon = section.icon;

              return (
                <AccordionItem
                  key={section.key}
                  value={section.key}
                  className={`border rounded-lg${idx === 0 ? '' : ' mt-4'}`}
                >
                  <AccordionTrigger className="group rounded-lg px-4 py-3 transition-colors hover:bg-muted/50 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <div className="flex w-full items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ring-1 ring-inset ring-black/5 transition-colors dark:ring-white/10 ${section.iconClassName}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 text-left leading-tight">
                          <div className="text-sm font-semibold tracking-tight">
                            {section.title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {section.description}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 my-auto mr-2 rounded-md border bg-background px-2.5 py-1 text-xs font-medium tabular-nums text-foreground/70 shadow-sm">
                        {items.length}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {isLoading ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-lg border bg-card/60"
                          >
                            <div className="space-y-3 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <Skeleton className="h-9 w-9 rounded-lg" />
                                  <div className="space-y-2">
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-4 w-40" />
                                  </div>
                                </div>
                                <Skeleton className="h-5 w-20" />
                              </div>

                              <div className="space-y-2 rounded-lg border bg-background/60 p-3">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-4 rounded" />
                                  <Skeleton className="h-4 w-16" />
                                  <Skeleton className="h-4 w-36" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-4 rounded" />
                                  <Skeleton className="h-4 w-44" />
                                </div>
                              </div>

                              <Skeleton className="h-9 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : items.length === 0 ? (
                      <EmptyState
                        className="py-8 mt-2"
                        title="No interviews found"
                        description="Try adjusting your search or filters."
                      />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                        {items.map(renderInterviewCard)}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          renderTable()
        )}
      </div>
    </>
  );
}
