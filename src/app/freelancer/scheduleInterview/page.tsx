'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, Briefcase, UserCheck } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';
import HistoryInterviews from '@/components/freelancer/scheduleInterview/HistoryInterviews';
import { createScheduleInterviewMenuItems } from '@/config/menuItems/freelancer/scheduleInterviewMenuItems';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL
  const tabFromUrl = searchParams.get('tab');

  // Default to upskill/current if tab missing
  const [activeTab, setActiveTab] = React.useState<string>(
    tabFromUrl || 'upskill/current',
  );

  // Ensure URL always has /current if missing
  React.useEffect(() => {
    if (!tabFromUrl) {
      router.replace('/freelancer/scheduleInterview?tab=upskill/current');
    } else if (!tabFromUrl.includes('/')) {
      router.replace(`/freelancer/scheduleInterview?tab=${tabFromUrl}/current`);
    }
  }, [tabFromUrl, router]);

  // Split mainTab and section safely
  const [mainTab = 'upskill', section = 'current'] = activeTab.split('/');

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/freelancer/scheduleInterview?tab=${newTab}`);
  };

  const { menuItemsTop, menuItemsBottom } =
    createScheduleInterviewMenuItems(handleTabChange);

  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const getTabIcon = () => {
    switch (mainTab) {
      case 'upskill':
        return <GraduationCap className="w-5 h-5" />;
      case 'project':
        return <Briefcase className="w-5 h-5" />;
      case 'talent':
        return <UserCheck className="w-5 h-5" />;
      default:
        return <UserCheck className="w-5 h-5" />;
    }
  };

  const renderSectionContent = () => {
    if (section === 'current' && mainTab === 'talent')
      return <CurrentInterviews />;
    if (section === 'bidded' && mainTab === 'talent')
      return <BidedInterviews />;
    if (section === 'history' && mainTab === 'talent')
      return <HistoryInterviews />;

    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          No {section} {mainTab} interviews{' '}
          {section === 'current'
            ? 'scheduled'
            : section === 'bidded'
              ? 'found'
              : 'available'}
          .
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={
          mainTab === 'upskill'
            ? 'Upskill Interview'
            : mainTab === 'project'
              ? 'Project Interview'
              : mainTab === 'talent'
                ? 'Dehix Talent Interview'
                : 'Schedule Interview'
        }
      />

      <div className="flex flex-col sm:py-0 sm:pl-14 mb-8 w-full">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Schedule Interview"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            {
              label: 'Schedule Interview',
              link: '/freelancer/scheduleInterview',
            },
          ]}
        />

        <div className="p-6">
          {/* Section Tabs */}
          <Tabs
            value={section}
            onValueChange={(value) => handleTabChange(`${mainTab}/${value}`)}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="bidded">Bidded</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {mainTab === 'upskill' && 'Upskill Interview'}
              {mainTab === 'project' && 'Project Interview'}
              {mainTab === 'talent' && 'Dehix Talent Interview'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {mainTab === 'upskill' &&
                'Enhance your skills through specialized interviews'}
              {mainTab === 'project' &&
                'Project-based interviews for specific opportunities'}
              {mainTab === 'talent' && 'Talent assessment interviews'}
            </p>
          </div>

          {/* Section Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#151518] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  {getTabIcon()}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.charAt(0).toUpperCase() + section.slice(1)}{' '}
                  {mainTab.charAt(0).toUpperCase() + mainTab.slice(1)} Interview
                </h2>
              </div>

              {renderSectionContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
