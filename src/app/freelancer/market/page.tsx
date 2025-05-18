'use client';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, X } from 'lucide-react';

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

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface ProjectDomain {
  _id: string;
  label: string;
}

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    jobType: [],
    domain: [],
    skills: [],
    projects: [],
    projectDomain: [],
  });

  const [jobs, setJobs] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projectDomains, setProjectDomains] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(
    'Filter by Project Domains',
  );
  const [openSheet, setOpenSheet] = useState(false);
  const dispatch = useDispatch();

  // Load drafts once on mount (or you can load in parent component if multiple JobCards)
  useEffect(() => {
    const fetchProjectDrafts = async () => {
      try {
        const response = await axiosInstance.get('/freelancer/draft');
        dispatch(setDraftedProjects(response.data.projectDraft));
        return response.data.projectDraft || [];
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjectDrafts();
  }, [dispatch]);

  const handleFilterChange = (
    filterType: keyof FilterState,
    selectedValues: string[],
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: selectedValues,
    }));
  };

  const handleReset = () => {
    setFilters({
      jobType: [],
      domain: [],
      skills: [],
      projects: [],
      projectDomain: [],
    });
  };

  const constructQueryString = (filters: FilterState) => {
    return Object.keys(filters)
      .map((key) => {
        const values = filters[key as keyof FilterState];
        if (values.length > 0) {
          return `${key}=${values.join(',')}`;
        }
        return '';
      })
      .filter((part) => part !== '')
      .join('&');
  };

  // Fetch filter options (skills, domains, project domains)
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        setIsLoading(true);

        // Fetch skills
        const skillsResponse = await axiosInstance.get('/skills');
        const skillLabels = skillsResponse.data.data.map(
          (skill: Skill) => skill.label,
        );
        setSkills(skillLabels);

        // Fetch domains
        const domainsResponse = await axiosInstance.get('/domain');
        const domainLabels = domainsResponse.data.data.map(
          (domain: Domain) => domain.label,
        );
        setDomains(domainLabels);

        // Fetch project domains
        const projectDomainsResponse =
          await axiosInstance.get('/projectdomain');
        const projectDomainLabels = projectDomainsResponse.data.data.map(
          (projectDomain: ProjectDomain) => projectDomain.label,
        );
        setProjectDomains(projectDomainLabels);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load filter options. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilterOptions();
  }, []);

  // Fetch jobs with applied filters
  const fetchJobs = useCallback(
    async (appliedFilters: FilterState) => {
      try {
        setIsLoading(true);

        // Get freelancer details to check not interested projects
        const freelancerResponse = await axiosInstance.get(`/freelancer`);
        const freelancerDetails = freelancerResponse.data;

        // Construct query string from filters
        const queryString = constructQueryString(appliedFilters);

        // Fetch projects/jobs
        const jobsResponse = await axiosInstance.get(
          `/project/freelancer/${user.uid}?${queryString}`,
        );

        const fetchedJobs = jobsResponse?.data?.data || [];

        // Filter out not interested projects
        if (freelancerDetails) {
          const notInterestedProjects =
            freelancerDetails.notInterestedProject || [];
          const filteredJobs = fetchedJobs.filter(
            (job: Project) => !notInterestedProjects.includes(job._id),
          );
          setJobs(filteredJobs);
        } else {
          setJobs(fetchedJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load job listings. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user.uid],
  );

  const handleApply = () => {
    fetchJobs(filters);
  };

  // Initial data fetch
  useEffect(() => {
    setIsClient(true);
    fetchJobs(filters);
  }, [fetchJobs]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowFilters(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleModalToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleRemoveJob = async (id: string) => {
    try {
      // Mark project as not interested
      await axiosInstance.put(`/freelancer/${id}/not-interested_project`);

      // Remove from UI
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));

      toast({
        title: 'Success',
        description: 'Project marked as not interested',
      });
    } catch (error) {
      console.error('Error marking project as not interested:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update project status. Please try again.',
      });
    }
  };

  const handleApplyToJob = async (id: string) => {
    try {
      await axiosInstance.post(`/project/apply/${id}`);
      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });
    } catch (error) {
      console.error('Error applying to project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
      });
    }
  };

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
          <div className="mt-4 lg:mt-0 w-full">
            <ScrollArea className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] no-scrollbar overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 pb-20 lg:pb-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onApply={() => handleApplyToJob(job._id)}
                      onNotInterested={() => handleRemoveJob(job._id)}
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
