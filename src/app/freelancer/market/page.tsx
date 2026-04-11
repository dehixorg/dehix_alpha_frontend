'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectMarketTab from '@/components/market/ProjectMarketTab';
import TalentMarketTab from '@/components/market/TalentMarketTab';
import FreelancerAppLayout from '@/components/layout/FreelancerAppLayout';
import { useMarketTour } from '@/components/tour/freelancer/useMarketTour';

const Market: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'projects' || tabParam === 'talent'
      ? tabParam
      : 'projects';
  });
  useMarketTour();

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

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<unknown>;

      if (
        customEvent.detail === 'projects' ||
        customEvent.detail === 'talent'
      ) {
        setActiveTab(customEvent.detail);
      }
    };

    const root = document.querySelector('[data-tour="market-root"]');
    root?.addEventListener('market:switch-tab', handler);

    return () => {
      root?.removeEventListener('market:switch-tab', handler);
    };
  }, []);

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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-tour="market-root"
        data-market-active={activeTab}
      >
        <TabsList className="mb-4" data-tour="market-tabs">
          <TabsTrigger value="projects">Project Market</TabsTrigger>
          <TabsTrigger value="talent">Talent Market</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <div data-tour="market-projects-root">
            <ProjectMarketTab />
          </div>
        </TabsContent>
        <TabsContent value="talent">
          <div data-tour="market-talent-root">
            <TalentMarketTab />
          </div>
        </TabsContent>
      </Tabs>
    </FreelancerAppLayout>
  );
};

export default Market;
