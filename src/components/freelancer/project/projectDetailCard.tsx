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
import { getStatusBadge } from '@/utils/statusBadge';
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
  handleCompleteProject,
}: ProjectDetailCardProps) {
  const { text: projectStatus, className: statusBadgeStyle } =
    getStatusBadge(status);

  return (
    <Card className="p-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <CardTitle className="text-2xl font-bold">{projectName}</CardTitle>
          <div>
            <Badge className={statusBadgeStyle}>{projectStatus}</Badge>
          </div>
        </div>
        <div className="h-[1px] bg-gray-600 mt-2 mb-4"></div>
      </CardHeader>

      <CardContent>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-full">
            <p className="mb-6 mx-4 w-full break-words">{description}</p>

            <Badge className="uppercase flex font-semibold items-center text-sm bg-gray-300 px-2 rounded">
              <Mail className="mr-2 h-4 w-4" />
              <span>{email}</span>
            </Badge>

            <div className="flex justify-start items-center mb-2">
              <h4 className="text-xl font-semibold">Project Domains: </h4>
              <div className="flex flex-wrap gap-1 my-2 ml-1">
                {projectDomain.map((projectDomain, index) => (
                  <Badge
                    key={index}
                    className="uppercase mx-1 text-xs font-normal bg-gray-300"
                  >
                    {projectDomain}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-start items-center">
              <h4 className="text-xl font-semibold">Skills: </h4>
              <div className="flex flex-wrap gap-1 my-2 ml-1">
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
        <DateRange startDate={startDate} endDate={endDate} />

        <Button
          className="ml-auto"
          size="sm"
          onClick={handleCompleteProject}
          disabled={!handleCompleteProject} // Disable if the function is not provided
        >
          Mark as Completed
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectDetailCard;
