/* eslint-disable prettier/prettier */
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
  skillName?: string;
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
        // Fetch interviews where the current user is the interviewee
        const [{ data: interviewRes }, { data: freelancerRes }] =
          await Promise.all([
            axiosInstance.get(`/interview?intervieweeId=${userId}`),
            axiosInstance.get(`/freelancer/${userId}`), // assumes this endpoint returns freelancer doc
          ]);

        const allInterviews: any[] = Array.isArray(interviewRes)
          ? interviewRes
          : interviewRes?.data ?? [];

        const dehixTalentObj = freelancerRes?.data?.dehixTalent ?? {};

        const talentToSkillMap: Record<string, string> = {};
        Object.values(dehixTalentObj).forEach((talent: any) => {
          if (talent._id) {
            // Use talentName as the primary source for skill name
            const skillName =
              talent.talentName ||
              talent.skillName ||
              talent.name ||
              talent.label ||
              talent.skill ||
              talent.talentId;
            // Map both _id and talentId to the same skill name
            talentToSkillMap[talent._id] = skillName;
            if (talent.talentId) {
              talentToSkillMap[talent.talentId] = skillName;
            }
          }
        });

        // TEMP FIX: Show all interviews for the user as interviewee, regardless of talentId or status
        const eligibleInterviews = allInterviews;

        // Fetch interviewee profiles to get their names/headlines
        const intervieweeIds = Array.from(
          new Set(
            eligibleInterviews
              .map((iv: any) => iv.intervieweeId)
              .filter(Boolean),
          ),
        );

        // If all interviews are for the current user, we can use the current user's profile
        const isAllCurrentUser =
          intervieweeIds.length === 1 && intervieweeIds[0] === userId;

        const intervieweeMap: Record<string, any> = {};
        if (isAllCurrentUser && userId) {
          // If all interviews are for the current user, use the current user's profile
          intervieweeMap[userId] = freelancerRes?.data;
        } else if (intervieweeIds.length) {
          const profilePromises = intervieweeIds.map((id) =>
            axiosInstance.get(`/freelancer/${id}`).catch((err) => {
              console.error(`Failed to fetch profile for ${id}:`, err);
              return null;
            }),
          );
          const profileResults = await Promise.all(profilePromises);
          profileResults.forEach((res, idx) => {
            if (res?.data) {
              intervieweeMap[intervieweeIds[idx]] = res.data;
            }
          });
        }

        const enriched = eligibleInterviews.map((iv: any) => {
          const intervieweeProfile = intervieweeMap[iv.intervieweeId];

          let intervieweeName = 'Unknown';
          if (intervieweeProfile) {
            // Check if the profile is wrapped in a data property
            const profile = intervieweeProfile.data || intervieweeProfile;

            if (profile.firstName || profile.lastName) {
              intervieweeName =
                `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
            } else if (profile.userName) {
              intervieweeName = profile.userName;
            } else if (profile.profileHeadline) {
              intervieweeName = profile.profileHeadline;
            } else if (profile.name) {
              intervieweeName = profile.name;
            }
          } else {
            // Fallback to showing the ID if no profile is found
            intervieweeName = `User ${iv.intervieweeId.substring(0, 8)}...`;
          }

          return {
            ...iv,
            intervieweeName,
          };
        });

        // Use the talentId label or talentType as skill name since skill API is not working
        const finalList = enriched.map((iv: any) => {
          // Try to get skill name from user's talent mapping first
          const talentId = iv.talentId; // This is the _id of the talent object

          // Try different variations of the talentId
          const variations = [
            talentId,
            talentId?.toString(),
            talentId?.toLowerCase(),
            talentId?.toUpperCase(),
          ].filter(Boolean);

          let foundSkillName = null;
          for (const variation of variations) {
            if (talentToSkillMap[variation]) {
              foundSkillName = talentToSkillMap[variation];

              break;
            }
          }

          const skillName =
            foundSkillName ||
            iv.talentId?.label ||
            iv.talentType ||
            iv.skill ||
            iv.level ||
            talentId ||
            'Unknown Skill';

          return {
            ...iv,
            skillName,
          };
        });

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
      const newBidId = crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString();
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
        setBidsData((prev) =>
          prev.map((iv) =>
            iv._id === interviewId ? { ...iv, interviewBids: bidsObj } : iv,
          ),
        );
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to place bid',
        });
      }

      setBidFee('');
      setConfirmAction(null);
      return;
    }

    const isAccepted = action === 'ACCEPTED';

    const rawBids = interviewToUpdate.interviewBids || {};
    const bidsArray: any[] = Array.isArray(rawBids)
      ? rawBids
      : Object.values(rawBids);

    const updatedBidsArray = bidsArray
      .map((bid: any) => ({
        _id: bid._id,
        interviewerId: bid.interviewer?._id || bid.interviewerId,
        dateTimeAgreement: bid.dateTimeAgreement || false,
        suggestedDateTime: bid.suggestedDateTime || null,
        fee: bid.fee || '0',
        status:
          bid._id === bidId ? action : isAccepted ? 'REJECTED' : bid.status,
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
                    <span className="font-medium">
                      {interview?.skillName || 'Unknown Skill'}
                    </span>
                    {interview?.intervieweeName && (
                      <span className="text-sm text-muted-foreground">
                        {interview.intervieweeName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-right">
                    {interview?.interviewDate && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(interview.interviewDate).toLocaleDateString()}
                      </span>
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
              <Button
                className="mb-3"
                disabled={confirmAction.action === 'PLACE_BID' && !bidFee}
                onClick={handleActionConfirm}
              >
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
