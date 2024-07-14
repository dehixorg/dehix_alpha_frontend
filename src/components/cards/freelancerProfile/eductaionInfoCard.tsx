import React from 'react';
import { Github, MessageSquareIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

interface EducationProps {
  degree: string;
  universityName: string;
  fieldOfStudy: string;
  start: string;
  end: string | 'current';
  grade: string;
}

const EducationInfoCard: React.FC<EducationProps> = ({
  degree,
  universityName,
  fieldOfStudy,
  start,
  end,
  grade,
}) => {
  return (
    <Card className="max-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex">
          {universityName}
        </CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-white">
          {degree} in {fieldOfStudy}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 pt-4">Grade: {grade}</p>
      </CardContent>
      <CardFooter className="flex">
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
          {new Date(start).toLocaleDateString()}
        </p>
        <p>-</p>
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 uppercase rounded">
          {end !== 'current' ? new Date(end).toLocaleDateString() : 'Current'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default EducationInfoCard;