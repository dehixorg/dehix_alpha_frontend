'use client';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { RootState } from '@/lib/store';
import AppliedBids from '@/components/bidmanagement/appliedbids';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Skeleton } from '@/components/ui/skeleton';

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

const BidsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [projectIds, setProjectIds] = useState<any>([]);
  const [bidsArray, setBidsArray] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectIds = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/project/business/?status=Pending`,
        );

        const ids = response.data.data.map((project: Project) => project._id);
        setProjectIds(ids);
      } catch (error) {
        console.error('Error fetching project IDs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectIds();
  }, [user.uid]);

  useEffect(() => {
    const fetchBidsForProjects = async () => {
      try {
        setLoading(true);
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
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error('Error fetching bids:', error);
      } finally {
        setLoading(false);
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
      notifyError('Something went wrong. Please try again.', 'Error');
      console.error('Error updating bid status:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Bids"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Bids"
          breadcrumbItems={[{ label: 'Bids', link: '#' }]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
          <div className="bids-page max-w-6xl mx-auto p-8  mb-8">
            <h1 className="text-3xl font-bold mb-8">Manage Bids</h1>
            {loading ? (
              <div className="space-y-4 animate-in fade-in-50">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-9 w-28" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bidsArray.length ? (
              <AppliedBids bids={bidsArray} onAction={handleAction} />
            ) : (
              <p className="">No bids available.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BidsPage;
