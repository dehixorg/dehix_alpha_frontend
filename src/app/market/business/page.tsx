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
} from '@/config/menuItems/business/dashboardMenuItems';
import Breadcrumb from '@/components/shared/breadcrumbList';
import DropdownProfile from '@/components/shared/DropdownProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import FreelancerCard from '@/components/opportunities/freelancer/freelancerCard';
import { RootState } from '@/lib/store';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
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
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);

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
  const [filters, setFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    domain: [],
    skills: [],
  });
  const handleFilterChange = (filterType: any, selectedValues: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: selectedValues,
    }));
  };

  const fetchData = async (appliedFilters: FilterState) => {
    try {
      const queryString = constructQueryString(appliedFilters);
      const response = await axiosInstance.get(
        `/freelancer/allfreelancer?${queryString}`,
      );
      console.log(response.data.data);
      setFreelancers(response.data.data);
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
        active="Dashboard"
      />
      <div className="ml-12">
        <div className="mb-6 mt-4 ">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background  sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Breadcrumb
              items={[
                { label: 'Dashboard', link: '/dashboard/business' },
                { label: 'Freelancers Marketplace', link: '#' },
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
        <div className="flex flex-col lg:flex-row lg:space-x-5 md:-space-x-3 ml:20 sm:-space-x-4 -ml-12 md:ml-6 lg:ml-6">
          <div className="hidden lg:block lg:space-y-4">
            <Button onClick={handleApply} className="w-[100%]">
              Apply
            </Button>

            <div className="mb-4">
              <CompanyCard
                heading="Filter by experience"
                checkboxLabels={['0-2', '3-6', '7+']}
                selectedValues={filters.jobType}
                setSelectedValues={(values) =>
                  handleFilterChange('jobType', values)
                }
              />
            </div>
            <div className="mb-4">
              <SkillDom
                label="Domains"
                heading="Filter by domains"
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
            {freelancers.map((freelancer: any, index: number) => (
              <FreelancerCard
                key={index}
                name={freelancer.firstName + ' ' + freelancer.lastName}
                skills={freelancer.skills}
                domains={freelancer.domains}
                experience={freelancer.workExperience}
              />
            ))}
          </div>
        </div>
      </div>

      {isClient && showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 m-20">
          <div className="bg-white p-4 rounded-lg w-full max-w-screen-lg mx-auto item-center">
            <div className="border-b border-gray-300 pb-4">
              <Button onClick={handleApply} className="w-[100%]">
                Apply
              </Button>

              <MobileSkillDom
                label="Locations"
                heading="Filter by location"
                checkboxLabels={[
                  'All',
                  'Banglore',
                  'Pune',
                  'Noida',
                  'Delhi',
                  'Gurugram',
                ]}
                selectedValues={filters.location}
                setSelectedValues={(values) =>
                  handleFilterChange('location', values)
                }
              />
            </div>

            <div className="border-b border-gray-300 pb-4">
              <MobileCompany
                heading="Filter by experience"
                checkboxLabels={['0-2', '3-6', '7+']}
                selectedValues={filters.jobType}
                setSelectedValues={(values) =>
                  handleFilterChange('jobType', values)
                }
              />
            </div>

            <div className="border-b border-gray-300 pb-4">
              <MobileSkillDom
                label="Domains"
                heading="Filter by domains"
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
        </div>
      )}
      {isClient && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4  flex justify-center z-50">
          <button
            className="w-full max-w-xs p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out"
            onClick={handleModalToggle}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      )}
    </section>
  );
};

export default Market;
