'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  UserCheck,
  Filter,
  Calendar,
  Clock,
  History,
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import CurrentInterviews from '@/components/freelancer/scheduleInterview/CurrentInterviews';
import BidedInterviews from '@/components/freelancer/scheduleInterview/BidedInterviews';
import HistoryInterviews from '@/components/freelancer/scheduleInterview/HistoryInterviews';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Button } from '@/components/ui/button';

export default function ScheduleInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Simplified state management - only status matters now
  const statusFromUrl = searchParams.get('status') || 'current';
  const typeFromUrl = searchParams.get('type') || 'all';

  const [activeStatus, setActiveStatus] = React.useState<string>(statusFromUrl);
  const [selectedType, setSelectedType] = React.useState<string>(typeFromUrl);

  React.useEffect(() => {
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    if (status && status !== activeStatus) {
      setActiveStatus(status);
    }
    if (type && type !== selectedType) {
      setSelectedType(type);
    }
  }, [searchParams]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    router.push(
      `/freelancer/scheduleInterview?status=${status}&type=${selectedType}`,
    );
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    router.push(
      `/freelancer/scheduleInterview?status=${activeStatus}&type=${type}`,
    );
  };

  const interviewTypes = [
    {
      id: 'all',
      name: 'All Interviews',
      icon: <Filter className="w-5 h-5" />,
      gradient: 'from-gray-500 to-gray-600',
      color: 'gray',
    },
    {
      id: 'upskill',
      name: 'Upskill',
      icon: <GraduationCap className="w-5 h-5" />,
      gradient: 'from-purple-500 to-indigo-600',
      color: 'purple',
    },
    {
      id: 'project',
      name: 'Project',
      icon: <Briefcase className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-600',
      color: 'blue',
    },
    {
      id: 'talent',
      name: 'Dehix Talent',
      icon: <UserCheck className="w-5 h-5" />,
      gradient: 'from-violet-500 to-purple-600',
      color: 'violet',
    },
  ];

  const getActiveType = () =>
    interviewTypes.find((t) => t.id === selectedType) || interviewTypes[0];

  const renderContent = () => {
    // Only render content for Talent type with data
    // For others, show coming soon or empty state
    if (selectedType === 'talent' || selectedType === 'all') {
      switch (activeStatus) {
        case 'current':
          return <CurrentInterviews />;
        case 'bidded':
          return <BidedInterviews />;
        case 'history':
          return <HistoryInterviews />;
        default:
          return <CurrentInterviews />;
      }
    }

    // Empty state for upskill and project (not implemented yet)
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div
          className={`w-20 h-20 rounded-full bg-gradient-to-br ${getActiveType().gradient} p-4 flex items-center justify-center mb-4 shadow-lg`}
        >
          <div className="text-white">{getActiveType().icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {getActiveType().name} - Coming Soon
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          This interview type is currently under development. Stay tuned for
          updates!
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={freelancerMenuItemsTop}
        menuItemsBottom={freelancerMenuItemsBottom}
        active="Schedule Interviews"
      />

      <div className="flex flex-col sm:py-0 sm:pl-14 mb-8 w-full">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Schedule Interviews"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            {
              label: 'Schedule Interview',
              link: '/freelancer/scheduleInterview',
            },
          ]}
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Schedule Interviews
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-2xl">
                Manage all your interview opportunities in one place. Filter by
                status and type to find what you need.
              </p>
            </div>
          </div>

          {/* Main Card Container */}
          <div className="bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Interview Type Filters - NOW ON TOP */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Filter by Interview Type
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {interviewTypes.map((type) => (
                  <Button
                    key={type.id}
                    onClick={() => handleTypeFilter(type.id)}
                    variant={selectedType === type.id ? 'default' : 'outline'}
                    className={`h-auto py-3 px-4 flex flex-col items-center gap-2 transition-all ${
                      selectedType === type.id
                        ? `bg-gradient-to-br ${type.gradient} text-white hover:opacity-90 border-0 shadow-md`
                        : 'hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    {type.icon}
                    <span className="text-xs sm:text-sm font-medium">
                      {type.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Tabs - NOW BELOW FILTERS */}
            <Tabs
              value={activeStatus}
              onValueChange={handleStatusChange}
              className="w-full"
            >
              <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-2">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <TabsTrigger
                    value="current"
                    className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Current</span>
                    <span className="sm:hidden">Now</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="bidded"
                    className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Bidded</span>
                    <span className="sm:hidden">Bids</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium transition-all"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">History</span>
                    <span className="sm:hidden">Past</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <TabsContent value="current" className="m-0 p-0">
                {renderContent()}
              </TabsContent>
              <TabsContent value="bidded" className="m-0 p-0">
                {renderContent()}
              </TabsContent>
              <TabsContent value="history" className="m-0 p-0">
                {renderContent()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
