'use client';
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';

import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';
import MobileCompany from '@/components/opportunities/mobile-opport/mob-comp/mob-comp';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/dashboardMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import JobCard from '@/components/opportunities/jobs/jobs';

interface FilterState {
  jobType: string[];
  domain: string[];
  skills: string[];
}

interface Project {
  _id: string;
  projectName: string;
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
    status?: string;
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

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    jobType: [],
    domain: [],
    skills: [],
  });
  const [jobs, setJobs] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);

  const handleFilterChange = (filterType: any, selectedValues: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: selectedValues,
    }));
  };

  const constructQueryString = (filters: FilterState) => {
    const query = Object.keys(filters)
      .map((key) => {
        const values = filters[key as keyof FilterState];
        if (values.length > 0) {
          return `${key}=${values.join(',')}`;
        }
        return '';
      })
      .filter((part) => part !== '')
      .join('&');

    return query;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        const skillLabels = skillsResponse.data.data.map(
          (skill: Skill) => skill.label,
        );
        setSkills(skillLabels);

        const domainsResponse = await axiosInstance.get('/domain/all');
        const domainLabels = domainsResponse.data.data.map(
          (domain: Domain) => domain.label,
        );
        setDomains(domainLabels);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const fetchData = async (appliedFilters: FilterState) => {
    try {
      const queryString = constructQueryString(appliedFilters);
      const response = await axiosInstance.get(
        `/business/all_project?${queryString}`,
      );
      setJobs(response.data.data);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleApply = () => {
    console.log('Selected Filters:', filters);
    fetchData(filters);
  };

  useEffect(() => {
    setIsClient(true);
    fetchData(filters); // Fetch all data initially
  }, [user.uid]);

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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Market"
          />

          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '/dashboard/freelancer' },
              { label: 'Freelancer Market', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownProfile />
        </header>
      </div>
      <div className="flex flex-col lg:flex-row lg:space-x-4 ml-4 lg:ml-20 md:ml-20 md:-space-x-3 pr-4 sm:pr-5">
        <div className="hidden lg:block lg:sticky lg:top-16 lg:w-[400px] lg:self-start lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:transition-all lg:duration-300 lg:scrollbar lg:scrollbar-thumb-gray-500 lg:scrollbar-track-gray-200 hover:lg:overflow-y-auto">
          <Button onClick={handleApply} className="w-[80%]">
            Apply
          </Button>
          <div className="mb-4 mt-4">
            <SkillDom
              label="Domains"
              heading="Filter by domain"
              checkboxLabels={domains}
              selectedValues={filters.domain}
              setSelectedValues={(values) =>
                handleFilterChange('domain', values)
              }
            />
          </div>
          <div className="mb-4">
            <SkillDom
              label="Skills"
              heading="Filter by skills"
              checkboxLabels={skills}
              selectedValues={filters.skills}
              setSelectedValues={(values) =>
                handleFilterChange('skills', values)
              }
            />
          </div>
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-10 space-y-4 w-full">
          {jobs.map((job: Project, index: number) => (
            <JobCard
              key={index}
              id={job._id}
              projectName={job.projectName}
              description={job.description}
              companyName={job.companyName}
              email={job.email}
              skillsRequired={job.skillsRequired}
              status={job.status}
              team={job.team}
            />
          ))}
        </div>
      </div>

      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-hidden">
          <div className="bg-white rounded-lg w-full max-w-screen-lg mx-auto h-[80vh] max-h-full flex flex-col">
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

              <div className="border-b border-gray-300 pb-4">
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
            </div>
            <div className="p-4 border-t border-gray-300">
              <Button onClick={handleApply} className="w-full">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
      {isClient && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4 flex justify-center z-50">
          <button
            className="w-full max-w-xs p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out"
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
