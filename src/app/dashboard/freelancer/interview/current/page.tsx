'use client';
import React, { useState } from 'react';
import { MessageSquare, ListFilter } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import dummyData from '@/dummydata.json';

// Convert interviewDate strings to Date objects
const sampleInterviews = dummyData.dashboardfreelancercurrentInterview.map(
  (interview) => ({
    ...interview,
    interviewDate: new Date(interview.interviewDate),
  }),
);

export default function CurrentPage() {
  const [filter, setFilter] = useState('All');

  const filteredInterviews = sampleInterviews.filter((interview) => {
    if (interview.status === 'Complete') return false;
    if (filter === 'All') return true;
    if (filter === 'Skills' && interview.skill) return true;
    if (filter === 'Domain' && interview.domain) return true;
    return false;
  });

  return (
    <div className="mt-5">
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
  );
}
