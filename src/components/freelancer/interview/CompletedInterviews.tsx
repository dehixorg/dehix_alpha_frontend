/* eslint-disable prettier/prettier */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowDown,
  ArrowUp,
  GraduationCap,
  Handshake,
  Search,
  Table,
  TrendingUp,
  Users2,
  UserRoundCheck,
  Briefcase,
} from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';

import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notifyError } from '@/utils/toastMessage';

type InterviewApiRole = 'interviewer' | 'interviewee';

type HistoryInterviewsProps = {
  apiRole?: InterviewApiRole;
  enableViewToggle?: boolean;
  hideIds?: boolean;
};

export default function HistoryInterviews({
  apiRole = 'interviewer',
  enableViewToggle = false,
  hideIds = false,
}: HistoryInterviewsProps) {
  const user = useSelector((state: RootState) => state.user);

  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>('All');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [tableSort, setTableSort] = useState<'dateAsc' | 'dateDesc'>('dateDesc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
            interviewStatus: 'history',
          },
        });

        const data: GroupedInterviews = response?.data?.data || {};
        setGrouped(data);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.data?.code === 'NOT_FOUND') {
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
    const interviewDate = item?.interviewDate
      ? new Date(item.interviewDate)
      : undefined;
    const meetingLink = String(item?.meetingLink || '').trim();
    const talentName = String(item?.name || item?.talentName || '').trim();

    return (
      <Card key={item._id} className="overflow-hidden">
        <CardHeader className="gap-1">
          <CardTitle className="text-base">
            {String(item?.interviewType || 'INTERVIEW').toUpperCase()}
          </CardTitle>
          <CardDescription className="text-xs">
            {String(item?.interviewStatus || '-').toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Talent:</span>{' '}
            {String(item?.talentType || '-').toUpperCase()} / {item?.talentId || '-'}
            {talentName ? ` (${talentName})` : ''}
          </div>
          <div className="text-sm">
            <span className="font-medium">Date:</span>{' '}
            {interviewDate ? interviewDate.toLocaleString() : '-'}
          </div>
          {item?.description ? (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </div>
          ) : null}
          {meetingLink ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                window.open(meetingLink, '_blank', 'noopener,noreferrer')
              }
            >
              Open meeting
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  const getStatusBadge = (statusRaw: string) => {
    const status = String(statusRaw || '').toUpperCase().trim();
    const base =
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
    if (status === 'APPROVED')
      return { label: status, className: `${base} bg-emerald-500/10 text-emerald-600` };
    if (status === 'APPLIED')
      return { label: status, className: `${base} bg-amber-500/10 text-amber-700` };
    if (status === 'PENDING')
      return { label: status, className: `${base} bg-slate-500/10 text-slate-700` };
    if (status === 'REJECTED' || status === 'CANCELLED')
      return { label: status, className: `${base} bg-red-500/10 text-red-600` };
    if (status === 'COMPLETED')
      return { label: status, className: `${base} bg-blue-500/10 text-blue-600` };
    return { label: status || '-', className: `${base} bg-muted text-muted-foreground` };
  };

  const getTypeBadgeClassName = (iconClassName: string) => {
    const base =
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
    return `${base} ${iconClassName}`;
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

    if (isLoading) {
      return <div className="text-sm text-muted-foreground">Loading...</div>;
    }

    if (rows.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">No interviews found.</div>
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
                    <span className={getTypeBadgeClassName(section.iconClassName)}>
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
                    <span className={statusBadge.className}>{statusBadge.label}</span>
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
      <div className="flex flex-col gap-4 md:gap-6">
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
                <span className="text-xs text-muted-foreground">View</span>
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
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-9 w-9 place-items-center rounded-md ${section.iconClassName}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left leading-tight">
                          <div className="text-sm font-semibold">
                            {section.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {section.description}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground">
                        {items.length}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : items.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No interviews found.
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
