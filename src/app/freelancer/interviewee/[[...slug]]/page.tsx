'use client';
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Briefcase, History, ListVideo } from 'lucide-react';
import { useSelector } from 'react-redux';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CurrentComponent from '@/components/freelancer/interview/Current';
import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import CompletedInterviews from '@/components/freelancer/interview/CompletedInterviews';
import Bids from '@/components/freelancer/interview/Bids';
import { RootState } from '@/lib/store';

export default function IntervieweePage() {
  const params = useParams();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  // slug will be [] or ["current"], ["bids"], ["history"]
  const slug = Array.isArray(params?.slug) ? params.slug : [];
  const activeTab = slug[0] || 'current';

  useEffect(() => {
    if (slug.length === 0) {
      router.replace('/freelancer/interviewee/current');
    }
  }, [slug, router]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Schedule Interviews"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Schedule Interviews"
          breadcrumbItems={[
            { label: 'Interviewee', link: '/freelancer/interviewee/current' },
          ]}
        />
        <main className="flex-1 px-4 sm:px-6 sm:py-2">
          <div className="mx-auto w-full max-w-7xl">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Interviewee
                </CardTitle>
                <CardDescription>
                  Track your current interviews, bids, and history.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={(val) =>
                    router.push(`/freelancer/interviewee/${val}`)
                  }
                  className="w-full"
                >
                  <div className="border-b px-2 sm:px-6">
                    <TabsList className="bg-transparent h-12 w-full md:w-auto p-0">
                      <TabsTrigger
                        value="current"
                        className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <ListVideo className="h-4 w-4" />
                        <span>Current</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="bids"
                        className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Bids</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        <History className="h-4 w-4" />
                        <span>History</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div>
                    <TabsContent value="current" className="m-0">
                      <CurrentComponent
                        apiRole="interviewee"
                        hideIds
                        showTodaySummary
                        enableViewToggle
                      />
                    </TabsContent>
                    <TabsContent value="bids" className="m-0 p-0">
                      <Bids userId={user.uid} />
                    </TabsContent>
                    <TabsContent value="history" className="m-0">
                      <CompletedInterviews
                        apiRole="interviewee"
                        enableViewToggle
                        hideIds
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
