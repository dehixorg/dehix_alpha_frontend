import React from 'react';

import { Button } from '@/components/ui/button';
import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
}
interface FilterSidebarProps {
  filters: FilterState;
  domains: string[];
  skills: string[];
  handleFilterChange: (filterType: string, selectedValues: string[]) => void;
  handleApply: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  domains,
  skills,
  handleFilterChange,
  handleApply,
}) => {
  return (
    <div className="hidden lg:block lg:space-y-4">
      <Button onClick={handleApply} className="w-[100%]">
        Apply
      </Button>
      <div className="mb-4">
        <CompanyCard
          heading="Filter by experience"
          checkboxLabels={['0-2', '3-6', '7+']}
          selectedValues={filters.jobType}
          setSelectedValues={(values) => handleFilterChange('jobType', values)}
        />
      </div>
      <div className="mb-4">
        <SkillDom
          label="Domains"
          heading="Filter by domains"
          checkboxLabels={domains}
          selectedValues={filters.domain}
          setSelectedValues={(values) => handleFilterChange('domain', values)}
        />
      </div>
      <div className="mb-4">
        <SkillDom
          label="Skills"
          heading="Filter by skills"
          checkboxLabels={skills}
          selectedValues={filters.skills}
          setSelectedValues={(values) => handleFilterChange('skills', values)}
        />
      </div>
    </div>
  );
};

export default FilterSidebar;
