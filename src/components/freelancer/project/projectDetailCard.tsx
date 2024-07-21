import React from 'react';
import { Mail } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ProjectDetailCardProps {
  projectName: string;
  description: string;
  email: string;
  status: string | undefined;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
  domains: string[];
  skills: string[];
}

const getStatusBadge = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { text: 'ACTIVE', className: 'bg-blue-500 hover:bg-blue-600' };
    case 'pending':
      return { text: 'PENDING', className: 'bg-warning hover:bg-warning' };
    case 'completed':
      return { text: 'COMPLETED', className: 'bg-success hover:bg-success' };
    case 'rejected':
      return { text: 'REJECTED', className: 'bg-red-500 hover:bg-red-600' };
    default:
      return { text: 'UNKNOWN', className: 'bg-gray-500 hover:bg-gray-600' };
  }
};
function ProjectDetailCard({
  projectName,
  description,
  email,
  status,
  startDate,
  endDate,
  domains,
  skills,
}: ProjectDetailCardProps) {
  const { text, className } = getStatusBadge(status);

  return (
    <Card className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">{projectName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge className={className}>{text}</Badge>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-full">
            <p className="mb-6">{description}</p>
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4" />
              <span>{email}</span>
            </div>
            <div className="my-4">
              <h4 className="text-xl font-semibold">Project Domains</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {domains.map((domain, index) => (
                  <Badge
                    key={index}
                    className="uppercase mx-1 text-xs font-normal bg-gray-300"
                  >
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <h4 className="text-xl font-semibold">Skills</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills?.map((skill, index) => (
                  <Badge
                    key={index}
                    className="uppercase mx-1 text-xs font-normal bg-gray-300"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex">
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
          {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}
        </p>
        <p>-</p>
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 uppercase rounded">
          {endDate ? new Date(endDate).toLocaleDateString() : 'Current'}
        </p>
      </CardFooter>
    </Card>
  );
}

export default ProjectDetailCard;
