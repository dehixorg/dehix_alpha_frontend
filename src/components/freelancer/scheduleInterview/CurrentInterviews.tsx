/* eslint-disable prettier/prettier */
'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, Video, Info, Star } from 'lucide-react';

import { RootState } from '@/lib/store';
import { fetchScheduledInterviews, completeBid } from '@/lib/api/interviews';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// ---------------- Types ----------------
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
  interviewBids?: any;
  interviewerRating?: number;
  interviewerFeedback?: string;
  interviewer?: {
    _id?: string;
    name?: string;
    email?: string;
    userName?: string;
    description?: string;
  };
}

// ---------------- Component ----------------
export default function CurrentInterviews() {
  const user = useSelector((state: RootState) => state.user);

  // ---------- States ----------
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [interviewerDetails, setInterviewerDetails] = useState<{
    [key: string]: any;
  }>({});

  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [openDescIdx, setOpenDescIdx] = useState<number | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [feedback, setfeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ---------- Fetch Interviews ----------
  const loadScheduledInterviews = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await fetchScheduledInterviews(user.uid);
      
      setInterviews(data);
      await fetchInterviewerDetails(data);
    } catch (error) {
      console.error('Failed to load scheduled interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduledInterviews();
  }, [user.uid]);

  const fetchInterviewerDetails = async (
    interviewData: ScheduledInterview[],
  ) => {
    const interviewerIds = interviewData
      .map(
        (interview) =>
          interview.interviewerId ||
          interview.interviewer?._id ||
          (interview as any).creatorId,
      )
      .filter(Boolean);

    if (interviewerIds.length === 0) return;

    try {
      const uniqueIds = Array.from(new Set(interviewerIds));
      const detailsMap: { [key: string]: any } = {};

      for (const interviewerId of uniqueIds) {
        try {
          const response = await axiosInstance.get(
            `/freelancer/${interviewerId}`,
          );
          if (response.data?.data)
            detailsMap[interviewerId] = response.data.data;
        } catch (error) {
          console.error(`Failed to fetch interviewer ${interviewerId}:`, error);
        }
      }
      setInterviewerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch interviewer details:', error);
    }
  };

  // ---------- Handle Submit / Reject ----------
  const handleRejected = async (interview: ScheduledInterview) => {
    try {
      setSubmitting(true);
      if (!rating || rating < 1) {
        toast({
          variant: 'destructive',
          title: 'Rating required',
          description: 'Please select a rating before submitting.',
        });
        return;
      }

      await completeBid(interview._id, rating, feedback, 'CANCELLED');
      setIsDialogOpen(false);

      toast({
        title: 'Rejected submitted',
        description: 'Your rejection and feedback have been saved.',
      });

      setfeedback('');
      setRating(0);
      setHover(0);
    } catch (e: any) {
      console.error('Error in handleRejected:', e);
      toast({
        variant: 'destructive',
        title: 'Failed to submit',
        description:
          e?.response?.data?.message || e?.message || 'Something went wrong.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (interview: ScheduledInterview) => {
    try {
      setSubmitting(true);
      if (!rating || rating < 1) {
        toast({
          variant: 'destructive',
          title: 'Rating required',
          description: 'Please select a rating before submitting.',
        });
        return;
      }
      const status =
        interview.interviewerRating && interview.interviewerFeedback
          ? 'COMPLETED'
          : 'SCHEDULED';

      await completeBid(interview._id, rating, feedback, status);
      setIsDialogOpen(false);

      toast({
        title: 'Feedback submitted',
        description: 'Your rating and feedback have been saved.',
      });

      setfeedback('');
      setRating(0);
      setHover(0);
    } catch (e: any) {
      console.error('Error in handleSubmit:', e);
      toast({
        variant: 'destructive',
        title: 'Failed to submit',
        description:
          e?.response?.data?.message || e?.message || 'Something went wrong.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Helpers ----------
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      raw: date,
    };
  };

  const capitalizeFirstLetter = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const getAcceptedInterviewerName = (
    interview: ScheduledInterview,
  ): string => {
    const interviewerId =
      interview.interviewerId ||
      interview.interviewer?._id ||
      (interview as any).creatorId;

    if (interview.interviewer?.name)
      return capitalizeFirstLetter(interview.interviewer.name);
    if (interview.interviewer?.userName)
      return capitalizeFirstLetter(interview.interviewer.userName);

    if (interview.interviewer?.email) {
      const emailPrefix = interview.interviewer.email.split('@')[0];
      return capitalizeFirstLetter(emailPrefix);
    }

    if (interviewerId && interviewerDetails[interviewerId]) {
      const details = interviewerDetails[interviewerId];
      const name =
        details.name || details.userName || details.email?.split('@')[0];
      if (name) return capitalizeFirstLetter(name);
    }

    return interviewerId ? `Interviewer (${interviewerId})` : 'Interviewer';
  };

  const handleShowMore = () => setDisplayCount((prev) => prev + 5);

  // ---------- Render ----------
  const displayedInterviews = interviews.slice(0, displayCount);
  const hasMoreInterviews = displayCount < interviews.length;

  // ---------- Loading UI ----------
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full bg-card mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#09090B]">
                {[
                  'Interviewer',
                  'Type',
                  'Date',
                  'Time',
                  'Status',
                  'Actions',
                ].map((header, i) => (
                  <TableHead key={i} className="text-center font-medium">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 mx-auto"></div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="transition">
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // ---------- Empty State ----------
  if (interviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          No scheduled interviews found.
        </p>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="space-y-4">
      <div className="w-full bg-card mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-[#09090B]">
              <TableHead className="text-center font-medium">
                Interviewer
              </TableHead>
              <TableHead className="text-center font-medium">Date</TableHead>
              <TableHead className="text-center font-medium">Time</TableHead>
              <TableHead className="text-center font-medium">
                Link/Feedback
              </TableHead>
              <TableHead className="text-center font-medium"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayedInterviews.map((interview, idx) => {
              const { date, time, raw } = formatDateTime(
                interview.interviewDate,
              );
              const interviewerName = getAcceptedInterviewerName(interview);

              // Compare dates (ignore time)
              const today = new Date();
              const todayDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
              );
              const InterviewDate = new Date(
                raw.getFullYear(),
                raw.getMonth(),
                raw.getDate(),
              );
              const status = todayDate > InterviewDate ? 'past' : 'upcoming';

              return (
                <TableRow key={interview._id}>
                  {/* Interviewer */}
                  <TableCell className="py-3 text-center font-semibold text-gray-900 dark:text-white">
                    {interviewerName}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {date}
                      </span>
                    </div>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {time}
                      </span>
                    </div>
                  </TableCell>

                  {/* Link or Feedback */}
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {status === 'past' ? (
                        interview.interviewerFeedback ? (
                          <Button variant="outline" size="sm">
                            Submitted
                          </Button>
                        ) : (
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-80 p-4 space-y-4 bg-transparent border-0 shadow-none">
                              <div className="flex flex-col gap-3">
                                {/* Rating Stars */}
                                <div className="flex justify-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-6 w-6 cursor-pointer transition ${
                                        (hover || rating) >= star
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-400'
                                      }`}
                                      onClick={() => setRating(star)}
                                      onMouseEnter={() => setHover(star)}
                                      onMouseLeave={() => setHover(0)}
                                    />
                                  ))}
                                </div>

                                {/* Feedback Text */}
                                <Textarea
                                  placeholder="Write your feedback..."
                                  value={feedback}
                                  onChange={(e) => setfeedback(e.target.value)}
                                  className="resize-none"
                                />

                                {/* Submit / Reject */}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSubmit(interview)}
                                    className="w-full"
                                    disabled={submitting}
                                  >
                                    Submit
                                  </Button>
                                  <Button
                                    onClick={() => handleRejected(interview)}
                                    className="w-full"
                                    disabled={submitting}
                                  >
                                    Rejected
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )
                      ) : (
                        <>
                          <Video className="h-4 w-4 text-purple-500" />
                          {interview.meetingLink ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(interview.meetingLink, '_blank')
                              }
                              className="flex items-center gap-2"
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Join Meeting
                              </span>
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              No Link
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Info Button */}
                  <TableCell className="py-3 text-center relative">
                    <button
                      onClick={() =>
                        setOpenDescIdx(openDescIdx === idx ? null : idx)
                      }
                      className="bg-gray-700 rounded-full p-2 hover:bg-gray-600"
                    >
                      <Info size={16} color="white" />
                    </button>
                    {openDescIdx === idx && (
                      <div
                        className="p-3 bg-gray-900 border rounded shadow text-left text-white absolute z-10 min-w-[250px] max-w-[350px]"
                        style={{
                          top: '50%',
                          right: '50%',
                          transform: 'translateY(-50%)',
                          marginRight: '8px',
                        }}
                      >
                        <div className="text-sm leading-relaxed">
                          {interview.interviewer?.description ||
                            interview.description ||
                            'No description available'}
                        </div>
                        <div
                          className="absolute w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"
                          style={{
                            top: '50%',
                            right: '-8px',
                            transform: 'translateY(-50%)',
                          }}
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Show More Button */}
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
