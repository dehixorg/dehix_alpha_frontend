'use client';
import type React from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Award,
  DollarSign,
  Globe,
  X,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export interface BusinessFilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  experience: string[];
  minRate: string;
  maxRate: string;
}

interface BusinessFilterComponentProps {
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

const SearchInput = ({
  placeholder,
  value,
  onChange,
  onClear,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-8 h-9 text-sm pr-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-8 w-8"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Helper function to create unique DOM IDs
const toDomId = (prefix: string, value: string): string => {
  return `${prefix}-${value.replace(/\s+/g, '-').toLowerCase()}`;
};

export function BusinessFilterComponent({
  filters,
  onFilterChange,
  activeFilterCount,
  skills,
  domains,
  experiences,
  jobTypes,
  locations,
  onReset,
}: BusinessFilterComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [domainSearchQuery, setDomainSearchQuery] = useState('');

  const clearSearch = (type: 'skills' | 'domains') => {
    switch (type) {
      case 'skills':
        setSearchQuery('');
        break;
      case 'domains':
        setDomainSearchQuery('');
        break;
    }
  };

  const getFilterValues = (key: keyof BusinessFilterState): string[] => {
    const value = filters[key];
    return Array.isArray(value) ? value : [];
  };

  const renderFilterSection = (
    title: string,
    items: string[],
    filterKey: keyof BusinessFilterState,
    searchQuery: string,
    onSearchChange: (value: string) => void,
    onClear: () => void,
    icon: React.ReactNode,
    showSearch = true,
  ) => {
    const filterValues = getFilterValues(filterKey);

    return (
      <AccordionItem
        value={filterKey}
        className="border bg-muted/20 p-4 rounded-lg"
      >
        <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium">{title}</span>
            {filterValues.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                {filterValues.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="py-2">
          <div className="space-y-3">
            {showSearch && (
              <SearchInput
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={onSearchChange}
                onClear={onClear}
              />
            )}
            <div className="h-60">
              <ScrollArea className="h-full w-full pr-2">
                <div className="space-y-1 py-1">
                  {items
                    .filter((item) =>
                      item.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((item) => (
                      <div
                        key={item}
                        className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1.5 transition-colors group"
                      >
                        <Checkbox
                          id={toDomId(String(filterKey), item)}
                          checked={filterValues.includes(item)}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true;
                            const newValues = isChecked
                              ? [...filterValues, item]
                              : filterValues.filter((v) => v !== item);

                            onFilterChange({ [filterKey]: newValues } as any);
                          }}
                          className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor={toDomId(String(filterKey), item)}
                          className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="sticky bg-background border rounded-lg">
      <div className="sticky top-0 z-10 bg-background border-b p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-1 text-red-500 hover:text-red-500/80 transition-colors bg-red-500/10 hover:bg-red-500/20"
          >
            Clear all
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
        </p>
      </div>
      <ScrollArea className="flex-1 px-4 py-2">
        <Accordion
          type="multiple"
          defaultValue={[
            'skills',
            'domain',
            'experience',
            'jobType',
            'location',
          ]}
          className="space-y-4 pb-2"
        >
          {renderFilterSection(
            'Skills',
            skills,
            'skills',
            searchQuery,
            setSearchQuery,
            () => clearSearch('skills'),
            <Award className="h-4 w-4 text-muted-foreground" />,
          )}

          {renderFilterSection(
            'Domains',
            domains,
            'domain',
            domainSearchQuery,
            setDomainSearchQuery,
            () => clearSearch('domains'),
            <Globe className="h-4 w-4 text-muted-foreground" />,
          )}

          {renderFilterSection(
            'Experience',
            experiences,
            'experience',
            '',
            () => {},
            () => {},
            <UserCheck className="h-4 w-4 text-muted-foreground" />,
            false,
          )}

          {renderFilterSection(
            'Job Type',
            jobTypes,
            'jobType',
            '',
            () => {},
            () => {},
            <Briefcase className="h-4 w-4 text-muted-foreground" />,
            false,
          )}

          {renderFilterSection(
            'Location',
            locations,
            'location',
            '',
            () => {},
            () => {},
            <MapPin className="h-4 w-4 text-muted-foreground" />,
            false,
          )}

          <AccordionItem
            value="rate"
            className="border bg-muted/20 p-4 rounded-lg"
          >
            <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Rate Range</span>
                {(filters.minRate || filters.maxRate) && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    1
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="min-rate" className="text-sm font-medium">
                      Min ($/hr)
                    </label>
                    <Input
                      id="min-rate"
                      type="number"
                      placeholder="0"
                      value={filters.minRate}
                      onChange={(e) =>
                        onFilterChange({ minRate: e.target.value })
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="max-rate" className="text-sm font-medium">
                      Max ($/hr)
                    </label>
                    <Input
                      id="max-rate"
                      type="number"
                      placeholder="1000"
                      value={filters.maxRate}
                      onChange={(e) =>
                        onFilterChange({ maxRate: e.target.value })
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}

export default BusinessFilterComponent;
