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
import { notifyError, notifySuccess } from '@/utils/toastMessage';
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
        notifyError(
          'Please select a rating before submitting.',
          'Rating required',
        );
        return;
      }

      await completeBid(interview._id, rating, feedback, 'CANCELLED');
      setIsDialogOpen(false);

      notifySuccess(
        'Your rejection and feedback have been saved.',
        'Rejected submitted',
      );

      setfeedback('');
      setRating(0);
      setHover(0);
    } catch (e: any) {
      console.error('Error in handleRejected:', e);
      notifyError(
        e?.response?.data?.message || e?.message || 'Something went wrong.',
        'Failed to submit',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (interview: ScheduledInterview) => {
    try {
      setSubmitting(true);
      if (!rating || rating < 1) {
        notifyError(
          'Please select a rating before submitting.',
          'Rating required',
        );
        return;
      }
      const status =
        interview.interviewerRating && interview.interviewerFeedback
          ? 'COMPLETED'
          : 'SCHEDULED';

      await completeBid(interview._id, rating, feedback, status);
      setIsDialogOpen(false);

      notifySuccess(
        'Your rating and feedback have been saved.',
        'Feedback submitted',
      );

      setfeedback('');
      setRating(0);
      setHover(0);
    } catch (e: any) {
      console.error('Error in handleSubmit:', e);
      notifyError(
        e?.response?.data?.message || e?.message || 'Something went wrong.',
        'Failed to submit',
      );
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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Scheduled Interviews
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          You don&apos;t have any scheduled interviews at the moment. Check
          back later for new opportunities.
        </p>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Total Interviews
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {interviews.length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Upcoming
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {
                  interviews.filter((i) => {
                    const interviewDate = new Date(i.interviewDate);
                    const today = new Date();
                    return interviewDate >= today;
                  }).length
                }
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Past Due
              </p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {
                  interviews.filter((i) => {
                    const interviewDate = new Date(i.interviewDate);
                    const today = new Date();
                    return interviewDate < today;
                  }).length
                }
              </p>
            </div>
            <Info className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Interviewer
              </TableHead>
              <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Date
              </TableHead>
              <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Time
              </TableHead>
              <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Link/Feedback
              </TableHead>
              <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
                Details
              </TableHead>
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
                <TableRow
                  key={interview._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  {/* Interviewer */}
                  <TableCell className="py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
                        {interviewerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {interviewerName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {date}
                      </span>
                    </div>
                  </TableCell>

                  {/* Time */}
                  <TableCell className="py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-lg">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {time}
                      </span>
                    </div>
                  </TableCell>

                  {/* Link or Feedback */}
                  <TableCell className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {status === 'past' ? (
                        interview.interviewerFeedback ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                            <Star className="h-4 w-4 fill-green-500 text-green-500" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Submitted
                            </span>
                          </div>
                        ) : (
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                              >
                                <Star className="h-4 w-4 mr-2" />
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
                                    variant="destructive"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )
                      ) : (
                        <>
                          {interview.meetingLink ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                window.open(interview.meetingLink, '_blank')
                              }
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                              No Link Available
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Info Button */}
                  <TableCell className="py-4 text-center relative">
                    <button
                      onClick={() =>
                        setOpenDescIdx(openDescIdx === idx ? null : idx)
                      }
                      className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Info
                        size={18}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </button>
                    {openDescIdx === idx && (
                      <div
                        className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-left absolute z-10 min-w-[250px] max-w-[350px]"
                        style={{
                          top: '50%',
                          right: '50%',
                          transform: 'translateY(-50%)',
                          marginRight: '8px',
                        }}
                      >
                        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {interview.interviewer?.description ||
                            interview.description ||
                            'No description available'}
                        </div>
                        <div
                          className="absolute w-0 h-0 border-l-8 border-l-white dark:border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"
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
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleShowMore}
            variant="outline"
            className="px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 border-2"
          >
            Show More ({interviews.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
