import React from 'react';

import { Button } from '@/components/ui/button';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';
import CompanyCard from '@/components/opportunities/mobile-opport/mob-comp/mob-comp';

interface FilterState {
  location: string[];
  jobType: string[];
  domain: string[];
  skills: string[];
}

interface MobileFilterModalProps {
  showFilters: boolean;
  filters: FilterState;
  domains: string[];
  skills: string[];
  handleFilterChange: (
    filterType: string,
    selectedValues: string | string[],
  ) => void;
  handleApply: () => void;
  handleModalToggle: () => void;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  showFilters,
  filters,
  domains,
  skills,
  handleFilterChange,
  handleApply,
  handleModalToggle,
}) => {
  return (
    <>
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-hidden">
          <div className="bg-black rounded-lg w-full max-w-screen-lg mx-auto h-[80vh] max-h-full flex flex-col">
            <div className="overflow-y-auto p-4 flex-grow">
              <div className="border-b border-gray-300 pb-4 ">
                <CompanyCard
                  heading="Filter by Experience"
                  setLimits={(values) =>
                    handleFilterChange('experience', values)
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
            <div className="p-4 border-t border-gray-300">
              <Button onClick={handleApply} className="w-full">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
      {
        <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4 flex justify-center z-50">
          <button
            className="w-full max-w-xs p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out"
            onClick={handleModalToggle}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      }
    </>
  );
};

export default MobileFilterModal;
