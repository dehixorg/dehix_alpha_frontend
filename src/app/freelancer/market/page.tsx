'use client';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bookmark,
  Sliders,
  Search,
  Star,
  Briefcase,
  Tag,
  DollarSign,
  Layers,
  X,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { RootState } from '@/lib/store';
import Header from '@/components/header/header';
import JobCard from '@/components/shared/JobCard';
import { setDraftedProjects } from '@/lib/projectDraftSlice';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
export interface Project {
  _id: string;
  companyId: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  position?: string;
  status?: string;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  profiles?: {
    _id?: string;
    domain?: string;
    profileType?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    description?: string;
    positions?: number;
    years?: number;
    connectsRequired?: number;
  }[];
}

// Filter section component
const FilterSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
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
const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const draftedProjects = useSelector(
    (state: RootState) => state.projectDraft.draftedProjects,
  );
  const dispatch = useDispatch();
  const [isClient, setIsClient] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    jobType: [],
    domain: [],
    skills: [],
    projects: [],
    projectDomain: [],
    sorting: [],
    minRate: '',
    maxRate: '',
    favourites: false,
    consultant: false,
  });
  const [jobs, setJobs] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [projectDomains, setProjectDomains] = useState<string[]>([]);
  const [bidProfiles, setBidProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const fetchBidData = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profileIds = res.data.data.map((bid: any) => bid.profile_id);
      setBidProfiles(profileIds);
    } catch (error) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    }
  }, [user.uid]);
  useEffect(() => {
    fetchBidData();
  }, [fetchBidData]);
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await axiosInstance.get('/freelancer/draft');
        dispatch(setDraftedProjects(res.data.projectDraft));
      } catch (err) {
        console.error(err);
      }
    };
    fetchDrafts();
  }, [dispatch]);
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsLoading(true);
        const skillsRes = await axiosInstance.get('/skills');
        setSkills(skillsRes.data.data.map((s: any) => s.label));
        const domainsRes = await axiosInstance.get('/domain');
        setDomains(domainsRes.data.data.map((d: any) => d.label));
        const projDomRes = await axiosInstance.get('/projectdomain');
        setProjectDomains(projDomRes.data.data.map((pd: any) => pd.label));
      } catch (err) {
        console.error('Error loading filters', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load filter options.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = useCallback(
    (filterType: keyof FilterState, selectedValues: string[] | string) => {
      setFilters((prev) => ({
        ...prev,
        [filterType]: Array.isArray(selectedValues)
          ? selectedValues
          : [selectedValues],
      }));
    },
    [],
  );
  console.log("JOB: ", jobs);

  const handleReset = useCallback(() => {
    setFilters({
      jobType: [],
      domain: [],
      skills: [],
      projects: [],
      projectDomain: [],
      sorting: [],
      minRate: '',
      maxRate: '',
      favourites: false,
      consultant: false,
    });
  }, []);

  // Fetch jobs when filters change or component mounts
  const fetchJobs = useCallback(
    async (options: FilterState & { signal?: AbortSignal }) => {
      const { signal, ...appliedFilters } = options;
      try {
        setIsLoading(true);
        const query = constructQueryString(appliedFilters);
        console.log('Fetching jobs with query:', query);

        const jobsRes = await axiosInstance.get(
          `/project/freelancer/${user.uid}${query ? `?${query}` : ''}`,
          { signal },
        );

        console.log('Jobs API response:', jobsRes.data);
        const allJobs = jobsRes.data?.data || [];
        console.log('Parsed jobs:', allJobs);

        // Apply client-side filtering
        const filteredJobs = allJobs.filter((job: Project) => {
          // Filter out completed projects
          if (job.status?.toLowerCase() === 'completed') return false;

          // Apply favourites filter if enabled
          if (appliedFilters.favourites && !draftedProjects.includes(job._id)) {
            return false;
          }

          // Apply consultant filter if enabled
          if (appliedFilters.consultant) {
            const hasConsultantRole = job.profiles?.some(
              (profile) => profile.profileType?.toUpperCase() === 'CONSULTANT',
            );
            if (!hasConsultantRole) return false;
          }

          // Apply domain filter
          if (appliedFilters.domain?.length > 0 && job.projectDomain) {
            const hasMatchingDomain = appliedFilters.domain.some((d) =>
              job.projectDomain?.includes(d),
            );
            if (!hasMatchingDomain) return false;
          }

          // Apply skills filter
          if (appliedFilters.skills?.length > 0 && job.skillsRequired) {
            const hasMatchingSkill = appliedFilters.skills.some((skill) =>
              job.skillsRequired?.includes(skill),
            );
            if (!hasMatchingSkill) return false;
          }

          // Apply project domain filter
          if (appliedFilters.projectDomain?.length > 0 && job.projectDomain) {
            const hasMatchingProjectDomain = appliedFilters.projectDomain.some(
              (pd) => job.projectDomain?.includes(pd),
            );
            if (!hasMatchingProjectDomain) return false;
          }

          // Apply rate filters
          const jobRate = job.profiles?.[0]?.rate;
          if (appliedFilters.minRate && jobRate) {
            if (jobRate < Number(appliedFilters.minRate)) return false;
          }
          if (appliedFilters.maxRate && jobRate) {
            if (jobRate > Number(appliedFilters.maxRate)) return false;
          }

          return true;
        });

        // Sort by creation date (newest first)
        filteredJobs.sort((a: Project, b: Project) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        console.log('Filtered jobs:', filteredJobs);
        setJobs(filteredJobs);
      } catch (err) {
        // Type guard to check if it's an Error object
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            console.error('Fetch jobs error:', err);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to load job listings.',
            });
          }
        } else {
          // Handle non-Error objects
          console.error('An unknown error occurred:', err);
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              'An unexpected error occurred while loading job listings.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user.uid, draftedProjects],
  );
  // Effect to fetch jobs when filters change or component mounts
  useEffect(() => {
    console.log('Filters or user changed - current filters:', filters);

    if (!user?.uid) {
      console.log('User not authenticated, skipping job fetch');
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      try {
        console.log('Initiating job fetch with filters:', filters);
        setIsLoading(true);

        // Create a clean filters object with all filter properties
        const fetchOptions: FilterState & { signal?: AbortSignal } = {
          jobType: filters.jobType || [],
          domain: filters.domain || [],
          skills: filters.skills || [],
          projects: filters.projects || [],
          projectDomain: filters.projectDomain || [],
          sorting: filters.sorting || [],
          minRate: filters.minRate || '',
          maxRate: filters.maxRate || '',
          favourites: filters.favourites || false,
          consultant: filters.consultant || false,
          signal,
        };

        console.log('Sending filters to API:', fetchOptions);
        await fetchJobs(fetchOptions);
      } catch (error) {
        if (!signal.aborted && isMounted) {
          console.error('Error in fetchData:', error);
          const isCanceledError =
            error &&
            typeof error === 'object' &&
            'name' in error &&
            error.name === 'CanceledError';
          if (!isCanceledError) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to load job listings. Please try again.',
            });
          }
        }
      } finally {
        if (!signal.aborted && isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Add a small debounce to prevent too many API calls
    const timer = setTimeout(fetchData, 300);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, user?.uid, fetchJobs]);

  const constructQueryString = (filters: FilterState) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        // Only process non-empty arrays
        if (value?.length > 0) {
          value.forEach((v) => {
            if (v !== undefined && v !== null) {
              params.append(key, String(v));
            }
          });
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        // Handle string parameters
        params.append(key, value);
      } else if (typeof value === 'boolean' && value === true) {
        // Handle boolean flags
        params.append(key, 'true');
      } else if (typeof value === 'number') {
        // Handle numbers
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    console.log('Constructed query string:', queryString);
    return queryString;
  };
  const handleResize = () => {
    if (window.innerWidth >= 1024) setShowFilters(false);
  };
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleModalToggle = () => {
    setShowFilters((prev) => !prev);
  };
  const handleRemoveJob = async (id: string) => {
    try {
      await axiosInstance.put(`/freelancer/${id}/not_interested_project`);
      // Immediately remove from UI
      setJobs((prev) => prev.filter((job) => job._id !== id));
      // Refresh the data to ensure consistency
      setTimeout(() => {
        fetchJobs(filters);
      }, 500);
      toast({
        title: 'Success',
        description: 'Project marked as not interested.',
      });
    } catch (err) {
      console.error('Remove job error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update project status.',
      });
    }
  };
  // Active filters count for badge
  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value?.length;
    if (typeof value === 'string' && value) return count + 1;
    if (typeof value === 'boolean' && value) return count + 1;
    return count;
  }, 0);

  if (!isClient) return null;

  return (
    <>
      <div className="flex min-h-screen bg-background w-full flex-col">
        <SidebarMenu
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          active="Market"
        />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            activeMenu="Market"
            breadcrumbItems={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Marketplace', link: '#' },
            ]}
          />
          <div className="px-4 sm:px-8 pt-2 pb-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Find Your Next Opportunity
                </h1>
                <p className="text-muted-foreground max-w-3xl">
                  Browse through available projects and find the perfect match
                  for your skills and interests.
                </p>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects by name, skills, or keywords..."
                    className="pl-10 h-11 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="gap-2 h-11"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Sliders className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="px-1.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground"
                    onClick={handleReset}
                  >
                    Clear all
                  </Button>
                  {Object.entries(filters).map(([key, value]) => {
                    if (Array.isArray(value) && value?.length > 0) {
                      return value.map((item) => (
                        <Badge
                          key={`${key}-${item}`}
                          variant="secondary"
                          className="h-8 px-3"
                        >
                          {item}
                          <button
                            onClick={() =>
                              handleFilterChange(
                                key as keyof FilterState,
                                value.filter((v) => v !== item),
                              )
                            }
                            className="ml-2 rounded-full hover:bg-muted-foreground/10 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ));
                    }
                    if (typeof value === 'string' && value) {
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="h-8 px-3"
                        >
                          {key}: {value}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, [key]: '' }))
                            }
                            className="ml-2 rounded-full hover:bg-muted-foreground/10 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    }
                    if (typeof value === 'boolean' && value) {
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="h-8 px-3"
                        >
                          {key}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, [key]: false }))
                            }
                            className="ml-2 rounded-full hover:bg-muted-foreground/10 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        {isClient && (
          <div
            className={`fixed inset-0 z-50 lg:hidden transition-transform duration-300 ease-in-out transform ${
              showFilters ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-background border-r shadow-lg p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-120px)] pr-4 -mr-4">
                <div className="space-y-6">
                  <FilterSection title="Project Type" icon={Layers}>
                    <div className="space-y-2">
                      {['Fixed Price', 'Hourly', 'Milestone'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.jobType.includes(type)}
                            onCheckedChange={(checked) => {
                              setFilters((prev) => ({
                                ...prev,
                                jobType: checked
                                  ? [...prev.jobType, type]
                                  : prev.jobType.filter((t) => t !== type),
                              }));
                            }}
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection title="Skills" icon={Tag}>
                    <div className="space-y-2">
                      {skills.slice(0, 5).map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={filters.skills.includes(skill)}
                            onCheckedChange={(checked) => {
                              setFilters((prev) => ({
                                ...prev,
                                skills: checked
                                  ? [...prev.skills, skill]
                                  : prev.skills.filter((s) => s !== skill),
                              }));
                            }}
                          />
                          <label
                            htmlFor={`skill-${skill}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                      {skills?.length > 5 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-8 px-0 text-primary"
                        >
                          Show more
                        </Button>
                      )}
                    </div>
                  </FilterSection>

                  <FilterSection title="Budget" icon={DollarSign}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="min-rate"
                            className="text-xs text-muted-foreground"
                          >
                            Min ($)
                          </Label>
                          <Input
                            id="min-rate"
                            placeholder="Min"
                            type="number"
                            value={filters.minRate}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                minRate: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="max-rate"
                            className="text-xs text-muted-foreground"
                          >
                            Max ($)
                          </Label>
                          <Input
                            id="max-rate"
                            placeholder="Max"
                            type="number"
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
                  </FilterSection>

                  <FilterSection title="Other" icon={Sliders}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="favourites"
                          checked={filters.favourites}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({
                              ...prev,
                              favourites: !!checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="favourites"
                          className="text-sm font-medium leading-none cursor-pointer flex items-center"
                        >
                          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500/20" />
                          Saved Projects
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="consultant"
                          checked={filters.consultant}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({
                              ...prev,
                              consultant: !!checked,
                            }))
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
              <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 -mx-6 -mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-11"
                  >
                    Reset All
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="h-11"
                  >
                    Show Results
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-6 px-4 lg:px-8">
        {/* Job Listings */}
        <div className="flex-1 py-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {isLoading ? 'Loading...' : `${jobs?.length} Projects Found`}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={filters.sorting[0] || 'newest'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sorting: [value] }))
                }
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                  <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="hidden lg:block lg:sticky lg:top-20 lg:w-80 lg:self-start lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 lg:py-2 lg:-my-2">
            <div className="space-y-6 py-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset all
                </Button>
              </div>
              <FilterSection title="Project Type" icon={Layers}>
                <div className="space-y-2">
                  {['Fixed Price', 'Hourly', 'Milestone'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
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
                      />
                      <label
                        htmlFor={`desktop-type-${type}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
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
                  <div className="space-y-2 max-h-60 overflow-y-auto py-1 -mx-1 px-1">
                    {skills
                      .filter((skill) =>
                        skill.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                      .slice(0, 10)
                      .map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center space-x-2 hover:bg-muted/50 rounded p-1"
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
                          />
                          <label
                            htmlFor={`desktop-skill-${skill}`}
                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                          >
                            {skill}
                          </label>
                          <Badge variant="outline" className="h-5 text-xs">
                            {Math.floor(Math.random() * 100) + 1}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Budget Range" icon={DollarSign}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="desktop-min-rate"
                        className="text-xs text-muted-foreground"
                      >
                        Min ($)
                      </Label>
                      <Input
                        id="desktop-min-rate"
                        placeholder="Min"
                        type="number"
                        value={filters.minRate}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minRate: e.target.value,
                          }))
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="desktop-max-rate"
                        className="text-xs text-muted-foreground"
                      >
                        Max ($)
                      </Label>
                      <Input
                        id="desktop-max-rate"
                        placeholder="Max"
                        type="number"
                        value={filters.maxRate}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxRate: e.target.value,
                          }))
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
                      id="desktop-favourites"
                      checked={filters.favourites}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          favourites: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="desktop-favourites"
                      className="text-sm font-medium leading-none cursor-pointer flex items-center"
                    >
                      <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500/20" />
                      Saved Projects
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="desktop-consultant"
                      checked={filters.consultant}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          consultant: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="desktop-consultant"
                      className="text-sm font-medium leading-none cursor-pointer flex items-center"
                    >
                      <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                      Consultant Roles
                    </label>
                  </div>
                </div>
              </FilterSection>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20 rounded-full" />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-9 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs?.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onNotInterested={() => handleRemoveJob(job._id)}
                bidExist={
                  Array.isArray(job.profiles) &&
                  job.profiles.some((p: any) => bidProfiles.includes(p._id))
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30">
            <div className="w-48 h-48 bg-muted/20 rounded-full flex items-center justify-center mb-6">
              <Search className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {activeFilterCount > 0
                ? "We couldn't find any projects matching your current filters."
                : 'There are currently no projects available. Check back later!'}
            </p>
            {activeFilterCount > 0 ? (
              <Button variant="outline" onClick={handleReset}>
                Clear all filters
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>
                Refresh page
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Filters Modal */}
      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-screen-lg mx-auto h-[80vh] max-h-full flex flex-col shadow-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              <Button variant="ghost" size="sm" onClick={handleModalToggle}>
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            <div className="overflow-y-auto p-4 flex-grow scrollbar-hide">
              {/* Mobile Favourites Filter */}
              <div className="border-b border-gray-200 dark:border-gray-800 py-4">
                <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mobile-favourites"
                      checked={filters.favourites}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          favourites: checked as boolean,
                        }))
                      }
                    />
                    <label
                      htmlFor="mobile-favourites"
                      className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer select-none flex items-center space-x-2"
                    >
                      <Bookmark className="w-4 h-4 cursor-pointer fill-red-600 text-red-600" />
                      <span>Drafts</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <MobileSkillDom
                  label="Domains"
                  heading="Filter by Domains"
                  checkboxLabels={domains}
                  selectedValues={filters.domain}
                  setSelectedValues={(values) =>
                    handleFilterChange('domain', values)
                  }
                />
              </div>

              <div className="border-b border-gray-200 dark:border-gray-800 py-4">
                <MobileSkillDom
                  label="Skills"
                  heading="Filter by Skills"
                  checkboxLabels={skills}
                  selectedValues={filters.skills}
                  setSelectedValues={(values) =>
                    handleFilterChange('skills', values)
                  }
                />
              </div>

              <div className="border-b border-gray-200 dark:border-gray-800 py-4">
                <MobileSkillDom
                  label="ProjectDomain"
                  heading="Filter by Project Domains"
                  checkboxLabels={projectDomains}
                  selectedValues={filters.projectDomain}
                  setSelectedValues={(values) =>
                    handleFilterChange('projectDomain', values)
                  }
                />
              </div>

              <div className="py-4">
                <Label className="mb-4 block text-lg font-medium text-gray-900 dark:text-white">
                  Filter by Rate
                </Label>
                <div className="flex gap-4">
                  <div className="flex flex-col flex-1">
                    <Label
                      htmlFor="minRate"
                      className="mb-1 text-sm text-gray-500 dark:text-gray-400"
                    >
                      Min Rate
                    </Label>
                    <Input
                      id="minRate"
                      type="number"
                      min={0}
                      max={100000}
                      aria-label="Minimum Rate"
                      placeholder="e.g. 10"
                      value={filters.minRate}
                      onChange={(e) => {
                        setFilters((prev) => ({
                          ...prev,
                          minRate: e.target.value,
                        }));
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <Label
                      htmlFor="maxRate"
                      className="mb-1 text-sm text-gray-500 dark:text-gray-400"
                    >
                      Max Rate
                    </Label>
                    <Input
                      id="maxRate"
                      type="number"
                      min={0}
                      max={100000}
                      aria-label="Maximum Rate"
                      placeholder="e.g. 100"
                      value={filters.maxRate}
                      onChange={(e) => {
                        setFilters((prev) => ({
                          ...prev,
                          maxRate: e.target.value,
                        }));
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Reset
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-300 ease-in-out shadow-lg font-medium"
                >
                  Show Results
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Market;
