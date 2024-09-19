'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

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
  projectDomain:string[];
}

const Market: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [projectDomain, setProjectDomain] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    domain: [],
    skills: [],
    projectDomain:[],
  });

  const handleFilterChange = (filterType: string, selectedValues: string[]) => {
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

  const fetchData = useCallback(async (appliedFilters: FilterState) => {
    try {
      const queryString = constructQueryString(appliedFilters);
      const response = await axiosInstance.get(
        `/freelancer/allfreelancer?${queryString}`,
      );
      setFreelancers(response.data.data);
    } catch (error) {
      console.error('API Error:', error);
    }
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        const skillLabels = skillsResponse.data.data.map(
          (skill: any) => skill.label,
        );
        setSkills(skillLabels);

        const domainsResponse = await axiosInstance.get('/domain/all');
        const domainLabels = domainsResponse.data.data.map(
          (domain: any) => domain.label,
        );
        setDomains(domainLabels);

        const projectDomainResponse = await axiosInstance.get('/projectDomain/all');
        const projectDomainLabels = projectDomainResponse.data.data.map(
          (projectDomain: any) => projectDomain.label,
        );
        setProjectDomain(projectDomainLabels);
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
    <section className="p-3 relative">
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
            projectDomain={projectDomain}
            handleFilterChange={handleFilterChange}
            handleApply={handleApply}
          />
          <FreelancerList freelancers={freelancers} />
        </div>
      </div>
      <MobileFilterModal
        showFilters={showFilters}
        filters={filters}
        domains={domains}
        skills={skills}
        projectDomain={projectDomain}
        handleFilterChange={handleFilterChange}
        handleApply={handleApply}
        handleModalToggle={handleModalToggle}
      />
    </section>
  );
};

export default Market;
