/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// No dropdown menu needed since we only keep a single action
// Removed accordion usage as we now use a table layout
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmptyState from '@/components/shared/EmptyState';

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
  interviewBids?: Record<string, InterviewBid>; // Object of bids
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
        notifyError('Something went wrong. Please try again.', 'Error');
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
        notifySuccess('Bid placed successfully');
        // Refresh list
        setBidsData((prev) =>
          prev.map((iv) =>
            iv._id === interviewId ? { ...iv, interviewBids: bidsObj } : iv,
          ),
        );
      } catch (err) {
        console.error(err);
        notifyError('Failed to place bid', 'Error');
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
      notifyError('Something went wrong. Please try again.', 'Error');
    }

    setConfirmAction(null);
  };

  return (
    <div className="w-full">
      {loading ? (
        // Table skeleton
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Interviewee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(4)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="h-4 w-28 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-40 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-24 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-8 w-8 bg-muted rounded-md inline-block" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : bidsData?.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Interviewee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidsData.map((interview) => (
                <TableRow key={interview?._id}>
                  <TableCell className="font-medium">
                    {interview?.skillName || 'Unknown Skill'}
                  </TableCell>
                  <TableCell>{interview?.intervieweeName || '-'}</TableCell>
                  <TableCell>
                    {interview?.interviewDate
                      ? new Date(interview.interviewDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {interview?.InterviewStatus || 'BIDDING'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setConfirmAction({
                          interviewId: interview._id,
                          action: 'PLACE_BID',
                        })
                      }
                    >
                      Place Bid
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title="No interview bids yet"
          description="When you have interviews open for bidding, they will show up here."
          icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
        />
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

      {/* Removed View Bids dialog to keep only single action */}
    </div>
  );
};

export default BidsPage;
