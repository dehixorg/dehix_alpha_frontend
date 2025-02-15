import React from 'react';

import { Button } from '@/components/ui/button';
import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  experience: string[];
}
interface FilterSidebarProps {
  filters: FilterState;
  domains: string[];
  skills: string[];
  handleFilterChange: (
    filterType: string,
    selectedValues: string | string[],
  ) => void;
  handleApply: () => void;
  handleReset: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  domains,
  skills,
  handleFilterChange,
  handleApply,
  handleReset,
}) => {
  const handleSubmit = () => {
    handleApply();
  };

  return (
    <div className="hidden mb-10 lg:block lg:sticky lg:top-16 lg:w-[400px] lg:self-start lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:transition-all lg:duration-300 lg:scrollbar  no-scrollbar lg:scrollbar-thumb-gray-500 lg:scrollbar-track-gray-200 hover:lg:overflow-y-auto">
      <div className="h-full px-4 flex flex-col space-y-4 ">
        <Button
          onClick={() => {
            handleSubmit();
          }}
          className="w-full"
        >
          Apply
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          style={{ marginTop: '1rem' }}
          className="w-full dark:text-white "
        >
          Reset
        </Button>
        <div className="mb-4">
          <CompanyCard
            heading="Filter by Experience"
            setLimits={(values) => handleFilterChange('experience', values)}
          />
        </div>
        <div className="mb-4">
          <SkillDom
            label="Domains"
            heading="Filter by Domains"
            checkboxLabels={domains}
            selectedValues={filters.domain}
            setSelectedValues={(values) => handleFilterChange('domain', values)}
          />
        </div>
        <div className="mb-12">
          <SkillDom
            label="Skills"
            heading="Filter by Skills"
            checkboxLabels={skills}
            selectedValues={filters.skills}
            setSelectedValues={(values) => handleFilterChange('skills', values)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
