'use client';
import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SkillDomProps {
  label: string;
  heading: string;
  checkboxLabels: string[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
}

const SkillDom: React.FC<SkillDomProps> = ({
  label,
  heading,
  checkboxLabels,
  selectedValues,
  setSelectedValues,
}) => {
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const handleCheckboxChange = (label: string) => {
    if (label === 'All') {
      if (selectedValues.includes('All')) {
        setSelectedValues([]);
      } else {
        setSelectedValues(['All']);
      }
    } else {
      if (selectedValues.includes(label)) {
        setSelectedValues(selectedValues.filter((item) => item !== label));
      } else {
        const newSelectedValues = [
          ...selectedValues.filter((item) => item !== 'All'),
          label,
        ];
        setSelectedValues(newSelectedValues);
      }
    }
    
  };

  const filteredSkills = checkboxLabels.filter((label) =>
    label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const visibleSkills = filteredSkills.slice(0, 3);
  const hiddenSkills = filteredSkills.slice(3);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder={`Search ${label}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-2"
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
      </CardContent>
      <CardFooter>
        {filteredSkills.length > 3 && (
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
        )}
        {filteredSkills.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {label === 'Skills' ? 'No skills found.' : 'No domain found.'}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default SkillDom;
