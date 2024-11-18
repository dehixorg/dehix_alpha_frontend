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
        <div className="h-[1px] bg-gray-600 mt-2 mb-4"></div>
      </CardHeader>

      <CardContent>
        <Badge className={className}>{text}</Badge>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-full">
            <p className="mb-6 mx-4 w-full break-words">{description}</p>

            <Badge className="uppercase flex font-semibold items-center text-sm bg-gray-300 px-2 rounded inline-flex">
              <Mail className="mr-2 h-4 w-4" />
              <span>{email}</span>
            </Badge>

            {domains.length > 0 && (
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
            )}

            {skills.length > 0 && (
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
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center">
        <DateRange startDate={startDate} endDate={endDate} />
      </CardFooter>
    </Card>
  );
}

export default ProjectDetailCard;
