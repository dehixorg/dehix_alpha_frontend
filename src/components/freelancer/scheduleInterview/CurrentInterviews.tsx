"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { axiosInstance } from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, Video, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ScheduledInterview {
  _id: string;
  interviewerId: string;
  intervieweeId: string;
  interviewType: string;
  InterviewStatus: string;
  description: string;
  creatorId: string;
  talentType: string;
  talentId: string;
  interviewDate: string;
  meetingLink?: string;
  interviewer?: {
    name: string;
    email: string;
  };
}

export default function CurrentInterviews() {
  const user = useSelector((state: RootState) => state.user);
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(false);

  const loadScheduledInterviews = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/interview`, {
        params: { 
          intervieweeId: user.uid,
          InterviewStatus: 'SCHEDULED'
        }
      });
      
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load scheduled interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduledInterviews();
  }, [user?.uid]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getAcceptedInterviewerName = (interview: ScheduledInterview): string => {
    return interview.interviewer?.name || 'Interviewer';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          No scheduled interviews found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#09090B]">
            <TableHead className="w-[200px] text-center font-medium">
              Interviewer
            </TableHead>
            <TableHead className="w-[150px] text-center font-medium">
              Date
            </TableHead>
            <TableHead className="w-[150px] text-center font-medium">
              Time
            </TableHead>
            <TableHead className="w-[150px] text-center font-medium">
              Meeting Type
            </TableHead>
            <TableHead className="w-[300px] text-center font-medium">
              Description
            </TableHead>
            <TableHead className="w-[200px] text-center font-medium">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.map((interview) => {
            const { date, time } = formatDateTime(interview.interviewDate);
            const interviewerName = getAcceptedInterviewerName(interview);
            
            return (
              <TableRow key={interview._id} className="transition">
                <TableCell className="py-3 text-center">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {interviewerName}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {date}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {time}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {interviewerName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-center">
                  {interview.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {interview.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="py-3 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    {interview.meetingLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(interview.meetingLink, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Join Meeting
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // Add to calendar functionality
                        const event = {
                          title: `Interview with ${interviewerName}`,
                          description: interview.description,
                          start: interview.interviewDate,
                          end: new Date(new Date(interview.interviewDate).getTime() + 60 * 60 * 1000).toISOString(),
                        };
                        
                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&dates=${new Date(event.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${new Date(event.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
                        
                        window.open(calendarUrl, '_blank');
                      }}
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
