'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanyCardProps {
  heading: string;
  setLimits: (limit: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ heading, setLimits }) => {
  const [lowerLimit, setLowerLimit] = React.useState<string>('');
  const [higherLimit, setHigherLimit] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const validateAndSetLimits = (lower: string, higher: string) => {
    const lowerValue = lower ? Number(lower) : 0;
    const higherValue = higher ? Number(higher) : 0;

    if (lowerValue < 0 || higherValue < 0) {
      setError('Experience cannot be negative.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (higherValue > 30) {
      setError('Maximum experience cannot exceed 30 years.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (lowerValue > higherValue && higher !== '') {
      setError('Please enter the maximum experience first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setLowerLimit(lower);
    setHigherLimit(higher);
    setLimits(`${lower || 0}-${higher || 0}`);
  };

  return (
    <Card className="w-full">
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
              onChange={(e) => validateAndSetLimits(e.target.value, higherLimit)}
              className="w-20 mt-1"
              placeholder="0"
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
              onChange={(e) => validateAndSetLimits(lowerLimit, e.target.value)}
              className="w-20 mt-1"
              placeholder="30"
            />
          </div>
        </div>

        {/* Validation message below inputs */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
