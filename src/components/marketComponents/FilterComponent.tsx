'use client';
import React, { useEffect, useState } from 'react';
import {
  Search,
  Layers,
  DollarSign,
  Sliders,
  Bookmark,
  Globe,
  FolderGit2,
  Award,
  UserCheck,
  X,
} from 'lucide-react';

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

interface FilterState {
  projects: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  projectDomain: string[];
  sorting: string[];
  minRate: string;
  maxRate: string;
  favourites: boolean;
  consultant: boolean;
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

interface FilterComponentProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  handleReset: () => void;
  activeFilterCount: number;
  skills: string[];
  domains: string[];
  projectDomains: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  domainSearchQuery: string;
  setDomainSearchQuery: (query: string) => void;
  projectDomainSearchQuery: string;
  setProjectDomainSearchQuery: (query: string) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
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
}) => {
  // Debounced local inputs for better UX
  const [skillsQueryLocal, setSkillsQueryLocal] = useState(searchQuery);
  const [domainQueryLocal, setDomainQueryLocal] = useState(domainSearchQuery);
  const [projectDomainQueryLocal, setProjectDomainQueryLocal] = useState(
    projectDomainSearchQuery,
  );

  useEffect(() => setSkillsQueryLocal(searchQuery), [searchQuery]);
  useEffect(() => setDomainQueryLocal(domainSearchQuery), [domainSearchQuery]);
  useEffect(
    () => setProjectDomainQueryLocal(projectDomainSearchQuery),
    [projectDomainSearchQuery],
  );

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(skillsQueryLocal), 300);
    return () => clearTimeout(t);
  }, [skillsQueryLocal, setSearchQuery]);
  useEffect(() => {
    const t = setTimeout(() => setDomainSearchQuery(domainQueryLocal), 300);
    return () => clearTimeout(t);
  }, [domainQueryLocal, setDomainSearchQuery]);
  useEffect(() => {
    const t = setTimeout(
      () => setProjectDomainSearchQuery(projectDomainQueryLocal),
      300,
    );
    return () => clearTimeout(t);
  }, [projectDomainQueryLocal, setProjectDomainSearchQuery]);

  type ArrayFilterKeys =
    | 'jobType'
    | 'domain'
    | 'skills'
    | 'projectDomain'
    | 'sorting';
  type BooleanFilterKeys = 'favourites' | 'consultant';

  const clearSection = (section: ArrayFilterKeys | BooleanFilterKeys) => {
    setFilters((prev) => {
      if ((['favourites', 'consultant'] as const).includes(section as any)) {
        const key = section as BooleanFilterKeys;
        return { ...prev, [key]: false } as FilterState;
      } else {
        const key = section as ArrayFilterKeys;
        return { ...prev, [key]: [] } as FilterState;
      }
    });
  };

  return (
    <div className="sticky top-[4rem] lg:h-[calc(100vh-6rem)] border rounded-lg flex flex-col">
      <div className="bg-gradient border-b p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}{' '}
            applied
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1 text-red-500 hover:text-red-500/80 transition-colors bg-red-500/10 hover:bg-red-500/20"
          >
            Clear all
          </Button>
        </div>
        {/* Active filter badges */}
        {(filters.jobType.length > 0 ||
          filters.domain.length > 0 ||
          filters.projectDomain.length > 0 ||
          filters.skills.length > 0 ||
          filters.favourites ||
          filters.consultant ||
          filters.minRate ||
          filters.maxRate) && (
          <div
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Active filters"
          >
            {filters.jobType.map((t) => (
              <Badge
                key={`t-${t}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {t}
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label={`Remove ${t}`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      jobType: prev.jobType.filter((x) => x !== t),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.domain.map((d) => (
              <Badge
                key={`d-${d}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {d}
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label={`Remove ${d}`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      domain: prev.domain.filter((x) => x !== d),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.projectDomain.map((pd) => (
              <Badge
                key={`pd-${pd}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {pd}
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label={`Remove ${pd}`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      projectDomain: prev.projectDomain.filter((x) => x !== pd),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.skills.map((s) => (
              <Badge
                key={`s-${s}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {s}
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label={`Remove ${s}`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      skills: prev.skills.filter((x) => x !== s),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.favourites && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Drafts only
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label="Disable drafts only"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, favourites: false }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.consultant && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Consultation
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label="Disable consultation"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, consultant: false }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.minRate || filters.maxRate) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.minRate ? `$${filters.minRate}` : ''}
                {filters.minRate && filters.maxRate ? '–' : ''}
                {filters.maxRate ? `$${filters.maxRate}` : ''}
                <button
                  className="ml-1 rounded hover:bg-muted px-1"
                  aria-label="Clear budget range"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      minRate: '',
                      maxRate: '',
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="h-full overflow-auto no-scrollbar px-4 pb-2 pt-4">
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
            value="project-type"
            className="border bg-muted/20 p-4 rounded-lg"
            role="group"
            aria-labelledby="filter-project-type"
          >
            <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span id="filter-project-type" className="font-medium">
                  Project Type
                </span>
                {filters.jobType.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    {filters.jobType.length}
                  </Badge>
                )}
                {filters.jobType.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearSection('jobType');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-2">
              <div className="space-y-2 pl-1">
                {['Fixed Price', 'Hourly', 'Milestone'].map((type) => (
                  <div key={type} className="flex items-center space-x-2 group">
                    <Checkbox
                      id={`desktop-type-${type}`}
                      checked={filters.jobType.includes(type)}
                      onCheckedChange={(checked) => {
                        setFilters((prev) => ({
                          ...prev,
                          jobType: checked
                            ? [...prev.jobType, type]
                            : prev.jobType.filter((t) => t !== type),
                        }));
                      }}
                      className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={`desktop-type-${type}`}
                      className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="domains"
            className="border bg-muted/20 p-3 rounded-lg"
            role="group"
            aria-labelledby="filter-domains"
          >
            <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span id="filter-domains" className="font-medium">
                  Domains
                </span>
                {filters.domain.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    {filters.domain.length}
                  </Badge>
                )}
                {filters.domain.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearSection('domain');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-2 px-1">
              <div className="space-y-3">
                <SearchInput
                  placeholder="Search domains..."
                  value={domainQueryLocal}
                  onChange={setDomainQueryLocal}
                  onClear={() => setDomainQueryLocal('')}
                />
                <div className="h-60 overflow-hidden">
                  <ScrollArea className="h-full w-full pr-2">
                    <div className="space-y-1 py-1">
                      {domains.filter((domain) =>
                        domain
                          .toLowerCase()
                          .includes(domainSearchQuery.toLowerCase()),
                      ).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No items found
                        </p>
                      ) : (
                        domains
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
                                id={`desktop-domain-${domain}`}
                                checked={filters.domain.includes(domain)}
                                onCheckedChange={(checked) => {
                                  setFilters((prev) => ({
                                    ...prev,
                                    domain: checked
                                      ? [...prev.domain, domain]
                                      : prev.domain.filter((d) => d !== domain),
                                  }));
                                }}
                                className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`desktop-domain-${domain}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                              >
                                {domain}
                              </label>
                            </div>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="project-domains"
            className="border bg-muted/20 p-3 rounded-lg"
            role="group"
            aria-labelledby="filter-project-domains"
          >
            <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                <span id="filter-project-domains" className="font-medium">
                  Project Domains
                </span>
                {filters.projectDomain.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    {filters.projectDomain.length}
                  </Badge>
                )}
                {filters.projectDomain.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearSection('projectDomain');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-2 px-1">
              <div className="space-y-3">
                <SearchInput
                  placeholder="Search project domains..."
                  value={projectDomainQueryLocal}
                  onChange={setProjectDomainQueryLocal}
                  onClear={() => setProjectDomainQueryLocal('')}
                />
                <div className="h-60 overflow-hidden">
                  <ScrollArea className="h-full w-full pr-2">
                    <div className="space-y-1 py-1">
                      {projectDomains.filter((domain) =>
                        domain
                          .toLowerCase()
                          .includes(projectDomainSearchQuery.toLowerCase()),
                      ).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No items found
                        </p>
                      ) : (
                        projectDomains
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
                                id={`desktop-project-domain-${domain}`}
                                checked={filters.projectDomain.includes(domain)}
                                onCheckedChange={(checked) => {
                                  setFilters((prev) => ({
                                    ...prev,
                                    projectDomain: checked
                                      ? [...prev.projectDomain, domain]
                                      : prev.projectDomain.filter(
                                          (d) => d !== domain,
                                        ),
                                  }));
                                }}
                                className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`desktop-project-domain-${domain}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                              >
                                {domain}
                              </label>
                            </div>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="skills"
            className="border bg-muted/20 p-3 rounded-lg"
            role="group"
            aria-labelledby="filter-skills"
          >
            <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span id="filter-skills" className="font-medium">
                  Skills
                </span>
                {filters.skills.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    {filters.skills.length}
                  </Badge>
                )}
                {filters.skills.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearSection('skills');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-2 px-1">
              <div className="space-y-3">
                <SearchInput
                  placeholder="Search skills..."
                  value={skillsQueryLocal}
                  onChange={setSkillsQueryLocal}
                  onClear={() => setSkillsQueryLocal('')}
                />
                <div className="h-60 overflow-hidden">
                  <ScrollArea className="h-full w-full pr-2">
                    <div className="space-y-1 py-1">
                      {skills.filter((skill) =>
                        skill.toLowerCase().includes(searchQuery.toLowerCase()),
                      ).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No items found
                        </p>
                      ) : (
                        skills
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
                                id={`desktop-skill-${skill}`}
                                checked={filters.skills.includes(skill)}
                                onCheckedChange={(checked) => {
                                  setFilters((prev) => ({
                                    ...prev,
                                    skills: checked
                                      ? [...prev.skills, skill]
                                      : prev.skills.filter((s) => s !== skill),
                                  }));
                                }}
                                className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`desktop-skill-${skill}`}
                                className="text-sm font-medium leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                              >
                                {skill}
                              </label>
                            </div>
                          ))
                      )}
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
                      htmlFor="desktop-min-rate"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Min ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="desktop-min-rate"
                        placeholder="0"
                        type="number"
                        className="pl-8 h-9"
                        value={filters.minRate}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minRate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="desktop-max-rate"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Max ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="desktop-max-rate"
                        placeholder="1000"
                        type="number"
                        className="pl-8 h-9"
                        value={filters.maxRate}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxRate: e.target.value,
                          }))
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
            role="group"
            aria-labelledby="filter-other"
          >
            <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                <span id="filter-other" className="font-medium">
                  Other Options
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-2">
              <div className="space-y-3 pl-1">
                <div className="flex items-center space-x-2 group">
                  <Checkbox
                    id="desktop-favourites"
                    checked={filters.favourites}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        favourites: Boolean(checked),
                      }))
                    }
                    className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="desktop-favourites"
                    className="text-sm font-medium leading-none cursor-pointer flex items-center group-hover:text-primary transition-colors"
                  >
                    <Bookmark className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    Drafts only
                  </label>
                </div>
                <div className="flex items-center space-x-2 group">
                  <Checkbox
                    id="desktop-consultant"
                    checked={filters.consultant}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        consultant: Boolean(checked),
                      }))
                    }
                    className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor="desktop-consultant"
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
      </div>
    </div>
  );
};

export default FilterComponent;
