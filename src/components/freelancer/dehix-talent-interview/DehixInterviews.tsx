'use client';
import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, DollarSign, ExternalLink, Bell } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';

const DehixInterviews = ({
  filter,
  isTableView,
  searchQuery,
  skillData,
  domainData,
}: any) => {
  const [interviewerDetails, setInterviewerDetails] = useState<{[key: string]: any}>({});

  const fetchInterviewerDetails = async (data: any[]) => {
    console.log('Fetching interviewer details for interviews:', data.length, 'interviews');
    
    // Extract interviewer IDs from both interviews and bids
    const interviewerIds: string[] = [];
    
          data.forEach((interview: any) => {
        // Check interview level interviewer
        if (interview.interviewer?._id) {
          interviewerIds.push(interview.interviewer._id);
        }
        
        // Check bids level interviewer
        const bids = Object.values(interview?.interviewBids || {});
        bids.forEach((bid: any) => {
          if (bid.interviewer?._id) {
            interviewerIds.push(bid.interviewer._id);
          }
          if (bid.creatorId) {
            interviewerIds.push(bid.creatorId);
          }
          if (bid.interviewerId) {
            interviewerIds.push(bid.interviewerId);
          }
        });
      });
    
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
          // Use the public endpoint which returns data directly
          const response = await axiosInstance.get(`/public/freelancer/${interviewerId}`);
          console.log('Response for interviewer', interviewerId, ':', response.data);
          // Handle both response formats (with and without data wrapper)
          const freelancerData = response.data?.data || response.data;
          if (freelancerData) {
            detailsMap[interviewerId] = freelancerData;
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

  const getInterviewerName = (interview: any, bid?: any): string => {
    // First try to get name from the bid data if available
    if (bid) {
      if (bid.interviewer?.userName) {
        console.log('Using userName from bid data:', bid.interviewer.userName);
        return bid.interviewer.userName;
      }
      
      if (bid.interviewer?.name) {
        console.log('Using name from bid data:', bid.interviewer.name);
        return bid.interviewer.name;
      }
      
      if (bid.interviewer?.firstName) {
        const fullName = bid.interviewer.lastName 
          ? `${bid.interviewer.firstName} ${bid.interviewer.lastName}`
          : bid.interviewer.firstName;
        console.log('Using firstName/lastName from bid data:', fullName);
        return fullName;
      }
      
      const interviewerId = bid.interviewer?._id || bid.creatorId || bid.interviewerId;
      if (interviewerId && interviewerDetails[interviewerId]) {
        const details = interviewerDetails[interviewerId];
        console.log('Using fetched details for bid interviewer:', interviewerId, details);
        const name = details.name || details.userName || details.firstName || details.email?.split('@')[0];
        if (name) {
          if (details.lastName && !details.name && !details.userName) {
            return `${details.firstName} ${details.lastName}`;
          }
          return name;
        }
      }
      
      if (interviewerId) {
        console.log('No details found for bid interviewer ID:', interviewerId);
        return `Interviewer (${interviewerId})`;
      }
    }
    
    // Try to get name from the interview data
    if (interview.interviewer?.userName) {
      console.log('Using userName from interview data:', interview.interviewer.userName);
      return interview.interviewer.userName;
    }
    
    if (interview.interviewer?.name) {
      console.log('Using name from interview data:', interview.interviewer.name);
      return interview.interviewer.name;
    }
    
    if (interview.interviewer?.firstName) {
      const fullName = interview.interviewer.lastName 
        ? `${interview.interviewer.firstName} ${interview.interviewer.lastName}`
        : interview.interviewer.firstName;
      console.log('Using firstName/lastName from interview data:', fullName);
      return fullName;
    }
    
    const interviewerId = interview.interviewer?._id || interview.creatorId || interview.interviewerId;
    if (interviewerId && interviewerDetails[interviewerId]) {
      const details = interviewerDetails[interviewerId];
      console.log('Using fetched details for interviewer:', interviewerId, details);
      const name = details.name || details.userName || details.firstName || details.email?.split('@')[0];
      if (name) {
        if (details.lastName && !details.name && !details.userName) {
          return `${details.firstName} ${details.lastName}`;
        }
        return name;
      }
    }
    
    if (interviewerId) {
      console.log('No details found for interviewer ID:', interviewerId);
      return `Interviewer (${interviewerId})`;
    }
    
    console.log('No interviewer ID found, using default');
    return 'Unnamed Interviewer';
  };

  useEffect(() => {
    const data = filteredData();
    if (data.length > 0) {
      fetchInterviewerDetails(data);
    }
  }, [skillData, domainData, filter]);

  const filteredData = () => {
    const data =
      filter === 'All'
        ? [...skillData, ...domainData]
        : filter === 'Skills'
          ? skillData
          : filter === 'Domain'
            ? domainData
            : [];

    console.log('Filtered data:', data);
    console.log('isTableView:', isTableView);
    console.log('skillData:', skillData);
    console.log('domainData:', domainData);

    return searchQuery
      ? data.filter(({ talentType }: any) =>
          talentType?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : data;
  };

  const getRemainingDays = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';

    const today = new Date().getTime(); // Get timestamp in milliseconds
    const scheduledDate = new Date(dateString).getTime(); // Convert to timestamp

    const diffTime = scheduledDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? `${diffDays}d` : 'Today';
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSetReminder = (bid: any) => {
    // TODO: Implement reminder functionality
    console.log('Setting reminder for bid:', bid);
    // This could open a modal or trigger a notification system
  };

  const handleJoinMeeting = (meetingLink: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-8  ml-0 md:ml-5 ">
        <h1 className="text-2xl font-bold">Dehix-talent interview</h1>
      </div>
      <div className=" p-0 md:p-6 flex flex-col gap-4  sm:px-6 sm:py-0 md:gap-8  pt-2 pl-0 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8  relative">
        <div>
          {filteredData().length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No related data found.
            </div>
          ) : isTableView ? (
            <div className="w-full bg-card  mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
              <div>DEBUG: Table view is active</div>
              <Table>
                <TableHeader>
                  <TableRow className=" hover:bg-[#09090B">
                    <TableHead className="w-[200px] text-center font-medium">
                      Interviewer
                    </TableHead>
                    <TableHead className="w-[200px] text-center font-medium">
                      Time
                    </TableHead>
                    <TableHead className="w-[150px] text-center font-medium">
                      Link
                    </TableHead>
                    <TableHead className="w-[120px] text-center font-medium">
                      Reminder
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const data = filteredData();
                    console.log('Rendering table with data:', data);
                    return data.map((interview: any) => {
                      const bids = Object.values(interview?.interviewBids || {});
                      // Show all bids for debugging, not just accepted ones
                      const allBids = bids;
                      console.log('Interview:', interview);
                      console.log('All bids:', bids);
                      console.log('Interview keys:', Object.keys(interview || {}));
                      // If no bids, show the interview itself
                      if (allBids.length === 0) {
                        console.log('No bids found, showing interview directly');
                        return (
                          <TableRow key={interview?._id} className=" transition">
                            <TableCell className="py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">
                                  {getInterviewerName(interview)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {interview.talentType} • {interview.level}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">
                                  {formatDateTime(interview?.suggestedDateTime)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getRemainingDays(interview?.suggestedDateTime)} remaining
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              {interview?.meetingLink ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleJoinMeeting(interview.meetingLink)}
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink size={14} />
                                  Join Meeting
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  No link available
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetReminder(interview)}
                                className="flex items-center gap-2"
                              >
                                <Bell size={14} />
                                Set Reminder
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      return allBids.map((bid: any) => (
                        <TableRow key={bid?._id} className=" transition">
                          <TableCell className="py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">
                                {getInterviewerName(interview, bid)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {interview.talentType} • {interview.level}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">
                                {formatDateTime(bid?.suggestedDateTime)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getRemainingDays(bid?.suggestedDateTime)} remaining
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            {bid?.meetingLink ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleJoinMeeting(bid.meetingLink)}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink size={14} />
                                Join Meeting
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                No link available
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetReminder(bid)}
                              className="flex items-center gap-2"
                            >
                              <Bell size={14} />
                              Set Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ));
                    });
                  })()}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData()!.map((interview: any) =>
                Object.values(interview?.interviewBids || {})
                  .filter((bid: any) => bid?.status === 'ACCEPTED') // Filter only accepted bids
                  .map((bid: any) => (
                    <Card
                      key={bid?._id}
                      className="p-6 relative rounded-2xl shadow-xl border border-gray-300 hover:shadow-2xl "
                    >
                      <CardHeader className="p-4 border-b  rounded-t-2xl">
                        <CardTitle className="text-xl font-semibold ">
                          {getInterviewerName(interview, bid)}
                        </CardTitle>
                        <CardDescription className="text-sm ">
                          {interview?.level}
                        </CardDescription>
                        <p className="text-sm absolute top-1 right-3 flex items-center gap-2">
                          <Badge
                            variant={'default'}
                            className="px-1 py-1 text-xs"
                          >
                            {interview?.InterviewStatus}
                          </Badge>
                        </p>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm flex items-center gap-2">
                          <Briefcase size={16} className="" />
                          <span className="font-medium">Experience :</span>
                          {bid?.interviewer?.workExperience} years
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <DollarSign size={16} className="" />
                          <span className="font-medium">Interview Fees :</span>₹
                          {bid?.fee}
                        </p>
                        <p className="text-sm flex items-center whitespace-nowrap gap-2">
                          <Calendar size={16} className="" />
                          <span className="font-medium">Schedule Date :</span>
                          {new Date(bid?.suggestedDateTime).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </CardContent>
                      <CardFooter className="flex  justify-between p-4 border-t  rounded-b-2xl">
                        <Button variant="outline" size="sm" className="">
                          Edit
                        </Button>
                        <Button size="sm" className="">
                          View
                        </Button>
                        <span className="absolute bottom-3 right-4 text-xs font-medium text-gray-600  px-2 py-1 rounded-md">
                          {getRemainingDays(bid?.suggestedDateTime)}
                        </span>
                      </CardFooter>
                    </Card>
                  )),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DehixInterviews;
