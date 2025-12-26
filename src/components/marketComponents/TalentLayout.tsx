// src/components/marketComponents/TalentLayout.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Users2, FileText } from 'lucide-react';

import Header from '../header/header';

import TalentContent from './TalentContent';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { FreelancerApplication } from '@/types/talent';

interface ProfessionalExperience {
  workFrom?: string;
  workTo?: string;
  jobTitle?: string;
}

interface TalentLayoutProps {
  activeTab: 'applications' | 'overview';
  talents?: FreelancerApplication[];
  loading?: boolean;
  statusFilter?: 'invited' | 'accepted' | 'rejected' | 'applications';
  onStatusFilterChange?: (
    value: 'invited' | 'accepted' | 'rejected' | 'applications',
  ) => void;
  talentFilter?: string;
  onTalentFilterChange?: (value: string) => void;
  talentOptions?: { label: string; value: string }[];
  onUpdateApplicationStatus?: (
    freelancerId: string,
    status: 'SELECTED' | 'REJECTED',
  ) => Promise<void>;
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
  statusFilter,
  onStatusFilterChange,
  talentFilter,
  onTalentFilterChange,
  talentOptions,
  onUpdateApplicationStatus,
}) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      router.push('/business/talent');
    } else {
      router.push('/business/talent/applications');
    }
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">
                <Users2 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="applications">
                <FileText className="h-4 w-4 mr-2" />
                Applications
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="container flex-1 items-start px-4 py-6">
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <TalentContent
                activeTab={activeTab}
                talents={activeTab === 'overview' ? [] : talents}
                loading={loading}
                statusFilter={statusFilter}
                onStatusFilterChange={onStatusFilterChange}
                talentFilter={talentFilter}
                onTalentFilterChange={onTalentFilterChange}
                talentOptions={talentOptions}
                onUpdateApplicationStatus={onUpdateApplicationStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;
