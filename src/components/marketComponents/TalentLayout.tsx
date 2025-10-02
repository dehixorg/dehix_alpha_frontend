// src/components/marketComponents/TalentLayout.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookMarked,
  CheckCircle2,
  Filter,
  Search,
  Users2,
  XCircle,
  Sliders
} from 'lucide-react';
import { useSelector } from 'react-redux';


import TalentContent from './TalentContent';
import Header from '../header/header';

import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import SidebarMenu from '@/components/menu/sidebarMenu';
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

  // NEW: State for skills/domains list, search query, and 'show more' functionality
  const [allSkillsAndDomains, setAllSkillsAndDomains] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  const [skillsSearch, setSkillsSearch] = useState('');
  const [domainsSearch, setDomainsSearch] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllSkills, setShowAllSkills] = useState(false);

  // REMOVED 'location: []' from the initial state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    skills: [],
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
      filterType: 'skills' | 'experience',
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

  const handleTabChange = (value: string) => {
    router.push(`/business/talent/${value}`);
  };

  const handleApplyFilters = () => {
    fetchData(filters);
  };

  // REMOVED 'location: []' from the reset object
  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      skills: [],
      experience: [],
    };
    setFilters(emptyFilters);
  };
  console.log('these are all skills and domain', allSkillsAndDomains);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-auto">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active=''
      />
      <div className="sm:ml-14 flex flex-col min-h-screen">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Market"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Hire Talent', link: '#' },
            { label: activeTab, link: '#' },
          ]}
        />
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Talent Management</h1>

            {/* Filter Sheet Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 sm:w-96 overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-4 mt-4">
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
                    <div className="space-y-1">
                      {skills
                        .filter((skill) =>
                          skill
                            .toLowerCase()
                            .includes(skillsSearch.toLowerCase()),
                        )
                        .slice(0, showAllSkills ? skills.length : 10)
                        .map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`skill-${skill}`}
                              checked={filters.skills.includes(skill)}
                              onCheckedChange={(Checked) =>
                                handleToggleFilter('skills', skill, !!Checked)
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
                    <div className="space-y-1">
                      {domains
                        .filter((domain) =>
                          domain
                            .toLowerCase()
                            .includes(domainsSearch.toLowerCase()),
                        )
                        .slice(0, showAllSkills ? domains.length : 10)
                        .map((domain) => (
                          <div
                            key={domain}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`domain-${domain}`}
                              checked={filters.skills.includes(domain)}
                              onCheckedChange={(Checked) =>
                                handleToggleFilter('skills', domain, !!Checked)
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

                  {/* Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset
                    </Button>
                    <Button onClick={handleApplyFilters}>Apply Filters</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-9">
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
