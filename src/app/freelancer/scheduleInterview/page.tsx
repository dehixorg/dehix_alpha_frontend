'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  UserCheck
} from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import ScheduleInterviewDialog from '@/components/freelancer/scheduleInterview/scheduleInterviewDialog';
import { createScheduleInterviewMenuItems } from '@/config/menuItems/freelancer/scheduleInterviewMenuItems';
import Header from '@/components/header/header';
import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';

export default function ScheduleInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(() => {
    const tab = searchParams.get('tab');
    return tab || 'upskill';
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  const { menuItemsTop, menuItemsBottom } = createScheduleInterviewMenuItems(handleTabChange, activeTab);

  // Update active tab when URL changes
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'upskill':
        return (
          <div className="space-y-6">
            {/* Current Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Interview
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No current upskill interviews scheduled.
                </p>
              </div>
            </div>

            {/* Bidded Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bidded Interview
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No bidded upskill interviews found.
                </p>
              </div>
            </div>

            {/* History Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  History
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No upskill interview history available.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'project':
        return (
          <div className="space-y-6">
            {/* Current Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Interview
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No current project interviews scheduled.
                </p>
              </div>
            </div>

            {/* Bidded Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bidded Interview
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No bidded project interviews found.
                </p>
              </div>
            </div>

            {/* History Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  History
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No project interview history available.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'talent':
        return (
          <div className="space-y-6">
            {/* Current Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Interviews
                </h2>
              </div>
              <CurrentInterviews />
            </div>

            {/* Bidded Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bided Interviews
                </h2>
              </div>
              <BidedInterviews />
            </div>

            {/* History Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  History
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No talent interview history available.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'dehix':
        return (
          <div className="space-y-6">
            {/* Current Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Interview
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No current Dehix interviews scheduled.
                </p>
              </div>
            </div>

            {/* Bidded Interview Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bidded Interview
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No bidded Dehix interviews found.
                </p>
              </div>
            </div>

            {/* History Segment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  History
                </h2>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No Dehix interview history available.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <ScheduleInterviewDialog />;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={activeTab === 'main' ? 'Schedule Interview' : activeTab === 'upskill' ? 'Upskill Interview' : activeTab === 'project' ? 'Project Interview' : activeTab === 'talent' ? 'Dehix Talent Interview' : activeTab === 'dehix' ? 'Dehix Interview' : 'Schedule Interview'}
      />
      <div className="flex flex-col sm:py-2 sm:pl-14 mb-8 w-full">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="ScheduleInterviews"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Schedule Interview', link: '#' },
          ]}
        />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'upskill' && 'Upskill Interview'}
              {activeTab === 'project' && 'Project Interview'}
              {activeTab === 'talent' && 'Dehix Talent Interview'}
              {activeTab === 'dehix' && 'Dehix Interview'}
              {activeTab === 'main' && 'Schedule Interview'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {activeTab === 'upskill' && 'Enhance your skills through specialized interviews'}
              {activeTab === 'project' && 'Project-based interviews for specific opportunities'}
              {activeTab === 'talent' && 'Talent assessment interviews'}
              {activeTab === 'dehix' && 'Platform verification interviews'}
              {activeTab === 'main' && 'Manage your interview scheduling and preparation'}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

