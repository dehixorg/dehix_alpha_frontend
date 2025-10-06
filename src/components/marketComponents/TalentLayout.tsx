// src/components/marketComponents/TalentLayout.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookMarked,
  CheckCircle2,
  Search,
  Users2,
  XCircle,
  Sliders,
  Award,
  Globe,
  UserCheck,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import Header from '../header/header';

import TalentContent from './TalentContent';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';

interface ProfessionalExperience {
  workFrom?: string;
  workTo?: string;
  jobTitle?: string;
}

interface TalentData {
  invited: any[];
  accepted: any[];
  rejected: any[];
}

// REMOVED 'location: string[]' from the interface
interface FilterState {
  search: string;
  skills: string[];
  domains: string[];
  experience: string[];
}

interface TalentLayoutProps {
  activeTab: 'invited' | 'accepted' | 'rejected' | 'overview';
}

export const calculateExperience = (
  professionalInfo: ProfessionalExperience[],
): string => {
  if (!professionalInfo || professionalInfo.length === 0) {
    return 'Not specified';
  }
  let totalExperienceInMonths = 0;
  professionalInfo.forEach((job) => {
    if (job.workFrom && job.workTo) {
      const start = new Date(job.workFrom);
      const end = new Date(job.workTo);
      if (start < end) {
        const diffInMonths =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        if (diffInMonths > 0) {
          totalExperienceInMonths += diffInMonths;
        }
      }
    }
  });

  const years = Math.floor(totalExperienceInMonths / 12);
  const months = totalExperienceInMonths % 12;

  if (years === 0 && months === 0) return 'Less than a month';
  const yearString = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
  const monthString =
    months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

  if (yearString && monthString) return `${yearString} and ${monthString}`;
  return yearString || monthString;
};

const TalentLayout: React.FC<TalentLayoutProps> = ({ activeTab }) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const businessId = user?.uid;
  const [talentData, setTalentData] = useState<TalentData>({
    invited: [],
    accepted: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // NEW: State for skills/domains list, search query, and 'show more' functionality
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  const [skillsSearch, setSkillsSearch] = useState('');
  const [domainsSearch, setDomainsSearch] = useState('');

  // REMOVED 'location: []' from the initial state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    skills: [],
    domains: [],
    experience: [],
  });

  const experienceMapping = {
    Junior: '1',
    'Mid-level': '2',
    Senior: '3',
    Lead: '4',
  };

  // REMOVED 'location' from the filterType parameter
  const handleToggleFilter = useCallback(
    (
      filterType: 'skills' | 'domains' | 'experience',
      value: string,
      isChecked: boolean,
    ) => {
      setFilters((prevFilters) => {
        const currentValues = prevFilters[filterType] as string[];
        const updatedValues = isChecked
          ? [...currentValues, value]
          : currentValues.filter((item) => item !== value);
        return {
          ...prevFilters,
          [filterType]: updatedValues,
        };
      });
    },
    [],
  );

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: value,
    }));
  }, []);

  // REMOVED the 'location' part of the query string logic
  const constructQueryString = useCallback((currentFilters: FilterState) => {
    const queryParts: string[] = [];
    if (currentFilters.search) {
      queryParts.push(`search=${encodeURIComponent(currentFilters.search)}`);
    }
    if (currentFilters.skills.length > 0) {
      queryParts.push(
        `skillName=${currentFilters.skills.map(encodeURIComponent).join(',')}`,
      );
    }
    if (currentFilters.domains.length > 0) {
      queryParts.push(
        `domainName=${currentFilters.domains.map(encodeURIComponent).join(',')}`,
      );
    }
    if (currentFilters.experience.length > 0) {
      queryParts.push(
        `experience=${currentFilters.experience.map(encodeURIComponent).join(',')}`,
      );
    }

    return queryParts.join('&');
  }, []);

  const fetchData = useCallback(
    async (currentFilters: FilterState) => {
      if (!businessId || activeTab === 'overview') {
        return;
      }
      setLoading(true);

      try {
        let endpoint = '';
        if (activeTab === 'invited') {
          endpoint = `/business/hire-dehixtalent/free/invited`;
        } else if (activeTab === 'accepted') {
          endpoint = `/business/hire-dehixtalent/free/selected`;
        } else if (activeTab === 'rejected') {
          endpoint = `/business/hire-dehixtalent/free/rejected`;
        }

        const queryString = constructQueryString(currentFilters);
        const response = await axiosInstance.get(`${endpoint}?${queryString}`);

        setTalentData((prevData) => {
          const newState = {
            ...prevData,
            [activeTab]: response.data.data,
          };
          return newState;
        });
      } catch (err) {
        console.error('Error fetching talents:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
    [businessId, activeTab, constructQueryString],
  );

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [skillsResponse, domainsResponse] = await Promise.all([
          axiosInstance.get('/skills'),
          axiosInstance.get('/domain'),
        ]);

        setSkills(skillsResponse.data.data.map((skill: any) => skill.label));
        setDomains(
          domainsResponse.data.data.map((domain: any) => domain.label),
        );
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load filter options.',
        });
        console.error('Error fetching filter data:', error);
      }
    };
    fetchFilterData();
    fetchData(filters);
  }, [activeTab, filters, fetchData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false); // close sheet
      }
    };

    handleResize(); // run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (value: string) => {
    router.push(`/business/talent/${value}`);
  };

  // REMOVED 'location: []' from the reset object
  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      skills: [],
      domains: [],
      experience: [],
    };
    setFilters(emptyFilters);
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-auto">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=""
      />
      <div className="sm:ml-14 flex flex-col min-h-screen">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dehix Talent"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Hire Talent', link: '#' },
            {
              label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
              link: '#',
            },
          ]}
        />
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 ">
            <h1 className="text-xl font-bold">Talent Management</h1>

            {/* Filter Sheet Trigger */}
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-80 sm:w-96 p-4">
                  <div className="flex items-center justify-between mb-2 w-full pl-2">
                    <h2 className="flex items-center gap-2 flex-shrink-0 text-lg font-semibold">
                      Filters
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="flex items-center gap-1 text-red-500 hover:text-red-500/80 transition-colors bg-red-500/10 hover:bg-red-500/20 whitespace-nowrap"
                    >
                      Clear all
                    </Button>
                  </div>

                  {/* Make the entire sheet scrollable */}
                  <ScrollArea className="h-[calc(100vh-5rem)] pr-4">
                    <div className="space-y-4 mt-4 px-1">
                      {/* Search */}
                      <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Search by name, skills..."
                            className="pl-8"
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                          />
                        </div>
                      </div>
                      <Separator />

                      {/* Skills */}
                      <div className="space-y-2">
                        <Label>Skills</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search Skills"
                            className="pl-8"
                            value={skillsSearch}
                            onChange={(e) => setSkillsSearch(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="max-h-48 overflow-y-auto no-scrollbar pr-2 rounded-md border">
                          <div className="space-y-1 py-1">
                            {skills
                              .filter((skill) =>
                                skill
                                  .toLowerCase()
                                  .includes(skillsSearch.toLowerCase()),
                              )
                              .map((skill) => (
                                <div
                                  key={skill}
                                  className="flex items-center space-x-4"
                                >
                                  <Checkbox
                                    id={`skill-${skill}`}
                                    checked={filters.skills.includes(skill)}
                                    onCheckedChange={(Checked) =>
                                      handleToggleFilter(
                                        'skills',
                                        skill,
                                        !!Checked,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`skill-${skill}`}
                                    className="font-normal"
                                  >
                                    {skill}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <Separator />

                      {/* Domains */}
                      <div className="space-y-2">
                        <Label>Domains</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search Domains"
                            className="pl-8"
                            value={domainsSearch}
                            onChange={(e) => setDomainsSearch(e.target.value)}
                          />
                        </div>
                        <ScrollArea className="max-h-48 overflow-y-auto no-scrollbar pr-2 rounded-md border">
                          <div className="space-y-1 py-1">
                            {domains
                              .filter((domain) =>
                                domain
                                  .toLowerCase()
                                  .includes(domainsSearch.toLowerCase()),
                              )
                              .map((domain) => (
                                <div
                                  key={domain}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`domain-${domain}`}
                                    checked={filters.domains.includes(domain)}
                                    onCheckedChange={(Checked) =>
                                      handleToggleFilter(
                                        'domains',
                                        domain,
                                        !!Checked,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`domain-${domain}`}
                                    className="font-normal"
                                  >
                                    {domain}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <Separator />

                      {/* Experience */}
                      <div className="space-y-2">
                        <Label>Experience</Label>
                        <div className="space-y-1">
                          {Object.entries(experienceMapping).map(
                            ([label, value]) => (
                              <div
                                key={label}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`exp-${label}`}
                                  checked={filters.experience.includes(value)}
                                  onCheckedChange={(Checked) =>
                                    handleToggleFilter(
                                      'experience',
                                      value,
                                      !!Checked,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`exp-${label}`}
                                  className="font-normal"
                                >
                                  {label}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <Separator />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="container px-4 py-4 ">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 ">
              <TabsTrigger value="overview" asChild>
                <a href="/business/talent">
                  <Users2 className="h-4 w-4 mr-2" />
                  Overview
                </a>
              </TabsTrigger>
              <TabsTrigger
                value="invited"
                onClick={() => handleTabChange('invited')}
              >
                <BookMarked className="h-4 w-4 mr-2" />
                Invites
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                onClick={() => handleTabChange('accepted')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accepted
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                onClick={() => handleTabChange('rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="container flex-1 items-start px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            <aside className="border bg-background rounded-lg hidden lg:block col-span-3">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background border-b p-4 rounded-t-lg">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-red-500 hover:text-red-500/80 transition-colors bg-red-500/10 hover:bg-red-500/20 whitespace-nowrap"
                  >
                    Clear all
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {/* {filtersCount} filter{filtersCount !== 1 ? 's' : ''} applied */}
                </p>
              </div>

              {/* Scrollable Content */}
              <ScrollArea>
                <Accordion
                  type="multiple"
                  defaultValue={['skills', 'domains', 'experience']}
                >
                  {/* Skills Section */}
                  <AccordionItem
                    value="skills"
                    className="border bg-muted/10 p-4 rounded-lg"
                  >
                    <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Skills</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="py-2 space-y-2">
                      <Input
                        placeholder="Search Skills"
                        value={skillsSearch}
                        onChange={(e) => setSkillsSearch(e.target.value)}
                        className="pl-8"
                      />
                      <ScrollArea className="h-48">
                        <div className="space-y-1 p-1">
                          {skills
                            .filter((skill) =>
                              skill
                                .toLowerCase()
                                .includes(skillsSearch.toLowerCase()),
                            )
                            .map((skill) => (
                              <div
                                key={skill}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`skill-${skill}`}
                                  checked={filters.skills.includes(skill)}
                                  onCheckedChange={(checked) =>
                                    handleToggleFilter(
                                      'skills',
                                      skill,
                                      !!checked,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`skill-${skill}`}
                                  className="font-normal"
                                >
                                  {skill}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Domains Section */}
                  <AccordionItem
                    value="domains"
                    className="border bg-muted/10 p-4 rounded-lg"
                  >
                    <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Domains</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="py-2 space-y-2">
                      <Input
                        placeholder="Search Domains"
                        value={domainsSearch}
                        onChange={(e) => setDomainsSearch(e.target.value)}
                        className="pl-8"
                      />
                      <ScrollArea className="h-48">
                        <div className="space-y-1 p-1">
                          {domains
                            .filter((domain) =>
                              domain
                                .toLowerCase()
                                .includes(domainsSearch.toLowerCase()),
                            )
                            .map((domain) => (
                              <div
                                key={domain}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`domain-${domain}`}
                                  checked={filters.domains.includes(domain)}
                                  onCheckedChange={(checked) =>
                                    handleToggleFilter(
                                      'domains',
                                      domain,
                                      !!checked,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`domain-${domain}`}
                                  className="font-normal"
                                >
                                  {domain}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Experience Section */}
                  <AccordionItem
                    value="experience"
                    className="border bg-muted/10 p-4 rounded-lg"
                  >
                    <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Experience</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="py-2 space-y-1">
                      {Object.entries(experienceMapping).map(
                        ([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`exp-${label}`}
                              checked={filters.experience.includes(value)}
                              onCheckedChange={(checked) =>
                                handleToggleFilter(
                                  'experience',
                                  value,
                                  !!checked,
                                )
                              }
                            />
                            <Label
                              htmlFor={`exp-${label}`}
                              className="font-normal"
                            >
                              {label}
                            </Label>
                          </div>
                        ),
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </aside>

            {/* Talent Content */}
            <div className="col-span-12 lg:col-span-9">
              <TalentContent
                activeTab={activeTab}
                talents={activeTab === 'overview' ? [] : talentData[activeTab]}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;
