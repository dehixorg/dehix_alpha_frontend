'use client';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Header from '@/components/header/header';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectMarketTab from '@/components/market/ProjectMarketTab';
import TalentMarketTab from '@/components/market/TalentMarketTab';

const Market: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'projects' || tabParam === 'talent'
      ? tabParam
      : 'projects';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTab =
      tabParam === 'projects' || tabParam === 'talent' ? tabParam : 'projects';
    setActiveTab(validTab);
  }, [searchParams]);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab !== activeTab) {
      router.replace(`/freelancer/market?tab=${activeTab}`);
    }
  }, [activeTab, router, searchParams]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:pb-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Market"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'Market', link: '#' },
          ]}
        />
        <div className="p-4 sm:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="projects">Project Market</TabsTrigger>
              <TabsTrigger value="talent">Talent Market</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <ProjectMarketTab />
            </TabsContent>
            <TabsContent value="talent">
              <TalentMarketTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Market;
