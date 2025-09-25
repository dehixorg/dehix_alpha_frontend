'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Briefcase, User, Package } from 'lucide-react';

import BusinessVerification from '@/components/freelancer/oracleDashboard/BusinessVerification';
import EducationVerification from '@/components/freelancer/oracleDashboard/EducationVerification';
import ProjectVerification from '@/components/freelancer/oracleDashboard/ProjectVerification';
import WorkExpVerification from '@/components/freelancer/oracleDashboard/WorkExpVerification';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Header from '@/components/header/header';

export default function OracleDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  // Get the last segment of the URL for the active tab
  const lastSegment = pathname.split('/').pop() || '';
  const validTabs = ['business', 'experience', 'project', 'education'];
  const currentTabFromURL = validTabs.includes(lastSegment)
    ? lastSegment
    : 'business';

  const [activeTab, setActiveTab] = useState(currentTabFromURL);

  // Sync state if user navigates directly via URL
  useEffect(() => {
    if (currentTabFromURL !== activeTab) {
      setActiveTab(currentTabFromURL);
    }
  }, [currentTabFromURL, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/freelancer/oracleDashboard/${tab}`);
  };

  return (
    <div className="flex min-h-screen bg-muted/40 w-full flex-col pb-10">
      <SidebarMenu
        menuItemsTop={freelancerMenuItemsTop}
        menuItemsBottom={freelancerMenuItemsBottom}
        active="Oracle"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Oracle"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            {
              label: 'Oracle Dashboard',
              link: '/freelancer/oracleDashboard/business',
            },
          ]}
        />
        <div className="flex-1 px-4 py-6">
          <div className="mx-auto w-full max-w-7xl">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="business"
                  className="flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Business</span>
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Experience</span>
                </TabsTrigger>
                <TabsTrigger
                  value="project"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  <span>Projects</span>
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Education</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="business">
                <BusinessVerification />
              </TabsContent>
              <TabsContent value="experience">
                <WorkExpVerification />
              </TabsContent>
              <TabsContent value="project">
                <ProjectVerification />
              </TabsContent>
              <TabsContent value="education">
                <EducationVerification />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
