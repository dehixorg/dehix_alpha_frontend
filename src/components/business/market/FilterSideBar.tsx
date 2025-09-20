import React from 'react';
import { Button } from '@/components/ui/button';
import CompanyCard from '@/components/opportunities/company-size/company';
import SkillDom from '@/components/opportunities/skills-domain/skilldom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
  experience: string[];
  minRate: string;
  maxRate: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  domains: string[];
  skills: string[];
  handleFilterChange: (
    filterType: string,
    selectedValues: string | string[],
  ) => void;
  handleReset: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  domains,
  skills,
  handleFilterChange,
  handleReset,
}) => {
  return (
    <div className="hidden mb-10 lg:block lg:sticky lg:top-16 lg:w-[400px] lg:self-start lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:transition-all lg:duration-300 lg:scrollbar no-scrollbar lg:scrollbar-thumb-gray-500 lg:scrollbar-track-gray-200 hover:lg:overflow-y-auto">
      <div className="h-full px-4 flex flex-col space-y-4">
        {/* Correctly wire the Apply button */}
        <Button
          
          className="w-full"
        >
          Apply Filters
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          style={{ marginTop: '1rem' }}
          className="w-full dark:text-white"
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
            heading="Filter by Domains"
            checkboxLabels={domains}
            selectedValues={filters.domain}
            setSelectedValues={(values) => handleFilterChange('domain', values)}
          />
        </div>
        <div className="mb-12">
          <SkillDom
            heading="Filter by Skills"
            checkboxLabels={skills}
            selectedValues={filters.skills}
            setSelectedValues={(values) => handleFilterChange('skills', values)}
          />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Filter by Rate</CardTitle>
          </CardHeader>
          <CardContent>
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
                  min={0}
                  max={100000}
                  aria-label="Minimum Rate"
                  placeholder="e.g. 10"
                  value={filters.minRate}
                  onChange={(e) => {
                    const rawValue = Number(e.target.value);
                    const safeValue = Math.min(Math.max(rawValue, 0), 100000);
                    handleFilterChange('minRate', [safeValue.toString()]);
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
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
                  min={0}
                  max={100000}
                  aria-label="Maximum Rate"
                  placeholder="e.g. 100"
                  value={filters.maxRate}
                  onChange={(e) => {
                    const rawValue = Number(e.target.value);
                    const safeValue = Math.min(Math.max(rawValue, 0), 100000);
                    handleFilterChange('maxRate', [safeValue.toString()]);
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FilterSidebar;
