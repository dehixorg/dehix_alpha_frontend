/* eslint-disable prettier/prettier */
"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, Clock, User, CheckCircle, XCircle, Info } from "lucide-react";

import { RootState } from "@/lib/store";
import { fetchCompletedInterviews } from "@/lib/api/interviews";
import { axiosInstance } from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const [interviewerDetails, setInterviewerDetails] = useState<{[key: string]: any}>({});
  const [openDescIdx, setOpenDescIdx] = useState<number | null>(null);

  const loadCompletedInterviews = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const data = await fetchCompletedInterviews(user.uid);
      setInterviews(data);
      await fetchInterviewerDetails(data);
      console.log(data,"valueeeeeeeeeeeeeeeeeeeee");
    } catch (error) {
      console.error('Failed to load completed interviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCompletedInterviews();
  });
  
  const fetchInterviewerDetails = async (interviewData: CompletedInterview[]) => {
    console.log('Fetching interviewer details for:', interviewData.length, 'interviews');
    
    if (interviewData.length > 0) {
      console.log('Sample interview structure:', interviewData[0]);
    }
    
    const interviewerIds = interviewData
      .filter(interview => {
        return interview.interviewerId || interview.interviewer?._id || (interview as any).creatorId;
      })
      .map(interview => interview.interviewerId || interview.interviewer?._id || (interview as any).creatorId);
    
    console.log('Interviewer IDs found:', interviewerIds);
    
    if (interviewerIds.length === 0) return;
    
    try {
      const uniqueIds = Array.from(new Set(interviewerIds.filter(id => id && id !== undefined)));
      console.log('Unique interviewer IDs:', uniqueIds);
      const detailsMap: {[key: string]: any} = {};
      
      for (const interviewerId of uniqueIds) {
        if (!interviewerId) continue;
        try {
          console.log('Fetching details for interviewer ID:', interviewerId);
          const response = await axiosInstance.get(`/freelancer/${interviewerId}`);
          console.log('Response for interviewer', interviewerId, ':', response.data);
          if (response.data?.data) {
            detailsMap[interviewerId] = response.data.data;
          }
        } catch (error) {
          console.error(`Failed to fetch interviewer ${interviewerId}:`, error);
        }
      }
      
      console.log('Final interviewer details map:', detailsMap);
      setInterviewerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch interviewer details:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
  };

  const getAcceptedInterviewerName = (interview: CompletedInterview): string => {
    const interviewerId = interview.interviewerId || interview.interviewer?._id || (interview as any).creatorId;
    
    // Check the interview object directly
    if (interview.interviewer?.name) {
      return capitalizeFirstLetter(interview.interviewer.name);
    }
    if (interview.interviewer?.userName) {
      return capitalizeFirstLetter(interview.interviewer.userName);
    }
    if (interview.interviewer?.email) {
      const emailPrefix = interview.interviewer.email.split('@')[0];
      return capitalizeFirstLetter(emailPrefix);
    }
    
    // Check the pre-fetched details map
    if (interviewerId && interviewerDetails[interviewerId]) {
      const details = interviewerDetails[interviewerId];
      const name = details.name || details.userName || details.email?.split('@')[0];
      if (name) {
        return capitalizeFirstLetter(name);
      }
    }
    
    if (interviewerId) return `Interviewer (${interviewerId})`;
    return 'Interviewer';
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const displayedInterviews = interviews.slice(0, displayCount);
  const hasMoreInterviews = displayCount < interviews.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full bg-card mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#09090B]">
                <TableHead className="w-[200px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="w-[150px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="w-[150px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="w-[150px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="w-[150px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="w-[300px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
                <TableHead className="w-[150px] text-center font-medium">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="transition">
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
      <div className="w-full bg-card mx-auto px-5 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="dark:hover:bg-[#09090B]">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInterviews.map((interview, index) => {
              const { date, time } = formatDateTime(interview.interviewDate);
              const interviewerName = getAcceptedInterviewerName(interview);
              
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
                  <TableCell className="py-3 text-center relative">
                    <button
                      onClick={() => setOpenDescIdx(openDescIdx === index ? null : index)}
                      className="bg-gray-700 rounded-full p-2 hover:bg-gray-600"
                    >
                      <Info size={16} color="white" />
                    </button>
                    {openDescIdx === index && (
                      <div
                        className="p-3 bg-gray-900 border rounded shadow text-left text-white absolute z-10 min-w-[250px] max-w-[350px]"
                        style={{ top: '50%', right: '50%', transform: 'translateY(-50%)', marginRight: '8px' }}
                      >
                        <div className="text-sm leading-relaxed">
                          {(interview.feedback) || "No feedback available"}
                        </div>
                        {/* Arrow pointing to the button */}
                        <div 
                          className="absolute w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"
                          style={{ top: '50%', right: '-8px', transform: 'translateY(-50%)' }}
                        ></div>
                      </div>
                    )}
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
            className="px-6 py-2"
          >
            Show More ({interviews.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
