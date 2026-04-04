'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ListVideo,
  Calendar,
  History,
  Search,
  Table,
  Grid3x3,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import EmptyState from '@/components/shared/EmptyState';
import InterviewItemCard from '@/components/freelancer/interview/InterviewItemCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';

interface Meeting {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  interviewer?: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    skills?: string[];
    avatar?: string;
  };
  interviewee?: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    skills?: string[];
    avatar?: string;
  };
  status: string;
  interviewType: string;
  htmlLink?: string;
  hangoutLink?: string;
  interviewStatus?: string;
  interviewDate?: string;
  name?: string;
  talentName?: string;
}

const mapInterviewToMeeting = (interview: any): Meeting => {
  return {
    ...interview,
    id: interview._id,
    summary: interview.talentName || 'Professional Interview',
    description: interview.description || `Interview for ${interview.talentName || 'Talent'}`,
    start: {
      dateTime: interview.interviewDate,
      timeZone: 'UTC',
    },
    end: {
      dateTime: new Date(new Date(interview.interviewDate).getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC',
    },
    status: (interview.interviewStatus || interview.InterviewStatus || 'PENDING').toLowerCase(),
    interviewType: (interview.interviewType || 'TALENT').toUpperCase(),
    hangoutLink: interview.meetingLink,
  };
};

type InterviewStatus = 'current' | 'scheduled' | 'history';

const getInterviewStatus = (meeting: Meeting): InterviewStatus => {
  const now = new Date();
  const startTime = new Date(meeting.start.dateTime);
  const endTime = new Date(meeting.end.dateTime);
  const dbStatus = (meeting.interviewStatus || '').toUpperCase();

  if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(dbStatus)) {
    return 'history';
  }

  if (dbStatus === 'ONGOING') {
    return 'current';
  }

  if (startTime <= now && now < endTime) {
    return 'current';
  } else if (startTime > now) {
    return 'scheduled';
  } else {
    return 'history';
  }
};

const groupByDate = (meetings: Meeting[]) => {
  const grouped: Record<string, Meeting[]> = {};

  meetings.forEach((meeting) => {
    const date = new Date(meeting.start.dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateKey: string;

    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateKey = 'Tomorrow';
    } else {
      dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(meeting);
  });

  return grouped;
};

export default function BusinessInterviewsPage() {
  const params = useParams();
  const router = useRouter();

  const slugParam = Array.isArray(params?.slug) ? params.slug : [];
  const slug = slugParam[0] || 'current';
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewType, setViewType] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    if (!['current', 'scheduled', 'history'].includes(slug)) {
      router.replace('/business/interviews/current');
    }
  }, [slug, router]);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/interview/business', {
        params: {
          limit: 100,
        },
      });

      const data = response.data?.data || {};
      const allInterviews = [
        ...(data.PROJECT || []),
        ...(data.TALENT || []),
      ];

      const mappedMeetings = allInterviews.map(mapInterviewToMeeting);
      setMeetings(mappedMeetings);
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      notifyError(
        error.response?.data?.message || 'Failed to fetch interviews',
        'Error',
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = useMemo(() => {
    let filtered = meetings.filter((m) => {
      const status = getInterviewStatus(m);
      const matchesTab = status === slug;
      const matchesSearch =
        m.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    return filtered;
  }, [meetings, slug, searchQuery, filterStatus]);

  const sections = [
    {
      key: 'TALENT',
      title: 'Talent',
      description: 'Interviews from your Dehix Talent profile',
      icon: GraduationCap,
      iconClassName: 'bg-blue-500/10 text-blue-500',
    },
    {
      key: 'PROJECT',
      title: 'Projects',
      description: 'Interviews scheduled for your projects',
      icon: Briefcase,
      iconClassName: 'bg-emerald-500/10 text-emerald-500',
    },
  ] as const;

  const groupedBySection = useMemo(() => {
    const grouped: Record<string, Meeting[]> = {
      TALENT: [],
      PROJECT: [],
    };

    filteredMeetings.forEach((m) => {
      const type = (m.interviewType || '').toUpperCase();
      if (grouped[type]) {
        grouped[type].push(m);
      } else if (type === 'PROJECT') {
        grouped['PROJECT'].push(m);
      } else if (type === 'TALENT') {
        grouped['TALENT'].push(m);
      }
    });

    return grouped;
  }, [filteredMeetings]);

  const getStatusBadge = (statusRaw: string) => {
    const status = String(statusRaw || '').toUpperCase().trim();
    const base = 'inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-tight';

    if (status === 'APPROVED' || status === 'COMPLETED')
      return { label: status, className: `${base} bg-[#E3F8EE] text-[#00BA77] border border-[#BFF3D9]` };
    if (status === 'ONGOING' || status === 'SCHEDULED')
      return { label: status, className: `${base} bg-[#DEE7FF] text-[#4F78FF] border border-[#C7D7FF]` };
    if (status === 'PENDING' || status === 'APPLIED')
      return { label: status, className: `${base} bg-amber-100 text-amber-700 border border-amber-200` };
    if (status === 'REJECTED' || status === 'CANCELLED')
      return { label: status, className: `${base} bg-red-100 text-red-700 border border-red-200` };

    return { label: status || '-', className: `${base} bg-muted text-muted-foreground border border-border` };
  };

  const renderTable = () => {
    const allItems = sections.flatMap((s) =>
      (groupedBySection[s.key] || []).map((item) => ({ item, section: s }))
    );

    if (allItems.length === 0) {
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
            <tr className="text-left font-medium">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Talent</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Meeting</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map(({ item, section }) => {
              const relatedUser = item.interviewee || item.interviewer;
              const fullName = relatedUser 
                ? `${relatedUser.firstName || ''} ${relatedUser.lastName || ''}`.trim() || relatedUser.userName
                : item?.name || item?.talentName || '-';
              
              const skill = relatedUser?.skills && relatedUser.skills.length > 0 ? relatedUser.skills[0] : '';
              const talentDetails = skill ? `${fullName} (${skill})` : fullName;

              const statusInfo = getStatusBadge(item.status);
              const meetingLink = item.hangoutLink || '';

              return (
                <tr key={item.id} className="border-t hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold ${section.iconClassName}`}>
                      {section.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#1A1A1A] dark:text-white/90">{talentDetails}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#666666] dark:text-[#8C8C8C]">
                    {new Date(item.start.dateTime).toLocaleString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={statusInfo.className}>{statusInfo.label}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {meetingLink ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 font-bold text-xs rounded-xl border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white hover:bg-white/90 dark:hover:bg-[#262626] shadow-sm"
                        onClick={() => window.open(meetingLink, '_blank')}
                      >
                        Open
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
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

  const tabCounts = useMemo(
    () => ({
      current: meetings.filter((m) => getInterviewStatus(m) === 'current')
        .length,
      scheduled: meetings.filter((m) => getInterviewStatus(m) === 'scheduled')
        .length,
      history: meetings.filter((m) => getInterviewStatus(m) === 'history')
        .length,
    }),
    [meetings],
  );

  const handleTabChange = (tab: string) => {
    router.push(`/business/interviews/${tab}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Interviews"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Interviews"
          breadcrumbItems={[
            { label: 'Interviews', link: '/business/interviews' },
          ]}
        />
        <main className="flex-1 px-4 sm:px-10 sm:py-2">
          <div className="mx-auto w-full max-w-none">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Interviews
                </CardTitle>
                <CardDescription>
                  Track your interviews, scheduled meetings, and history.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Tabs */}
                <Tabs
                  value={slug}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <div className="border-b px-2 sm:px-6">
                    <TabsList className="bg-transparent h-12 w-full justify-start p-0">
                      <TabsTrigger
                        value="current"
                        className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <ListVideo className="h-4 w-4" />
                        <span>Current</span>
                        {tabCounts.current > 0 && (
                          <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                            {tabCounts.current}
                          </span>
                        )}
                      </TabsTrigger>

                      <TabsTrigger
                        value="scheduled"
                        className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Scheduled</span>
                        {tabCounts.scheduled > 0 && (
                          <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                            {tabCounts.scheduled}
                          </span>
                        )}
                      </TabsTrigger>

                      <TabsTrigger
                        value="history"
                        className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <History className="h-4 w-4" />
                        <span>History</span>
                        {tabCounts.history > 0 && (
                          <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                            {tabCounts.history}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="space-y-6 p-4 sm:p-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <div className="flex gap-3 flex-1">
                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search interviews..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={viewType === 'list' ? 'default' : 'outline'}
                          size="sm"
                          className="h-9 gap-2"
                          onClick={() => setViewType('list')}
                        >
                          <Table className="h-4 w-4" />
                          Table
                        </Button>
                        <Button
                          variant={viewType === 'grid' ? 'default' : 'outline'}
                          size="sm"
                          className="h-9 gap-2"
                          onClick={() => setViewType('grid')}
                        >
                          <BoxModelIcon className="h-4 w-4" />
                          Cards
                        </Button>
                      </div>
                    </div>

                    {loading ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Content */}
                        {viewType === 'list' ? (
                          filteredMeetings.length === 0 ? (
                            <EmptyState
                              icon="📅"
                              title="No interviews found"
                              description={`No interviews in the ${slug} category.`}
                            />
                          ) : (
                            renderTable()
                          )
                        ) : (
                          <Accordion
                            type="single"
                            collapsible
                            defaultValue={sections[0].key}
                            className="w-full"
                          >
                            {sections.map((section, idx) => {
                              const items = groupedBySection[section.key] || [];
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
                                  <AccordionContent className="px-4 pb-6">
                                    {items.length === 0 ? (
                                      <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/5 py-12 px-4 text-center">
                                        <h3 className="text-[18px] font-bold tracking-tight text-foreground/90 dark:text-white">
                                          No interviews found
                                        </h3>
                                        <p className="mt-1.5 text-[14px] font-medium text-muted-foreground/70">
                                          Try adjusting your search or filters.
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                                        {items.map((meeting) => (
                                          <InterviewItemCard
                                            key={meeting.id}
                                            item={meeting as any}
                                            hideIds={true}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        )}
                      </>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
