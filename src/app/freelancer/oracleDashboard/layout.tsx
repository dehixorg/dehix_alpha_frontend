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
import Header from '@/components/header/header';

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-10 bg-background border-r">
        <SidebarMenu
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          active="Business Verification"
        />
      </div>
      <div className="flex mb-8 flex-col sm:pl-14 w-full">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'oracle', link: '#' },
            { label: 'oracleDashboard', link: '#' },
          ]}
        />
        {/* Main Content */}
        <div className="flex-1">
          <header className="border-b">
            <div className="w-full flex-1 h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Oracle Verification</h1>
              </div>
              <div className="flex items-center gap-4"></div>
            </div>
          </header>

          <div className="w-full px-4 py-4">
            <Tabs defaultValue={activeTab} className="w-full">
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
              <div className="col-span-12">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleLayout;
