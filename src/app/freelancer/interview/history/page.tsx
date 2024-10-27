'use client';
import { useState } from 'react';
import { ListFilter, PackageOpen } from 'lucide-react';

import { Search } from '@/components/search';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import Header from '@/components/header/header';

export default function HistoryPage() {
  const [filter, setFilter] = useState('All');

  // const filteredInterviews = sampleInterviews.filter((interview) => {
  //   if (filter === 'All') return interview.status === 'Completed';
  //   if (filter === 'Skills' && interview.skill)
  //     return interview.status === 'Completed';
  //   if (filter === 'Domain' && interview.domain)
  //     return interview.status === 'Completed';
  //   return false;
  // });

  const breadcrumbItems = [
    { label: 'Freelancer', link: '/dashboard/freelancer' },
    {
      label: 'Interview',
      link: '/freelancer/interview/profile',
    },
    { label: 'History Interviews', link: '#' },
  ];

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="History"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 w-full">
        <Header
          breadcrumbItems={breadcrumbItems}
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="History"
        />
        <div className="ml-10">
          <h1 className="text-3xl font-bold">History Interviews</h1>
          <p className="text-gray-400 mt-2">
            Review your past interviews and reflect on your progress and
            experiences.
          </p>
        </div>
        <div className="flex flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 lg:flex-col xl:flex-col pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filter === 'All'}
                onSelect={() => setFilter('All')}
              >
                All
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={filter === 'Skills'}
                onSelect={() => setFilter('Skills')}
              >
                Skills
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filter === 'Domain'}
                onSelect={() => setFilter('Domain')}
              >
                Domain
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-center py-10 w-[90vw] mt-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">No Inverview Scheduled for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
