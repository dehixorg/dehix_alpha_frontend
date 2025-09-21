'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Layers, Search, Sliders, Tag, DollarSign, Bookmark, Briefcase } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  jobType: string[];
  domain: string[];
  skills: string[];
  projectDomain: string[];
  minRate: string;
  maxRate: string;
  favourites: boolean;
  consultant: boolean;
}

interface FilterSheetProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  activeFilterCount: number;
  skills: string[];
  domains: string[];
  projectDomains: string[];
  onReset: () => void;
}

const FilterSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="space-y-4 mb-6">
    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </div>
    <div className="pl-6">{children}</div>
  </div>
);

export function FilterSheet({
  filters,
  onFilterChange,
  activeFilterCount,
  skills,
  domains,
  projectDomains,
  onReset,
}: FilterSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (updates: Partial<FilterState>) => {
    onFilterChange(updates);
  };

  return (
    <Sheet>
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
      <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0 overflow-y-auto">
        <div className="h-full flex flex-col">
          <div className="sticky top-0 z-10 bg-background border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Reset all
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <FilterSection title="Project Type" icon={Layers}>
                <div className="space-y-2">
                  {['Fixed Price', 'Hourly', 'Milestone'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.jobType.includes(type)}
                        onCheckedChange={(checked) => {
                          handleFilterChange({
                            jobType: checked
                              ? [...filters.jobType, type]
                              : filters.jobType.filter((t) => t !== type),
                          });
                        }}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm font-medium leading-none cursor-pointer">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Domains" icon={Layers}>
                <ScrollArea className="h-60 py-1 -mx-1">
                  <div className="space-y-2 pr-2">
                    {domains.map((domain) => (
                      <div key={domain} className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1">
                        <Checkbox
                          id={`domain-${domain}`}
                          checked={filters.domain.includes(domain)}
                          onCheckedChange={(checked) => {
                            handleFilterChange({
                              domain: checked
                                ? [...filters.domain, domain]
                                : filters.domain.filter((d) => d !== domain),
                            });
                          }}
                        />
                        <label htmlFor={`domain-${domain}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                          {domain}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </FilterSection>

              <FilterSection title="Project Domains" icon={Layers}>
                <ScrollArea className="h-60 py-1 -mx-1">
                  <div className="space-y-2 pr-2">
                    {projectDomains.map((domain) => (
                      <div key={domain} className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1">
                        <Checkbox
                          id={`project-domain-${domain}`}
                          checked={filters.projectDomain.includes(domain)}
                          onCheckedChange={(checked) => {
                            handleFilterChange({
                              projectDomain: checked
                                ? [...filters.projectDomain, domain]
                                : filters.projectDomain.filter((d) => d !== domain),
                            });
                          }}
                        />
                        <label htmlFor={`project-domain-${domain}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                          {domain}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </FilterSection>

              <FilterSection title="Skills" icon={Tag}>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search skills..."
                      className="pl-8 h-9 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-60 py-1 -mx-1">
                    <div className="space-y-2 pr-2">
                      {skills
                        .filter((skill) =>
                          skill.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((skill) => (
                          <div key={skill} className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1">
                            <Checkbox
                              id={`skill-${skill}`}
                              checked={filters.skills.includes(skill)}
                              onCheckedChange={(checked) => {
                                handleFilterChange({
                                  skills: checked
                                    ? [...filters.skills, skill]
                                    : filters.skills.filter((s) => s !== skill),
                                });
                              }}
                            />
                            <label htmlFor={`skill-${skill}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                              {skill}
                            </label>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </FilterSection>

              <FilterSection title="Budget Range" icon={DollarSign}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="min-rate" className="text-xs text-muted-foreground">
                        Min ($)
                      </label>
                      <Input
                        id="min-rate"
                        placeholder="Min"
                        type="number"
                        value={filters.minRate}
                        onChange={(e) =>
                          handleFilterChange({ minRate: e.target.value })
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="max-rate" className="text-xs text-muted-foreground">
                        Max ($)
                      </label>
                      <Input
                        id="max-rate"
                        placeholder="Max"
                        type="number"
                        value={filters.maxRate}
                        onChange={(e) =>
                          handleFilterChange({ maxRate: e.target.value })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Other Options" icon={Sliders}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favourites"
                      checked={filters.favourites}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ favourites: !!checked })
                      }
                    />
                    <label
                      htmlFor="favourites"
                      className="text-sm font-medium leading-none cursor-pointer flex items-center"
                    >
                      <Bookmark className="h-4 w-4 mr-2 text-red-500 fill-red-500/20" />
                      Saved Projects
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consultant"
                      checked={filters.consultant}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ consultant: !!checked })
                      }
                    />
                    <label
                      htmlFor="consultant"
                      className="text-sm font-medium leading-none cursor-pointer flex items-center"
                    >
                      <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                      Consultant Roles
                    </label>
                  </div>
                </div>
              </FilterSection>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
