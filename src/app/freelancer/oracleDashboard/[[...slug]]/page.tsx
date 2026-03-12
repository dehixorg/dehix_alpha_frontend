'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Briefcase, User, Package } from 'lucide-react';
import { useSelector } from 'react-redux';

import BusinessVerification from '@/components/freelancer/oracleDashboard/BusinessVerification';
import EducationVerification from '@/components/freelancer/oracleDashboard/EducationVerification';
import ProjectVerification from '@/components/freelancer/oracleDashboard/ProjectVerification';
import WorkExpVerification from '@/components/freelancer/oracleDashboard/WorkExpVerification';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';
import { useOracleTour } from '@/components/tour/freelancer/useOracleTour';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';

export default function OracleDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const user = useSelector((state: RootState) => state.user);

  const [verificationData, setVerificationData] = useState<
    Record<string, any[]>
  >({
    business: [],
    experience: [],
    project: [],
    education: [],
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({
    business: false,
    experience: false,
    project: false,
    education: false,
  });
  const [fetched, setFetched] = useState<Record<string, boolean>>({
    business: false,
    experience: false,
    project: false,
    education: false,
  });

  // Determine active tab from dynamic route params
  const slugParam = (params as any)?.slug;
  const lastSegment = Array.isArray(slugParam)
    ? slugParam[slugParam.length - 1] || ''
    : (slugParam ?? '');
  const validTabs = ['business', 'experience', 'project', 'education'];
  const currentTabFromURL = validTabs.includes(lastSegment)
    ? lastSegment
    : 'business';

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    router.push(`/freelancer/oracleDashboard/${tab}`);
  };

  const fetchVerificationData = useCallback(
    async (docType: string) => {
      if (!user?.uid || fetched[docType]) return;
      try {
        setLoading((prev) => ({ ...prev, [docType]: true }));
        const response = await axiosInstance.get(
          `/verification/${user.uid}/oracle?doc_type=${docType}`,
        );
        setVerificationData((prev) => ({
          ...prev,
          [docType]: response.data.data || [],
        }));
        setFetched((prev) => ({ ...prev, [docType]: true }));
      } catch (error) {
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error(error);
      } finally {
        setLoading((prev) => ({ ...prev, [docType]: false }));
      }
    },
    [user?.uid, fetched],
  );

  useEffect(() => {
    fetchVerificationData(currentTabFromURL);
  }, [currentTabFromURL, fetchVerificationData]);

  useOracleTour(true);

  return (
    <FreelancerAppLayout
      active="Oracle"
      activeMenu="Oracle"
      breadcrumbItems={[
        { label: 'Freelancer', link: '/dashboard/freelancer' },
        {
          label: 'Oracle Dashboard',
          link: `/freelancer/oracleDashboard/${currentTabFromURL}`,
        },
      ]}
      containerClassName="flex min-h-screen w-full flex-col pb-10"
      mainClassName="flex-1 px-4"
    >
      <div className="mx-auto w-full max-w-7xl mt-4 md:mt-0">
        <Tabs
          value={currentTabFromURL}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList
            className="grid w-full grid-cols-4 gap-2"
            data-tour="oracle-tabs"
          >
            <TabsTrigger
              value="business"
              className="flex items-center gap-1 px-1.5 text-xs sm:text-sm sm:px-3"
            >
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Business</span>
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="flex items-center gap-1 px-1.5 text-xs sm:text-sm sm:px-3"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Experience</span>
            </TabsTrigger>
            <TabsTrigger
              value="project"
              className="flex items-center gap-1 px-1.5 text-xs sm:text-sm sm:px-3"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="flex items-center gap-1 px-1.5 text-xs sm:text-sm sm:px-3"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Education</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" data-tour="oracle-page">
            <BusinessVerification
              data={verificationData.business}
              loading={loading.business}
            />
          </TabsContent>
          <TabsContent value="experience">
            <WorkExpVerification
              data={verificationData.experience}
              loading={loading.experience}
            />
          </TabsContent>
          <TabsContent value="project">
            <ProjectVerification
              data={verificationData.project}
              loading={loading.project}
            />
          </TabsContent>
          <TabsContent value="education">
            <EducationVerification
              data={verificationData.education}
              loading={loading.education}
            />
          </TabsContent>
        </Tabs>
      </div>
    </FreelancerAppLayout>
  );
}
