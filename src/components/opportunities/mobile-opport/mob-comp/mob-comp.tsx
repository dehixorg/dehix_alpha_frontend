'use client';
import * as React from 'react';

interface MobileCompanyProps {
  heading: string;
  checkboxLabels: string[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
}

const MobileCompany: React.FC<MobileCompanyProps> = ({
  heading,
  checkboxLabels,
  selectedValues,
  setSelectedValues,
}) => {
  const handleCheckboxChange = (label: string) => {
    if (selectedValues.includes(label)) {
      setSelectedValues([]);
    } else {
      setSelectedValues([label]);
    }
  };

  return (
    <div>
      <h1 className="mt-2 text-black">{heading}</h1>
      <div className="items-center p-2">
        {checkboxLabels.map((label) => (
          <div key={label} className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={selectedValues.includes(label)}
              onChange={() => handleCheckboxChange(label)}
              className="mr-2"
            />
            <label className="text-sm text-black">{label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileCompany;
