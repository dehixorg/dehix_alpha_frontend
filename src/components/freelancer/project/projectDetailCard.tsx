import React from 'react';
import { CheckCircle, Code2, Mail, Milestone, Tag } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadge } from '@/utils/statusBadge';
import { Separator } from '@/components/ui/separator';
import DateRange from '@/components/cards/dateRange';
import { Button } from '@/components/ui/button';

export interface ProjectDetailCardProps {
  projectName: string;
  description: string;
  email: string;
  status: string | undefined;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
  projectDomain: string[];
  skills: string[];
  userRole?: 'Business' | 'Freelancer'; // Added role prop
  projectId: string; // Added project ID prop
  handleCompleteProject?: () => void;
}

function ProjectDetailCard({
  projectName,
  description,
  email,
  status,
  startDate,
  endDate,
  projectDomain,
  skills,
  userRole = 'Business', // Default to 'Business'
  projectId, // Project ID prop
  handleCompleteProject,
}: ProjectDetailCardProps) {
  const { text: projectStatus, className: statusBadgeStyle } =
    getStatusBadge(status);

  // Construct the milestone route dynamically based on userRole and projectId
  const milestoneRoute = `/${userRole.toLowerCase()}/project/${projectId}/milestone`;

  return (
    <Card className="shadow-lg border border-gray-800 rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center mb-0.5">
          <CardTitle className="text-xl md:text-2xl font-semibold">
            {projectName}
          </CardTitle>
          <Badge
            className={`${statusBadgeStyle} px-1 py-0.5 text-xs md:text-sm rounded-md`}
          >
            {projectStatus}
          </Badge>
        </div>
        <Separator className="my-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        <DateRange startDate={startDate} endDate={endDate} />

        <p className="text-sm md:text-base leading-relaxed">{description}</p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Project Domain Section */}
          <div className="flex flex-col gap-2 px-3 py-1 text-xs md:text-sm rounded-md shadow-inner w-full md:w-1/2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 block md:hidden" />
              <p className="font-medium">Project Domain:</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {projectDomain.map((domain, index) => (
                <Badge
                  key={index}
                  className="bg-gray-200 text-gray-900 text-xs md:text-sm px-2 py-1 rounded-full"
                >
                  {domain}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="flex flex-col gap-2 px-3 py-1 text-xs md:text-sm rounded-md shadow-inner w-full md:w-1/2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 block md:hidden" />
              <p className="font-medium">Skills:</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-gray-200 text-gray-900 text-xs md:text-sm px-2 py-1 rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="flex flex-wrap items-center gap-4 px-3 py-1 text-xs md:text-sm rounded-md shadow-inner">
          <Mail className="w-4 h-4 " />
          <span className="text-sm">{email}</span>
        </div>

        {/* Completed Button */}
        <div className="flex justify-between mt-4">
          <Link href={milestoneRoute}>
            <Button
              className={`flex items-center px-4 py-2 text-xs md:text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-500`}
              size="sm"
            >
              <Milestone className="w-4 h-4 mr-1" />
              Milestone
            </Button>
          </Link>
          <Button
            className={`flex items-center px-4 py-2 text-xs md:text-sm font-medium text-white rounded-md ${
              projectStatus === 'COMPLETED'
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
            size="sm"
            onClick={handleCompleteProject}
            disabled={!handleCompleteProject}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {projectStatus === 'COMPLETED' ? 'Completed' : 'Mark complete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectDetailCard;
