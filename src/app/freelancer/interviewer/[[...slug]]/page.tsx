'use client';
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListVideo, Users2, History, Briefcase } from 'lucide-react';

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
import InterviewProfile from '@/components/freelancer/interview/interviewProfile';
import CompletedInterviews from '@/components/freelancer/interview/CompletedInterviews';
import InterviewerBids from '@/components/freelancer/interview/InterviewerBids';

export default function InterviewerPage() {
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(params?.slug) ? params.slug : [];
  const activeTab = slug[0] || 'profile';

  useEffect(() => {
    if (slug.length === 0) {
      router.replace('/freelancer/interviewer/profile');
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
            { label: 'Interviewer', link: '/freelancer/interviewer/profile' },
          ]}
        />
        <main className="flex-1 p-4 sm:px-6 sm:py-2">
          <div className="mx-auto w-full max-w-[92vw]">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Interviews
                </CardTitle>
                <CardDescription>
                  Manage your interview profile, active interviews, bids, and
                  history.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={(val) =>
                    router.push(`/freelancer/interviewer/${val}`)
                  }
                  className="w-full"
                >
                  <div className="border-b px-2 sm:px-6">
                    <div className="max-w-full overflow-x-auto no-scrollbar">
                      <TabsList className="bg-transparent h-12 w-max min-w-max md:w-auto p-0 whitespace-nowrap">
                        <TabsTrigger
                          value="profile"
                          className="relative h-12 px-4 rounded-none flex items-center justify-center gap-2 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          <Users2 className="h-4 w-4" />
                          <span>Profile</span>
                        </TabsTrigger>
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
                  </div>

                  <div className="px-4 py-4 sm:px-6">
                    <TabsContent value="profile" className="m-0">
                      <InterviewProfile />
                    </TabsContent>
                    <TabsContent value="current" className="m-0">
                      <CurrentComponent enableViewToggle />
                    </TabsContent>
                    <TabsContent value="bids" className="m-0">
                      <InterviewerBids />
                    </TabsContent>
                    <TabsContent value="history" className="m-0">
                      <CompletedInterviews enableViewToggle />
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
