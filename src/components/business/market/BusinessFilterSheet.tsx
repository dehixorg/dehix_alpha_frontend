'use client';

import { Sliders } from 'lucide-react';
import { useState } from 'react';

import BusinessFilterComponent from './BusinessFilterComponent';
import type { BusinessFilterState } from './BusinessFilterComponent';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BusinessFilterSheetProps {
  filters: BusinessFilterState;
  onFilterChange: (updates: Partial<BusinessFilterState>) => void;
  activeFilterCount: number;
  skills: string[];
  domains: string[];
  experiences: string[];
  jobTypes: string[];
  locations: string[];
  onReset: () => void;
}

export function BusinessFilterSheet({
  filters,
  onFilterChange,
  activeFilterCount,
  skills,
  domains,
  experiences,
  jobTypes,
  locations,
  onReset,
}: BusinessFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <ScrollArea className="h-full">
          <BusinessFilterComponent
            filters={filters}
            onFilterChange={onFilterChange}
            activeFilterCount={activeFilterCount}
            skills={skills}
            domains={domains}
            experiences={experiences}
            jobTypes={jobTypes}
            locations={locations}
            onReset={handleReset}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
