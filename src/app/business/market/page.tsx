'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import SidebarMenu from '@/components/menu/sidebarMenu';
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
import { toast } from '@/components/ui/use-toast';

interface FilterState {
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
    minRate: '',
    maxRate: '',
  });

  const handleFilterChange = (
    filterType: string,
    selectedValues: string | string[],
  ) => {
    let transformedValues: string | string[] = selectedValues;

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
      minRate: '',
      maxRate: '',
    });
  };

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

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'experience') return;

      if (Array.isArray(value) && value.length > 0) {
        const cleanedValues = value.filter(
          (v) => v !== undefined && v !== null && v !== '',
        );
        if (cleanedValues.length > 0) {
          queryParts.push(`${key}=${cleanedValues.join(',')}`);
        }
      } else if (typeof value === 'string') {
        queryParts.push(
          `${key}=${value
            .split(',')
            .map((v) => v.trim())
            .join(',')}`,
        );
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('Error fetching data:', error);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData(filters); // Fetch all data initially
  }, [user.uid, filters, fetchData]);

  const handleModalToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <section className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Market"
      />
      <div className="flex flex-col sm:gap-4  sm:pl-14 mb-8">
        <MarketHeader />
        <div className="flex flex-col lg:flex-row lg:space-x-5 md:-space-x-3 ml:20 sm:-space-x-4 md:ml-6 lg:ml-6">
          <FilterSidebar
            filters={filters}
            domains={domains}
            skills={skills}
            handleFilterChange={handleFilterChange}
            handleReset={handleReset}
          />
          <FreelancerList freelancers={freelancers} isLoading={isDataLoading} />
        </div>
      </div>
      <MobileFilterModal
        showFilters={showFilters}
        filters={filters}
        domains={domains}
        skills={skills}
        handleFilterChange={handleFilterChange}
        handleModalToggle={handleModalToggle}
      />
    </section>
  );
};

export default Market;
