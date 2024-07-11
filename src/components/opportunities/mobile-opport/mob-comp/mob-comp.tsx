'use client';
import * as React from 'react';

interface MobileCompanyProps {
  heading: string;
  checkboxLabels: string[];
}

const MobileCompany: React.FC<MobileCompanyProps> = ({
  heading,
  checkboxLabels,
}) => {
  const [checkboxStates, setCheckboxStates] = React.useState<boolean[]>(
    new Array(checkboxLabels.length).fill(false),
  );

  const handleCheckboxChange = (index: number) => {
    setCheckboxStates((prevStates) => {
      const newStates = new Array(prevStates.length).fill(false); // Reset all to false
      newStates[index] = true; // Set the clicked checkbox to true
      return newStates;
    });
  };

  return (
    <div>
      <h1 className="mt-2 text-black">{heading}</h1>
      <div className="items-center p-2">
        {checkboxLabels.map((label, index) => (
          <div key={index} className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={checkboxStates[index]}
              onChange={() => handleCheckboxChange(index)}
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
