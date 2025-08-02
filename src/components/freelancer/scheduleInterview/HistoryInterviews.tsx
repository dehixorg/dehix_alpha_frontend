"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { axiosInstance } from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HistoryInterview {
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
  rating?: number;
  feedback?: string;
}

export default function HistoryInterviews() {
  const user = useSelector((state: RootState) => state.user);
  const [interviews, setInterviews] = useState<HistoryInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);

  const loadHistoryInterviews = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/interview`, {
        params: { 
          intervieweeId: user.uid,
          InterviewStatus: 'COMPLETED'
        }
      });
      
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load history interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryInterviews();
  }, [user?.uid]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInterviewerName = (interview: HistoryInterview): string => {
    return interview.interviewer?.name || 'Interviewer';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const displayedInterviews = interviews.slice(0, displayCount);
  const hasMoreInterviews = displayCount < interviews.length;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                Status
              </TableHead>
              <TableHead className="w-[150px] text-center font-medium">
                Rating
              </TableHead>
              <TableHead className="w-[300px] text-center font-medium">
                Feedback
              </TableHead>
              <TableHead className="w-[150px] text-center font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInterviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      No completed interviews found in history.
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Your completed interviews will appear here once you have some.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayedInterviews.map((interview) => {
                const { date, time } = formatDateTime(interview.interviewDate);
                const interviewerName = getInterviewerName(interview);
                
                return (
                  <TableRow key={interview._id} className="transition">
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {interviewerName}
                        </span>
                      </div>
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
                        {getStatusIcon(interview.InterviewStatus)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getStatusText(interview.InterviewStatus)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {interview.rating ? (
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {interview.rating}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No rating
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {interview.feedback ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {interview.feedback}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No feedback
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex flex-col gap-2 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // View details functionality
                            console.log('View interview details:', interview);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {hasMoreInterviews && (
        <div className="flex justify-center">
          <Button
            onClick={handleShowMore}
            variant="outline"
            className="px-6 py-2"
          >
            Show More ({interviews.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
} 