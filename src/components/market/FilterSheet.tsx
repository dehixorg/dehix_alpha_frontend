'use client';
import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import FilterComponent from '@/components/marketComponents/FilterComponent';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterSheetProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  handleReset: () => void;
  activeFilterCount: number;
  skills: string[];
  domains: string[];
  projectDomains: string[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  domainSearchQuery: string;
  setDomainSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  projectDomainSearchQuery: string;
  setProjectDomainSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function FilterSheet({
  filters,
  setFilters,
  handleReset,
  activeFilterCount,
  skills,
  domains,
  projectDomains,
  searchQuery,
  setSearchQuery,
  domainSearchQuery,
  setDomainSearchQuery,
  projectDomainSearchQuery,
  setProjectDomainSearchQuery,
}: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleResetAndClose = () => {
    handleReset();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <ScrollArea className="flex-1">
          <FilterComponent
            filters={filters}
            setFilters={setFilters}
            handleReset={handleReset}
            activeFilterCount={activeFilterCount}
            skills={skills}
            domains={domains}
            projectDomains={projectDomains}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            domainSearchQuery={domainSearchQuery}
            setDomainSearchQuery={setDomainSearchQuery}
            projectDomainSearchQuery={projectDomainSearchQuery}
            setProjectDomainSearchQuery={setProjectDomainSearchQuery}
          />
        </ScrollArea>
        <div className="sticky bottom-0 border-t bg-background p-3 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleResetAndClose}
            aria-label="Reset all filters"
          >
            Reset
          </Button>
          <Button
            className="flex-1"
            onClick={() => setIsOpen(false)}
            aria-label="Apply filters"
          >
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
