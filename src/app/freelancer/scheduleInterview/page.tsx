'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, Briefcase, Users, UserCheck } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import ScheduleInterviewDialog from '@/components/freelancer/scheduleInterview/scheduleInterviewDialog';
import { createScheduleInterviewMenuItems } from '@/config/menuItems/freelancer/scheduleInterviewMenuItems';
import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';
import HistoryInterviews from '@/components/freelancer/scheduleInterview/HistoryInterviews';

export default function ScheduleInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(() => {
    const tab = searchParams.get('tab');
    return tab || 'upskill';
  });

  const [activeSection, setActiveSection] = React.useState<
    'current' | 'bidded' | 'history'
  >('current');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  const { menuItemsTop, menuItemsBottom } =
    createScheduleInterviewMenuItems(handleTabChange);

  // Update active tab when URL changes
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const renderContent = () => {
    // Get the appropriate icon based on active tab
    const getTabIcon = () => {
      switch (activeTab) {
        case 'upskill':
          return <GraduationCap className="w-5 h-5" />;
        case 'project':
          return <Briefcase className="w-5 h-5" />;
        case 'talent':
        case 'dehix':
          return <UserCheck className="w-5 h-5" />;
        default:
          return <Users className="w-5 h-5" />;
      }
    };

    const renderSectionContent = () => {
      const icon = getTabIcon();
      const iconClass =
        activeSection === 'current'
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          : activeSection === 'bidded'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';

      const sectionTitle =
        activeSection === 'current'
          ? 'Current Interview'
          : activeSection === 'bidded'
            ? 'Bidded Interview'
            : 'History';

      const sectionContent = () => {
        if (activeSection === 'current' && activeTab === 'talent')
          return <CurrentInterviews />;
        if (activeSection === 'bidded' && activeTab === 'talent')
          return <BidedInterviews />;
        if (activeSection === 'history' && activeTab === 'talent')
          return <HistoryInterviews />;

        // Default content for other tabs
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No {activeSection.toLowerCase()} {activeTab.toLowerCase()}{' '}
              interviews{' '}
              {activeSection === 'current'
                ? 'scheduled'
                : activeSection === 'bidded'
                  ? 'found'
                  : 'available'}
              .
            </p>
          </div>
        );
      };

      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#151518] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 ${iconClass} rounded-full flex items-center justify-center`}
              >
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {sectionTitle}
              </h2>
            </div>
            <div className="mt-4">{sectionContent()}</div>
          </div>
        </div>
      );
    };

    // Handle different tab content
    switch (activeTab) {
      case 'upskill':
      case 'project':
      case 'talent':
      case 'dehix':
        return renderSectionContent();
      default:
        return <ScheduleInterviewDialog />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={
          activeTab === 'main'
            ? 'Schedule Interview'
            : activeTab === 'upskill'
              ? 'Upskill Interview'
              : activeTab === 'project'
                ? 'Project Interview'
                : activeTab === 'talent'
                  ? 'Dehix Talent Interview'
                  : activeTab === 'dehix'
                    ? 'Dehix Interview'
                    : 'Schedule Interview'
        }
      />
      <div className="flex flex-col sm:py-2 sm:pl-14 mb-8 w-full">
        <div className="p-6">
          {/* Section Tabs */}
          <Tabs
            value={activeSection}
            onValueChange={(value) =>
              setActiveSection(value as 'current' | 'bidded' | 'history')
            }
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="bidded">Bidded</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'upskill' && 'Upskill Interview'}
              {activeTab === 'project' && 'Project Interview'}
              {activeTab === 'talent' && 'Dehix Talent Interview'}
              {activeTab === 'dehix' && 'Dehix Interview'}
              {activeTab === 'main' && 'Schedule Interview'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {activeTab === 'upskill' &&
                'Enhance your skills through specialized interviews'}
              {activeTab === 'project' &&
                'Project-based interviews for specific opportunities'}
              {activeTab === 'talent' && 'Talent assessment interviews'}
              {activeTab === 'dehix' && 'Platform verification interviews'}
              {activeTab === 'main' &&
                'Manage your interview scheduling and preparation'}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
