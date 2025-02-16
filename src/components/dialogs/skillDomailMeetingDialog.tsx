'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

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
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RootState } from '@/lib/store';

interface Interviewer {
  _id: string;
  fullName: string;
  email: string;
}

interface MeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doc_id: string;
  doc_type: string;
}

export function SkillDomainMeetingDialog({
  isOpen,
  onClose,
  doc_id,
  doc_type,
}: MeetingDialogProps) {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState<string>(
    dayjs().add(1, 'day').format('YYYY-MM-DD'),
  );
  const [endDateTime, setEndDateTime] = useState<string>(
    dayjs().add(1, 'day').add(1, 'hour').format('YYYY-MM-DD'),
  );
  const [attendees, setAttendees] = useState<string[]>(['']);
  const [interviewer, setInterviewer] = useState<Interviewer[]>([]);

  const handleRequest = async (meetingData: object) => {
    const query = Object.fromEntries(searchParams.entries());
    if (query.code) {
      await handleCreateMeet(meetingData, query.code);
    } else {
      handleAuth();
    }
  };

  const handleCreateMeet = async (meetingData: object, code: string) => {
    await axiosInstance.post(`/meeting`, meetingData, {
      params: {
        code: code, // Add the query string here
      },
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const meetingData = {
      summary,
      description,
      start: {
        dateTime: dayjs(startDateTime).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: dayjs(endDateTime).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees,
    };
    handleRequest(meetingData);
    // onClose();
  };

  const handleAuth = async () => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const response = await axiosInstance.get('/meeting/auth-url', {
        params: { redirectUri: baseUrl },
      });
      const authUrl = response.data.url;
      if (authUrl) {
        router.push(authUrl);
      }
    } catch (error) {
      console.error('Error fetching Google Auth URL:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get(
          `/freelancer/${user.uid}/doc_id/${doc_id}?doc_type=${doc_type}`,
        );
        setInterviewer(response?.data?.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [doc_id, doc_type, user.uid]);

  // Helper function to handle both date and time change
  const handleDateTimeChange = (
    type: 'start' | 'end',
    dateTime: string,
    time: string,
  ) => {
    const updatedDateTime = dayjs(dateTime)
      .set('hour', parseInt(time.split(':')[0]))
      .set('minute', parseInt(time.split(':')[1]))
      .format('YYYY-MM-DDTHH:mm');

    if (type === 'start') {
      setStartDateTime(updatedDateTime);
    } else {
      setEndDateTime(updatedDateTime);
    }
  };

  // Ensure end date/time is always after start
  const validateEndDateTime = (newEndDateTime: string) => {
    if (dayjs(newEndDateTime).isBefore(dayjs(startDateTime))) {
      setEndDateTime(
        dayjs(startDateTime).add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      );
    } else {
      setEndDateTime(newEndDateTime);
    }
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
            <Label htmlFor="interviewer" className="text-right">
              Interviewer
            </Label>
            <Select
              onValueChange={(value) => {
                const updatedAttendees = [user.email, value];
                setAttendees(updatedAttendees);
              }}
              value={attendees[0] || ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an interviewer" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {interviewer?.map((interviewer: Interviewer, id) => (
                  <SelectItem key={id} value={interviewer._id}>
                    {interviewer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              value={dayjs(startDateTime).format('YYYY-MM-DD')}
              onChange={(e) =>
                setStartDateTime(
                  e.target.value + 'T' + dayjs(startDateTime).format('HH:mm'),
                )
              }
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
              value={dayjs(endDateTime).format('YYYY-MM-DD')}
              onChange={(e) =>
                validateEndDateTime(
                  e.target.value + 'T' + dayjs(endDateTime).format('HH:mm'),
                )
              }
              className="col-span-3"
              required
            />
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              type="time"
              className="col-span-3"
              value={dayjs(startDateTime).format('HH:mm')}
              onChange={(e) =>
                handleDateTimeChange(
                  'start',
                  dayjs(startDateTime).format('YYYY-MM-DD'),
                  e.target.value,
                )
              }
              required
            />
          </div>

          {/* End Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input
              type="time"
              className="col-span-3"
              value={dayjs(endDateTime).format('HH:mm')}
              onChange={(e) =>
                handleDateTimeChange(
                  'end',
                  dayjs(endDateTime).format('YYYY-MM-DD'),
                  e.target.value,
                )
              }
              required
            />
          </div>
          <DialogFooter className="flex justify-center">
            <Button type="submit">Create Meeting</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SkillDomainMeetingDialog;
