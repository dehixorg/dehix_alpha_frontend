'use client';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { RootState } from '@/lib/store';
import AppliedBids from '@/components/bidmanagement/appliedbids';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

interface Project {
  _id: string;
  projectName: string;
  description: string;
  companyId: string;
  email: string;
  companyName: string;
  end: string | null;
  skillsRequired: string[];
  role: string;
  projectType: string;
  profiles: {
    domain: string;
    freelancersRequired: string;
    skills: string[];
    experience: number;
    minConnect: number;
    rate: number;
    description: string;
    _id: string;
  }[];
  status: string;
  team: string[];
  url: string[];
  createdAt: string;
  updatedAt: string;
}

interface Bid {
  _id: string;
  bid_status: string;
  project_id: string;
  bidder_id: string;
  current_price: 0;
  domain_id: string;
}

const errorToast: {
  variant: 'destructive';
  title: string;
  description: string;
} = {
  variant: 'destructive',
  title: 'Error',
  description: 'Something went wrong. Please try again.',
};

const BidsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [projectIds, setProjectIds] = useState<any>([]);
  const [bidsArray, setBidsArray] = useState<any[]>([]);
  const errorToast: {
    variant: 'destructive';
    title: string;
    description: string;
  } = {
    variant: 'destructive',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  };

  useEffect(() => {
    const fetchProjectIds = async () => {
      try {
        const response = await axiosInstance.get(
          `/project/business/?status=Pending`,
        );

        const ids = response.data.data.map((project: Project) => project._id);
        setProjectIds(ids);
      } catch (error) {
        console.error('Error fetching project IDs:', error);
      }
    };

    fetchProjectIds();
  }, [user.uid]);

  useEffect(() => {
    const fetchBidsForProjects = async () => {
      try {
        const pendingBids: Bid[] = [];

        for (const projectId of projectIds) {
          const response = await axiosInstance.get(`/bid/${projectId}/bids`);

          const data = response.data.data;
          data.forEach((bid: Bid) => {
            if (bid.bid_status === 'Pending') {
              pendingBids.push(bid);
            }
          });
        }

        setBidsArray(pendingBids);
      } catch (error) {
        toast(errorToast);
        console.error('Error fetching bids:', error);
      }
    };

    if (projectIds.length) {
      fetchBidsForProjects();
    }
  }, [projectIds]);

  const handleAction = async (bidId: string, actionType: string) => {
    let updatedStatus;
    if (actionType === 'Accept') updatedStatus = 'Accepted';
    else if (actionType === 'Reject') updatedStatus = 'Rejected';
    else if (actionType === 'Schedule Interview') updatedStatus = 'Interview';
    else if (actionType === 'Lobby') updatedStatus = 'Lobby';

    try {
      await axiosInstance.put(`/bid/${bidId}/status`, {
        bid_status: updatedStatus,
      });
    } catch (error) {
      toast(errorToast);
      console.error('Error updating bid status:', error);
    }
  };

  return (
    <div className="bids-page max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Bids</h1>
      {bidsArray.length ? (
        <AppliedBids bids={bidsArray} onAction={handleAction} />
      ) : (
        <p className="">No bids available.</p>
      )}
    </div>
  );
};

export default BidsPage;
