'use client';
import { useState } from 'react';
import { ListFilter } from 'lucide-react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import HistoryInterviews from '@/components/freelancer/HistoryProject/HistoryInterviews';

export default function HistoryComponent() {
  const [filter, setFilter] = useState('All');
  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl sm:text-2xl">
            History Interviews
          </CardTitle>
          <CardDescription>
            Review your past interviews and reflect on your progress and
            experiences.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-1 flex-col items-start gap-4 md:gap-6">
        <div className="flex justify-between items-center w-full">
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
        </div>
        <div className="w-full">
          <HistoryInterviews />
        </div>
      </div>
    </>
  );
}
