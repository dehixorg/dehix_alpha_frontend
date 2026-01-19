'use client';

import { useState, useEffect } from 'react';
import { CalendarX2, Calendar, Clock, Users, Video, Copy } from 'lucide-react';

import { CardTitle, CardContent, CardHeader, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { MeetingDialog } from '@/components/ui/meetingDialog';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import StatusDot from '@/components/shared/StatusDot';

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
  kind?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
}

export function InterviewsSection() {
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingMeetings = async (limit = 10, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/meeting', {
        params: {
          status: 'upcoming',
          limit,
          offset,
        },
      });

      setUpcomingMeetings(response.data?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch upcoming meetings:', err);
      setError(err.response?.data?.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(end).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startTime} - ${endTime}`;
  };

  const handleCreateMeet = () => setShowMeetingDialog(true);

  const handleDialogClose = () => {
    setShowMeetingDialog(false);
    fetchUpcomingMeetings();
  };

  const copyMeetLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Copied', description: 'Meet link copied to clipboard.' });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Please copy the link manually.',
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="p-0">
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-0 pt-0">
          <div className="space-y-1">
            <CardTitle className="text-xl">Interviews</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your upcoming meetings and interview slots.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreateMeet}>
              Create meet
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-0">
          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-4 animate-pulse"
                >
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border bg-muted/30 p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-background">
                <CalendarX2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Couldn’t load interviews</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchUpcomingMeetings()}
              >
                Try again
              </Button>
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="rounded-lg border bg-muted/20 p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-background">
                <CalendarX2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">No upcoming interviews</p>
                <p className="text-sm text-muted-foreground">
                  Create a meet to schedule an interview.
                </p>
              </div>
              <Button className="mt-4" onClick={handleCreateMeet}>
                Create meet
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {upcomingMeetings.map((meeting) => {
                const primaryLink = meeting.hangoutLink || meeting.htmlLink;

                const statusForDot =
                  meeting.status === 'confirmed' ? 'ACTIVE' : meeting.status;

                const attendeeEmails =
                  meeting.attendees?.map((a) => a.email).filter(Boolean) || [];
                const attendeeCount = attendeeEmails.length;

                return (
                  <Card
                    key={meeting.id}
                    className="group rounded-lg border p-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {meeting.summary || 'Untitled meeting'}
                              </p>
                              {meeting.description ? (
                                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                  {meeting.description}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusDot status={statusForDot} size="sm" />
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 rounded-md border card px-2 py-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(meeting.start.dateTime)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border card px-2 py-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTimeRange(
                                meeting.start.dateTime,
                                meeting.end.dateTime,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {meeting.hangoutLink || primaryLink ? (
                        <div className="flex items-center justify-between gap-2">
                          {attendeeCount ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-full border card px-3 py-1 hover:bg-accent hover:text-accent-foreground"
                                >
                                  <Users className="h-3.5 w-3.5" />
                                  {attendeeCount}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[320px]">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium">
                                    Attendees
                                  </p>
                                  <div className="max-h-40 overflow-auto pr-1">
                                    {attendeeEmails.map((email) => (
                                      <p
                                        key={email}
                                        className="text-xs text-muted-foreground"
                                      >
                                        {email}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                          <div className="flex items-center gap-2 ml-auto">
                            {primaryLink ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    aria-label="Copy meeting link"
                                    onClick={() => copyMeetLink(primaryLink)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy link</TooltipContent>
                              </Tooltip>
                            ) : null}

                            {meeting.hangoutLink ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  window.open(meeting.hangoutLink, '_blank')
                                }
                              >
                                <Video className="h-4 w-4" />
                                Join
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>

        <MeetingDialog isOpen={showMeetingDialog} onClose={handleDialogClose} />
      </div>
    </TooltipProvider>
  );
}
