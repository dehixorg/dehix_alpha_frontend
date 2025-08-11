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

export interface InterviewerInfo {
  _id?: string;
  userName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  skills?: string[];
  workExperience?: number;
}

export interface PopulatedBid extends InterviewBid {
  interviewer?: InterviewerInfo;
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
  interviewerId?: string; // Add this field for the interviewer ID
  description: string;
  talentId: string;
  fee: number;
  suggestedDateTime: string;
  meetingLink?: string;
}

export async function fetchPendingBids(intervieweeId: string) {
  try {
    const response = await axios.get<{ data: any[] }>(`${BASE_URL}/interview`, {
      params: {
        intervieweeId,
      },
    });

    const interviews = Array.isArray(response.data) ? response.data : response.data.data || [];
    const pending: PendingBid[] = [];

    for (const interview of interviews) {
      // Only process interviews with BIDDING status
      if (interview.InterviewStatus !== 'BIDDING') continue;
      
      const interviewId = interview._id;
      const bidsData = interview.interviewBids;
      
      if (!bidsData) continue;

      // Handle both array and object formats
      const bidsArray = Array.isArray(bidsData) ? bidsData : Object.values(bidsData);

      for (const bid of bidsArray) {
        if (typeof bid === 'object' && bid !== null) {
          const processedBid = {
            ...bid,
            interviewId,
            bidKey: bid._id,
            description: interview.description || bid.description || '',
            InterviewStatus: interview.InterviewStatus || 'BIDDING',
          };
          pending.push(processedBid);
        }
      }
    }
    
    return pending;
  } catch (error) {
    console.error('Error fetching pending bids:', error);
    return [];
  }
}

// Fetch scheduled interviews for the given interviewee
export async function fetchScheduledInterviews(intervieweeId: string) {
  const response = await axios.get<{ data: any[] }>(`${BASE_URL}/interview`, {
    params: {
      intervieweeId,
      InterviewStatus: "SCHEDULED",
    },
  });

  // The backend returns { data: [...] }, so unwrap once and return the array.
  // FIX: Remove unnecessary Array.isArray check.
  console.log('=== API CALL DEBUGGING ===');
  console.log('fetchScheduledInterviews called with intervieweeId:', intervieweeId);
  console.log('API response:', response.data);
  console.log('response.data.data:', response.data.data);
  
  if (response.data.data && response.data.data.length > 0) {
    response.data.data.forEach((interview, index) => {
      console.log(`API Interview ${index + 1}:`, {
        _id: interview._id,
        interviewerId: interview.interviewerId,
        intervieweeId: interview.intervieweeId,
        creatorId: interview.creatorId,
        talentId: interview.talentId
      });
    });
  }
  
  return response.data.data;
}




export async function acceptBid(interviewId: string, bidId: string) {
  const { data } = await axios.post(
    `${BASE_URL}/interview/${interviewId}/interview-bids/${bidId}`
  );
  return data;
}

//for history interviews
export async function fetchCompletedInterviews(intervieweeId: string) {
  const response = await axios.get<{ data: any[] }>(`${BASE_URL}/interview`, {
    params: {
      intervieweeId,
      InterviewStatus: "COMPLETED",
    },
  });

  // The backend returns { data: [...] }, so unwrap once and return the array.
  // FIX: Remove unnecessary Array.isArray check.
  console.log('=== API CALL DEBUGGING ===');
  console.log('fetchCompletesInterviews called with intervieweeId:', intervieweeId);
  console.log('API response:', response.data);
  console.log('response.data.data:', response.data.data);
  
  if (response.data.data && response.data.data.length > 0) {
    response.data.data.forEach((interview, index) => {
      console.log(`API Interview ${index + 1}:`, {
        _id: interview._id,
        interviewerId: interview.interviewerId,
        intervieweeId: interview.intervieweeId,
        creatorId: interview.creatorId,
        talentId: interview.talentId
      });
    });
  }
  
  return response.data.data;
}




export async function completeBid(interviewId: string, bidId: string) {
  const { data } = await axios.post(
    `${BASE_URL}/interview/${interviewId}/interview-bids/${bidId}`
  );
  return data;
}