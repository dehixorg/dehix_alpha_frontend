// src/components/marketComponents/TalentLayout.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  BookMarked,
  CheckCircle2,
  Users2,
  XCircle,
  FileText,
} from 'lucide-react';

import Header from '../header/header';

import TalentContent from './TalentContent';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';

interface ProfessionalExperience {
  workFrom?: string;
  workTo?: string;
  jobTitle?: string;
}

interface FreelancerApplication {
  _id: string;
  freelancerId: string;
  freelancer_professional_profile_id: string;
  status: 'INVITED' | 'SELECTED' | 'REJECTED';
  cover_letter?: string;
  interview_ids: string[];
  updatedAt: string;
}

interface TalentLayoutProps {
  activeTab: 'invited' | 'accepted' | 'rejected' | 'applications' | 'overview';
  talents?: FreelancerApplication[];
  loading?: boolean;
}

export const calculateExperience = (
  professionalInfo: ProfessionalExperience[],
): string => {
  if (!professionalInfo || professionalInfo.length === 0) {
    return 'Not specified';
  }
  let totalExperienceInMonths = 0;
  professionalInfo.forEach((job) => {
    if (job.workFrom && job.workTo) {
      const start = new Date(job.workFrom);
      const end = new Date(job.workTo);
      if (start < end) {
        const diffInMonths =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        if (diffInMonths > 0) {
          totalExperienceInMonths += diffInMonths;
        }
      }
    }
  });

  const years = Math.floor(totalExperienceInMonths / 12);
  const months = totalExperienceInMonths % 12;

  if (years === 0 && months === 0) return 'Less than a month';
  const yearString = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
  const monthString =
    months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

  if (yearString && monthString) return `${yearString} and ${monthString}`;
  return yearString || monthString;
};

const TalentLayout: React.FC<TalentLayoutProps> = ({
  activeTab,
  talents = [],
  loading = false,
}) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    router.push(`/business/talent/${value}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-auto">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />
      <div className="sm:ml-14 flex flex-col min-h-screen">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dehix Talent"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Hire Talent', link: '#' },
            {
              label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
              link: '#',
            },
          ]}
        />
        {/* Filters will be added later if needed */}
        <div className="container px-4 py-4 ">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" asChild>
                <a href="/business/talent">
                  <Users2 className="h-4 w-4 mr-2" />
                  Overview
                </a>
              </TabsTrigger>
              <TabsTrigger value="applications">
                <FileText className="h-4 w-4 mr-2" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="invited">
                <BookMarked className="h-4 w-4 mr-2" />
                Invites
              </TabsTrigger>
              <TabsTrigger value="accepted">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accepted
              </TabsTrigger>
              <TabsTrigger value="rejected">
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="container flex-1 items-start px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Filters sidebar will be added later if needed */}

            {/* Talent Content */}
            <div className="col-span-12">
              <TalentContent
                activeTab={activeTab}
                talents={activeTab === 'overview' ? [] : talents}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;
