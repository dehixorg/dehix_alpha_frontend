'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyCardProps {
  heading: string;
  checkboxLabels: string[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
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
    <Card className="w-[250px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="items-center p-2">
          {checkboxLabels.map((label) => (
            <div key={label} className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={selectedValues.includes(label)}
                onChange={() => handleCheckboxChange(label)}
                className="mr-2"
              />
              <label className="text-sm">{label}</label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
