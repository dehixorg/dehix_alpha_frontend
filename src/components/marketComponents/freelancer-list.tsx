'use client';

import type React from 'react';
import { useState, useEffect } from 'react';

import FreelancerCard from '@/components/marketComponents/freelancer-card';
import { axiosInstance } from '@/lib/axiosinstance';
import { toast } from '@/components/ui/use-toast';

interface FreelancerListProps {
  freelancers: any[];
}

const FreelancerList: React.FC<FreelancerListProps> = ({ freelancers }) => {
  const [invitedFreelancers, setInvitedFreelancers] = useState<string[]>([]);

  useEffect(() => {
    // Fetch already invited freelancers
    const fetchInvitedFreelancers = async () => {
      try {
        const response = await axiosInstance.get(
          '/business/hire-dehixtalent/invited',
        );
        // Extract freelancer IDs from the response
        const invitedIds = response.data.data.map(
          (invite: any) => invite.freelancerId,
        );
        setInvitedFreelancers(invitedIds);
      } catch (error) {
        console.error('Error fetching invited freelancers:', error);
      }
    };

    fetchInvitedFreelancers();
  }, []);

  const handleInvite = async (freelancerId: string): Promise<void> => {
    try {
      // Call the invite API endpoint
      await axiosInstance.put(
        `/business/hire-dehixtalent/${freelancerId}/invite`,
      );
      // Update local state to reflect the change
      setInvitedFreelancers((prev) => [...prev, freelancerId]);
    } catch (error) {
      console.error('Error inviting freelancer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
      });
      throw error;
    }
  };

  return (
    <div className="mt-4 lg:mt-0 lg:ml-10 space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {freelancers.length > 0 ? (
          freelancers.map((freelancer) => (
            <FreelancerCard
              key={freelancer._id}
              freelancer={freelancer}
              onInvite={handleInvite}
              isInvited={invitedFreelancers.includes(freelancer._id)}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-10">
            <p className="text-muted-foreground">
              No freelancers found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerList;
