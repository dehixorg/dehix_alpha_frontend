'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  label?: string;
  heading: string;
  checkboxLabels: string[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  openItem?: string | null;
  setOpenItem?: (item: string | null) => void;
  useAccordion?: boolean;
}

const SkillDom: React.FC<SkillDomProps> = ({
  label = 'Skills',
  heading,
  checkboxLabels,
  selectedValues,
  setSelectedValues,
  openItem,
  setOpenItem,
  useAccordion = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMore, setShowMore] = useState(false);

  const handleCheckboxChange = (label: string) => {
    if (selectedValues.includes(label)) {
      setSelectedValues(selectedValues.filter((item) => item !== label));
    } else {
      setSelectedValues([...selectedValues, label]);
    }
  };

  const filteredLabels = checkboxLabels.filter((label) =>
    label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const visibleLabels = filteredLabels.slice(0, 3);
  const hiddenLabels = filteredLabels.slice(3);

  const renderCheckboxes = () => (
    <>
      {visibleLabels.map((label) => (
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
        hiddenLabels.map((label) => (
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
    </>
  );

  if (useAccordion) {
    return (
      <Card className="w-full">
        <Accordion
          type="single"
          collapsible
          value={openItem === heading ? heading : ''}
          onValueChange={(value) =>
            setOpenItem?.(value === heading ? heading : null)
          }
        >
          <AccordionItem value={heading}>
            <AccordionTrigger className="text-left px-4 py-2 hover:no-underline">
              {heading}
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 mt-2 pb-4 space-y-3">
                <Input
                  type="text"
                  placeholder={`Search ${heading.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-52 overflow-y-auto no-scrollbar space-y-2">
                  {filteredLabels.map((label) => (
                    <div key={label} className="flex items-center space-x-2">
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
                  {filteredLabels.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No options found.
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    );
  }

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
        {renderCheckboxes()}
      </CardContent>
      <CardFooter>
        {filteredLabels.length > 3 && (
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
        {filteredLabels.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {label === 'Skills' ? 'No skills found.' : 'No domain found.'}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default SkillDom;
