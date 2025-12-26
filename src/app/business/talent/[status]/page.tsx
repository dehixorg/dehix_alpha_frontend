'use client';
import React, { useEffect, useState } from 'react';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import { axiosInstance } from '@/lib/axiosinstance';
import { FreelancerApplication } from '@/types/talent';

const freelancerProfileCache = new Map<
  string,
  {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePic?: string;
  }
>();

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

  const [tabApplications, setTabApplications] = useState<FreelancerApplication[]>(
    [],
  );
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

        type Status = 'INVITED' | 'SELECTED' | 'REJECTED' | 'APPLIED';
        const desiredStatus: Status =
          activeTab === 'accepted'
            ? 'SELECTED'
            : activeTab === 'rejected'
              ? 'REJECTED'
              : activeTab === 'applications'
                ? 'APPLIED'
                : 'INVITED';

        // Filter down to only the freelancers relevant for the current tab.
        const relevant: { item: HireTalentItem; freelancer: FreelancerApplication }[] =
          [];
        data.forEach((item) => {
          item.freelancers?.forEach((freelancer) => {
            if (!freelancer?.freelancerId) return;
            if ((freelancer.status as Status) !== desiredStatus) return;
            relevant.push({ item, freelancer });
          });
        });

        // Collect unique freelancer IDs to fetch profiles (only for this tab)
        const freelancerIds = new Set<string>();
        relevant.forEach(({ freelancer }) => {
          if (freelancer.freelancerId) freelancerIds.add(freelancer.freelancerId);
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
              if (freelancerProfileCache.has(id)) {
                profileMap[id] = freelancerProfileCache.get(id) as any;
                return;
              }
              const res = await axiosInstance.get(`/public/freelancer/${id}`);
              const p = res?.data?.data || res?.data || {};
              const cached = {
                firstName: p.firstName || undefined,
                lastName: p.lastName || undefined,
                email: p.email || undefined,
                profilePic: p.profilePic || undefined,
              };
              freelancerProfileCache.set(id, cached);
              profileMap[id] = cached;
            } catch (e) {
              // Ignore individual failures; deterministic fallbacks will be applied below
            }
          }),
        );

        // Deduplicate freelancers for this tab using a Map
        const aggregateMap = new Map<string, FreelancerApplication & { status: Status }>();
        relevant.forEach(({ item, freelancer }) => {
          const profile = profileMap[freelancer.freelancerId];
          const current: FreelancerApplication & { status: Status } = {
            ...freelancer,
            status: freelancer.status as Status,
            firstName: profile?.firstName || freelancer.firstName || 'Name unavailable',
            lastName: profile?.lastName || freelancer.lastName || '',
            email: profile?.email || freelancer.email || 'Email not provided',
            profilePic: profile?.profilePic || freelancer.profilePic || '',
            domainName:
              item.talentName || item.domainName || item.skillName || 'General',
            role: item.talentName || item.domainName || item.skillName || 'Developer',
            professionalInfo: [],
            skills:
              (item.type || '').toUpperCase() === 'SKILL' && item.talentName
                ? [
                    {
                      _id: item.talentId || item.skillId || '',
                      name: item.talentName || item.skillName,
                    },
                  ]
                : item.skillName
                  ? [{ _id: item.skillId || '', name: item.skillName }]
                  : [],
          } as any;

          const existing = aggregateMap.get(freelancer.freelancerId);
          if (!existing) {
            aggregateMap.set(freelancer.freelancerId, current);
            return;
          }

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
            skills: existing.skills?.length ? existing.skills : current.skills,
            status: desiredStatus,
          } as any;

          aggregateMap.set(freelancer.freelancerId, merged);
        });

        setTabApplications(Array.from(aggregateMap.values()));
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
  }, [activeTab]);

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
        talents={tabApplications}
        loading={loading}
      />
    </>
  );
}
