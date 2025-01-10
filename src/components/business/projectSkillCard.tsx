import React from 'react';
import { Mail, Calendar, Tag, Code2, Plus } from 'lucide-react';

import { Separator } from '../ui/separator';
import DateRange from '../cards/dateRange';
import { Card } from '../ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

import { Badge } from '@/components/ui/badge';

export interface ProjectSkillCardProps {
  domainName?: string | undefined;
  description?: string | undefined;
  email?: string;
  status?: string | undefined;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  domains?: string[];
  skills?: string[] | undefined;
  imageUrl?: string;
  isLastCard?: boolean;
}
function ProjectSkillCard({
  domainName,
  description,
  email,
  status,
  startDate,
  endDate,
  domains = [],
  skills = [],
  isLastCard,
}: ProjectSkillCardProps) {
  if (isLastCard) {
    return (
      <Card className="flex w-[300px] mx-auto items-center justify-center h-[430px] border border-dashed border-gray-400 rounded-lg  cursor-pointer ">
        <Plus className="w-12 h-12 text-gray-400" />
      </Card>
    );
  }

  const truncateFileName = (fileName: string | undefined) => {
    const maxLength = 10;
    if (fileName && fileName.length > maxLength) {
      return `${fileName.substring(0, maxLength)}...`;
    }
    return fileName;
  };

  return (
    <div className="w-[300px] min-h-[400px] bg-card  mx-auto relative border border-gray-700 rounded-lg shadow-md p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <HoverCard>
          <HoverCardTrigger>
            <h2 className="text-lg cursor-pointer font-semibold">
              {truncateFileName(domainName)}
            </h2>
          </HoverCardTrigger>
          <HoverCardContent className="py-2 w-auto">
            {domainName}
          </HoverCardContent>
        </HoverCard>

        <Badge className="bg-yellow-400 capitalize text-black text-xs px-2 py-1 rounded-md">
          {status?.toLocaleLowerCase() || 'Pending'}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <Separator />
        <div className="flex mt-6 mb-6 items-center text-sm">
          <DateRange startDate={startDate} endDate={endDate} />
        </div>

        {/* Description */}
        <p className="text-sm mb-4">
          {description || 'No description available.'}
        </p>

        {/* Domains */}
        {domains.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Project Domain:</h3>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain, index) => (
                <Badge
                  key={index}
                  className="px-3 bg-gray-200 text-gray-900 py-1 text-xs rounded-full"
                >
                  {domain}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  className="px-3 bg-gray-200 text-gray-900 py-1 text-xs rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex mt-[28px] items-center text-sm">
          <Mail className="w-4 h-4 mr-2" />
          <span>{email || 'No email provided.'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3">
        <button className="w-auto bg-blue-600 text-white px-5 py-1 rounded-md hover:bg-blue-700">
          Mark as completed
        </button>
      </div>
    </div>
  );
}

export default ProjectSkillCard;
