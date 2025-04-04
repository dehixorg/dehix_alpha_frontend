import React from 'react';
import { Github, MessageSquareIcon } from 'lucide-react';

import DateRange from './dateRange';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

interface ExperienceProps {
  company: string;
  jobTitle: string;
  workDescription: string;
  workFrom: string;
  workTo: string | 'current';
  referencePersonName: string;
  referencePersonContact: string;
  githubRepoLink: string;
  verificationStatus: string;
  comments: string;
}

const ExperienceCard: React.FC<ExperienceProps> = ({
  company,
  jobTitle,
  workDescription,
  workFrom,
  workTo,
  referencePersonName,
  referencePersonContact,
  githubRepoLink,
  verificationStatus,
  comments,
}) => {
  const getBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'verified':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };
  return (
    <Card className="w-full h-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex">
          {company}
          {githubRepoLink && (
            <div className="ml-auto">
              <a href={githubRepoLink} className="text-sm text-white underline">
                <Github />
              </a>
            </div>
          )}
        </CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-white">
          {jobTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge
          className={`px-3 py-1 text-xs font-bold rounded-full border transition ${getBadgeStyle(
            verificationStatus,
          )}`}
        >
          {verificationStatus.toUpperCase()}
        </Badge>

        <p className="text-gray-300 pt-4">{workDescription}</p>

        <p className="mt-2 flex text-gray-500 border p-3 rounded">
          <MessageSquareIcon className="pr-1" />
          {comments}
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Reference: {referencePersonName}
          </p>
          <p className="text-sm text-gray-600">
            Contact: {referencePersonContact}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex">
        <DateRange startDate={workFrom} endDate={workTo} />
      </CardFooter>
    </Card>
  );
};

export default ExperienceCard;
