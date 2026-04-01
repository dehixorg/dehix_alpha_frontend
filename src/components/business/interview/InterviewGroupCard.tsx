'use client';
import React, { useMemo } from 'react';
import { Video, Copy, Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notifySuccess, notifyError } from '@/utils/toastMessage';

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

interface InterviewGroupCardProps {
  meeting: Meeting;
  viewType: 'list' | 'grid';
}

export default function InterviewGroupCard({
  meeting,
  viewType,
}: InterviewGroupCardProps) {
  const interviewStatus = useMemo(() => {
    const now = new Date();
    const startTime = new Date(meeting.start.dateTime);
    const endTime = new Date(meeting.end.dateTime);

    if (startTime <= now && now < endTime) {
      return 'CURRENT';
    } else if (startTime > now) {
      return 'SCHEDULED';
    } else {
      return 'COMPLETED';
    }
  }, [meeting]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const attendeeCount = meeting.attendees?.length || 0;

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      notifySuccess('Meeting link copied to clipboard', 'Success');
    } catch {
      notifyError('Failed to copy link', 'Error');
    }
  };

  if (viewType === 'list') {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {formatTime(meeting.start.dateTime)} • TALENT
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{meeting.summary}</p>
          {meeting.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {meeting.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Badge
            variant={
              interviewStatus === 'CURRENT'
                ? 'default'
                : interviewStatus === 'SCHEDULED'
                  ? 'outline'
                  : 'secondary'
            }
            className="text-xs"
          >
            {interviewStatus}
          </Badge>

          {meeting.hangoutLink ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  window.open(meeting.hangoutLink, '_blank')
                }
                title="Join Meeting"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopyLink(meeting.hangoutLink || '')}
                title="Copy Link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No meeting link</span>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm line-clamp-2">
              {meeting.summary}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">TALENT</p>
          </div>
          <Badge
            variant={
              interviewStatus === 'CURRENT'
                ? 'default'
                : interviewStatus === 'SCHEDULED'
                  ? 'outline'
                  : 'secondary'
            }
            className="text-xs whitespace-nowrap"
          >
            {interviewStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {meeting.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {meeting.description}
          </p>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(meeting.start.dateTime)}</span>
          </div>

          {attendeeCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{attendeeCount} attendee{attendeeCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {meeting.hangoutLink ? (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
              onClick={() => window.open(meeting.hangoutLink, '_blank')}
            >
              <Video className="h-3.5 w-3.5 mr-1" />
              Join
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => handleCopyLink(meeting.hangoutLink || '')}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2">
            Meeting link available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
