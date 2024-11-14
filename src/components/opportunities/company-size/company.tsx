'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="items-center p-2">
          {checkboxLabels.map((label) => (
            <div key={label} className="flex items-center mb-1">
              <Checkbox
                checked={selectedValues.includes(label)}
                onCheckedChange={() => handleCheckboxChange(label)}
                className="mr-2"
              />
              <Label className="text-sm">{label}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
