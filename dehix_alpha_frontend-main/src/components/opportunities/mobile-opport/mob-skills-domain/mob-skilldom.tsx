'use client';
import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MobileSkillDomProps {
  label: string;
  heading: string;
  checkboxLabels: string[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
}

const MobileSkillDom: React.FC<MobileSkillDomProps> = ({
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
    label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const visibleSkills = filteredSkills.slice(0, 3);
  const hiddenSkills = filteredSkills.slice(3);

  return (
    <div>
      <h1 className="mt-2 text-white">{heading}</h1>
      <div className="items-center p-2">
        <Input
          placeholder={`Search ${label}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2 bg-secondary border-black"
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
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center text-sm cursor-pointer ml-auto"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Less' : 'More'}
              {showMore ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {filteredSkills.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No skills found.</p>
        )}
      </div>
    </div>
  );
};

export default MobileSkillDom;
