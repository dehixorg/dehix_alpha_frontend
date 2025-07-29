/* eslint-disable prettier/prettier */
import { axiosInstance as axios } from '../axiosinstance';

// Adjust BASE_URL via env variable if you have a proxy setup
const BASE_URL = (process.env.NEXT_PUBLIC__BASE_URL || '').replace(/\/$/, '');

export interface InterviewBid {
  _id: string;
  intervieweeId: string;
  interviewType: 'INTERVIEWER' | string;
  InterviewStatus: 'BIDDING' | string;
  interviewDate: string;
  description: string;
  creatorId: string; // interviewer user id
  talentType: string;
  talentId: string;
  fee: number;
  // other props omitted for brevity
}

export interface BidderInfo {
  name: string;
  headline?: string;
}

export interface PopulatedBid extends InterviewBid {
  bidder: BidderInfo;
}

export async function fetchBids(interviewId: string) {
  const { data } = await axios.get<PopulatedBid[]>(
    `${BASE_URL}/interview/${interviewId}/interview-bids`
  );
  return data;
}

// Fetch all PENDING interview bids addressed to the given interviewee
export interface PendingBid extends PopulatedBid {
  bidKey: string;
  interviewId: string;
  description: string;
  talentId: string;
  fee: number;
}
export async function fetchPendingBids(intervieweeId: string) {
  // Get all interviews for this interviewee
  const { data: resp } = await axios.get<any>(
    `${BASE_URL}/interview`,
    {
      params: { intervieweeId },
    },
  );
  const interviews = Array.isArray(resp) ? resp : resp.data;
  // data is array of interviews; each may have interviewBids object
  const pending: PendingBid[] = [];
  for (const interview of interviews) {
    if (!interview.interviewBids || Object.keys(interview.interviewBids).length === 0) {
      continue;
    }
    const bidsObj = interview.interviewBids;
    if (Array.isArray(bidsObj)) {
      for (const bid of bidsObj) {
        pending.push({ ...bid, interviewId: interview._id, bidKey: bid._id });
      }
    } else {
      for (const bidId in bidsObj) {
        const bid = bidsObj[bidId];
        pending.push({ ...bid, interviewId: interview._id, bidKey: bidId });
      }
    }
  }
  return pending;
}

export async function acceptBid(interviewId: string, bidId: string) {
  const { data } = await axios.post(
    `${BASE_URL}/interview/${interviewId}/interview-bids/${bidId}`
  );
  return data;
}
