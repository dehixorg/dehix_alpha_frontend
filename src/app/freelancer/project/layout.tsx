'use client';
import {
  HomeIcon,
  FileCheck,
  Pointer,
  FolderDot,
  CircleX,
  Settings,
} from 'lucide-react';
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom as freelancerMenuItemsBottom,
  menuItemsTop as freelancerMenuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Header from '@/components/header/header';
interface ProjectLayoutProps {
  children: ReactNode;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const activeTab = pathname.includes('/freelancer/project/applied')
    ? 'applied'
    : pathname.includes('/freelancer/project/completed')
    ? 'completed'
    : pathname.includes('/freelancer/project/rejected')
    ? 'Rejected'
    : 'Current';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-10 bg-background border-r">
        <SidebarMenu
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          active="profile"
        />
      </div>
      <div className="flex mb-8 flex-col sm:pl-14 w-full">
        <Header
          menuItemsTop={freelancerMenuItemsTop}
          menuItemsBottom={freelancerMenuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'project', link: '#' },
            { label: 'projectDashboard', link: '#' },
          ]}
        />
        {/* Main Content */}
        <div className="flex-1">
          <header className="border-b">
            <div className="w-full flex-1 h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Project</h1>
              </div>
              <div className="flex items-center gap-4"></div>
            </div>
          </header>

          <div className="w-full px-4 py-4">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="Current"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/project/current">
                    <FolderDot className="h-4 w-4" />
                    <span>Current Projects</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="applied"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/project/applied">
                    <Pointer className="h-4 w-4" />
                    <span>Applied</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/project/completed">
                    <FileCheck className="h-4 w-4" />
                    <span>Completed</span>
                  </a>
                </TabsTrigger>
                <TabsTrigger
                  value="Rejected"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="/freelancer/project/rejected">
                    <CircleX className="h-4 w-4" />
                    <span>Rejected</span>
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

export default ProjectLayout;
