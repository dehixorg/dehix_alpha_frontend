import React from 'react';

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
  const formatDate = (date: Date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  return (
    <Card className="max-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex">
          {universityName || 'University Name'}
        </CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-white">
          {degree || 'Degree'} in {fieldOfStudy || 'Field of Study'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 pt-4">Grade: {grade || 'N/A'}</p>
      </CardContent>
      <CardFooter className="flex">
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
          {startDate ? formatDate(startDate) : 'Start Date N/A'}
        </p>
        <p>-</p>
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 uppercase rounded">
          {endDate === 'current' ? 'Current' : formatDate(endDate)}
        </p>
      </CardFooter>
    </Card>
  );
};

export default EducationInfoCard;
