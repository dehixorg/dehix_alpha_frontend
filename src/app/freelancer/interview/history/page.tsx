'use client';
import { useState } from 'react';
import { ListFilter } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';
import { Button } from '@/components/ui/button';
import HistoryInterviews from '@/components/freelancer/HistoryProject/HistoryInterviews';

export default function HistoryPage() {
  const [filter, setFilter] = useState('All');
  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="History"
      />
      <div className="flex flex-col sm:gap-4 mb-8 sm:py-0 sm:pl-14 w-full">
        {/* <Header
          breadcrumbItems={breadcrumbItems}
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="History"
        /> */}
        <div className="ml-10">
          <h1 className="text-3xl font-bold">History Interviews</h1>
          <p className="text-gray-400 mt-2">
            Review your past interviews and reflect on your progress and
            experiences.
          </p>
        </div>
        <div className="flex flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8 lg:flex-col xl:flex-col pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8">
          <div className="flex justify-between items-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
                >
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
          </div>
          <div className="w-full">
            <HistoryInterviews />
          </div>
        </div>
      </div>
    </div>
  );
}
