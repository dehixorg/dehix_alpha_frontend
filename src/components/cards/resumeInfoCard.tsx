import React from 'react';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

interface ResumeProps {
  _id: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  professionalSummary?: string;
  selectedTemplate?: string;
  updatedAt?: string;
  onClick?: () => void;
}

const ResumeInfoCard: React.FC<ResumeProps> = ({
  _id,
  personalInfo,
  professionalSummary,
  selectedTemplate,
  updatedAt,
  onClick,
}) => {
  return (
    <Card
      className="w-full h-full mx-auto md:max-w-2xl hover:shadow-lg  cursor-pointer hover:bg-gray-800 transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex">
          {personalInfo?.firstName || 'No'} {personalInfo?.lastName || 'Name'}
        </CardTitle>
        <CardDescription className="block mt-1">
          {selectedTemplate
            ? `Template: ${selectedTemplate}`
            : 'No template selected'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">
          {professionalSummary || 'No professional summary available'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {updatedAt
            ? `Last updated: ${format(new Date(updatedAt), 'MMM d, yyyy')}`
            : 'No update date'}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ResumeInfoCard;
