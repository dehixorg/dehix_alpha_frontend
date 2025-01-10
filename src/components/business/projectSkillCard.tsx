import React from 'react';
import { Mail } from 'lucide-react';

import DateRange from '@/components/cards/dateRange';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadge } from '@/utils/statusBadge';

export interface ProjectSkillCardProps {
  domainName: string | undefined;
  description: string | undefined;
  email: string;
  status: string | undefined;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
  domains: string[];
  skills: string[] | undefined;
}

function ProjectSkillCard({
  domainName,
  description,
  email,
  status,
  startDate,
  endDate,
  domains,
  skills,
}: ProjectSkillCardProps) {
  const { text, className } = getStatusBadge(status);

  return (
    <Card className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">{domainName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge className={className}>{text}</Badge>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-full">
            <p className="mb-6 break-words">
              {description
                ? description.length > 50
                  ? `${description.slice(0, 50)}...`
                  : description
                : 'No description available'}
            </p>
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4" />
              <span>{email}</span>
            </div>
            {domains.length > 0 && (
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
            )}
            {skills && skills.length > 0 && (
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
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex">
        <DateRange startDate={startDate} endDate={endDate} />
      </CardFooter>
    </Card>
  );
}

export default ProjectSkillCard;
