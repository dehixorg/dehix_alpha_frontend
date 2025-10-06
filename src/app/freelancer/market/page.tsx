'use client';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import Header from '@/components/header/header';
import JobCard from '@/components/shared/JobCard';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { setDraftedProjects } from '@/lib/projectDraftSlice';
import FilterComponent from '@/components/marketComponents/FilterComponent';
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

  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [projectDomainSearchQuery, setProjectDomainSearchQuery] = useState('');
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
    setIsLargeScreen(window.innerWidth >= 1024);
  };
  useEffect(() => {
    handleResize(); // Initial check
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
              <div className="flex items-center justify-between px-1">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground ml-auto">
                  {jobs.length} {jobs.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              {!isLargeScreen && (
                <div className="ml-auto flex items-center gap-2">
                  <FilterSheet
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
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden px-4 sm:px-8 pb-8">
          {/* Desktop Filters */}
          {isLargeScreen && (
            <aside className="w-80 flex-shrink-0 pr-6">
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
            </aside>
          )}
          {/* Job Cards */}{' '}
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
