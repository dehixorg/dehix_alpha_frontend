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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHireTalentData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const hireTalentResponse = await axiosInstance.get(
          `/business/hire-dehixtalent`,
        );

        const data: HireTalentItem[] = hireTalentResponse.data.data;

        // Collect unique freelancer IDs to fetch profiles in bulk
        const freelancerIds = new Set<string>();
        data.forEach((item) => {
          item.freelancers?.forEach((f) => {
            if (f.freelancerId) freelancerIds.add(f.freelancerId);
          });
        });

        // Fetch profiles and build a map for quick lookup
        const profileMap: Record<
          string,
          {
            firstName?: string;
            lastName?: string;
            email?: string;
            profilePic?: string;
          }
        > = {};

        await Promise.all(
          Array.from(freelancerIds).map(async (id) => {
            try {
              const res = await axiosInstance.get(`/public/freelancer/${id}`);
              const p = res?.data?.data || res?.data || {};
              profileMap[id] = {
                firstName: p.firstName || undefined,
                lastName: p.lastName || undefined,
                email: p.email || undefined,
                profilePic: p.profilePic || undefined,
              };
            } catch (e) {
              // Ignore individual failures; deterministic fallbacks will be applied below
            }
          }),
        );

        // Deduplicate freelancers across all hire items using a Map
        type Status = 'INVITED' | 'SELECTED' | 'REJECTED' | 'APPLIED';
        const statusRank: Record<Status, number> = {
          SELECTED: 4,
          INVITED: 3,
          APPLIED: 2,
          REJECTED: 1,
        } as const;

        const aggregateMap = new Map<
          string,
          FreelancerApplication & { status: Status }
        >();

        data.forEach((item) => {
          item.freelancers?.forEach((freelancer) => {
            if (!freelancer.freelancerId) return;
            const profile = profileMap[freelancer.freelancerId];

            // Build enriched object for this occurrence
            const current: FreelancerApplication & { status: Status } = {
              ...freelancer,
              status: freelancer.status as Status,
              firstName: profile?.firstName || 'Name unavailable',
              lastName: profile?.lastName || '',
              email: profile?.email || 'Email not provided',
              profilePic: profile?.profilePic || '',
              domainName: item.domainName || item.skillName || 'General',
              role: item.domainName || item.skillName || 'Developer',
              professionalInfo: [],
              skills: item.skillName
                ? [{ _id: item.skillId || '', name: item.skillName }]
                : [],
            } as any;

            const existing = aggregateMap.get(freelancer.freelancerId);
            if (!existing) {
              aggregateMap.set(freelancer.freelancerId, current);
            } else {
              // Merge: prefer non-empty fields and higher-precedence status
              const merged: FreelancerApplication & { status: Status } = {
                ...existing,
                ...current,
                firstName: existing.firstName || current.firstName,
                lastName: existing.lastName || current.lastName,
                email: existing.email || current.email,
                profilePic: existing.profilePic || current.profilePic,
                domainName: existing.domainName || current.domainName,
                role: existing.role || current.role,
                professionalInfo: existing.professionalInfo?.length
                  ? existing.professionalInfo
                  : current.professionalInfo,
                skills: existing.skills?.length
                  ? existing.skills
                  : current.skills,
                status:
                  statusRank[existing.status] >= statusRank[current.status]
                    ? existing.status
                    : current.status,
              } as any;
              aggregateMap.set(freelancer.freelancerId, merged);
            }
          });
        });

        // Distribute unique freelancers into arrays based on resolved status
        const invited: FreelancerApplication[] = [];
        const selected: FreelancerApplication[] = [];
        const rejected: FreelancerApplication[] = [];
        const applied: FreelancerApplication[] = [];

        aggregateMap.forEach((f) => {
          if (f.status === 'SELECTED') selected.push(f);
          else if (f.status === 'INVITED') invited.push(f);
          else if (f.status === 'APPLIED') applied.push(f);
          else if (f.status === 'REJECTED') rejected.push(f);
        });

        setInvitedApplications(invited);
        setSelectedApplications(selected);
        setRejectedApplications(rejected);
        setAppliedApplications(applied);
      } catch (error) {
        console.error('Error fetching hire talent data:', error);
        setErrorMessage(
          'Failed to load talent data. Please refresh the page or try again later.',
        );
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
    <>
      {errorMessage && (
        <div className="container px-4 pt-4">
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3">
            {errorMessage}
          </div>
        </div>
      )}
      <TalentLayout
        activeTab={
          activeTab as 'invited' | 'accepted' | 'rejected' | 'applications'
        }
        talents={getCurrentTabData()}
        loading={loading}
      />
    </>
  );
}
