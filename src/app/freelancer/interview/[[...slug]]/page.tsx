'use client';
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListVideo, Users2, History, Briefcase } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileComponent from '@/components/freelancer/interview/Profile';
import BidsComponent from '@/components/freelancer/interview/Bids';
import CurrentComponent from '@/components/freelancer/interview/Current';
import HistoryComponent from '@/components/freelancer/interview/History';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();

  // slug will be [] or ["profile"], ["current"], ["bids"], ["history"]
  const slug = Array.isArray(params?.slug) ? params.slug : [];
  const activeTab = slug[0] || 'profile';

  // Redirect plain /interview → /interview/profile
  useEffect(() => {
    if (slug.length === 0) {
      router.replace('/freelancer/interview/profile');
    }
  }, [slug, router]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Interviews"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Interviews"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Interview', link: '/freelancer/interview/profile' },
          ]}
        />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-0 md:py-2">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Interviews Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your interview profile, track current interviews, and
              review your history
            </p>
          </div>

          <div className="w-full">
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                router.push(`/freelancer/interview/${val}`)
              }
              className="w-full"
            >
              {/* Enhanced Tab List */}
              <div className="bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 p-2 mb-6 shadow-sm">
                <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2 h-auto p-0">
                  <TabsTrigger
                    value="profile"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-950/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm transition-all"
                  >
                    <Users2 className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="current"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all"
                  >
                    <ListVideo className="h-5 w-5" />
                    <span className="font-medium">Current</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="bids"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-violet-50 dark:data-[state=active]:bg-violet-950/30 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 data-[state=active]:shadow-sm transition-all"
                  >
                    <Briefcase className="h-5 w-5" />
                    <span className="font-medium">Bids</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-950/30 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all"
                  >
                    <History className="h-5 w-5" />
                    <span className="font-medium">History</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents */}
              <TabsContent value="profile" className="mt-0">
                <div className="bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <ProfileComponent />
                </div>
              </TabsContent>
              <TabsContent value="current" className="mt-0">
                <div className="bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <CurrentComponent />
                </div>
              </TabsContent>
              <TabsContent value="bids" className="mt-0">
                <div className="bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <BidsComponent />
                </div>
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <div className="bg-white dark:bg-[#0a0a0b] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <HistoryComponent />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
