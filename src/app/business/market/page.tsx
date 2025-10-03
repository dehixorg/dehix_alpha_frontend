 client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
import {'use
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import { notifyError } from '@/utils/toastMessage';
import FreelancerList from '@/components/business/market/FreelancerList';
import { BusinessFilterSheet } from '@/components/business/market/BusinessFilterSheet';
import Header from '@/components/header/header';
import BusinessFilterComponent from '@/components/business/market/BusinessFilterComponent';

export interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  experience: string[];
  minRate: string;
  maxRate: string;
}

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
  const locations = ['Remote', 'On-site', 'Hybrid'];
  const experiences = ['Entry', 'Intermediate', 'Senior', 'Lead'];
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    domain: [],
    skills: [],
    minRate: '',
    maxRate: '',
  });
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleReset = () => {
    setFilters({
      location: [],
      jobType: [],
      experience: [],
      domain: [],
      skills: [],
      minRate: '',
      maxRate: '',
    });
  };

  const getActiveFilterCount = (filters: FilterState) => {
    return (
      filters.skills.length +
      filters.domain.length +
      filters.experience.length +
      filters.jobType.length +
      filters.location.length +
      (filters.minRate ? 1 : 0) +
      (filters.maxRate ? 1 : 0)
    );
  };

  const activeFilterCount = getActiveFilterCount(filters);

  const constructQueryString = (filters: FilterState) => {
    const queryParts: string[] = [];

    if (Array.isArray(filters.experience) && filters.experience.length > 0) {
      const sortedExperience = filters.experience
        .map(Number)
        .sort((a, b) => a - b);
      const from = sortedExperience[0];
      const to = sortedExperience[sortedExperience.length - 1];

      if (from !== undefined) queryParts.push(`workExperienceFrom=${from}`);
      if (to !== undefined) queryParts.push(`workExperienceTo=${to}`);
    }

    //   Object.entries(filters).forEach(([key, value]) => {
    //     // Skip experience as it's already handled above
    //     if (key === 'experience') return;

    //     // Skip minRate and maxRate if they are empty strings
    //     if ((key === 'minRate' || key === 'maxRate') && value === '') return;

    //   if (Array.isArray(value) && value.length > 0) {
    //     const cleanedValues = value.filter((v) => v !== undefined && v !== null && v !== "");
    //     if (cleanedValues.length > 0) {
    //       queryParts.push(`${key}=${cleanedValues.join(",")}`);
    //     }
    //   } else if (typeof value === "string" && value.trim() !== "") {
    //     queryParts.push(
    //       `${key}=${value
    //         .split(",")
    //         .map((v) => v.trim())
    //         .join(",")}`,
    //     );
    //   }
    // });

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'experience') return;

      if ((key === 'minRate' || key === 'maxRate') && value === '') return;

      if (Array.isArray(value) && value.length > 0) {
        const cleanedValues = value.filter(
          (v) => v !== undefined && v !== null && v !== '',
        );
        if (cleanedValues.length > 0) {
          queryParts.push(`${key}=${cleanedValues.join(',')}`);
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        if (key === 'minRate' || key === 'maxRate') {
          queryParts.push(`${key}=${Number(value)}`);
        } else {
          queryParts.push(
            `${key}=${value
              .split(',')
              .map((v) => v.trim())
              .join(',')}`,
          );
        }
      }
    });

    return queryParts.join('&');
  };

  const fetchData = useCallback(async (appliedFilters: FilterState) => {
    try {
      setIsDataLoading(true);
      const queryString = constructQueryString(appliedFilters);
      const response = await axiosInstance.get(`/freelancer?${queryString}`);

      setFreelancers(response.data.data);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
      console.error('API Error:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  //Working fine
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const skillsResponse = await axiosInstance.get('/skills');
        const skillLabels = skillsResponse.data.data.map(
          (skill: any) => skill.label,
        );
        setSkills(skillLabels);

        const domainsResponse = await axiosInstance.get('/domain');
        const domainLabels = domainsResponse.data.data.map(
          (domain: any) => domain.label,
        );
        setDomains(domainLabels);
      } catch (error) {
        notifyError('Something went wrong. Please try again.', 'Error');
        console.error('Error fetching data:', error);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [user.uid, filters, fetchData]);

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 1024);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 mb-8 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Market"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/business/dashboard' },
            { label: 'Market', link: '/business/market' },
          ]}
        />
        <div className="flex flex-col sm:gap-4">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col space-y-2">
                <h1 className="hidden md:block text-2xl sm:text-3xl font-bold tracking-tight">
                  Business Marketplace
                </h1>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight block md:hidden">
                  Business Marketplace
                </h1>
                <p className="hidden md:block text-muted-foreground">
                  Discover and hire vetted freelancers for your projects.
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {!isLargeScreen && (
                  <BusinessFilterSheet
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    activeFilterCount={activeFilterCount}
                    skills={skills}
                    domains={domains}
                    experiences={experiences}
                    jobTypes={jobTypes}
                    locations={locations}
                    onReset={handleReset}
                  />
                )}
              </div>
              <div className="flex items-center justify-between px-1 mb-4">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground ml-auto">
                  {freelancers.length}{' '}
                  {freelancers.length === 1 ? 'result' : 'results'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden px-4 sm:px-8 pb-8">
            {isLargeScreen && (
              <aside className="w-80 flex-shrink-0 pr-6">
                <BusinessFilterComponent
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleReset}
                  activeFilterCount={activeFilterCount}
                  skills={skills}
                  domains={domains}
                  locations={locations}
                  jobTypes={jobTypes}
                  experiences={experiences}
                />
              </aside>
            )}
            <div className="flex-1 overflow-y-auto">
              <FreelancerList
                freelancers={freelancers}
                isLoading={isDataLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Market;
