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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  interviewType?: string;
  interviewDate?: string;
  intervieweeName?: string;
  description?: string;
  interviewBids?: InterviewBid[]; // Array of bids
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
  const [bidFee, setBidFee] = useState<string>('');

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        // Fetch both freelancer profile (to know their skills) and interview requests in parallel
        const [{ data: interviewRes }, { data: freelancerRes }] = await Promise.all([
          axiosInstance.get('/interview'),
          axiosInstance.get(`/freelancer/${userId}`), // assumes this endpoint returns freelancer doc
        ]);
        console.log('interviewRes', interviewRes);
        console.log('freelancerRes', freelancerRes);

        const allInterviews: any[] = Array.isArray(interviewRes) ? interviewRes : (interviewRes?.data ?? []);
        console.log('interviews fetched  mmmmmmm', allInterviews.length);
        const dehixTalentObj = freelancerRes?.data?.dehixTalent ?? {};
        console.log('dehixTalentObj', dehixTalentObj);
        const verifierSkills: string[] = Object.values(dehixTalentObj).map((t: any) => t.talentId);
        console.log('interviews fetched', allInterviews.length, 'skills', verifierSkills);
        // Show only requests whose talentId (string) is in verifierSkills
        const eligibleInterviews = allInterviews.filter(
          (iv: any) => iv?.talentId && verifierSkills.includes(iv.talentId),
        );

        // Fetch interviewee profiles to get their names/headlines
        const intervieweeIds = Array.from(
          new Set(eligibleInterviews.map((iv: any) => iv.intervieweeId).filter(Boolean)),
        );
        let intervieweeMap: Record<string, any> = {};
        if (intervieweeIds.length) {
          const profilePromises = intervieweeIds.map((id) => axiosInstance.get(`/freelancer/${id}`).catch(() => null));
          const profileResults = await Promise.all(profilePromises);
          profileResults.forEach((res, idx) => {
            if (res?.data) {
              intervieweeMap[intervieweeIds[idx]] = res.data;
            }
          });
        }

        const enriched = eligibleInterviews.map((iv: any) => ({
          ...iv,
          intervieweeName: intervieweeMap[iv.intervieweeId]?.userName || intervieweeMap[iv.intervieweeId]?.profileHeadline || 'Unknown',
        }));

        // Fetch skill names for each talentId
        const talentIds = Array.from(new Set(enriched.map((iv: any) => iv.talentId).filter(Boolean)));
        let skillMap: Record<string, any> = {};
        if (talentIds.length) {
          const skillPromises = talentIds.map((id) => axiosInstance.get(`/skill/${id}`).catch(() => null));
          const skillResults = await Promise.all(skillPromises);
          skillResults.forEach((res, idx) => {
            if (res?.data) {
              skillMap[talentIds[idx]] = res.data;
            }
          });
        }

        const finalList = enriched.map((iv: any) => ({
          ...iv,
          skillName: skillMap[iv.talentId]?.name || iv.talentType || iv.talentId,
        }));

        setBidsData(finalList);
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

    if (action === 'PLACE_BID') {
      // Build new bid
      const newBidId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      const newBid = {
        _id: newBidId,
        interviewerId: userId,
        dateTimeAgreement: true,
        suggestedDateTime: new Date().toISOString(),
        fee: bidFee || '0',
        status: 'PENDING',
      };

      const rawBids = interviewToUpdate.interviewBids || {};
      const bidsObj = Array.isArray(rawBids)
        ? Object.fromEntries((rawBids as any[]).map((b: any) => [b._id, b]))
        : { ...rawBids };
      bidsObj[newBidId] = newBid;

      const updatedInterview = {
        _id: interviewToUpdate._id,
        talentId: updatedTalentId,
        interviewBids: bidsObj,
        InterviewStatus: 'BIDDING',
      };

      try {
        await axiosInstance.put(`/interview/${interviewId}`, updatedInterview);
        toast({ title: 'Bid placed successfully' });
        // Refresh list
        setBidsData((prev) => prev.map((iv) => (iv._id === interviewId ? { ...iv, interviewBids: bidsObj } : iv)));
      } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to place bid' });
      }

      setBidFee('');
      setConfirmAction(null);
      return;
    }

    const isAccepted = action === 'ACCEPTED';

    const rawBids = interviewToUpdate.interviewBids || {};
    const bidsArray: any[] = Array.isArray(rawBids) ? rawBids : Object.values(rawBids);

    const updatedBidsArray = bidsArray
      .map((bid: any) => ({
      _id: bid._id,
      interviewerId: bid.interviewer?._id || bid.interviewerId,
      dateTimeAgreement: bid.dateTimeAgreement || false,
      suggestedDateTime: bid.suggestedDateTime || null,
      fee: bid.fee || '0',
      status: bid._id === bidId ? action : isAccepted ? 'REJECTED' : bid.status,
      }))
      .filter((bid: any) => bid.interviewerId);

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
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{interview?.talentType || 'Unknown Skill'}</span>
                    {interview?.intervieweeName && (
                      <span className="text-sm text-muted-foreground">{interview.intervieweeName}</span>
                    )}
                    {interview?.interviewType && (
                      <span className="text-sm text-muted-foreground">{interview.interviewType}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-right">
                    {interview?.interviewDate && (
                      <span className="text-sm text-muted-foreground">{new Date(interview.interviewDate).toLocaleDateString()}</span>
                    )}
                    <span className="text-blue-600">Verify request</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <BidList
                  interview={interview}
                  setConfirmAction={setConfirmAction}
                />  
                {interview?.description && (
                    <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
                      {interview.description}
                    </p>
                  )}
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
            {confirmAction?.action === 'PLACE_BID' ? (
              <div className="space-y-4">
                <Label htmlFor="fee">Enter your bid fee</Label>
                <Input
                  id="fee"
                  type="number"
                  value={bidFee}
                  onChange={(e) => setBidFee(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
            ) : (
              <DialogHeader>
                <DialogTitle>
                  Confirm {confirmAction.action?.toLowerCase()} action?
                </DialogTitle>
              </DialogHeader>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button className="mb-3" disabled={confirmAction.action==='PLACE_BID' && !bidFee} onClick={handleActionConfirm}>
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
