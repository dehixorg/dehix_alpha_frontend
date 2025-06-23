'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { RootState } from '@/lib/store';
import JobCard from '@/components/opportunities/jobs/jobs';
import { StatusEnum } from '@/utils/freelancer/enum';
import Header from '@/components/header/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FilterState {
  projects: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  projectDomain: string[];
  sorting: string[];
  minRate: string;
  maxRate: string;
}

interface Project {
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
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: StatusEnum;
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
  }[];
  status?: string;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Skill {
  label: string;
}

interface Domain {
  label: string;
}
interface ProjectsDomain {
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
    sorting: [],
    minRate: '',
    maxRate: '',
  });

  const [jobs, setJobs] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectsDomain[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [isgetJobLoading, setIsJobLoading] = useState(false);

  const handleFilterChange = (filterType: any, selectedValues: any) => {
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
      sorting: [],
      minRate: '',
      maxRate: '',
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
        return '';
      })
      .filter(Boolean)
      .join('&');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsJobLoading(true);
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
        const projectResponse = await axiosInstance.get('/projectdomain');
        const projectData: ProjectsDomain[] = projectResponse.data.data;
        setProjects(projectData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      } finally {
        setIsJobLoading(false);
      }
    }
    fetchData();
  }, []);

  const fetchData = useCallback(
    async (appliedFilters: FilterState) => {
      try {
        const freelancerDetails = await axiosInstance.get(`/freelancer`);
        const queryString = constructQueryString(appliedFilters);
        const getJobs = await axiosInstance.get(
          `/project/freelancer/${user.uid}?${queryString}`,
        );

        const jobs = getJobs?.data?.data;

        if (freelancerDetails?.data && jobs) {
          const notInterestedProjects =
            freelancerDetails.data.notInterestedProject || [];
          const filteredJobs = jobs.filter(
            (job: Project) => !notInterestedProjects.includes(job._id),
          );
          setJobs(filteredJobs);
        }
      } catch (error) {
        console.error('API Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
      }
    },
    [user.uid],
  );

  const handleApply = () => {
    fetchData(filters);
  };
  useEffect(() => {
    setIsClient(true);
    fetchData(filters); // Fetch all data initially
  }, [filters, fetchData]);

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

  const handleRemoveJob = (id: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));
  };

  return (
    <div className="flex min-h-screen w-full flex-col sm:pl-6 pb-10">
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
        <div className="mb-8 ml-4 sm:ml-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Freelancer Marketplace
          </h1>
          <p className="text-gray-400 mt-2 hidden sm:block">
            Discover and manage your freelance opportunities, connect with
            potential projects, and filter by skills, domains and project
            domains to enhance your portfolio.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-6 px-4 lg:px-20 md:px-8">
        {/* Left Sidebar Scroll */}
        <div className="hidden lg:block lg:sticky lg:top-16 lg:w-1/3 xl:w-1/4 lg:self-start lg:h-[calc(100vh-4rem)]">
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
              onValueChange={(value) => handleFilterChange('sorting', value)}
            >
              <SelectTrigger className="w-full mt-4">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascending">Ascending</SelectItem>
                <SelectItem value="descending">Descending</SelectItem>
              </SelectContent>
            </Select>

            <div className="my-4">
              <SkillDom
                label="ProjectDomain"
                heading="Filter by Project Domains"
                checkboxLabels={projects.map((project) => project.label)}
                selectedValues={filters.projectDomain}
                setSelectedValues={(values) =>
                  handleFilterChange('projectDomain', values)
                }
              />
            </div>

            <div className="mb-4">
              <SkillDom
                label="Skills"
                heading="Filter by Skills"
                checkboxLabels={skills}
                selectedValues={filters.skills}
                setSelectedValues={(values) =>
                  handleFilterChange('skills', values)
                }
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
                    placeholder="e.g. 10"
                    value={filters.minRate}
                    onChange={(e) =>
                      handleFilterChange('minRate', e.target.value)
                    }
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
                    placeholder="e.g. 100"
                    value={filters.maxRate}
                    onChange={(e) =>
                      handleFilterChange('maxRate', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <SkillDom
                label="Domains"
                heading="Filter by Domains"
                checkboxLabels={domains}
                selectedValues={filters.domain}
                setSelectedValues={(values) =>
                  handleFilterChange('domain', values)
                }
              />
            </div>
          </ScrollArea>
        </div>

        {/* Right Content Scroll */}
        {isgetJobLoading ? (
          <div className="mt-4 lg:mt-0 space-y-4 w-full flex justify-center items-center h-[60vh]">
            <Loader2 size={40} className="text-white animate-spin" />
          </div>
        ) : (
          <div className="mt-4 lg:mt-0 w-full flex justify-center">
            <ScrollArea className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] no-scrollbar overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 pb-20 lg:pb-4">
                {jobs.map((job: Project, index: number) => (
                  <JobCard
                    key={index}
                    id={job._id}
                    companyId={job.companyId}
                    projectName={job.projectName}
                    description={job.description}
                    companyName={job.companyName}
                    email={job.email}
                    skillsRequired={job.skillsRequired}
                    status={job.status}
                    profiles={job.profiles || []}
                    onRemove={handleRemoveJob}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Modal for Filters */}
      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-hidden">
          <div className="bg-secondary rounded-lg w-full max-w-screen-lg mx-auto h-[80vh] max-h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
              <h2 className="text-xl font-semibold">Filters</h2>
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
                  setSelectedValues={(values: any) =>
                    handleFilterChange('skills', values)
                  }
                />
              </div>
              <div className="pt-4">
                <MobileSkillDom
                  label="ProjectDomain"
                  heading="Filter by project-domain"
                  checkboxLabels={projects.map((project) => project.label)}
                  selectedValues={filters.projectDomain}
                  setSelectedValues={(values: any) =>
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
            className="w-full max-w-xs p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 ease-in-out shadow-lg font-medium"
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
