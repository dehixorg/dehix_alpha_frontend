'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import { axiosInstance } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { notifyError } from '@/utils/toastMessage';

export default function CurrentComponent() {
  const [filter, setFilter] = React.useState<'All' | 'Skills' | 'Domain'>(
    'All',
  );
  const [, setIsTableView] = useState(true);
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
        const response = await axiosInstance.get('/interview/interviewer', {
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
  }, [user?.uid]);

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
              onClick={() => window.open(meetingLink, '_blank', 'noopener,noreferrer')}
            >
              Open meeting
            </Button>
          ) : null}
        </CardContent>
      </Card>
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
            <Button
              onClick={() => setIsTableView(true)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsTableView(false)}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <BoxModelIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
      </div>
    </>
  );
}
