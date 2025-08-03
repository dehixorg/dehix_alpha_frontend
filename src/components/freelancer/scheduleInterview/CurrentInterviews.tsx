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
    _id?: string;
    name?: string;
    email?: string;
    userName?: string;
  };
}

export default function CurrentInterviews() {
  const user = useSelector((state: RootState) => state.user);
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [interviewerDetails, setInterviewerDetails] = useState<{[key: string]: any}>({});

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
      
      console.log('Current interviews data:', data);
      
      setInterviews(data);
      
      // Fetch interviewer details for interviews that don't have them
      await fetchInterviewerDetails(data);
    } catch (error) {
      console.error('Failed to load scheduled interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewerDetails = async (interviewData: ScheduledInterview[]) => {
    console.log('Fetching interviewer details for:', interviewData.length, 'interviews');
    
    // Log the first interview to see its structure
    if (interviewData.length > 0) {
      console.log('Sample interview structure:', interviewData[0]);
    }
    
    // Try different possible fields for interviewer ID
    const interviewerIds = interviewData
      .filter(interview => {
        const hasInterviewerId = interview.interviewerId;
        const hasInterviewer = interview.interviewer?._id;
        const hasCreatorId = (interview as any).creatorId;
        const hasInterviewerObject = interview.interviewer;
        
        console.log('Interview', interview._id, 'fields:', {
          interviewerId: hasInterviewerId,
          interviewer_id: hasInterviewer,
          creatorId: hasCreatorId,
          interviewerObject: hasInterviewerObject
        });
        
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
    const interviewerId = interview.interviewerId || interview.interviewer?._id || (interview as any).creatorId;
    console.log('Getting name for interview:', interview._id, 'interviewerId:', interviewerId);
    
    // First try to get name from the interview data
    if (interview.interviewer?.name) {
      console.log('Using name from interview data:', interview.interviewer.name);
      return interview.interviewer.name;
    }
    
    if (interview.interviewer?.userName) {
      console.log('Using userName from interview data:', interview.interviewer.userName);
      return interview.interviewer.userName;
    }
    
    if (interview.interviewer?.email) {
      const emailName = interview.interviewer.email.split('@')[0];
      console.log('Using email prefix as name:', emailName);
      return emailName;
    }
    
    // If we have interviewerId, try to get from fetched details
    if (interviewerId && interviewerDetails[interviewerId]) {
      const details = interviewerDetails[interviewerId];
      console.log('Using fetched details for interviewer:', interviewerId, details);
      const name = details.name || details.userName || details.email?.split('@')[0];
      if (name) {
        return name;
      }
    }
    
    // If we have interviewerId but no details yet
    if (interviewerId) {
      console.log('No details found for interviewer ID:', interviewerId);
      return `Interviewer (${interviewerId})`;
    }
    
    console.log('No interviewer ID found, using default');
    return 'Interviewer';
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
                Interviewer
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
              <TableHead className="w-[300px] text-center font-medium">
                Description
              </TableHead>
              <TableHead className="w-[200px] text-center font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInterviews.map((interview) => {
              const { date, time } = formatDateTime(interview.interviewDate);
              const interviewerName = getAcceptedInterviewerName(interview);
              
              return (
                <TableRow key={interview._id} className="transition">
                  <TableCell className="py-3 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {getAcceptedInterviewerName(interview)}
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
                        {interview.interviewType || 'Interview'}
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
