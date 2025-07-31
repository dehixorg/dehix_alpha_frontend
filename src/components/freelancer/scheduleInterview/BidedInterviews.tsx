"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { fetchPendingBids, acceptBid, PendingBid } from "@/lib/api/interviews";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface BidedInterviewsProps {
  interviewType?: string;
}

export default function BidedInterviews({ interviewType }: BidedInterviewsProps) {
  const user = useSelector((state: RootState) => state.user);
  const intervieweeId = user?.uid;

  const [bids, setBids] = useState<PendingBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const getRowKey = (bid: PendingBid) => `${bid.interviewId}-${bid.bidKey}`;
  const [error, setError] = useState<string | null>(null);

  const loadBids = async () => {
    if (!intervieweeId) return;
    try {
      setLoading(true);
      const data = await fetchPendingBids(intervieweeId, interviewType);
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
      await acceptBid(bid.interviewId, bid.bidKey);
      await loadBids();
    } catch (e) {
      alert("Failed to accept bid");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  if (bids.length === 0) {
    return <p className="text-muted-foreground text-sm">No bids yet.</p>;
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <div
          key={getRowKey(bid)}
          className="border rounded-md p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-medium">{bid.interviewer?.userName ?? "Unnamed"}</p>
            <p className="text-xs text-muted-foreground">{bid.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-semibold">${bid.fee}</p>
            <Button
              size="sm"
              disabled={!!acceptingId}
              onClick={() => handleAccept(bid)}
            >
              {acceptingId === getRowKey(bid) ? <Loader2 className="animate-spin h-4 w-4" /> : "Accept"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
