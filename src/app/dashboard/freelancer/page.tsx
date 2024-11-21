'use client';
import { CheckCircle, ChevronRight, Clock, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Joyride, { Step } from 'react-joyride';

import { Search } from '@/components/search';
import Breadcrumb from '@/components/shared/breadcrumbList';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
import { axiosInstance } from '@/lib/axiosinstance';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import ProjectTableCard from '@/components/freelancer/homeTableComponent';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import MeetingDialog from '@/components/ui/meetingDialog'; // Import MeetingDialog

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: string;
  team?: string[];
}

const onboardingSteps: Step[] = [
  {
    target: '.Dashboard', // Target search bar
    content: 'It is your main dashboard, Here you can see your activities.',
    placement: 'right',
  },
  {
    target: '.earning', // Target search bar
    content: 'Here you can see your Total earning.',
    placement: 'bottom',
  },
  {
    target: '.active-project', // Target search bar
    content: 'Here you can see your active project stats.',
    placement: 'bottom',
  },
  {
    target: '.pending-project', // Target search bar
    content: 'Here you can see your pending project stats.',
    placement: 'bottom',
  },
  {
    target: '.Dropdown', // Target search bar
    content: 'Here you can log-out your profile and go to support.',
    placement: 'bottom',
  },
  {
    target: '.Market', // Target the "Active Projects" card
    content: 'This is your market place, Where you can see job posting.',
    placement: 'right',
  },
  {
    target: '.Projects', // Target the "Create Meet" button
    content: 'Here you can see your active, pending, compeleted and rejected projects.',
    placement: 'right',
  },
  {
    target: '.Analytics', // Target the "Create Meet" button
    content: 'Here you can analyse your overall performace.',
    placement: 'right',
  },
  {
    target: '.Interviews', // Target the "Create Meet" button
    content: 'Here you can manage and track your skills and domains.',
    placement: 'right',
  },
  {
    target: '.ScheduleInterviews', // Target the "Create Meet" button
    content: 'Here you can add your relevant skills and domains to help us schedule the right interview for you.',
    placement: 'right',
  },
  {
    target: '.Oracle', // Target the "Create Meet" button
    content: 'Here you can verify others skills, experience, education and business.',
    placement: 'right',
  },
  {
    target: '.Talent', // Target the "Create Meet" button
    content: 'Here you can add your skills and domains to get hire directly from Dehix Talent.',
    placement: 'right',
  },
  {
    target: '.Settings', // Target the "Create Meet" button
    content: 'Here you can manage your profile.',
    placement: 'top',
  },
];

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [runOnboarding, setRunOnboarding] = useState(false); // Onboarding state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/freelancer/${user.uid}/project`,
        );
        setProjects(response.data.data);
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Check if the user has already completed the onboarding
    const hasCompletedOnboarding = localStorage.getItem('completedOnboarding');
    if (!hasCompletedOnboarding) {
      setRunOnboarding(true); // Start the onboarding tour
    }
  }, [user.uid]);

  const handleOnboardingComplete = (data: any) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('completedOnboarding', 'true');
      setRunOnboarding(false); // End the onboarding
    }
  };

  const handleCreateMeetClick = () => {
    setShowMeetingDialog(true); // Open meeting dialog
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center py-6 gap-4 border-b bg-background px-4 sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dashboard"
          />
          <Breadcrumb items={[{ label: 'Dashboard', link: '#' }]} />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {/* Project Status Cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="sm:col-span-2 flex flex-col h-full earning">
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-3">
                    {loading ? <Skeleton className="h-10 w-20" /> : '0'}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="grid gap-4 grid-cols-4">
                  <div className="col-span-3">
                    <CardTitle>Total Earnings</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                      {loading ? (
                        <Skeleton className="h-5 w-40" />
                      ) : (
                        'Your total earnings from projects.'
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-end justify-end">
                    <ChevronRight className="h-12 w-12 text-muted-foreground" />
                  </div>
                </CardFooter>
              </Card>
              <div className="active-project">
                <StatCard
                  title="Active Projects"
                  value={
                    loading
                      ? '...'
                      : projects.filter((p) => p.status === 'Active').length
                  }
                  icon={<CheckCircle className="h-6 w-6 text-success" />}
                  additionalInfo={
                    loading ? 'Loading...' : 'Earning stats will be here'
                  }
                />
              </div>
              <div className="pending-project">
                <StatCard
                  title="Pending Projects"
                  value={
                    loading
                      ? '...'
                      : projects.filter((p) => p.status === 'Pending').length
                  }
                  icon={<Clock className="h-6 w-6 text-warning" />}
                  additionalInfo={
                    loading ? 'Loading...' : 'Project stats will be here'
                  }
                />
              </div>
            </div>

            {/* Tabs for project filtering */}
            <div className="overflow-x-auto">
              <Tabs defaultValue="active">
                <div className="flex items-center">
                  <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="active">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Active')}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="pending">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Pending')}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="completed">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Completed')}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="rejected">
                  <ProjectTableCard
                    projects={projects.filter((p) => p.status === 'Rejected')}
                    loading={loading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Create Meet Section */}
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <div className="text-center py-10">
              <CalendarX2 className="mx-auto mb-2 text-gray-500" size="100" />
              <p className="text-gray-500">No interviews scheduled</p>
              <Button
                className="mt-3 create-meet-btn"
                onClick={handleCreateMeetClick}
                disabled
              >
                Create Meet
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* MeetingDialog Modal */}
      <MeetingDialog
        isOpen={showMeetingDialog}
        onClose={() => setShowMeetingDialog(false)}
      />

      {/* Joyride Onboarding Tour */}
      <Joyride
        steps={onboardingSteps}
        run={runOnboarding}
        continuous
        showSkipButton
        callback={handleOnboardingComplete}
        spotlightClicks={true}
        styles={{
          options: {
            arrowColor: '#5d615e',
            backgroundColor: '#141414',
            overlayColor: 'rgba(0, 0, 0, 0.9)', // Adjust opacity here
            primaryColor: '#000',
            textColor: '#fafcfb',
            zIndex: 1000,
          },
        }}
      />
    </div>
  );
}
