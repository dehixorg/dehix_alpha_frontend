import { Calendar, ExternalLink, User2, Video, Copy } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    name?: string;
    avatar?: string;
  }>;
  interviewer?: {
    name?: string;
    avatar?: string;
  };
  status: string;
  interviewType: string;
  htmlLink?: string;
  hangoutLink?: string;
  interviewStatus?: string;
}

interface InterviewGroupCardProps {
  meeting: Meeting;
  viewType: 'list' | 'grid';
}

export default function InterviewGroupCard({
  meeting,
  viewType,
}: InterviewGroupCardProps) {
  const getInterviewStatus = () => {
    const now = new Date();
    const startTime = new Date(meeting.start.dateTime);
    const endTime = new Date(meeting.end.dateTime);
    const dbStatus = (
      meeting.interviewStatus ||
      meeting.status ||
      ''
    ).toUpperCase();

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(dbStatus)) {
      return 'COMPLETED';
    }

    if (dbStatus === 'ONGOING' || (startTime <= now && now < endTime)) {
      return 'ONGOING';
    }

    if (startTime > now) {
      return 'SCHEDULED';
    }

    return 'COMPLETED';
  };

  const interviewStatus = getInterviewStatus();

  const getStatusPillClassName = (status: string) => {
    const base =
      'inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-tight';

    if (status === 'COMPLETED' || status === 'APPROVED')
      return `${base} bg-[#E3F8EE] text-[#00BA77] border border-[#BFF3D9]`;
    if (status === 'ONGOING' || status === 'SCHEDULED')
      return `${base} bg-[#DEE7FF] text-[#4F78FF] border border-[#C7D7FF]`;

    return `${base} bg-slate-200/80 text-slate-500 border border-slate-300`;
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      notifySuccess('Meeting link copied to clipboard', 'Success');
    } catch {
      notifyError('Failed to copy link', 'Error');
    }
  };

  const firstAttendee = meeting.attendees?.[0];
  const meetingLink = meeting.hangoutLink || meeting.htmlLink || '';

  const dateLabel = new Date(meeting.start.dateTime).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  if (viewType === 'list') {
    return (
      <div className="flex items-center justify-between p-5 border rounded-2xl bg-white dark:bg-[#1E1E1E] hover:bg-accent transition shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className={getStatusPillClassName(interviewStatus)}>
              {interviewStatus}
            </div>
            <span className="text-xs font-bold text-[#666666] dark:text-[#8C8C8C] uppercase tracking-widest">
              {meeting.interviewType || 'INTERVIEW'}
            </span>
          </div>
          <p className="text-[15px] text-[#1A1A1A] dark:text-white font-bold mt-2 truncate">
            {meeting.summary}
          </p>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#8C8C8C]">
              <Calendar className="h-3.5 w-3.5" /> {dateLabel}
            </div>
            {firstAttendee?.name && (
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#8C8C8C]">
                <User2 className="h-3.5 w-3.5" /> {firstAttendee.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6">
          {meetingLink ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white dark:bg-[#1A1A1A] border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm"
                onClick={() => window.open(meetingLink, '_blank')}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white dark:bg-[#1A1A1A] border-[#E5E7EB] dark:border-[#2A2A2A] shadow-sm"
                onClick={() => handleCopyLink(meetingLink)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span className="text-xs font-medium text-[#8C8C8C]">No Link</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`group overflow-hidden border-none bg-[#D1D1D1] dark:bg-[#1E1E1E] dark:border dark:border-[#2A2A2A] rounded-[32px] shadow-none dark:shadow-xl transition-all`}
    >
      <CardHeader className="gap-0 pb-5 pt-8 px-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-white/90">
              {meeting.interviewType || 'INTERVIEW'}
            </CardTitle>
            <CardDescription className="text-[12px] font-medium text-[#666666] dark:text-[#8C8C8C] opacity-80">
              {meetingLink ? 'Meeting link available' : 'No meeting link'}
            </CardDescription>
          </div>
          <div className={getStatusPillClassName(interviewStatus)}>
            {interviewStatus}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-8 pb-8 pt-0">
        <div className="space-y-5 rounded-[24px] bg-white dark:bg-[#0F0F0F] p-7 shadow-sm dark:shadow-md dark:border dark:border-[#262626]">
          <div className="flex items-start gap-4">
            <User2 className="h-5 w-5 text-[#8C8C8C] mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-[#868686] dark:text-[#8C8C8C]">
                Talent
              </div>
              <div className="min-w-0 truncate text-[16px] font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                {meeting.summary}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Calendar className="h-5 w-5 text-[#8C8C8C] mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-[#868686] dark:text-[#8C8C8C]">
                Date
              </div>
              <div className="truncate text-[16px] font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                {dateLabel}
              </div>
            </div>
          </div>
        </div>

        {meeting.description ? (
          <div className="text-[13px] leading-relaxed text-[#666666] dark:text-[#A0A0A0] line-clamp-2 px-1 font-medium">
            {meeting.description}
          </div>
        ) : null}

        {meetingLink ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-between h-[52px] border-none bg-white dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white hover:bg-white/90 dark:hover:bg-[#262626] transition-all font-bold text-[15px] rounded-[18px] shadow-sm dark:shadow-lg mt-2"
            onClick={() =>
              window.open(meetingLink, '_blank', 'noopener,noreferrer')
            }
          >
            Open meeting
            <ExternalLink className="h-4.5 w-4.5" />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
