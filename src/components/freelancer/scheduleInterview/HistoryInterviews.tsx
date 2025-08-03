"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { axiosInstance } from "@/lib/axiosinstance";
import { fetchPendingBids, PendingBid } from "@/lib/api/interviews";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, User, CheckCircle, XCircle, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HistoryBid extends PendingBid {
  status?: string; // 'accepted' | 'rejected' | 'pending'
  bidStatus?: string;
}

export default function HistoryInterviews() {
  const user = useSelector((state: RootState) => state.user);
  const [bids, setBids] = useState<HistoryBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [interviewerDetails, setInterviewerDetails] = useState<{[key: string]: any}>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: boolean}>({});

  const fetchInterviewerDetails = async (bidData: HistoryBid[]) => {
    console.log('Fetching interviewer details for history bids:', bidData.length, 'bids');
    
    // Log the first bid to see its structure
    if (bidData.length > 0) {
      console.log('Sample history bid structure:', bidData[0]);
    }
    
    // Try different possible fields for interviewer ID
    const interviewerIds = bidData
      .filter(bid => {
        const hasInterviewerId = bid.interviewer?._id;
        const hasCreatorId = bid.creatorId;
        const hasInterviewerIdDirect = bid.interviewerId;
        
        console.log('History Bid', bid._id, 'fields:', {
          interviewer_id: hasInterviewerId,
          creatorId: hasCreatorId,
          interviewerId: hasInterviewerIdDirect
        });
        
        return bid.interviewer?._id || bid.creatorId || bid.interviewerId;
      })
      .map(bid => bid.interviewer?._id || bid.creatorId || bid.interviewerId);
    
    console.log('Interviewer IDs found for history bids:', interviewerIds);
    
    if (interviewerIds.length === 0) return;
    
    try {
      const uniqueIds = Array.from(new Set(interviewerIds.filter(id => id && id !== undefined)));
      console.log('Unique interviewer IDs for history bids:', uniqueIds);
      const detailsMap: {[key: string]: any} = {};
      
      for (const interviewerId of uniqueIds) {
        if (!interviewerId) continue;
        try {
          console.log('Fetching details for interviewer ID:', interviewerId);
          const response = await axiosInstance.get(`/public/freelancer/${interviewerId}`);
          console.log('Response for interviewer', interviewerId, ':', response.data);
          const freelancerData = response.data?.data || response.data;
          if (freelancerData) {
            detailsMap[interviewerId] = freelancerData;
          }
        } catch (error) {
          console.error(`Failed to fetch interviewer ${interviewerId}:`, error);
        }
      }
      
      console.log('Final interviewer details map for history bids:', detailsMap);
      setInterviewerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch interviewer details:', error);
    }
  };

  const loadHistoryBids = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      // Fetch all bids for the user
      const allBids = await fetchPendingBids(user.uid);
      console.log('All bids fetched:', allBids);
      
      // Filter bids to show only accepted or rejected ones
      const filteredBids = allBids.filter(bid => {
        const status = bid.status || bid.bidStatus || bid.InterviewStatus;
        console.log('Bid status check:', bid._id, 'status:', status);
        return status === 'accepted' || status === 'rejected' || status === 'ACCEPTED' || status === 'REJECTED';
      });
      
      console.log('Filtered bids (accepted/rejected):', filteredBids);
      
      setBids(filteredBids);
      
      // Fetch interviewer details for bids that don't have them
      await fetchInterviewerDetails(filteredBids);
    } catch (error) {
      console.error('Failed to load history bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryBids();
  }, [user?.uid]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInterviewerName = (bid: HistoryBid): string => {
    const interviewerId = bid.interviewer?._id || bid.creatorId || bid.interviewerId;
    console.log('Getting name for history bid:', bid._id, 'interviewerId:', interviewerId);
    
    // First try to get name from the bid data
    if (bid.interviewer?.name) {
      console.log('Using name from bid data:', bid.interviewer.name);
      return bid.interviewer.name;
    }
    
    if (bid.interviewer?.userName) {
      console.log('Using userName from bid data:', bid.interviewer.userName);
      return bid.interviewer.userName;
    }
    
    if (bid.interviewer?.firstName && bid.interviewer?.lastName) {
      const fullName = `${bid.interviewer.firstName} ${bid.interviewer.lastName}`;
      console.log('Using firstName/lastName from bid data:', fullName);
      return fullName;
    }
    
    // If we have interviewerId, try to get from fetched details
    if (interviewerId && interviewerDetails[interviewerId]) {
      const details = interviewerDetails[interviewerId];
      console.log('Using fetched details for interviewer:', interviewerId, details);
      const name = details.name || details.userName || details.firstName || details.email?.split('@')[0];
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

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'accepted':
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'accepted':
      case 'accepted':
        return 'Accepted';
      case 'rejected':
      case 'rejected':
        return 'Rejected';
      default:
        return status || 'Unknown';
    }
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const truncateDescription = (description: string, maxWords: number = 2) => {
    const words = description.split(' ');
    if (words.length <= maxWords) {
      return description;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const toggleDescription = (bidId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [bidId]: !prev[bidId]
    }));
  };

  const displayedBids = bids.slice(0, displayCount);
  const hasMoreBids = displayCount < bids.length;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          No accepted or rejected bids found.
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
                Fee
              </TableHead>
              <TableHead className="w-[150px] text-center font-medium">
                Status
              </TableHead>
              <TableHead className="w-[300px] text-center font-medium">
                Description
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBids.map((bid) => {
              const { date, time } = formatDateTime(bid.suggestedDateTime);
              const status = bid.status || bid.bidStatus || bid.InterviewStatus;
              const isExpanded = expandedDescriptions[bid._id] || false;
              const descriptionToDisplay = isExpanded ? bid.description : truncateDescription(bid.description || '');
              
              return (
                <TableRow key={bid._id} className="transition">
                  <TableCell className="py-3 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {getInterviewerName(bid)}
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
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ${bid.fee}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getStatusText(status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {bid.description && (
                      <p 
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => toggleDescription(bid._id)}
                      >
                        {descriptionToDisplay}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {hasMoreBids && (
        <div className="flex justify-center">
          <Button
            onClick={handleShowMore}
            variant="outline"
            className="px-6 py-2"
          >
            Show More ({bids.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
} 