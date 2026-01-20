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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-picker';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, CalendarIcon, Users, X } from 'lucide-react';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/hooks/use-toast';

interface MeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingDialog({ isOpen, onClose }: MeetingDialogProps) {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(
    dayjs().add(1, 'day').toDate(),
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endDate, setEndDate] = useState<Date>(dayjs().add(1, 'day').toDate());
  const [endTime, setEndTime] = useState<string>('10:00');
  const [attendees, setAttendees] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [meetLink, setMeetLink] = useState<string>('');
  const [timeError, setTimeError] = useState<string>('');

  const DRAFT_KEY = 'DEHIX_MEETING_DRAFT';

  const handleCreateMeet = async (meetingData: object) => {
    const response = await axiosInstance.post(`/meeting/admin`, meetingData);
    console.log('RESPONSE', response);
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

  const validateTime = () => {
    const startDateTime = dayjs(
      `${dayjs(startDate).format('YYYY-MM-DD')}T${startTime}`,
    );
    const endDateTime = dayjs(
      `${dayjs(endDate).format('YYYY-MM-DD')}T${endTime}`,
    );

    if (endDateTime.isBefore(startDateTime)) {
      setTimeError('End time must be after start time');
      return false;
    }

    setTimeError('');
    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateTime()) {
      return;
    }

    const startDateTimeIso =
      dayjs(startDate).format('YYYY-MM-DD') + 'T' + startTime + ':00';
    const endDateTimeIso =
      dayjs(endDate).format('YYYY-MM-DD') + 'T' + endTime + ':00';

    const meetingData = {
      summary,
      description,
      start: {
        dateTime: dayjs(startDateTimeIso).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: dayjs(endDateTimeIso).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees,
    };

    setSubmitting(true);
    handleCreateMeet(meetingData)
      .catch((error) => {
        console.error('Error creating meeting:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create meeting. Please try again.',
        });
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    setTimeError('');
  }, [startDate, endDate, startTime, endTime]);

  const addAttendee = () => {
    setAttendees([...attendees, '']);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      const updatedAttendees = attendees.filter((_, i) => i !== index);
      setAttendees(updatedAttendees);
    }
  };

  const handleAttendeeChange = (index: number, value: string) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index] = value;
    setAttendees(updatedAttendees);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create a Meeting
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new meeting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Meeting Title *</Label>
                <Input
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of the meeting"
                  className="min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date and Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <DateTimePicker
                  date={startDate}
                  onDateChange={(date) => date && setStartDate(date)}
                  time={startTime}
                  onTimeChange={setStartTime}
                  label="Start Date & Time *"
                />

                <DateTimePicker
                  date={endDate}
                  onDateChange={(date) => date && setEndDate(date)}
                  time={endTime}
                  onTimeChange={setEndTime}
                  label="End Date & Time *"
                />
              </div>

              {timeError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {timeError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attendees.map((attendee, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <Input
                    value={attendee}
                    onChange={(e) =>
                      handleAttendeeChange(index, e.target.value)
                    }
                    placeholder="Enter attendee email"
                    type="email"
                    className="flex-grow"
                    required={index === 0}
                  />
                  {attendees.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAttendee(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {index === attendees.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addAttendee}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Add email addresses of meeting attendees
              </p>
            </CardContent>
          </Card>

          <DialogFooter className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[140px]"
            >
              {submitting ? 'Creating Meeting...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </form>

        {meetLink && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Meeting Link</Label>
                <div className="flex gap-2">
                  <Input value={meetLink} readOnly className="flex-grow" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(meetLink);
                        toast({
                          title: 'Copied!',
                          description: 'Meeting link copied to clipboard.',
                        });
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
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MeetingDialog;
