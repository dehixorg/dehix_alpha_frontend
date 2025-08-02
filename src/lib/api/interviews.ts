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
  suggestedDateTime: string;
  meetingLink?: string;
}

export async function fetchPendingBids(intervieweeId: string) {
  const { data: resp } = await axios.get<any>(
    `${BASE_URL}/interview`,
    {
      params: { 
        intervieweeId,
        InterviewStatus: 'BIDDING' // Only get interviews that are still bidding
      },
    }
  );

  const interviews = Array.isArray(resp) ? resp : resp.data;

  const pending: PendingBid[] = [];

  for (const interview of interviews) {
    const interviewId = interview._id;
  
    const bidsObj = interview.interviewBids as Record<string, PendingBid>;

    if (!bidsObj || typeof bidsObj !== 'object') continue;
    console.log(bidsObj,"finding");

    for (const bid of Object.values(bidsObj)) {
      if (typeof bid === 'object' && bid !== null) {
        pending.push({
          ...bid,
          interviewId,
          bidKey: bid._id,
          description: interview.description || bid.description || '', // Add description from interview
        });
      }
    }
  }
  console.log("Pending bids fetched:", pending);
  return pending;
}

// Fetch scheduled interviews for the given interviewee
export async function fetchScheduledInterviews(intervieweeId: string) {
  const { data: resp } = await axios.get<any>(
    `${BASE_URL}/interview`,
    {
      params: { 
        intervieweeId,
        InterviewStatus: 'SCHEDULED' // Only get scheduled interviews
      },
    }
  );

    console.log(resp,"interviewsaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  const interviews = Array.isArray(resp) ? resp : resp.data;
  return interviews;
}




export async function acceptBid(interviewId: string, bidId: string) {
  const { data } = await axios.post(
    `${BASE_URL}/interview/${interviewId}/interview-bids/${bidId}`
  );
  return data;
}
