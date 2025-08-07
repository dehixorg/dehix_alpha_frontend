/* eslint-disable prettier/prettier */
"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { fetchPendingBids, acceptBid, PendingBid } from "@/lib/api/interviews";
import { axiosInstance } from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, DollarSign, User, Info } from "lucide-react";
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
  const [openDescIdx, setOpenDescIdx] = useState<number | null>(null);

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
        
        console.log('Bid', bid._id, 'fields:', {
          interviewer_id: hasInterviewerId,
          creatorId: hasCreatorId
        });
        
        return bid.interviewer?._id || bid.creatorId;
      })
      .map(bid => bid.interviewer?._id || bid.creatorId);
    
    console.log('Interviewer IDs found for bids:', interviewerIds);
    
    if (interviewerIds.length === 0) return;
    
    try {
      const uniqueIds = Array.from(new Set(interviewerIds.filter(id => id && id !== undefined)));
      console.log('Unique interviewer IDs for bids:', uniqueIds);
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
    const interviewerId = bid.interviewer?._id || bid.creatorId;
    console.log('Getting name for bid:', bid._id, 'interviewerId:', interviewerId);
    console.log('Bid interviewer object:', bid.interviewer);
    console.log('Bid creatorId:', bid.creatorId);
    console.log('Current interviewerDetails state:', interviewerDetails);
    
    // First try to get name from the bid data
    if (bid.interviewer?.userName) {
      console.log('Using userName from bid data:', bid.interviewer.userName);
      return bid.interviewer.userName;
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
    return 'Unnamed Interviewer';
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
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
              <TableHead className="w-[50px] text-center font-medium">
                {/* Info button column */}
              </TableHead>
              <TableHead className="w-[200px] text-center font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBids.map((bid, idx) => {
              const { date, time } = formatDateTime(bid.suggestedDateTime);
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
                  {/* Info button cell */}
                  <TableCell className="py-3 text-center relative">
                    <button
                      onClick={() => setOpenDescIdx(openDescIdx === idx ? null : idx)}
                      className="bg-gray-700 rounded-full p-2 hover:bg-gray-600"
                    >
                      <Info size={16} color="white" />
                    </button>
                    {openDescIdx === idx && (
                      <div className="mt-2 p-2 bg-gray-900 border rounded shadow text-left text-white absolute z-10 min-w-[200px]">
                        {bid.description && bid.description !== 'description'
                          ? bid.description
                          : "No description available"}
                      </div>
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
