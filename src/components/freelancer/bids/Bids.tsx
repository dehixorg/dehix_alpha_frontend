import React, { useEffect, useState } from 'react';

import SkeletonLoader from './SkeletonLoader';
import BidList from './BidList';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type InterviewBid = {
  _id?: string;
  interviewerId?: string;
  suggestedDateTime?: string;
  fee?: string;
  interviewer?: {
    _id?: string;
    userName?: string;
    skills?: string[];
    workExperience?: number;
  };
  status?: string;
};

type Interview = {
  _id?: string;
  talentId?: {
    id: string;
    label?: string;
  };
  talentType?: string;
  interviewBids?: Record<string, InterviewBid>; // Object of objects
  InterviewStatus?: string;
};

const BidsPage = ({ userId }: { userId?: string }) => {
  const [bidsData, setBidsData] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmAction, setConfirmAction] = useState<{
    interviewId?: string;
    bidId?: string;
    action?: string;
  } | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/interview', {
          params: {
            intervieweeId: userId,
          },
        });
        console.log(response);
        setBidsData(response?.data?.data || []);
      } catch (error) {
        console.error('Error fetching interview bids', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [userId]);

  const handleActionConfirm = async () => {
    if (!confirmAction) return;

    const { interviewId, bidId, action } = confirmAction;
    const interviewToUpdate = bidsData.find(
      (interview) => interview._id === interviewId,
    );
    if (!interviewToUpdate) return;

    const updatedTalentId = interviewToUpdate.talentId?.id;
    const isAccepted = action === 'ACCEPTED';

    const updatedBidsArray = Object.values(
      interviewToUpdate.interviewBids || {},
    )
      .map((bid: any) => ({
        _id: bid._id,
        interviewerId: bid.interviewer?._id || bid.interviewerId,
        dateTimeAgreement: bid.dateTimeAgreement || false,
        suggestedDateTime: bid.suggestedDateTime || null,
        fee: bid.fee || '0',
        status:
          bid._id === bidId ? action : isAccepted ? 'REJECTED' : bid.status,
      }))
      .filter((bid) => bid.interviewerId);

    const updatedBidsObject = updatedBidsArray.reduce((acc: any, bid: any) => {
      acc[bid._id] = bid;
      return acc;
    }, {} as any);

    const hasAcceptedBid = Object.values(updatedBidsObject).some(
      (bid: any) => bid.status === 'ACCEPTED',
    );
    const updatedInterviewStatus = hasAcceptedBid ? 'SCHEDULED' : 'BIDDING';

    const updatedInterview = {
      _id: interviewToUpdate._id,
      talentId: updatedTalentId,
      interviewBids: updatedBidsObject,
      InterviewStatus: updatedInterviewStatus,
    };

    try {
      await axiosInstance.put(`/interview/${interviewId}`, updatedInterview);

      // If accepted, remove interview from bidsData
      setBidsData((prevData: any) =>
        isAccepted
          ? prevData.filter((interview: any) => interview._id !== interviewId)
          : prevData.map((interview: any) =>
              interview._id === interviewId
                ? {
                    ...interview,
                    interviewBids: updatedBidsObject,
                    InterviewStatus: updatedInterviewStatus,
                  }
                : interview,
            ),
      );
    } catch (error) {
      console.error('Error updating interview bid:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.Please try again.',
      }); // Error toast
    }

    setConfirmAction(null);
  };

  return (
    <div className="w-[84vw] mx-auto ">
      {loading ? (
        <SkeletonLoader />
      ) : bidsData?.length > 0 ? (
        <Accordion type="single" collapsible defaultValue={bidsData?.[0]?._id}>
          {bidsData.map((interview) => (
            <AccordionItem key={interview?._id} value={interview?._id || ''}>
              <AccordionTrigger className="text-xl w-full font-semibold hover:no-underline">
                <div className="flex justify-between items-center w-full mx-3">
                  <div>{interview?.talentType || 'No Talent Label'}</div>
                  <div>
                    {Object.keys(interview?.interviewBids || {}).length} Bids
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <BidList
                  interview={interview}
                  setConfirmAction={setConfirmAction}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center text-lg font-semibold mt-4">
          No bids available
        </div>
      )}

      {confirmAction && (
        <Dialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
        >
          <DialogContent className="m-2 w-[80vw] md:max-w-lg ">
            <DialogHeader>
              <DialogTitle>
                Confirm {confirmAction.action?.toLowerCase()} action?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button className="mb-3" onClick={handleActionConfirm}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BidsPage;
