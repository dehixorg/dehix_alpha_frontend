'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ListVideo,
  Calendar,
  History,
  Search,
  Table,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  LayoutGrid,
  MoreVertical,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { BoxModelIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CardFooter,
} from '@/components/ui/card';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ReviewBidsDetail from '@/components/business/interview/ReviewBidsDetail';

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
  meetingLink?: string;
  interviewStatus?: string;
  interviewDate?: string;
  name?: string;
  talentName?: string;
}

const mapInterviewToMeeting = (interview: any): Meeting => {
  const rawInterviewStatus =
    interview.interviewStatus || interview.InterviewStatus || 'PENDING';

  return {
    ...interview,
    id: interview._id,
    summary: interview.talentName || 'Professional Interview',
    description:
      interview.description ||
      `Interview for ${interview.talentName || 'Talent'}`,
    start: {
      dateTime: interview.interviewDate,
      timeZone: 'UTC',
    },
    end: {
      dateTime: new Date(
        new Date(interview.interviewDate).getTime() + 60 * 60 * 1000,
      ).toISOString(),
      timeZone: 'UTC',
    },
    interviewStatus: rawInterviewStatus.toUpperCase(),
    status: rawInterviewStatus.toLowerCase(),
    interviewType: (interview.interviewType || 'TALENT').toUpperCase(),
    meetingLink: interview.meetingLink,
  };
};

type InterviewStatus = 'current' | 'bids' | 'history';

const getInterviewStatus = (meeting: Meeting): InterviewStatus => {
  const dbStatus = (meeting.interviewStatus || '').toUpperCase();

  if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(dbStatus)) {
    return 'history';
  }

  if (dbStatus === 'BIDDING') {
    return 'bids';
  }

  return 'current';
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

  const isReviewingBids = slug === 'bids' && slugParam.length > 1;
  const reviewInterviewId = isReviewingBids ? slugParam[slugParam.length - 1] : null;

  useEffect(() => {
    if (!['current', 'bids', 'history'].includes(slug)) {
      router.replace('/business/interviews/current');
    }
  }, [slug, router]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/interview/business', {
        params: {
          interviewStatus: slug === 'history' ? 'HISTORY' : 'CURRENT',
        },
      });

      const data = response.data?.data || {};
      // Collect all categorized interviews from the backend (PROJECT, TALENT, HIRE, etc.)
      const allInterviews = Object.values(data).flat();

      const mappedMeetings = (allInterviews as any[]).map(mapInterviewToMeeting);
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

  useEffect(() => {
    fetchMeetings();
  }, [slug]);

  const statusMap: Record<string, string[]> = {
    confirmed: ['approved', 'completed'],
    pending: ['pending'],
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
      if (statusMap[filterStatus]) {
        filtered = filtered.filter((m) =>
          statusMap[filterStatus].includes(m.status),
        );
      } else {
        filtered = filtered.filter((m) => m.status === filterStatus);
      }
    }

    return filtered;
  }, [meetings, slug, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = meetings.length;
    const pending = meetings.filter((m) => m.status === 'bidding').length;
    const scheduled = meetings.filter((m) =>
      ['SCHEDULED', 'ONGOING'].includes((m.interviewStatus || '').toUpperCase()),
    ).length;

    return [
      {
        label: 'Total Interviews',
        value: total,
        icon: ListVideo,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
      },
      {
        label: 'Open for Bidding',
        value: pending,
        icon: Briefcase,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
      },
      {
        label: 'Active/Ongoing',
        value: scheduled,
        icon: TrendingUp,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
      },
    ];
  }, [meetings]);

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
      } else if (type === 'PROJECT' || type === 'HIRE') {
        grouped['PROJECT'].push(m);
      } else if (type === 'TALENT') {
        grouped['TALENT'].push(m);
      }
    });

    return grouped;
  }, [filteredMeetings]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Interviews"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 mb-8 sm:pl-14 bg-background/50">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Interviews"
          breadcrumbItems={[
            { label: 'Interviews', link: '/business/interviews' },
          ]}
        />
        <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 sm:py-4 md:gap-10">
          <div className="mx-auto w-full max-w-[95vw]">
            <div className="flex flex-col gap-8 mb-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Interview Dashboard
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Streamline your hiring process. Manage project-specific skill verifications and talent interviews in one place.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, idx) => (
                  <Card key={idx} className="border-muted/40 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {stat.label}
                          </p>
                          <p className="text-3xl font-bold tracking-tight">
                            {stat.value}
                          </p>
                        </div>
                        <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110', stat.bg, stat.color)}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-1 bg-primary rounded-full" />
                    <h2 className="text-2xl font-bold tracking-tight">
                      {isReviewingBids ? 'Candidate Profiles' : 'Manage Interviews'}
                    </h2>
                  </div>
                  {!isReviewingBids && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border bg-background p-1">
                        <Button
                          variant={viewType === 'grid' ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewType('grid')}
                          className="h-8 w-8 p-0"
                        >
                          <BoxModelIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewType === 'list' ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewType('list')}
                          className="h-8 w-8 p-0"
                        >
                          <Table className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Tabs
                  value={slug}
                  onValueChange={(val) =>
                    router.push(`/business/interviews/${val}`)
                  }
                  className="w-full space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b pb-1">
                    <TabsList className="bg-muted/30 h-11 p-1 gap-1 border-none shadow-sm">
                      <TabsTrigger
                        value="current"
                        className="h-9 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all font-semibold"
                      >
                        <ListVideo className="h-4 w-4 mr-2" />
                        Current
                      </TabsTrigger>
                      <TabsTrigger
                        value="bids"
                        className="h-9 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all font-semibold"
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Bids
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="h-9 px-6 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all font-semibold"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                          placeholder="Search interviews..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-11 bg-background/50 border-muted/60 focus:border-primary/50 transition-all rounded-xl shadow-sm"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[160px] h-11 bg-background/50 border-muted/60 rounded-xl shadow-sm">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-muted/60">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <TabsContent value={slug} className="mt-0 border-none p-0 outline-none">
                    {loading ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <Card key={i} className="overflow-hidden border-muted/60">
                            <CardHeader className="space-y-2">
                              <Skeleton className="h-5 w-1/2" />
                              <Skeleton className="h-4 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Skeleton className="h-20 w-full" />
                              <div className="flex justify-between">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : isReviewingBids && reviewInterviewId ? (
                      <ReviewBidsDetail 
                        interviewId={reviewInterviewId} 
                        onBack={() => router.push('/business/interviews/bids')} 
                      />
                    ) : filteredMeetings.length === 0 ? (
                      <div className="py-12">
                        <EmptyState
                          title={`No ${slug} interviews found`}
                          description={
                            searchQuery
                              ? `No interviews match your search "${searchQuery}"`
                              : `You don't have any ${slug} interviews at the moment.`
                          }
                          icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
                          actions={
                            searchQuery && (
                              <Button variant="outline" onClick={() => setSearchQuery('')}>
                                Clear search
                              </Button>
                            )
                          }
                        />
                      </div>
                    ) : slug === 'bids' ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredMeetings.map((meeting) => (
                          <BiddingInterviewCard key={meeting.id} meeting={meeting} />
                        ))}
                      </div>
                    ) : (
                      <Accordion type="multiple" defaultValue={['TALENT', 'PROJECT']} className="space-y-8">
                        {sections.map((section) => {
                          const sectionMeetings = groupedBySection[section.key] || [];
                          if (sectionMeetings.length === 0) return null;

                          return (
                            <AccordionItem
                              key={section.key}
                              value={section.key}
                              className="border-none"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <AccordionTrigger className="hover:no-underline py-0 group">
                                  <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${section.iconClassName} transition-colors group-hover:bg-opacity-20`}>
                                      <section.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                      <h3 className="text-lg font-bold tracking-tight">
                                        {section.title}
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                          ({sectionMeetings.length})
                                        </span>
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {section.description}
                                      </p>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                              </div>

                              <AccordionContent className="pt-4">
                                {viewType === 'grid' ? (
                                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {sectionMeetings.map((meeting) => (
                                      <InterviewItemCard
                                        key={meeting.id}
                                        item={meeting as any}
                                        className="h-full"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-muted/60 overflow-hidden bg-card/30 backdrop-blur-sm">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b bg-muted/30">
                                          <th className="px-4 py-3 text-left font-semibold">Talent</th>
                                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                                          <th className="px-4 py-3 text-left font-semibold">Date</th>
                                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-muted/60">
                                        {sectionMeetings.map((meeting) => (
                                          <tr key={meeting.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-4 font-medium">{meeting.summary}</td>
                                            <td className="px-4 py-4">
                                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                                meeting.status === 'completed' || meeting.status === 'approved'
                                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                                              }`}>
                                                {meeting.interviewStatus}
                                              </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                              {new Date(meeting.start.dateTime).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                              <Button variant="ghost" size="sm" onClick={() => router.push(`/business/interviews/${slug}/${meeting.id}`)}>
                                                View Details
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function BiddingInterviewCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const bids = (meeting as any).interviewBids || [];

  return (
    <Card className="flex flex-col h-full border-muted/40 hover:border-primary/40 transition-all duration-300 bg-card/60 backdrop-blur-sm group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
            {meeting.interviewType}
          </Badge>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-full border border-muted/60">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold">
              {bids.length}
            </span>
          </div>
        </div>
        <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
          {meeting.talentName || meeting.summary}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-2 min-h-[40px] text-sm leading-relaxed">
          {meeting.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-6 pt-0">
        <div className="space-y-6">
          <div className="flex flex-col gap-2.5">
             <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
               <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                <Calendar className="h-3.5 w-3.5" />
               </div>
               <span>Requested: {new Date(meeting.start.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
             </div>
             <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
               <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                <Clock className="h-3.5 w-3.5" />
               </div>
               <span>Time: {new Date(meeting.start.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
          </div>

          <div className="space-y-3.5">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Recent Bids</h4>
                {bids.length > 0 && <span className="h-1 flex-1 mx-3 bg-muted/30 rounded-full" />}
             </div>

             {bids.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-4 px-2 rounded-xl border border-dashed border-muted bg-muted/10 text-center">
               </div>
             ) : (
               <div className="space-y-2.5">
                 {bids.slice(0, 2).map((bid: any, idx: number) => (
                   <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-background/40 border border-muted/40 hover:border-muted-foreground/20 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter mb-0.5">Estimated Fee</span>
                        <span className="text-sm font-bold text-foreground leading-none">${bid.fee}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] h-5 bg-background font-bold tracking-wide uppercase border-muted/60">
                        {bid.status}
                      </Badge>
                   </div>
                 ))}
                 {bids.length > 2 && (
                   <div className="flex items-center justify-center pt-1 group/more">
                     <p 
                        className="text-[11px] text-primary/80 font-bold hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                        onClick={() => router.push(`/business/interviews/bids/${meeting.id}`)}
                     >
                       View all {bids.length} bids <ChevronRight className="h-3 w-3" />
                     </p>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </CardContent>

      <Separator className="bg-muted/40" />
      <CardFooter className="p-4 bg-muted/5">
        <Button
          className="w-full shadow-sm group-hover:shadow-md h-11 rounded-xl font-bold transition-all border-none relative overflow-hidden"
          variant="default"
          onClick={() => router.push(`/business/interviews/bids/${meeting.id}`)}
        >
          <span className="relative z-10 flex items-center gap-2">
            Review Candidates <ChevronRight className="h-4 w-4" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
