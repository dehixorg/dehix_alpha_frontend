import React from 'react';

import { Button } from '@/components/ui/button';
import MobileCompany from '@/components/opportunities/mobile-opport/mob-comp/mob-comp';
import MobileSkillDom from '@/components/opportunities/mobile-opport/mob-skills-domain/mob-skilldom';

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
  handleFilterChange: (filterType: string, selectedValues: string[]) => void;
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
      <div className="fixed bottom-0 left-0 right-0 lg:hidden p-4  flex justify-center z-50">
        <button
          className="w-full max-w-xs p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 ease-in-out"
          onClick={handleModalToggle}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
    </>
  );
};

export default MobileFilterModal;