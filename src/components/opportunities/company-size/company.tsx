'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface CompanyCardProps {
  heading: string;
  setLimits: (limit: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ heading, setLimits }) => {
  const { toast } = useToast();

  const [lowerLimit, setLowerLimit] = React.useState<number>(0);
  const [higherLimit, setHigherLimit] = React.useState<number>(10);

  const validateAndSetLimits = (lower: number, higher: number) => {
    if (lower < 0 || higher < 0) {
      toast({
        title: 'Invalid Input',
        description: 'Experience cannot be negative.',
        variant: 'destructive',
      });
      return;
    }
    if (higher > 30) {
      toast({
        title: 'Invalid Input',
        description: 'Maximum experience cannot exceed 30 years.',
        variant: 'destructive',
      });
      return;
    }
    if (lower > higher && higher !== 0) {  
      toast({
        title: 'Invalid Range',
        description: 'Minimum cannot be greater than Maximum.',
        variant: 'destructive',
      });
      return;
    }
  
    setLowerLimit(lower);
    setHigherLimit(higher);
    setLimits(`${lower}-${higher}`);
  };  

  const handleLowerLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLowerLimit = Number(e.target.value);
    validateAndSetLimits(newLowerLimit, higherLimit);
  };

  const handleHigherLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHigherLimit = Number(e.target.value);
    validateAndSetLimits(lowerLimit, newHigherLimit);
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
    </Card>
  );
};

export default CompanyCard;
