'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, ListFilter, Search, UserIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RootState } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/breadcrumbList';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import dummyData from '@/dummydata.json';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/interviewMenuItems';

// Convert interviewDate strings to Date objects
const sampleInterviews = dummyData.dashboardfreelancercurrentInterview.map(
  (interview) => ({
    ...interview,
    interviewDate: new Date(interview.interviewDate),
  }),
);

export default function CurrentPage() {
  const [filter, setFilter] = useState('All');
  const user = useSelector((state: RootState) => state.user);

  const filteredInterviews = sampleInterviews.filter((interview) => {
    if (interview.status === 'Complete') return false;
    if (filter === 'All') return true;
    if (filter === 'Skills' && interview.skill) return true;
    if (filter === 'Domain' && interview.domain) return true;
    return false;
  });

  return (
    <div className="flex min-h-screen w-full">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Profile"
      />
      <div className="flex flex-col sm:py-2 sm:pl-14 w-full">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-2 sm:static sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-4">
            <CollapsibleSidebarMenu menuItems={menuItemsTop} active="Current" />
            <Breadcrumb
              items={[
                { label: 'Freelancer', link: '/dashboard/freelancer' },
                {
                  label: 'Interview',
                  link: '/dashboard/freelancer/interview/profile',
                },
                { label: 'Current Interview', link: '#' },
              ]}
            />
          </div>
          <div className="relative flex items-center gap-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[336px]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user.png" alt="@shadcn" />
                    <AvatarFallback>
                      <UserIcon size={16} />{' '}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredInterviews.map((interview, index) => (
              <Card key={index} className="max-w-full mx-auto md:max-w-lg">
                <CardHeader>
                  <CardTitle className="flex text-2xl">
                    {interview.reference}
                  </CardTitle>
                  <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-gray-700 text-sm">
                    {interview.skill || interview.domain}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge
                    className={`bg-${interview.status === 'Pending' ? 'warning' : 'success'} hover:bg-${interview.status === 'Pending' ? 'warning' : 'success'} text-xs`}
                  >
                    {interview.status.toUpperCase()}
                  </Badge>
                  <p className="text-gray-300 pt-4 text-sm">
                    {interview.description}
                  </p>

                  <p className="mt-4 flex text-gray-500 border p-3 rounded text-sm">
                    <MessageSquare className="pr-1 mr-1 h-5 w-5" />
                    {interview.comments}
                  </p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Reference: {interview.reference}
                    </p>
                    <p className="text-sm text-gray-600">
                      Contact: {interview.contact}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex">
                  <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
                    {interview.interviewDate.toLocaleDateString()}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
          </div>
        </div>
      </div>
      );
}
