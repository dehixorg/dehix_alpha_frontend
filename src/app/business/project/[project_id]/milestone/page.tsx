'use client';
import React from 'react';
import { useParams } from 'next/navigation';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import MilestoneTimeline from '@/components/shared/MilestoneTimeline';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Button } from '@/components/ui/button';
import { CreateMilestoneDialog } from '@/components/shared/CreateMilestoneDialog';
import { useMilestones } from '@/hooks/useMilestones';

const Page = () => {
  const { project_id } = useParams<{ project_id: string }>();

  const { milestones, loading, handleStorySubmit, fetchMilestones, stories } =
    useMilestones();
  console.log(stories);

  const derivedStories = milestones.map((milestone) => milestone.stories || []);

  return (
    <div className="flex min-h-screen h-auto w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu=""
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/business' },
            { label: 'Project', link: '/dashboard/business' },
            { label: project_id, link: `/business/project/${project_id}` },
            { label: 'Milestone', link: '#' },
          ]}
        />
        <div className="py-8 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">
              Project Milestones
            </h1>

            <Button className="px-3 py-1 ">
              <CreateMilestoneDialog
                projectId={project_id}
                fetchMilestones={fetchMilestones}
              />
            </Button>
          </div>
          <div className="w-full flex justify-center items-center">
            {loading ? (
              <p>Loading milestones...</p>
            ) : milestones.length > 0 ? (
              <MilestoneTimeline
                milestones={milestones}
                handleStorySubmit={handleStorySubmit}
                milestoneId={milestones[0]._id}
                stories={derivedStories}
              />
            ) : (
              <div className="flex justify-center items-center h-[50vh]">
                No milestones found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
