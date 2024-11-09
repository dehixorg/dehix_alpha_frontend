import React from 'react';

import DateRange from './dateRange';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

interface EducationProps {
  degree?: string;
  universityName?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date | 'current';
  grade?: string;
}

const EducationInfoCard: React.FC<EducationProps> = ({
  degree,
  universityName,
  fieldOfStudy,
  startDate,
  endDate,
  grade,
}) => {
  return (
    <Card className="w-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex">
          {universityName || 'University Name'}
        </CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium ">
          {degree || 'Degree'} in {fieldOfStudy || 'Field of Study'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className=" pt-4">Grade: {grade || 'N/A'}</p>
      </CardContent>
      <CardFooter className="flex">
        <DateRange startDate={startDate} endDate={endDate} />
      </CardFooter>
    </Card>
  );
};

export default EducationInfoCard;
