'use client';
import { useState } from 'react';
import { BookOpen, Briefcase, User, Package } from 'lucide-react';

import BusinessVerification from '../../../components/freelancer/oracleDashboard/BusinessVerification';
import EducationVerification from '../../../components/freelancer/oracleDashboard/EducationVerification';
import ProjectVerification from '../../../components/freelancer/oracleDashboard/ProjectVerification';
import WorkExpVerification from '../../../components/freelancer/oracleDashboard/WorkExpVerification';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

export default function OracleDashboardPage() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <div className="bg-background border-r">
        <SidebarMenu
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          active="Oracle"
        />
      </div>
      <div className="flex mb-8 flex-col md:pl-0 sm:pl-14 w-full">
        {/* Main Content */}
        <div className="flex-1">
          <div className="w-full flex-1 items-start px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <div className="flex min-h-screen w-full">
                  <div className="flex flex-col mb-8 sm:gap-4 sm:py-0 sm:pl-14 w-full">
                    <Tabs
                      defaultValue={activeTab}
                      onValueChange={setActiveTab}
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
          </div>
        </div>
      </div>
    </div>
  );
}
