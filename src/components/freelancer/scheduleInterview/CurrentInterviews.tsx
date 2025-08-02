"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { fetchScheduledInterviews } from "@/lib/api/interviews";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, Video, ExternalLink } from "lucide-react";

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
      const data = await fetchScheduledInterviews(user.uid);
      setInterviews(data);
      console.log(data,"valueeeeeeeeeeeeeeeeeeeee");
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
      {interviews.map((interview) => {
        const { date, time } = formatDateTime(interview.interviewDate);
        return (
          <div
            key={interview._id}
            className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {interview.talentType} Interview
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {date}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {time}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span 
                      className={`text-sm text-gray-600 dark:text-gray-400 ${
                        interview.meetingLink ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''
                      }`}
                      onClick={() => {
                        if (interview.meetingLink) {
                          window.open(interview.meetingLink, '_blank');
                        }
                      }}
                      title={interview.meetingLink ? "Click to join meeting" : ""}
                    >
                      {interview.interviewer?.name || "Interviewer"}
                    </span>
                  </div>
                </div>
                
                {interview.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {interview.description}
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex flex-col gap-2">
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
                      title: `${interview.talentType} Interview`,
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
