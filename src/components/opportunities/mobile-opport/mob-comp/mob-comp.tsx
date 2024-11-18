'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Importing the input component from ShadCN UI
import { Label } from '@/components/ui/label';

interface CompanyCardProps {
  heading: string;
  setLimits: (limit: string) => void; // To pass the selected limit range back to the parent
}

const CompanyCard: React.FC<CompanyCardProps> = ({ heading, setLimits }) => {
  // Use state to manage lower and higher limits internally
  const [lowerLimit, setLowerLimit] = React.useState<number>(0);
  const [higherLimit, setHigherLimit] = React.useState<number>(10);

  const handleLowerLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLowerLimit = Number(e.target.value);
    setLowerLimit(newLowerLimit);
    setLimits(`${newLowerLimit}-${higherLimit}`);
  };

  const handleHigherLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHigherLimit = Number(e.target.value);
    setHigherLimit(newHigherLimit);
    setLimits(`${lowerLimit}-${newHigherLimit}`);
  };

  return (
    <div className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 p-2">
          {/* Lower limit input */}
          <div className="flex flex-col">
            <Label htmlFor="lowerLimit" className="text-sm">
              Minimum
            </Label>
            <Input
              id="lowerLimit"
              type="number"
              value={lowerLimit}
              onChange={handleLowerLimitChange}
              className="w-20 mt-1"
            />
          </div>

          {/* Higher limit input */}
          <div className="flex flex-col">
            <Label htmlFor="higherLimit" className="text-sm">
              Maximum
            </Label>
            <Input
              id="higherLimit"
              type="number"
              value={higherLimit}
              onChange={handleHigherLimitChange}
              className="w-20 mt-1"
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default CompanyCard;
