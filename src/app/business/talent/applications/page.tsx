'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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

export default function Page() {
  const searchParams = useSearchParams();
  const statusParam = (searchParams.get('status') || '').toLowerCase();

  const allowed = new Set(['invited', 'accepted', 'rejected', 'applications']);
  const initialStatusFilter = allowed.has(statusParam)
    ? (statusParam as 'invited' | 'accepted' | 'rejected' | 'applications')
    : 'invited';

  const activeTab = 'applications' as const;
  const [statusFilter, setStatusFilter] = useState<
    'invited' | 'accepted' | 'rejected' | 'applications'
  >(initialStatusFilter);

  const [talentFilter, setTalentFilter] = useState<string>('');
  const [talentOptions, setTalentOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [tabApplications, setTabApplications] = useState<
    FreelancerApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateApplicationStatus = async (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED',
  ) => {
    const hireId = talentFilter;
    if (!hireId) return;

    try {
      await axiosInstance.post('/business/update-application', {
        hireId,
        freelancerId,
        status,
      });

      setRefreshKey((v) => v + 1);
    } catch (error) {
      console.error('Error updating application:', error);
      setErrorMessage('Failed to update application. Please try again.');
    }
  };

  useEffect(() => {
    const fetchHireTalentData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const hireTalentResponse = await axiosInstance.get(
          `/business/hire-dehixtalent`,
        );

        const data: HireTalentItem[] = hireTalentResponse.data.data;

        const nextTalentOptions = (data || [])
          .map((item) => ({
            label: String(item?.talentName || '').trim(),
            value: String(item?._id || '').trim(),
          }))
          .filter((o) => Boolean(o.value) && Boolean(o.label));

        const uniqueByValue = new Map<
          string,
          { label: string; value: string }
        >();
        for (const opt of nextTalentOptions) {
          if (!uniqueByValue.has(opt.value)) uniqueByValue.set(opt.value, opt);
        }
        const nextUniqueTalentOptions = Array.from(uniqueByValue.values());
        setTalentOptions(nextUniqueTalentOptions);

        const defaultTalentId = nextUniqueTalentOptions[0]?.value;
        const effectiveHireId = talentFilter || defaultTalentId || '';

        if (!talentFilter && defaultTalentId) {
          setTalentFilter(defaultTalentId);
        }

        type Status = 'INVITED' | 'SELECTED' | 'REJECTED' | 'APPLIED';
        const desiredStatus: Status =
          statusFilter === 'accepted'
            ? 'SELECTED'
            : statusFilter === 'rejected'
              ? 'REJECTED'
              : statusFilter === 'applications'
                ? 'APPLIED'
                : 'INVITED';

        if (!effectiveHireId) {
          setTabApplications([]);
          return;
        }

        const applicationsResponse = await axiosInstance.get(
          `/business/hire-dehixtalent-applications/${effectiveHireId}/applications/init`,
          {
            params: {
              status: desiredStatus,
              limit: 20,
              skip: 0,
            },
          },
        );

        const nextApplications: FreelancerApplication[] =
          (applicationsResponse.data?.data as FreelancerApplication[]) ||
          (applicationsResponse.data
            ?.applications as FreelancerApplication[]) ||
          [];

        const normalized = (
          Array.isArray(nextApplications) ? (nextApplications as any[]) : []
        )
          .map((row) => {
            const application = row?.application;
            const freelancer = row?.freelancer;
            const hire = row?.hire;

            if (!application || !freelancer) return row;

            const out: FreelancerApplication = {
              _id: String(application?._id || row?._id || ''),
              freelancerId: String(
                application?.freelancerId || freelancer?._id || '',
              ),
              freelancerProfessionalProfileId: String(
                application?.freelancerProfessionalProfileId ||
                  row?.freelancerProfessionalProfileId ||
                  '',
              ),
              status: application?.status,
              cover_letter: application?.cover_letter,
              interviewIds:
                application?.interview_ids || application?.interviewIds,
              updatedAt: String(application?.updatedAt || row?.updatedAt || ''),
              firstName: freelancer?.firstName,
              lastName: freelancer?.lastName,
              email: freelancer?.email,
              profilePic: freelancer?.profilePic,
              githubLink: freelancer?.githubLink,
              linkedin: freelancer?.linkedin,
              personalWebsite: freelancer?.personalWebsite,
              userName: freelancer?.userName,
              description: freelancer?.description,
              workExperience: freelancer?.workExperience,
              location: freelancer?.location,
              phone: freelancer?.phone,
              role: hire?.talentName || freelancer?.role,
              domainName: hire?.talentName || freelancer?.domainName,
              professionalInfo:
                freelancer?.professionalInfo ||
                freelancer?.professionalExperience ||
                [],
              skills: freelancer?.skills || [],
              kyc: freelancer?.kyc,
            } as any;

            (out as any).application = application;
            (out as any).hire = hire;

            return out;
          })
          .filter(Boolean);

        setTabApplications(normalized as FreelancerApplication[]);
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
  }, [statusFilter, talentFilter, refreshKey]);

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
        activeTab={activeTab}
        talents={tabApplications}
        loading={loading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        talentFilter={talentFilter}
        onTalentFilterChange={setTalentFilter}
        talentOptions={talentOptions}
        onUpdateApplicationStatus={updateApplicationStatus}
      />
    </>
  );
}
