'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';
import MarketHeader from '@/components/business/market/MarketHeader';
import FilterSidebar from '@/components/business/market/FilterSideBar';
import FreelancerList from '@/components/business/market/FreelancerList';
import MobileFilterModal from '@/components/business/market/MobileFilterModal';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  experience: string[];
}

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    domain: [],
    skills: [],
  });

  const handleFilterChange = (
    filterType: string,
    selectedValues: string | string[],
  ) => {
    let transformedValues: string | string[] = selectedValues;
    console.log(filterType);
    console.log(selectedValues);

    const values = Array.isArray(selectedValues)
      ? selectedValues
      : [selectedValues];

    transformedValues = values.flatMap((value) => {
      // Check for experience ranges like "0-2", "3-6", "7+" and split them
      if (value.includes('-')) {
        const [start, end] = value.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) =>
          (start + i).toString(),
        );
      }
      if (value === '7+') {
        return ['7', '8', '9', '10']; // Return as strings
      }
      return [value];
    });

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: transformedValues,
    }));
  };

  const handleReset = () => {
    setFilters({
      location: [],
      jobType: [],
      domain: [],
      skills: [],
      experience: [],
    });
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

  const fetchData = useCallback(async (appliedFilters: FilterState) => {
    try {
      setIsDataLoading(true);
      const queryString = constructQueryString(appliedFilters);
      const response = await axiosInstance.get(`/freelancer?${queryString}`);
      console.log(response);

      setFreelancers(response.data.data);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

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
        console.error('Error fetching data:', error);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData(filters); // Fetch all data initially
  }, [user.uid, filters, fetchData]);

  const handleApply = () => {
    fetchData(filters);
  };

  const handleModalToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <section className="p-3 relative sm:pl-6">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <CollapsibleSidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="ml-12">
        <MarketHeader />
        <div className="flex flex-col lg:flex-row lg:space-x-5 md:-space-x-3 ml:20 sm:-space-x-4 -ml-12 md:ml-6 lg:ml-6">
          <FilterSidebar
            filters={filters}
            domains={domains}
            skills={skills}
            handleFilterChange={handleFilterChange}
            handleApply={handleApply}
            handleReset={handleReset}
          />
          {isDataLoading ? (
            <div className="mt-4 lg:mt-0 lg:ml-10 space-y-4 w-full flex justify-center items-center h-[60vh]">
              <Loader2 size={40} className=" text-white animate-spin " />
            </div>
          ) : (
            <FreelancerList freelancers={freelancers} />
          )}
        </div>
      </div>
      <MobileFilterModal
        showFilters={showFilters}
        filters={filters}
        domains={domains}
        skills={skills}
        handleFilterChange={handleFilterChange}
        handleApply={handleApply}
        handleModalToggle={handleModalToggle}
      />
    </section>
  );
};

export default Market;
