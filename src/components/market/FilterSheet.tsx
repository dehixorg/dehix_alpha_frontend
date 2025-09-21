'use client';

import {
  Search,
  Sliders,
  DollarSign,
  Globe,
  FolderGit2,
  Bookmark,
  Award,
  X,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [projectDomainSearchQuery, setProjectDomainSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  const handleFilterChange = (updates: Partial<FilterState>) => {
    onFilterChange(updates);
  };

  const clearSearch = (type: 'skills' | 'domains' | 'projectDomains') => {
    switch (type) {
      case 'skills':
        setSearchQuery('');
        break;
      case 'domains':
        setDomainSearchQuery('');
        break;
      case 'projectDomains':
        setProjectDomainSearchQuery('');
        break;
    }
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
      <SheetContent
        side="right"
        className="w-[350px] sm:w-[400px] p-0 flex flex-col"
      >
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <SheetHeader className="text-left">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription className="sr-only">
                Filter and sort projects by various criteria
              </SheetDescription>
            </SheetHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1 text-red-500 hover:text-red-500/80 transition-colors bg-red-500/10 hover:bg-red-500/20"
            >
              Clear all
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}{' '}
            applied
          </p>
        </div>
        <ScrollArea className="flex-1 px-4 py-2">
          <Accordion
            type="multiple"
            defaultValue={[
              'project-type',
              'domains',
              'project-domains',
              'skills',
              'budget',
              'other',
            ]}
            className="space-y-4 pb-2"
          >
            <AccordionItem
              value="domains"
              className="border bg-muted/20 p-4 rounded-lg"
            >
              <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Domains</span>
                  {filters.domain.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                      {filters.domain.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="py-2">
                <div className="space-y-3">
                  <SearchInput
                    placeholder="Search domains..."
                    value={domainSearchQuery}
                    onChange={setDomainSearchQuery}
                    onClear={() => clearSearch('domains')}
                  />
                  <div className="h-60 overflow-hidden">
                    <ScrollArea className="h-full w-full pr-2">
                      <div className="space-y-1 py-1">
                        {domains
                          .filter((domain) =>
                            domain
                              .toLowerCase()
                              .includes(domainSearchQuery.toLowerCase()),
                          )
                          .map((domain) => (
                            <div
                              key={domain}
                              className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1.5 transition-colors group"
                            >
                              <Checkbox
                                id={`domain-${domain}`}
                                checked={filters.domain.includes(domain)}
                                onCheckedChange={(checked) => {
                                  handleFilterChange({
                                    domain: checked
                                      ? [...filters.domain, domain]
                                      : filters.domain.filter(
                                          (d) => d !== domain,
                                        ),
                                  });
                                }}
                                className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`domain-${domain}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                              >
                                {domain}
                              </label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="project-domains"
              className="border bg-muted/20 p-4 rounded-lg"
            >
              <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Project Domains</span>
                  {filters.projectDomain.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                      {filters.projectDomain.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="py-2">
                <div className="space-y-3">
                  <SearchInput
                    placeholder="Search project domains..."
                    value={projectDomainSearchQuery}
                    onChange={setProjectDomainSearchQuery}
                    onClear={() => clearSearch('projectDomains')}
                  />
                  <div className="h-60 overflow-hidden">
                    <ScrollArea className="h-full w-full pr-2">
                      <div className="space-y-1 py-1">
                        {projectDomains
                          .filter((domain) =>
                            domain
                              .toLowerCase()
                              .includes(projectDomainSearchQuery.toLowerCase()),
                          )
                          .map((domain) => (
                            <div
                              key={domain}
                              className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1.5 transition-colors group"
                            >
                              <Checkbox
                                id={`project-domain-${domain}`}
                                checked={filters.projectDomain.includes(domain)}
                                onCheckedChange={(checked) => {
                                  handleFilterChange({
                                    projectDomain: checked
                                      ? [...filters.projectDomain, domain]
                                      : filters.projectDomain.filter(
                                          (d) => d !== domain,
                                        ),
                                  });
                                }}
                                className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`project-domain-${domain}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                              >
                                {domain}
                              </label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="skills"
              className="border bg-muted/20 p-4 rounded-lg"
            >
              <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Skills</span>
                  {filters.skills.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                      {filters.skills.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="py-2">
                <div className="space-y-3">
                  <SearchInput
                    placeholder="Search skills..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => clearSearch('skills')}
                  />
                  <div className="h-60 overflow-hidden">
                    <ScrollArea className="h-full w-full pr-2">
                      <div className="space-y-1 py-1">
                        {skills
                          .filter((skill) =>
                            skill
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                          )
                          .slice(0, 50)
                          .map((skill) => (
                            <div
                              key={skill}
                              className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1.5 transition-colors group"
                            >
                              <Checkbox
                                id={`skill-${skill}`}
                                checked={filters.skills.includes(skill)}
                                onCheckedChange={(checked) => {
                                  handleFilterChange({
                                    skills: checked
                                      ? [...filters.skills, skill]
                                      : filters.skills.filter(
                                          (s) => s !== skill,
                                        ),
                                  });
                                }}
                                className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`skill-${skill}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                              >
                                {skill}
                              </label>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="budget"
              className="border bg-muted/20 p-4 rounded-lg"
            >
              <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Budget Range</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="py-2">
                <div className="space-y-4 pl-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="min-rate"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Min ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="min-rate"
                          placeholder="0"
                          type="number"
                          className="pl-8 h-9"
                          value={filters.minRate}
                          onChange={(e) =>
                            handleFilterChange({ minRate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="max-rate"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Max ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="max-rate"
                          placeholder="1000"
                          type="number"
                          className="pl-8 h-9"
                          value={filters.maxRate}
                          onChange={(e) =>
                            handleFilterChange({ maxRate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="other"
              className="border bg-muted/20 p-4 rounded-lg"
            >
              <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Other Options</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="py-2">
                <div className="space-y-3 pl-1">
                  <div className="flex items-center space-x-2 group">
                    <Checkbox
                      id="favourites"
                      checked={filters.favourites}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ favourites: Boolean(checked) })
                      }
                      className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="favourites"
                      className="text-sm font-medium leading-none cursor-pointer flex items-center group-hover:text-primary transition-colors"
                    >
                      <Bookmark className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      Drafts only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <Checkbox
                      id="consultant"
                      checked={filters.consultant}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ consultant: Boolean(checked) })
                      }
                      className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="consultant"
                      className="text-sm font-medium leading-none cursor-pointer flex items-center group-hover:text-primary transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      Available for consultation
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
