import axios from 'axios';

// Adjust BASE_URL via env variable if you have a proxy setup
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

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

export async function acceptBid(bidId: string) {
  const { data } = await axios.post(`${BASE_URL}/interview-bids/${bidId}/accept`);
  return data; // returns the newly created interview
}
