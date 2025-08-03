/* eslint-disable prettier/prettier */
"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { fetchPendingBids, acceptBid, PendingBid } from "@/lib/api/interviews";
import { axiosInstance } from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, DollarSign, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BidedInterviewsProps {
  interviewType?: string;
}

export default function BidedInterviews({ interviewType }: BidedInterviewsProps) {
  const user = useSelector((state: RootState) => state.user);
  const intervieweeId = user?.uid;
  const { toast } = useToast();

  const [bids, setBids] = useState<PendingBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(5);
  const [interviewerDetails, setInterviewerDetails] = useState<{[key: string]: any}>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: boolean}>({});

  const getRowKey = (bid: PendingBid) => `${bid.interviewId}-${bid.bidKey}`;
  const [error, setError] = useState<string | null>(null);

  const fetchInterviewerDetails = async (bidData: PendingBid[]) => {
    console.log('Fetching interviewer details for bids:', bidData.length, 'bids');
    
    // Log the first bid to see its structure
    if (bidData.length > 0) {
      console.log('Sample bid structure:', bidData[0]);
    }
    
    // Try different possible fields for interviewer ID
    const interviewerIds = bidData
      .filter(bid => {
        const hasInterviewerId = bid.interviewer?._id;
        const hasCreatorId = bid.creatorId;
        const hasInterviewerIdDirect = bid.interviewerId;
        
        console.log('Bid', bid._id, 'fields:', {
          interviewer_id: hasInterviewerId,
          creatorId: hasCreatorId,
          interviewerId: hasInterviewerIdDirect
        });
        
        // Log all available fields in the bid object
        console.log('All bid fields:', Object.keys(bid));
        console.log('Full bid object:', bid);
        
        return bid.interviewer?._id || bid.creatorId || bid.interviewerId;
      })
      .map(bid => bid.interviewer?._id || bid.creatorId || bid.interviewerId);
    
          console.log('Interviewer IDs found for bids:', interviewerIds);
      
      if (interviewerIds.length === 0) {
        console.log('No interviewer IDs found, skipping API calls');
        return;
      }
    
    try {
      const uniqueIds = Array.from(new Set(interviewerIds.filter(id => id && id !== undefined)));
      console.log('Unique interviewer IDs for bids:', uniqueIds);
      const detailsMap: {[key: string]: any} = {};
      
      for (const interviewerId of uniqueIds) {
        if (!interviewerId) continue;
        try {
          console.log('=== FETCHING INTERVIEWER DETAILS ===');
          console.log('Fetching details for interviewer ID:', interviewerId);
          // Use the public endpoint which returns data directly
          const response = await axiosInstance.get(`/public/freelancer/${interviewerId}`);
          console.log('Full response for interviewer', interviewerId, ':', response);
          console.log('Response data:', response.data);
          console.log('Response status:', response.status);
          // Handle both response formats (with and without data wrapper)
          const freelancerData = response.data?.data || response.data;
          if (freelancerData) {
            detailsMap[interviewerId] = freelancerData;
            console.log('Using freelancer data for interviewer:', interviewerId, 'Data:', freelancerData);
          } else {
            console.log('No data found in response for interviewer:', interviewerId);
          }
        } catch (error: any) {
          console.error(`Failed to fetch interviewer ${interviewerId}:`, error);
          console.error('Error details:', error.response?.data || error.message);
        }
      }
      
      console.log('Final interviewer details map for bids:', detailsMap);
      setInterviewerDetails(detailsMap);
    } catch (error) {
      console.error('Failed to fetch interviewer details:', error);
    }
  };

  const loadBids = async () => {
    if (!intervieweeId) return;
    try {
      setLoading(true);
      const data = await fetchPendingBids(intervieweeId);
      console.log("Bids data received:", data);
      console.log("Number of bids:", data.length);
      setBids(data);
      
      // Fetch interviewer details for bids that don't have them
      await fetchInterviewerDetails(data);
    } catch (e) {
      setError("Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervieweeId, interviewType]);

  // Test API call to verify endpoint is working
  useEffect(() => {
    const testApiCall = async () => {
      try {
        console.log('=== TESTING API ENDPOINT ===');
        const testResponse = await axiosInstance.get('/public/freelancer/ud0YP6N72bcE6YNxrsyz0z7lXEY2');
        console.log('Test API response:', testResponse.data);
      } catch (error: any) {
        console.error('Test API call failed:', error.response?.data || error.message);
      }
    };
    
    testApiCall();
  }, []);

  // Debug effect to see when interviewerDetails changes
  useEffect(() => {
    console.log('InterviewerDetails state changed:', interviewerDetails);
  }, [interviewerDetails]);

  const handleAccept = async (bid: PendingBid) => {
    try {
      setAcceptingId(getRowKey(bid));
      const result = await acceptBid(bid.interviewId, bid.bidKey);
      
      toast({
        title: "Interview Scheduled!",
        description: "Your interview has been scheduled successfully. Check your email for meeting details.",
      });
      
      await loadBids();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.response?.data?.message || "Failed to accept bid",
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInterviewerName = (bid: PendingBid): string => {
    const interviewerId = bid.interviewer?._id || bid.creatorId || bid.interviewerId;
    console.log('=== DEBUGGING INTERVIEWER NAME ===');
    console.log('Getting name for bid:', bid._id);
    console.log('InterviewerId:', interviewerId);
    console.log('Bid interviewer object:', bid.interviewer);
    console.log('Bid creatorId:', bid.creatorId);
    console.log('Bid interviewerId:', bid.interviewerId);
    console.log('Current interviewerDetails state:', interviewerDetails);
    console.log('Full bid object:', bid);
    
    // First try to get name from the bid data
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
    
    // If we have interviewerId, try to get from fetched details
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
    
    // If we have interviewerId but no details yet
    if (interviewerId) {
      console.log('No details found for interviewer ID:', interviewerId);
      return `Interviewer (${interviewerId})`;
    }
    
    console.log('No interviewer ID found, using default');
    return 'Unnamed Interviewer';
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

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No pending interview bids found.</p>
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
              <TableHead className="w-[300px] text-center font-medium">
                Description
              </TableHead>
              <TableHead className="w-[200px] text-center font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBids.map((bid) => {
              const { date, time } = formatDateTime(bid.suggestedDateTime);
              const isDescriptionExpanded = expandedDescriptions[getRowKey(bid)];
              const descriptionToDisplay = isDescriptionExpanded ? bid.description : truncateDescription(bid.description || '', 2);
              return (
                <TableRow key={getRowKey(bid)} className="transition">
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {getInterviewerName(bid)}
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
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${bid.fee}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {bid.description && bid.description !== 'description' ? (
                        <p 
                          className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => toggleDescription(getRowKey(bid))}
                        >
                          {descriptionToDisplay}
                        </p>
                      ) : (
                      <span className="text-sm text-gray-400">
                        No description available
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Button
                      size="sm"
                      disabled={!!acceptingId}
                      onClick={() => handleAccept(bid)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {acceptingId === getRowKey(bid) ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Accept & Schedule"
                      )}
                    </Button>
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
