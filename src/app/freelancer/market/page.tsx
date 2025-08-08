'use client';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, X } from 'lucide-react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import type { RootState } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Header from '@/components/header/header';
import JobCard from '@/components/shared/JobCard';
import { setDraftedProjects } from '@/lib/projectDraftSlice';
import { DraftSheet } from '@/components/shared/DraftSheet';

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

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const draftedProjects = useSelector(
    (state: RootState) => state.projectDraft.draftedProjects,
  );
  const dispatch = useDispatch();

  const [isClient, setIsClient] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(
    'Filter by Project Domains',
  );
  const [openSheet, setOpenSheet] = useState(false);

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

  const handleFilterChange = (
    filterType: keyof FilterState,
    selectedValues: string[],
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: selectedValues }));
  };

  const handleReset = () => {
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
    });
  };

  const constructQueryString = (filters: FilterState) => {
    return Object.entries(filters)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0 ? `${key}=${value.join(',')}` : '';
        }
        if (typeof value === 'string' && value.trim() !== '') {
          return `${key}=${encodeURIComponent(value)}`;
        }
        if (typeof value === 'number' && !isNaN(value)) {
          return `${key}=${value}`;
        }
        if (typeof value === 'boolean' && value === true) {
          return `${key}=true`;
        }
        return '';
      })
      .filter(Boolean)
      .join('&');
  };

  const fetchJobs = useCallback(
    async (appliedFilters: FilterState) => {
      try {
        setIsLoading(true);

        const query = constructQueryString(appliedFilters);
        const jobsRes = await axiosInstance.get(
          `/project/freelancer/${user.uid}?${query}`,
        );

        const allJobs = jobsRes.data.data || [];

        // Backend already filters out "not interested" projects
        let filteredJobs = allJobs;

        // Filter out completed projects - freelancers shouldn't see completed projects
        filteredJobs = filteredJobs.filter(
          (job: Project) => job.status?.toLowerCase() !== 'completed',
        );

        // Apply favourites filter if enabled
        if (appliedFilters.favourites) {
          filteredJobs = filteredJobs.filter((job: Project) =>
            draftedProjects.includes(job._id),
          );
        }

        // Sort projects by creation date (newest first)
        filteredJobs.sort((a: Project, b: Project) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });

        setJobs(filteredJobs);
      } catch (err) {
        console.error('Fetch jobs error:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load job listings.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user.uid, draftedProjects],
  );

  useEffect(() => {
    fetchJobs(filters);
  }, [fetchJobs, filters]);

  const handleApply = () => {
    fetchJobs(filters);
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

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-muted  w-full flex-col  pb-10">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Market"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Marketplace', link: '#' },
          ]}
        />
        <div className="flex  items-start sm:items-center justify-between">
          <div className="w-full sm:w-[70%] mb-4 sm:mb-8 ml-4 sm:ml-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Freelancer Marketplace
            </h1>
            <p className="text-gray-400 mt-2 hidden sm:block">
              Discover and manage your freelance opportunities, connect with
              potential projects, and filter by skills, domains and project
              domains to enhance your portfolio.
            </p>
          </div>
          <div className="w-full sm:w-[30%] flex justify-end pr-4 sm:pr-8">
            <DraftSheet open={openSheet} setOpen={setOpenSheet} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-6 px-4 lg:px-20 md:px-8">
        {/* Left Sidebar Filters */}
        <div className="hidden bg-background p-3 rounded-md lg:block lg:sticky lg:top-16 lg:w-1/3 xl:w-1/3 lg:self-start lg:h-[calc(100vh-4rem)]">
          <ScrollArea className="h-full no-scrollbar overflow-y-auto pr-4 space-y-4">
            <Button onClick={handleApply} className="w-full">
              Apply
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full mb-4 bg-gray dark:text-white"
              style={{ marginTop: '1rem' }}
            >
              Reset
            </Button>
            <Select
              onValueChange={(value) => {
                const safeValue = Array.isArray(value) ? value : [value];
                handleFilterChange('sorting', safeValue);
              }}
            >
              <SelectTrigger className="w-full mt-4">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascending">Ascending</SelectItem>
                <SelectItem value="descending">Descending</SelectItem>
              </SelectContent>
            </Select>

            {/* Favourites Filter */}
            <div className="my-4 p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="favourites"
                    checked={filters.favourites}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        favourites: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-red-600 bg-background border-2 border-muted-foreground rounded focus:ring-red-500 dark:focus:ring-red-600 focus:ring-2 checked:bg-red-600 checked:border-red-600"
                  />
                </div>
                <label
                  htmlFor="favourites"
                  className="text-sm font-medium text-foreground cursor-pointer select-none flex items-center space-x-2"
                >
                  <span>❤️</span>
                  <span>Show Favourites Only</span>
                </label>
              </div>
            </div>

            <div className="my-4">
              <SkillDom
                heading="Filter by Project Domains"
                checkboxLabels={projectDomains}
                selectedValues={filters.projectDomain}
                setSelectedValues={(values) =>
                  handleFilterChange('projectDomain', values)
                }
                openItem={openItem}
                setOpenItem={setOpenItem}
                useAccordion={true}
              />
            </div>

            <div className="mb-4">
              <SkillDom
                heading="Filter by Skills"
                checkboxLabels={skills}
                selectedValues={filters.skills}
                setSelectedValues={(values) =>
                  handleFilterChange('skills', values)
                }
                openItem={openItem}
                setOpenItem={setOpenItem}
                useAccordion={true}
              />
            </div>
            <div className="mb-4 border rounded-lg p-4 bg-background shadow-sm">
              <Label className="mb-4 block text-lg font-medium text-foreground ">
                Filter by Rate
              </Label>
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <Label
                    htmlFor="minRate"
                    className="mb-1 text-sm text-muted-foreground"
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
                      const rawValue = Number(e.target.value);
                      const safeValue = Math.min(Math.max(rawValue, 0), 100000);
                      handleFilterChange('minRate', [safeValue.toString()]);
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <Label
                    htmlFor="maxRate"
                    className="mb-1 text-sm text-muted-foreground"
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
                      const rawValue = Number(e.target.value);
                      const safeValue = Math.min(Math.max(rawValue, 0), 100000);
                      handleFilterChange('maxRate', [safeValue.toString()]);
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <SkillDom
                heading="Filter by Domains"
                checkboxLabels={domains}
                selectedValues={filters.domain}
                setSelectedValues={(values) =>
                  handleFilterChange('domain', values)
                }
                openItem={openItem}
                setOpenItem={setOpenItem}
                useAccordion={true}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Right Content - Job Listings */}
        {isLoading ? (
          <div className="mt-4 lg:mt-0 space-y-4 w-full flex justify-center items-center h-[60vh]">
            <Loader2 size={40} className="text-primary animate-spin" />
          </div>
        ) : (
          <div className="mt-4 lg:mt-0 w-full flex justify-center">
            <ScrollArea className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] no-scrollbar overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 pb-20 lg:pb-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onNotInterested={() => handleRemoveJob(job._id)}
                      bidExist={
                        Array.isArray(job.profiles) &&
                        job.profiles.some((p: any) =>
                          bidProfiles.includes(p._id),
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-400">
                      No projects found matching your filters.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Mobile Filters Modal */}
      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-hidden">
          <div className="bg-secondary rounded-lg w-full max-w-screen-lg mx-auto h-[80vh] max-h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
              <h2 className="text-xl font-semibold"> Filters</h2>
              <Button variant="ghost" size="sm" onClick={handleModalToggle}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="overflow-y-auto p-4 flex-grow">
              <div className="border-b border-gray-300 pb-4">
                <MobileSkillDom
                  label="Domains"
                  heading="Filter by domain"
                  checkboxLabels={domains}
                  selectedValues={filters.domain}
                  setSelectedValues={(values) =>
                    handleFilterChange('domain', values)
                  }
                />
              </div>

              <div className="border-b border-gray-300 py-4">
                <MobileSkillDom
                  label="Skills"
                  heading="Filter by skills"
                  checkboxLabels={skills}
                  selectedValues={filters.skills}
                  setSelectedValues={(values) =>
                    handleFilterChange('skills', values)
                  }
                />
              </div>

              {/* Mobile Favourites Filter */}
              <div className="border-b border-gray-300 py-4">
                <div className="p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="mobile-favourites"
                        checked={filters.favourites}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            favourites: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-red-600 bg-background border-2 border-muted-foreground rounded focus:ring-red-500 dark:focus:ring-red-600 focus:ring-2 checked:bg-red-600 checked:border-red-600"
                      />
                    </div>
                    <label
                      htmlFor="mobile-favourites"
                      className="text-sm font-medium text-foreground cursor-pointer select-none flex items-center space-x-2"
                    >
                      <span>❤️</span>
                      <span>Show Favourites Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <MobileSkillDom
                  label="ProjectDomain"
                  heading="Filter by project-domain"
                  checkboxLabels={projectDomains}
                  selectedValues={filters.projectDomain}
                  setSelectedValues={(values) =>
                    handleFilterChange('projectDomain', values)
                  }
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-300">
              <div className="flex gap-3">
                <Button onClick={handleApply} className="flex-1">
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Toggle Button */}
      {isClient && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4 flex justify-center z-40">
          <button
            className="w-full max-w-xs p-3 bg-primary text-white dark:text-black rounded-md hover:bg-primary/90 transition-colors duration-300 ease-in-out shadow-lg font-medium"
            onClick={handleModalToggle}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Market;
