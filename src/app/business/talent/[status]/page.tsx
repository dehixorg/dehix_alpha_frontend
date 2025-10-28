'use client';
import React, { useEffect, useState } from 'react';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import { axiosInstance } from '@/lib/axiosinstance';
import { FreelancerApplication } from '@/types/talent';

interface HireTalentItem {
  _id: string;
  businessId: string;
  skillId?: string;
  skillName?: string;
  domainId?: string;
  domainName?: string;
  talentId?: string;
  talentName?: string;
  type?: string;
  description: string;
  experience: string;
  status: string;
  visible: boolean;
  bookmarked: boolean;
  freelancerRequired: number;
  freelancerInLobby: string[];
  freelancerInvited: string[];
  freelancerSelected: string[];
  freelancerRejected: string[];
  createdAt: string;
  updatedAt: string;
  freelancers: FreelancerApplication[];
}

export default function Page({ params }: { params: { status: string } }) {
  const { status } = params;
  // Accept only the tabs TalentLayout understands
  const allowed = new Set(['invited', 'accepted', 'rejected', 'applications']);
  const activeTab = allowed.has(status) ? status : 'invited';

  const [invitedApplications, setInvitedApplications] = useState<
    FreelancerApplication[]
  >([]);
  const [selectedApplications, setSelectedApplications] = useState<
    FreelancerApplication[]
  >([]);
  const [rejectedApplications, setRejectedApplications] = useState<
    FreelancerApplication[]
  >([]);
  const [appliedApplications, setAppliedApplications] = useState<
    FreelancerApplication[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHireTalentData = async () => {
      try {
        setLoading(true);
        const hireTalentResponse = await axiosInstance.get(
          `/business/hire-dehixtalent`,
        );

        const data: HireTalentItem[] = hireTalentResponse.data.data;

        // Filter freelancers by status and enrich with default data
        const invited: FreelancerApplication[] = [];
        const selected: FreelancerApplication[] = [];
        const rejected: FreelancerApplication[] = [];
        const applied: FreelancerApplication[] = [];

        data.forEach((item) => {
          if (item.freelancers && item.freelancers.length > 0) {
            item.freelancers.forEach((freelancer) => {
              // Enrich freelancer data with defaults for missing fields
              const enrichedFreelancer = {
                ...freelancer,
                // Add default fields needed by profile cards
                firstName: 'Freelancer',
                lastName: `#${freelancer.freelancerId.slice(0, 6)}`,
                email: 'email@example.com',
                profilePic: '',
                domainName: item.domainName || item.skillName || 'General',
                role: item.domainName || item.skillName || 'Developer',
                professionalInfo: [],
                skills: item.skillName
                  ? [{ _id: item.skillId || '', name: item.skillName }]
                  : [],
              };

              if (freelancer.status === 'INVITED') {
                invited.push(enrichedFreelancer);
              } else if (freelancer.status === 'SELECTED') {
                selected.push(enrichedFreelancer);
              } else if (freelancer.status === 'REJECTED') {
                rejected.push(enrichedFreelancer);
              } else if (freelancer.status === 'APPLIED') {
                applied.push(enrichedFreelancer);
              }
            });
          }
        });

        setInvitedApplications(invited);
        setSelectedApplications(selected);
        setRejectedApplications(rejected);
        setAppliedApplications(applied);
      } catch (error) {
        console.error('Error fetching hire talent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHireTalentData();
  }, []);

  // Get the appropriate data based on active tab
  const getCurrentTabData = () => {
    if (activeTab === 'invited') return invitedApplications;
    if (activeTab === 'accepted') return selectedApplications;
    if (activeTab === 'rejected') return rejectedApplications;
    if (activeTab === 'applications') return appliedApplications;
    return [];
  };

  return (
    <TalentLayout
      activeTab={
        activeTab as 'invited' | 'accepted' | 'rejected' | 'applications'
      }
      talents={getCurrentTabData()}
      loading={loading}
    />
  );
}
