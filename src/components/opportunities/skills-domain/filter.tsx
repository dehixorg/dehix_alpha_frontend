'use client';
import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FilterProps {
  label: string;
  heading: string;
  checkboxLabels: any[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
}

const Filter: React.FC<FilterProps> = ({
  label,
  heading,
  checkboxLabels,
  selectedValues,
  setSelectedValues,
}) => {
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const handleCheckboxChange = (label: string) => {
    if (selectedValues.includes(label)) {
      setSelectedValues(selectedValues.filter((item) => item !== label));
    } else {
      setSelectedValues([...selectedValues, label]);
    }
  };
  const filteredSkills = checkboxLabels.filter((label) =>
    label?.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const visibleSkills = filteredSkills.slice(0, 3);
  const hiddenSkills = filteredSkills.slice(3);

  return (
    <Card className="w-[250px]">
      <CardContent>
        <h1 className="mt-2">{heading}</h1>
        <div className="items-center p-2">
          <Input
            placeholder={`Search ${label}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          {visibleSkills.map((label) => (
            <div key={label} className="flex items-center space-x-2 mb-1">
              <Checkbox
                id={label}
                checked={selectedValues.includes(label)}
                onCheckedChange={() => handleCheckboxChange(label)}
              />
              <Label htmlFor={label} className="text-sm">
                {label}
              </Label>
            </div>
          ))}

          {showMore &&
            hiddenSkills.map((label) => (
              <div key={label} className="flex items-center space-x-2 mb-1">
                <Checkbox
                  id={label}
                  checked={selectedValues.includes(label)}
                  onCheckedChange={() => handleCheckboxChange(label)}
                />
                <Label htmlFor={label} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          {filteredSkills.length > 3 && (
            <div className="flex items-center mb-1">
              <button
                className="text-sm text-blue-500 cursor-pointer"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? 'Less Options' : 'More Options'}
              </button>
            </div>
          )}
          {filteredSkills.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No skills found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Filter;
