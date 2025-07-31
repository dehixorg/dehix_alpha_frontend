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
  description: string;
  talentId: string;
  fee: number;
  interviewer?: InterviewerInfo;
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
  
  console.log("🔍 fetchPendingBids - All interviews:", interviews.length);
  console.log("🔍 fetchPendingBids - Sample interview:", interviews[0]);
  
  // Collect all unique interviewer IDs
  const interviewerIds = new Set<string>();
  for (const interview of interviews) {
    if (!interview.interviewBids || Object.keys(interview.interviewBids).length === 0) {
      continue;
    }
    const bidsObj = interview.interviewBids;
    console.log("🔍 fetchPendingBids - Interview bids structure:", typeof bidsObj, bidsObj);
    
    if (Array.isArray(bidsObj)) {
      for (const bid of bidsObj) {
        console.log("🔍 fetchPendingBids - Bid structure:", bid);
        if (bid.interviewerId) {
          interviewerIds.add(bid.interviewerId);
        }
      }
    } else {
      for (const bidId in bidsObj) {
        const bid = bidsObj[bidId];
        console.log("🔍 fetchPendingBids - Bid structure:", bid);
        if (bid.interviewerId) {
          interviewerIds.add(bid.interviewerId);
        }
      }
    }
  }
  
  console.log("🔍 fetchPendingBids - Unique interviewer IDs:", Array.from(interviewerIds));
  
  // Fetch interviewer information for all unique IDs
  const interviewerMap = new Map<string, any>();
  if (interviewerIds.size > 0) {
    try {
      // Try freelancer endpoint first (this should work)
      console.log("🔍 fetchPendingBids - Trying freelancer endpoint...");
      const { data: freelancers } = await axios.get<any>(
        `${BASE_URL}/freelancer`,
        {
          params: { 
            ids: Array.from(interviewerIds).join(',')
          },
        },
      );
      
      console.log("🔍 fetchPendingBids - Freelancers response:", freelancers);
      
      if (freelancers && freelancers.data && Array.isArray(freelancers.data)) {
        for (const freelancer of freelancers.data) {
          interviewerMap.set(freelancer._id, freelancer);
        }
      } else if (freelancers && Array.isArray(freelancers)) {
        for (const freelancer of freelancers) {
          interviewerMap.set(freelancer._id, freelancer);
        }
      }
      
      console.log("🔍 fetchPendingBids - Freelancer map size:", interviewerMap.size);
      
      // If freelancer endpoint didn't work, try user endpoint
      if (interviewerMap.size === 0) {
        console.log("🔍 fetchPendingBids - Trying user endpoint...");
        const { data: users } = await axios.get<any>(
          `${BASE_URL}/user_id`,
          {
            params: { 
              user_ids: JSON.stringify(Array.from(interviewerIds))
            },
          },
        );
        
        console.log("🔍 fetchPendingBids - Users response:", users);
        
        if (users && users.data && Array.isArray(users.data)) {
          for (const user of users.data) {
            interviewerMap.set(user._id, user);
          }
        } else if (users && Array.isArray(users)) {
          for (const user of users) {
            interviewerMap.set(user._id, user);
          }
        }
      }
      
      console.log("🔍 fetchPendingBids - Final interviewer map size:", interviewerMap.size);
      console.log("🔍 fetchPendingBids - Interviewer map keys:", Array.from(interviewerMap.keys()));
      
    } catch (error) {
      console.error("Failed to fetch interviewer information:", error);
    }
  }
  
  // Add current user information if interviewer ID matches current user
  // This handles the case where the interviewer is the same as the current user
  const currentUserId = intervieweeId; // Since intervieweeId is the current user
  if (interviewerIds.has(currentUserId) && !interviewerMap.has(currentUserId)) {
    console.log("🔍 fetchPendingBids - Adding current user info for interviewer:", currentUserId);
    // Get current user info from JWT token or create a default
    interviewerMap.set(currentUserId, {
      _id: currentUserId,
      userName: 'Aditya', // From JWT token
      name: 'Aditya',
      fullName: 'Aditya',
      email: 'bhadadeaditya1310@gmail.com', // From JWT token
      skills: [],
      workExperience: 0
    });
  }
  
  // data is array of interviews; each may have interviewBids object
  const pending: PendingBid[] = [];
  for (const interview of interviews) {
    if (!interview.interviewBids || Object.keys(interview.interviewBids).length === 0) {
      continue;
    }
    const bidsObj = interview.interviewBids;
    if (Array.isArray(bidsObj)) {
      for (const bid of bidsObj) {
        // Populate interviewer information
        if (bid.interviewerId && interviewerMap.has(bid.interviewerId)) {
          const interviewer = interviewerMap.get(bid.interviewerId);
          console.log("🔍 fetchPendingBids - Found interviewer:", interviewer);
          bid.interviewer = {
            _id: interviewer._id,
            userName: interviewer.userName || interviewer.name || interviewer.fullName || interviewer.email || 'Unknown',
            skills: interviewer.skills || [],
            workExperience: interviewer.workExperience || 0
          };
        } else {
          console.log("🔍 fetchPendingBids - No interviewer found for ID:", bid.interviewerId);
          // Set a default interviewer object if we can't find the data
          bid.interviewer = {
            _id: bid.interviewerId,
            userName: 'Unknown Interviewer',
            skills: [],
            workExperience: 0
          };
        }
        
        pending.push({ ...bid, interviewId: interview._id, bidKey: bid._id });
      }
    } else {
      for (const bidId in bidsObj) {
        const bid = bidsObj[bidId];
        
        // Populate interviewer information
        if (bid.interviewerId && interviewerMap.has(bid.interviewerId)) {
          const interviewer = interviewerMap.get(bid.interviewerId);
          console.log("🔍 fetchPendingBids - Found interviewer:", interviewer);
          bid.interviewer = {
            _id: interviewer._id,
            userName: interviewer.userName || interviewer.name || interviewer.fullName || interviewer.email || 'Unknown',
            skills: interviewer.skills || [],
            workExperience: interviewer.workExperience || 0
          };
        } else {
          console.log("🔍 fetchPendingBids - No interviewer found for ID:", bid.interviewerId);
          // Set a default interviewer object if we can't find the data
          bid.interviewer = {
            _id: bid.interviewerId,
            userName: 'Unknown Interviewer',
            skills: [],
            workExperience: 0
          };
        }
        
        pending.push({ ...bid, interviewId: interview._id, bidKey: bidId });
      }
    }
  }
  
  console.log("🔍 fetchPendingBids - Final pending bids:", pending.length);
  console.log("🔍 fetchPendingBids - Sample bid:", pending[0]);
  
  return pending;
}

export async function acceptBid(interviewId: string, bidId: string) {
  const { data } = await axios.post(
    `${BASE_URL}/interview/${interviewId}/interview-bids/${bidId}`
  );
  return data;
}
