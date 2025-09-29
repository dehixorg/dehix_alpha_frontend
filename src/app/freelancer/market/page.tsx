'use client';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import Header from '@/components/header/header';
import JobCard from '@/components/shared/JobCard';
import { setDraftedProjects } from '@/lib/projectDraftSlice';
import { FilterSheet } from '@/components/market/FilterSheet';

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

// Active filters count for badge
const getActiveFilterCount = (filters: FilterState) => {
  return Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + (value?.length || 0);
    if (typeof value === 'string' && value) return count + 1;
    if (typeof value === 'boolean' && value) return count + 1;
    return count;
  }, 0);
};
const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const draftedProjects = useSelector(
    (state: RootState) => state.projectDraft.draftedProjects,
  );
  const dispatch = useDispatch();
  const [, setShowFilters] = useState(true);
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
  const fetchBidData = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/bid/${user.uid}/bid`);
      const profileIds = res.data.data.map((bid: any) => bid.profile_id);
      setBidProfiles(profileIds);
    } catch (error) {
      console.error('API Error:', error);
      notifyError('Something went wrong. Please try again.');
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
        notifyError('Failed to load filter options.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilterOptions();
  }, []);

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
    async (options: FilterState) => {
      const appliedFilters = options;
      try {
        setIsLoading(true);
        const query = constructQueryString(appliedFilters);

        const jobsRes = await axiosInstance.get(
          `/project/freelancer/${user.uid}${query ? `?${query}` : ''}`,
        );

        const allJobs = jobsRes.data?.data || [];

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

        setJobs(filteredJobs);
      } catch (err) {
        // Type guard to check if it's an Error object
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            console.error('Fetch jobs error:', err);
            notifyError('Failed to load job listings.');
          }
        } else {
          // Handle non-Error objects
          console.error('An unknown error occurred:', err);
          notifyError(
            'An unexpected error occurred while loading job listings.',
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user.uid, draftedProjects],
  );
  // Effect to fetch jobs when filters change or component mounts
  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);

        // Create a clean filters object with all filter properties
        const fetchOptions: FilterState = {
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
        };

        await fetchJobs(fetchOptions);
      } catch (error) {
        if (isMounted) {
          console.error('Error in fetchData:', error);
          const isCanceledError =
            error &&
            typeof error === 'object' &&
            'name' in error &&
            (error as any).name === 'Cancel';
          if (!isCanceledError) {
            notifyError('Failed to load job listings. Please try again.');
          }
        }
      } finally {
        if (isMounted) {
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
      // Do not cancel globally here; avoid canceling unrelated in-flight requests
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

    return queryString;
  };
  const handleResize = () => {
    if (window.innerWidth >= 1024) setShowFilters(false);
  };
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleRemoveJob = async (id: string) => {
    try {
      await axiosInstance.put(`/freelancer/${id}/not_interested_project`);
      // Immediately remove from UI
      setJobs((prev) => prev.filter((job) => job._id !== id));
      // Refresh the data to ensure consistency
      setTimeout(() => {
        fetchJobs(filters);
      }, 500);
      notifySuccess('Project marked as not interested.', 'Success');
    } catch (err) {
      console.error('Remove job error:', err);
      notifyError('Failed to update project status.');
    }
  };
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:pb-4 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Market"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/freelancer' },
            { label: 'Market', link: '#' },
          ]}
        />
        <div className="p-4 sm:px-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <h2 className="hidden md:block text-2xl sm:text-3xl font-bold tracking-tight">
                  Find Your Next Opportunity
                </h2>
                <p className="hidden md:block text-muted-foreground">
                  Browse through available projects and find your next gig
                </p>
              </div>
              <FilterSheet
                filters={{
                  jobType: filters.jobType,
                  domain: filters.domain,
                  skills: filters.skills,
                  projectDomain: filters.projectDomain,
                  minRate: filters.minRate,
                  maxRate: filters.maxRate,
                  favourites: filters.favourites,
                  consultant: filters.consultant,
                }}
                onFilterChange={(updatedFilters) => {
                  setFilters((prev) => ({
                    ...prev,
                    ...updatedFilters,
                  }));
                }}
                activeFilterCount={activeFilterCount}
                skills={skills}
                domains={domains}
                projectDomains={projectDomains}
                onReset={handleReset}
              />
            </div>
            {/* Results count */}
            <div className="flex items-center justify-between px-1">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground ml-auto">
                {jobs.length} {jobs.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden px-4 sm:px-8 pb-8">
          {/* Desktop Filters */}
          {/* <aside className="hidden lg:block w-80 flex-shrink-0 pr-6">
            <div className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pb-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
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
                          skill
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
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
                        <Bookmark className="h-4 w-4 mr-2 text-red-500 fill-red-500/20" />
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
          </aside> */}

          {/* Job Cards */}
          <div className="flex-1 overflow-y-auto">
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
                            <Skeleton
                              key={i}
                              className="h-6 w-20 rounded-full"
                            />
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
            ) : jobs.length > 0 ? (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onNotInterested={() => handleRemoveJob(job._id)}
                    bidCount={
                      Array.isArray(job.profiles)
                        ? job.profiles.filter((p: any) =>
                            bidProfiles.includes(p._id),
                          ).length
                        : 0
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30">
                <div className="w-48 h-48 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No projects found
                </h3>
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
        </div>
      </div>
    </div>
  );
};

export default Market;
