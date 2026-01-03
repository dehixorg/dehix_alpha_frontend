'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { axiosInstance } from '@/lib/axiosinstance';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface MeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingDialog({ isOpen, onClose }: MeetingDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string>(
    dayjs().add(1, 'day').format('YYYY-MM-DD'),
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endDate, setEndDate] = useState<string>(
    dayjs().add(1, 'day').format('YYYY-MM-DD'),
  );
  const [endTime, setEndTime] = useState<string>('10:00');
  const [attendees, setAttendees] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [meetLink, setMeetLink] = useState<string>('');

  const query = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );

  const DRAFT_KEY = 'DEHIX_MEETING_DRAFT';

  const handleCreateMeet = async (meetingData: object, code: string) => {
    const response = await axiosInstance.post(`/meeting`, meetingData, {
      params: { code },
    });

    const link =
      response?.data?.data?.hangoutLink ||
      response?.data?.data?.htmlLink ||
      response?.data?.hangoutLink ||
      response?.data?.link ||
      '';

    if (link) {
      setMeetLink(String(link));
      toast({
        title: 'Meeting created',
        description: 'Your meeting link is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Meeting created, but no link returned',
        description: 'Please check your calendar for the event link.',
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const startDateTimeIso = dayjs(`${startDate}T${startTime}`).toISOString();
    const endDateTimeIso = dayjs(`${endDate}T${endTime}`).toISOString();

    const meetingData = {
      summary,
      description,
      start: {
        dateTime: startDateTimeIso,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTimeIso,
        timeZone: 'Asia/Kolkata',
      },
      attendees,
    };

    if (query.code) {
      setSubmitting(true);
      handleCreateMeet(meetingData, String(query.code))
        .catch((error) => {
          console.error('Error creating meeting:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create meeting. Please try again.',
          });
        })
        .finally(() => setSubmitting(false));
      return;
    }

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(meetingData));
    } catch (error) {
      console.error('Failed to save meeting draft:', error);
    }

    handleAuth();
  };

  const handleAuth = async () => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const response = await axiosInstance.get('/meeting/auth-url', {
        params: { redirectUri: baseUrl },
      });
      const authUrl = response.data.url;
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Error fetching Google Auth URL:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      }); // Error toast
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!query.code) return;

    let draft: any = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) draft = JSON.parse(raw);
    } catch (error) {
      console.error('Failed to read meeting draft:', error);
    }

    if (!draft) return;

    setSubmitting(true);
    handleCreateMeet(draft, String(query.code))
      .then(() => {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
        router.replace(window.location.pathname);
      })
      .catch((error) => {
        console.error('Error creating meeting:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create meeting. Please try again.',
        });
      })
      .finally(() => setSubmitting(false));
  }, [isOpen, query.code, router]);

  const addAttendee = () => {
    setAttendees([...attendees, '']);
  };

  const handleAttendeeChange = (index: number, value: string) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index] = value;
    setAttendees(updatedAttendees);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Meeting</DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new meeting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="summary" className="text-right">
              Summary
            </Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="col-span-3"
              placeholder="Meeting Summary"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Meeting Description"
              required
            />
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* End Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              type="time"
              className="col-span-3"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              End Time
            </Label>
            <Input
              type="time"
              className="col-span-3"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {/* Attendees Section */}
          <div className="grid grid-cols-4 items-start gap-3">
            <Label htmlFor="attendees" className="text-right">
              Attendees
            </Label>
            <div className="col-span-3 space-y-2">
              {attendees.map((attendee, index) => (
                <div className="flex items-center" key={index}>
                  <Input
                    value={attendee}
                    onChange={(e) =>
                      handleAttendeeChange(index, e.target.value)
                    }
                    placeholder="Enter attendee email"
                    className="flex-grow"
                    required
                  />
                  {/* Show the + button only for the last attendee field */}
                  {index === attendees.length - 1 && (
                    <Button
                      type="button"
                      onClick={addAttendee}
                      className="ml-2 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-center">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Working...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </form>

        {meetLink ? (
          <div className="mt-2 grid gap-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Link</Label>
              <Input className="col-span-3" value={meetLink} readOnly />
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(meetLink);
                    toast({ title: 'Copied', description: 'Link copied.' });
                  } catch (error) {
                    console.error('Failed to copy:', error);
                    toast({
                      variant: 'destructive',
                      title: 'Copy failed',
                      description: 'Please copy the link manually.',
                    });
                  }
                }}
              >
                Copy link
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default MeetingDialog;
