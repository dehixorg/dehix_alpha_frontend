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
import { Skeleton } from '@/components/ui/skeleton'; // Importing Skeleton
import { getStatusBadge } from '@/utils/statusBadge';

export interface ProjectDetailCardProps {
  projectName: string;
  description: string;
  email: string;
  status: string | undefined;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
  domains: string[];
  skills: string[];
  isLoading?: boolean; // Added loading state prop
}

function ProjectDetailCard({
  projectName,
  description,
  email,
  status,
  startDate,
  endDate,
  domains,
  skills,
  isLoading = false, // Default value is false
}: ProjectDetailCardProps) {
  const { text, className } = getStatusBadge(status);

  // Render the Skeleton component if loading
  if (isLoading) {
    return <ProjectDetailCardSkeleton />;
  }

  return (
    <Card className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">{projectName}</CardTitle>
        <div className="h-[1px] bg-gray-600 mt-2 mb-4"></div>
      </CardHeader>

      <CardContent>
        <Badge className={className}>{text}</Badge>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-full">
            <p className="mb-6 mx-4">{description}</p>

            <div className="flex items-center text-sm bg-gray-900 text-white p-2 w-full sm:w-1/2 rounded">
              <Mail className="mr-2 h-4 w-4 text-white" />
              <span>{email}</span>
            </div>

            <div className="my-4">
              <h4 className="text-xl font-semibold">Project Domains</h4>
              <div className="flex flex-wrap gap-2 mt-2 mx-4">
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
              <div className="flex flex-wrap gap-1 mt-2 mx-4">
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

      <CardFooter className="flex items-center">
        <p className="text-sm font-semibold text-white px-3 py-1 rounded">
          {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}
        </p>
        <span className="mx-2 text-gray-500">-</span>
        <p className="text-sm font-semibold text-white px-3 py-1 uppercase rounded">
          {endDate ? new Date(endDate).toLocaleDateString() : 'Current'}
        </p>
      </CardFooter>
    </Card>
  );
}

// Skeleton component for loading state
function ProjectDetailCardSkeleton() {
  return (
    <Card className="p-4">
      <CardHeader className="pb-3">
        <Skeleton className="h-8 w-3/4" /> {/* Skeleton for project name */}
        <div className="h-[1px] bg-gray-600 mt-2 mb-4"></div>
      </CardHeader>

      <CardContent>
        <Skeleton className="h-6 w-1/4" /> {/* Skeleton for status badge */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-full">
            <Skeleton className="h-16 w-full mb-6" /> {/* Skeleton for description */}
            <Skeleton className="h-10 w-1/2 mb-4" /> {/* Skeleton for email field */}

            <div className="my-4">
              <Skeleton className="h-6 w-1/3 mb-2" /> {/* Skeleton for domains title */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <div className="pt-4">
              <Skeleton className="h-6 w-1/4 mb-2" /> {/* Skeleton for skills title */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center">
        <Skeleton className="h-6 w-16" /> {/* Skeleton for start date */}
        <span className="mx-2 text-gray-500">-</span>
        <Skeleton className="h-6 w-16" /> {/* Skeleton for end date */}
      </CardFooter>
    </Card>
  );
}

export default ProjectDetailCard;
