'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

import { RootState } from '@/lib/store';
import { fetchCompletedInterviews } from '@/lib/api/interviews';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RatingModal } from '@/components/ui/rating-modal';
import { FeedbackModal } from '@/components/ui/feedback-modal';

interface CompletedInterview {
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
  rating?: number;
  feedback?: string;
  interviewer?: {
    _id?: string;
    name?: string;
    email?: string;
    userName?: string;
    description?: string;
  };
}

export default function HistoryInterviews() {
  const user = useSelector((state: RootState) => state.user);
  const [interviews, setInterviews] = useState<CompletedInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [intervieweeDetails, setIntervieweeDetails] = useState<{
    [key: string]: any;
  }>({});

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] =
    useState<CompletedInterview | null>(null);

  const loadCompletedInterviews = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await fetchCompletedInterviews(user.uid);
      setInterviews(data);
      await fetchIntervieweeDetails(data);
    } catch (error) {
      console.error('Failed to load completed interviews:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log('useEffect called');
    loadCompletedInterviews();
  }, [user.uid]);
  const fetchIntervieweeDetails = async (
    interviewData: CompletedInterview[],
  ) => {
    const intervieweeIds = interviewData
      .filter((interview) => interview.intervieweeId)
      .map((interview) => interview.intervieweeId);
    if (intervieweeIds.length === 0) return;
    try {
      const uniqueIds = Array.from(
        new Set(intervieweeIds.filter((id) => id && id !== undefined)),
      );
      console.log('Unique interviewee IDs:', uniqueIds);
      const detailsMap: { [key: string]: any } = {};
      for (const intervieweeId of uniqueIds) {
        if (!intervieweeId) continue;
        try {
          console.log('Fetching details for interviewee ID:', intervieweeId);
          const response = await axiosInstance.get(
            `/freelancer/${intervieweeId}`,
          );
          if (response.data?.data) {
            detailsMap[intervieweeId] = response.data.data;
          }
        } catch (error) {
          console.error(`Failed to fetch interviewee ${intervieweeId}:`, error);
        }
      }
      console.log('Final interviewee details map:', detailsMap);
      setIntervieweeDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch interviewee details:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Helper function for capitalization
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper functions for status display
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : 'Unknown';
  };

  const getAcceptedIntervieweeName = (
    interview: CompletedInterview,
  ): string => {
    const intervieweeId = interview.intervieweeId;
    // Check the pre-fetched details map
    if (intervieweeId && intervieweeDetails[intervieweeId]) {
      const details = intervieweeDetails[intervieweeId];
      const name =
        details.name || details.userName || details.email?.split('@')[0];
      if (name) {
        return capitalizeFirstLetter(name);
      }
    }
    if (intervieweeId) return `Interviewee (${intervieweeId})`;
    return 'Interviewee';
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const handleOpenRatingModal = (interview: CompletedInterview) => {
    setSelectedInterview(interview);
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedInterview(null);
  };

  const handleSubmitRating = async (rating: number) => {
    if (!selectedInterview || !user?.uid) return;

    try {
      await axiosInstance.put(`/interview/${selectedInterview._id}`, {
        rating,
      });
      // Update the local state to reflect the new rating
      setInterviews((prev) =>
        prev.map((interview) =>
          interview._id === selectedInterview._id
            ? { ...interview, rating }
            : interview,
        ),
      );
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  };

  const handleOpenFeedbackModal = (interview: CompletedInterview) => {
    console.log('Feedback button clicked for interview:', interview._id);
    setSelectedInterview(interview);
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedInterview(null);
  };

  const handleSubmitFeedback = async (feedback: string) => {
    if (!selectedInterview || !user?.uid) return;

    try {
      const response = await axiosInstance.put(
        `/interview/${selectedInterview._id}`,
        {
          feedback: feedback,
        },
      );
      // Check if the response indicates success
      if (response.data && response.data.success !== false) {
        // Update the local state to reflect the new feedback
        setInterviews((prev) =>
          prev.map((interview) =>
            interview._id === selectedInterview._id
              ? { ...interview, feedback }
              : interview,
          ),
        );
        console.log('Feedback submitted successfully:', feedback);
        // Remove the automatic refresh to prevent feedback from being overwritten
        // The local state update is sufficient for immediate UI feedback
        // If needed, we can add a manual refresh button or handle it differently
      } else {
        throw new Error(
          'Failed to save feedback: ' +
            (response.data?.message || 'Unknown error'),
        );
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  };

  const displayedInterviews = interviews.slice(0, displayCount);
  const hasMoreInterviews = displayCount < interviews.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full bg-white text-black dark:bg-black dark:text-white mx-auto px-4 md:px-10 py-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
          <Table className="bg-white text-black dark:bg-black dark:text-white">
            <TableHeader>
              <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <TableHead className="w-[200px] text-center font-medium">
                  Interviewee
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
                <TableHead className="w-[150px] text-center font-medium">
                  Feedback
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow
                  key={index}
                  className="transition bg-white text-black dark:bg-black dark:text-white"
                >
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="h-4 w-12 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-8 w-16 bg-gray-300 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-8 w-20 bg-gray-300 animate-pulse rounded"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          No completed interviews found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full bg-white text-black dark:bg-black dark:text-white mx-auto px-4 md:px-10 py-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
        <Table className="bg-white text-black dark:bg-black dark:text-white">
          <TableHeader>
            <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <TableHead className="w-[200px] text-center font-medium">
                Interviewee
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
              <TableHead className="w-[150px] text-center font-medium">
                Feedback
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInterviews.map((interview) => {
              const { date, time } = formatDateTime(interview.interviewDate);
              const intervieweeName = getAcceptedIntervieweeName(interview);
              return (
                <TableRow
                  key={interview._id}
                  className="transition bg-white text-black dark:bg-transparent dark:text-white"
                >
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-black dark:text-white">
                        {intervieweeName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-black dark:text-gray-400">
                        {date}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-black dark:text-gray-400">
                        {time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(interview.InterviewStatus)}
                      <span className="text-sm text-black dark:text-gray-400">
                        {getStatusText(interview.InterviewStatus)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex flex-col gap-2 items-center">
                      <Button
                        size="sm"
                        className="bg-blue-500"
                        variant="outline"
                        onClick={() => {
                          handleOpenRatingModal(interview);
                        }}
                        disabled={
                          typeof interview.rating === 'number' &&
                          interview.rating > 0
                        }
                      >
                        {interview.rating ? `${interview.rating}/5` : 'Rate'}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex flex-col gap-2 items-center">
                      <Button
                        size="sm"
                        className="bg-blue-500"
                        variant="outline"
                        onClick={() => handleOpenFeedbackModal(interview)}
                        disabled={
                          !!(
                            interview.feedback &&
                            interview.feedback.trim().length > 0
                          )
                        }
                      >
                        {interview.feedback &&
                        interview.feedback.trim().length > 0
                          ? 'Submitted'
                          : 'Feedback'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {hasMoreInterviews && (
        <div className="flex justify-center">
          <Button
            onClick={handleShowMore}
            variant="outline"
            className="px-6 py-2 text-black dark:text-white"
          >
            Show More ({interviews.length - displayCount} remaining)
          </Button>
        </div>
      )}
      {selectedInterview && (
        <>
          <RatingModal
            isOpen={isRatingModalOpen}
            onClose={handleCloseRatingModal}
            onSubmit={handleSubmitRating}
            intervieweeName={getAcceptedIntervieweeName(selectedInterview)}
          />
          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={handleCloseFeedbackModal}
            onSubmit={handleSubmitFeedback}
            intervieweeName={getAcceptedIntervieweeName(selectedInterview)}
          />
        </>
      )}
    </div>
  );
}
