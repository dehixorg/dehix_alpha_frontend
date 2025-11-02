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
        <main className="flex-1 px-4 md:px-6 py-0 md:py-2">
          <div className="w-full">
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                router.push(`/freelancer/interview/${val}`)
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-5 rounded-xl border bg-white/60 dark:bg-[#0B0B0E]/60 backdrop-blur p-1 shadow-sm">
                <TabsTrigger
                  value="profile"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <Users2 className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="current"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <ListVideo className="h-4 w-4" />
                  <span>Current</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bids"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Bids</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/70 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileComponent />
              </TabsContent>
              <TabsContent value="current">
                <CurrentComponent />
              </TabsContent>
              <TabsContent value="bids">
                <BidsComponent />
              </TabsContent>
              <TabsContent value="history">
                <HistoryComponent />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
