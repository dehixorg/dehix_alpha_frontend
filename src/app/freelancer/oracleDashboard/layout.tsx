'use client';
import { BookOpen, Briefcase, User, Package } from 'lucide-react';
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';

interface OracleLayoutProps {
  children: ReactNode;
}

const OracleLayout: React.FC<OracleLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const activeTab = pathname.includes('/business')
    ? 'business'
    : pathname.includes('/workExp') || pathname.includes('/workExpVerification')
      ? 'experience'
      : pathname.includes('/project')
        ? 'project'
        : pathname.includes('/education')
          ? 'education'
          : 'business';
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
          <div className="w-full p-4">
            <Tabs defaultValue={activeTab} className="md:pl-14 pl-0 w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="business"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/oracleDashboard/businessVerification">
                    <Briefcase className="h-4 w-4" />
                    <span>Business</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/oracleDashboard/workExpVerification">
                    <User className="h-4 w-4" />
                    <span>Experience</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="project"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/oracleDashboard/projectVerification">
                    <Package className="h-4 w-4" />
                    <span>Projects</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/oracleDashboard/educationVerification">
                    <BookOpen className="h-4 w-4" />
                    <span>Education</span>
                  </a>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="w-full flex-1 items-start px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12">
                <div className="flex min-h-screen w-full">
                  <div className="flex flex-col mb-8 sm:gap-4 sm:py-0 sm:pl-14 w-full">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleLayout;
