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
import CompletedInterviews from '@/components/freelancer/interview/CompletedInterviews';
import Bids from '@/components/freelancer/interview/Bids';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';
import { RootState } from '@/lib/store';
import { useIntervieweeTour } from '@/components/tour/freelancer/useIntervieweeTour';

export default function IntervieweePage() {
  const params = useParams();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  // slug will be [] or ["current"], ["bids"], ["history"]
  const slug = Array.isArray(params?.slug) ? params.slug : [];
  const activeTab = slug[0] || 'current';
  useIntervieweeTour(true);

  useEffect(() => {
    if (slug.length === 0) {
      router.replace('/freelancer/interviewee/current');
    }
  }, [slug, router]);

  return (
    <FreelancerAppLayout
      active="Schedule Interviews"
      activeMenu="Schedule Interviews"
      breadcrumbItems={[
        { label: 'Interviewee', link: '/freelancer/interviewee/current' },
      ]}
      mainClassName="flex-1 p-4 sm:px-6 sm:py-2"
    >
      <div className="mx-auto w-full max-w-[92vw]" data-tour="interviewee">
        <Card className="overflow-hidden">
          <CardHeader
            className="bg-gradient"
            data-tour="interviewee-header"
          >
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
                <div className="max-w-full overflow-x-auto no-scrollbar">
                  <TabsList
                    className="bg-transparent h-12 w-max min-w-max md:w-auto p-0 whitespace-nowrap"
                    data-tour="tab-list"
                  >
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
    </FreelancerAppLayout>
  );
}
