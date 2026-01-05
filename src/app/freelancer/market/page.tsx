'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectMarketTab from '@/components/market/ProjectMarketTab';
import TalentMarketTab from '@/components/market/TalentMarketTab';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';

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
    <FreelancerAppLayout
      active="Market"
      activeMenu="Market"
      breadcrumbItems={[
        { label: 'Dashboard', link: '/dashboard/freelancer' },
        { label: 'Market', link: '#' },
      ]}
      mainClassName="p-4 sm:px-8"
    >
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
    </FreelancerAppLayout>
  );
};

export default Market;
