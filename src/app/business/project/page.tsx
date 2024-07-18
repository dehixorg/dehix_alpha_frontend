'use client';
import {
  Boxes,
  Home,
  LineChart,
  Package,
  Search,
  Settings,
  Users2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import Breadcrumb from '@/components/shared/breadcrumbList';
import { CardTitle } from '@/components/ui/card';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/lib/store';
import InterviewCard from '@/components/shared/interviewCard';
import ProjectDetailCard from '@/components/business/project/projectDetailCard';
import { ProjectProfileDetailCard } from '@/components/business/project/projectProfileDetailCard';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import dummyData from '@/dummydata.json';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const menuItemsTop: MenuItem[] = [
    {
      href: '#',
      icon: <Boxes className="h-4 w-4 transition-all group-hover:scale-110" />,
      label: 'Dehix',
    },
    {
      href: '#',
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
    },
    {
      href: '#',
      icon: <Package className="h-5 w-5" />,
      label: 'Projects',
    },
    {
      href: '#',
      icon: <Users2 className="h-5 w-5" />,
      label: 'Customers',
    },
    {
      href: '#',
      icon: <LineChart className="h-5 w-5" />,
      label: 'Analytics',
    },
  ];

  const menuItemsBottom: MenuItem[] = [
    {
      href: '/settings/personal-info',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
    },
  ];
  console.log(user);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* side bar need to make caomponent */}
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Projects"
          />

          {/* bredcrumbs need to make compont  */}

          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'Project', link: '/dashboard/business' },
              { label: '#project_id', link: '#' },
            ]}
          />

          {/* search need to remove without changing the layout */}
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>

          {/* profile dropdown need to create separeant component */}
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="">
              <ProjectDetailCard />
            </div>
            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Profiles
            </h2>
            <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8">
              <ProjectProfileDetailCard className="min-w-[55%] " />
              <ProjectProfileDetailCard className="min-w-[55%] " />
            </div>
          </div>

          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>
            <InterviewCard
              interviewer={dummyData.freelancersampleInterview.interviewer}
              interviewee={dummyData.freelancersampleInterview.interviewee}
              skill={dummyData.freelancersampleInterview.skill}
              interviewDate={
                new Date(dummyData.freelancersampleInterview.interviewDate)
              }
              rating={dummyData.freelancersampleInterview.rating}
              comments={dummyData.freelancersampleInterview.comments}
            />
            <InterviewCard
              interviewer={dummyData.freelancersampleInterview.interviewer}
              interviewee={dummyData.freelancersampleInterview.interviewee}
              skill={dummyData.freelancersampleInterview.skill}
              interviewDate={
                new Date(dummyData.freelancersampleInterview.interviewDate)
              }
              rating={dummyData.freelancersampleInterview.rating}
              comments={dummyData.freelancersampleInterview.comments}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
