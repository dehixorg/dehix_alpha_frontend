/* eslint-disable prettier/prettier */
"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, Clock, Video, Info } from "lucide-react";

import { RootState } from "@/lib/store";
import { fetchScheduledInterviews } from "@/lib/api/interviews";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,  
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';

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
    _id?: string;
    name?: string;
    email?: string;
    userName?: string;
    description?: string;
  };
}

export default function CurrentInterviews() {
  const user = useSelector((state: RootState) => state.user);
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [intervieweeDetails, setIntervieweeDetails] = useState<{[key: string]: any}>({});
  const [openDescIdx, setOpenDescIdx] = useState<number | null>(null);

  const loadScheduledInterviews = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const data = await fetchScheduledInterviews(user.uid);
      setInterviews(data);
      await fetchIntervieweeDetails(data);
      console.log(data,"valueeeeeeeeeeeeeeeeeeeee");
    } catch (error) {
      console.error('Failed to load scheduled interviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    loadScheduledInterviews();
  },[user?.uid]);
  
  const fetchIntervieweeDetails = async (interviewData: ScheduledInterview[]) => {
    console.log('Fetching interviewee details for:', interviewData.length, 'interviews');
    
    // Log the first interview to see its structure
    if (interviewData.length > 0) {
      console.log('Sample interview structure:', interviewData[0]);
    }
    
    // Get interviewee IDs
    const intervieweeIds = interviewData
      .filter(interview => interview.intervieweeId)
      .map(interview => interview.intervieweeId);
    
    console.log('Interviewee IDs found:', intervieweeIds);
    
    if (intervieweeIds.length === 0) return;
    
    try {
      const uniqueIds = Array.from(new Set(intervieweeIds.filter(id => id && id !== undefined)));
      console.log('Unique interviewee IDs:', uniqueIds);
      const detailsMap: {[key: string]: any} = {};
      
      for (const intervieweeId of uniqueIds) {
        if (!intervieweeId) continue;
        try {
          console.log('Fetching details for interviewee ID:', intervieweeId);
          const response = await axiosInstance.get(`/freelancer/${intervieweeId}`);
          console.log('Response for interviewee', intervieweeId, ':', response.data);
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
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

// Helper function for capitalization
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Function to get interviewee name
const getAcceptedIntervieweeName = (interview: ScheduledInterview): string => {
  const intervieweeId = interview.intervieweeId;
  
  // Check the pre-fetched details map
  if (intervieweeId && intervieweeDetails[intervieweeId]) {
    const details = intervieweeDetails[intervieweeId];
    // Find the best name from the details
    const name = details.name || details.userName || details.email?.split('@')[0];
    if (name) {
      return capitalizeFirstLetter(name);
    }
  }
  
  // Fallbacks don't need capitalization as they are already capitalized
  if (intervieweeId) return `Interviewee (${intervieweeId})`;
  
  return 'Interviewee';
};

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const displayedInterviews = interviews.slice(0, displayCount);
  const hasMoreInterviews = displayCount < interviews.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full bg-card mx-auto px-4 md:px-10 py-6 border-none rounded-xl shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#09090B]">
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
                  Link
                </TableHead>
                <TableHead className="w-[50px] text-center font-medium">
                  {/* Info button column */}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="transition">
                  <TableCell className="py-3 text-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8 mx-auto"></div>
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
          No scheduled interviews found.
        </p>
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
                Interviewee
              </TableHead>
              <TableHead className="w-[150px] text-center font-medium">
                Date
              </TableHead>
              <TableHead className="w-[150px] text-center font-medium">
                Time
              </TableHead>
              <TableHead className="w-[150px] text-center font-medium">
                Link
              </TableHead>
              <TableHead className="w-[50px] text-center font-medium">
                {/* Info button column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInterviews.map((interview, idx) => {
              const { date, time } = formatDateTime(interview.interviewDate);
              const intervieweeName = getAcceptedIntervieweeName(interview);

              return (
                <TableRow key={interview._id} className="transition">
                  <TableCell className="py-3 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {intervieweeName}
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
                      {interview.meetingLink ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(interview.meetingLink, "_blank")}
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
                    </div>
                  </TableCell>
                  {/* Info button cell */}
                  <TableCell className="py-3 text-center relative">
                    <button
                      onClick={() => setOpenDescIdx(openDescIdx === idx ? null : idx)}
                      className="bg-gray-700 rounded-full p-2 hover:bg-gray-600"
                    >
                      <Info size={16} color="white" />
                    </button>
                    {openDescIdx === idx && (
                      <div
                        className="p-3 bg-gray-900 border rounded shadow text-left text-white absolute z-10 min-w-[250px] max-w-[350px]"
                        style={{ top: '50%', right: '50%', transform: 'translateY(-50%)', marginRight: '8px' }}
                      >
                        <div className="text-sm leading-relaxed">
                          {(interview.interviewer?.description || interview.description) || "No description available"}
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
