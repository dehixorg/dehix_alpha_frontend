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
} from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';

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
import InterviewGroupCard from '@/components/business/interview/InterviewGroupCard';
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
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
  status: string;
  htmlLink?: string;
  hangoutLink?: string;
}

type InterviewStatus = 'current' | 'scheduled' | 'history';

const getInterviewStatus = (meeting: Meeting): InterviewStatus => {
  const now = new Date();
  const startTime = new Date(meeting.start.dateTime);
  const endTime = new Date(meeting.end.dateTime);

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
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');

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
      const response = await axiosInstance.get('/meeting', {
        params: {
          limit: 100,
          offset: 0,
        },
      });
      setMeetings(response.data?.data || []);
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

  // Filter and categorize interviews
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

  // Group by date
  const groupedMeetings = useMemo(() => {
    return groupByDate(filteredMeetings);
  }, [filteredMeetings]);

  const tabCounts = useMemo(
    () => ({
      current: meetings.filter((m) => getInterviewStatus(m) === 'current').length,
      scheduled: meetings.filter((m) => getInterviewStatus(m) === 'scheduled')
        .length,
      history: meetings.filter((m) => getInterviewStatus(m) === 'history').length,
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
          breadcrumbItems={[{ label: 'Interviews', link: '/business/interviews' }]}
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
                <Tabs value={slug} onValueChange={handleTabChange} className="w-full">
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
                        {filteredMeetings.length === 0 ? (
                          <EmptyState
                            icon="📅"
                            title="No interviews found"
                            description={`No interviews in the ${slug} category.`}
                          />
                        ) : (
                          <div className="space-y-6">
                            {Object.entries(groupedMeetings).map(
                              ([dateGroup, groupMeetings]) => {
                                const firstMeeting = groupMeetings[0];
                                const date = new Date(firstMeeting.start.dateTime);
                                const formattedDate = date.toLocaleDateString(
                                  undefined,
                                  {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                  },
                                );

                                return (
                                  <div key={dateGroup} className="space-y-3">
                                    <div className="flex items-start justify-between gap-3 px-1">
                                      <div>
                                        <h2 className="text-base font-semibold tracking-tight">
                                          {dateGroup}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                          {formattedDate}
                                        </p>
                                      </div>
                                      <div className="shrink-0 rounded-md border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
                                        {groupMeetings.length}
                                      </div>
                                    </div>
                                    <div
                                      className={`grid gap-3 ${
                                        viewType === 'grid'
                                          ? 'md:grid-cols-2 lg:grid-cols-3'
                                          : 'grid-cols-1'
                                      }`}
                                    >
                                      {groupMeetings.map((meeting) => (
                                        <InterviewGroupCard
                                          key={meeting.id}
                                          meeting={meeting}
                                          viewType={viewType}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
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
