import React from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const formatDate = (date: Date | undefined) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

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
        <Badge className="text-sm font-semibold   px-3 py-1 rounded">
          {startDate ? formatDate(startDate) : 'Start Date N/A'}
        </Badge>
        <p>-</p>
        <Badge className="text-sm font-semibold   px-3 py-1 uppercase rounded">
          {endDate === 'current' ? 'Current' : formatDate(endDate)}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default EducationInfoCard;
