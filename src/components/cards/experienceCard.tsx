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
  return (
    <Card className="w-full mx-auto md:max-w-2xl">
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
        {verificationStatus === 'pending' ? (
          <Badge className="bg-warning hover:bg-warning">PENDING</Badge>
        ) : verificationStatus === 'verified' ? (
          <Badge className="bg-success hover:bg-success">VERIFIED</Badge>
        ) : (
          <Badge className="bg-blue-500 hover:bg-blue-600">ADDED</Badge>
        )}

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
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
          {new Date(workFrom).toLocaleDateString()}
        </p>
        <p>-</p>
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 uppercase rounded">
          {workTo !== 'current'
            ? new Date(workTo).toLocaleDateString()
            : 'Current'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ExperienceCard;
