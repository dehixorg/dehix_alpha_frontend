'use client';
import React from 'react';
import { Mail } from 'lucide-react'; // Importing Mail icon from Lucide React

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface ProjectProps {
  companyName: string;
  role: string;
  projectType: string;
  description: string;
  skillsRequired: string[];
  start: string;
  email: string;
  experience: string;
}

const RejectProjectCards: React.FC<ProjectProps> = ({
  companyName,
  role,
  projectType,
  description,
  skillsRequired,
  start,
  email,
  experience,
}) => {
  return (
    <Card className="max-w-full md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{companyName}</span>
        </CardTitle>
        <CardDescription className="mt-1 text-justify text-gray-400">
          <Badge className="bg-red-500 text-white my-2">REJECTED</Badge>
          <br />
          <strong className="text-white">Project Type:</strong> {projectType}
          <div className="mt-2">
            <p>{description}</p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="">
          <div className="mt-2">
            <span className="font-semibold">Skills Required:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {skillsRequired.map((skill, index) => (
                <Badge key={index} className="uppercase" variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-gray-400">
                <strong className="font-semibold text-white mr-1">Role:</strong>{' '}
                {role}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-400 flex items-center">
                  <Mail className="mr-2" />
                  {email}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">{email}</TooltipContent>
            </Tooltip>
          </div>
          {experience && (
            <p className="mt-2 flex items-center text-gray-400">
              <strong className="text-gray-400 mr-1">Experience:</strong>{' '}
              {experience}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex gap-4 text-gray-400">
          {new Date(start).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RejectProjectCards;
