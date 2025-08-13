/* eslint-disable prettier/prettier */
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

import { Calendar, Clock, DollarSign, User, Info } from "lucide-react";

import { RootState } from "@/lib/store";
import { fetchPendingBids, acceptBid, PendingBid as ApiPendingBid } from "@/lib/api/interviews";
import { axiosInstance } from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Use the imported type instead of redefining it
type PendingBid = ApiPendingBid;

interface BidedInterviewsProps {
  interviewType?: string;
}

// Helper function for capitalization
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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
  const [error, setError] = useState<string | null>(null);

  const getRowKey = (bid: PendingBid) => `${bid.interviewId}-${bid.bidKey}`;

  // This function is now identical to the working version in CurrentInterviews,
  // making it much more robust at finding the ID.
  const getInterviewerName = useCallback((bid: PendingBid): string => {
    // Look for the ID in every possible place, just like in the working component.
    const interviewerId = bid.interviewerId || bid.interviewer?._id || bid.creatorId;

    // 1. Check the pre-fetched details map first. This is the most reliable source.
    if (interviewerId && interviewerDetails[interviewerId]) {
      const details = interviewerDetails[interviewerId];
      const name = details.name || details.userName || details.email?.split('@')[0];
      if (name) {
        return capitalizeFirstLetter(name);
      }
    }

    // 2. Fallback to checking the bid object itself.
    if (bid.interviewer?.name) return capitalizeFirstLetter(bid.interviewer.name);
    if (bid.interviewer?.userName) return capitalizeFirstLetter(bid.interviewer.userName);
    if (bid.interviewer?.email) return capitalizeFirstLetter(bid.interviewer.email.split('@')[0]);

    // 3. If we have an ID but no details yet, show a clean fallback.
    if (interviewerId) {
      return `Interviewer (${interviewerId.substring(0, 5)}...)`;
    }

    // 4. Last resort. If you see this, the API is not sending ANY id for the interviewer.
    return 'Unnamed Interviewer';
  }, [interviewerDetails]);

  useEffect(() => {
    // This function now uses the more robust ID extraction logic.
    const fetchDetailsForBids = async (bidData: PendingBid[]) => {
        console.log('Starting fetch for bid details. Sample bid:', bidData[0]);
        const interviewerIds = bidData
            .map(bid => bid.interviewerId || bid.interviewer?._id || bid.creatorId)
            .filter(id => id); // Filter out any null/undefined IDs

        if (interviewerIds.length === 0) {
            console.warn("No interviewer IDs found in any of the expected fields.");
            return;
        }
        
        console.log('Found Interviewer IDs to fetch:', interviewerIds);

        try {
            const uniqueIds = Array.from(new Set(interviewerIds));
            const detailsMap: { [key: string]: any } = {};

            for (const interviewerId of uniqueIds) {
                try {
                    const response = await axiosInstance.get(`/freelancer/${interviewerId}`);
                    if (response.data?.data) {
                        detailsMap[interviewerId] = response.data.data;
                    }
                } catch (error) {
                    console.error(`Failed to fetch details for interviewer ${interviewerId}:`, error);
                }
            }
            setInterviewerDetails(prevDetails => ({ ...prevDetails, ...detailsMap }));
        } catch (error) {
            console.error('An error occurred while fetching interviewer details:', error);
        }
    };

    const loadBids = async () => {
        if (!intervieweeId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await fetchPendingBids(intervieweeId);
            setBids(data);
            console.log("Bids data received from API:", data); // IMPORTANT LOG

            if (data.length > 0) {
                await fetchDetailsForBids(data);
            }
        } catch (e) {
            setError("Failed to load bids");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    loadBids();
  }, [intervieweeId]);

  const handleAccept = async (bid: PendingBid) => {
    try {
      setAcceptingId(getRowKey(bid));
      await acceptBid(bid.interviewId, bid.bidKey);
      
      toast({
        title: "Interview Scheduled!",
        description: "Your interview has been scheduled successfully.",
      });
      
      setBids(prevBids => prevBids.filter(b => getRowKey(b) !== getRowKey(bid)));

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

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const displayedBids = bids.slice(0, displayCount);
  const hasMoreBids = displayCount < bids.length;

  if (loading && bids.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  if (bids.length === 0 && !loading) {
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
              <TableHead className="w-[200px] text-center font-medium">Interviewer</TableHead>
              <TableHead className="w-[150px] text-center font-medium">Date</TableHead>
              <TableHead className="w-[150px] text-center font-medium">Time</TableHead>
              <TableHead className="w-[150px] text-center font-medium">Fee</TableHead>
              <TableHead className="w-[50px] text-center font-medium">{/* Info */}</TableHead>
              <TableHead className="w-[200px] text-center font-medium">Actions</TableHead>
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">{date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">${bid.fee}</span>
                    </div>
                  </TableCell>
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
          <Button onClick={handleShowMore} variant="outline" className="px-6 py-2">
            Show More ({bids.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
