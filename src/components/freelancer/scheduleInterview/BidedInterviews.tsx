/* eslint-disable prettier/prettier */
"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { fetchPendingBids, acceptBid, PendingBid } from "@/lib/api/interviews";
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

  const getRowKey = (bid: PendingBid) => `${bid.interviewId}-${bid.bidKey}`;
  const [error, setError] = useState<string | null>(null);

  const loadBids = async () => {
    if (!intervieweeId) return;
    try {
      setLoading(true);
      const data = await fetchPendingBids(intervieweeId);
      console.log(data,"asldfjksldjk");
      setBids(data);
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
              return (
                <TableRow key={getRowKey(bid)} className="transition">
                  <TableCell className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {bid.interviewer?.userName ?? "Unnamed Interviewer"}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bid.description}
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
