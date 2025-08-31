import React from 'react';
import { Mail, Plus, Calendar, User } from 'lucide-react';

import { Separator } from '../ui/separator';
import { Card } from '../ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  onAddProfile?: () => void;
  team?: any[];
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
  onAddProfile,
  team = [],
}: ProjectSkillCardProps) {
  if (isLastCard) {
    return (
      <Card
        className="flex w-full items-center justify-center h-[250px] border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
        onClick={onAddProfile}
      >
        <Plus className="w-12 h-12 text-gray-400" />
      </Card>
    );
  }

  const truncateFileName = (fileName: string | undefined) => {
    const maxLength = 18;
    if (fileName && fileName.length > maxLength) {
      return `${fileName.substring(0, maxLength)}...`;
    }
    return fileName;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate dummy team data if no team is provided
  const displayTeam =
    team.length > 0
      ? team
      : [
          {
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            profilePic: '',
            color: 'bg-blue-100',
            textColor: 'text-blue-800',
          },
          {
            name: 'Michael Chen',
            email: 'michael.c@example.com',
            profilePic: '',
            color: 'bg-green-100',
            textColor: 'text-green-800',
          },
          {
            name: 'Emma Rodriguez',
            email: 'emma.r@example.com',
            profilePic: '',
            color: 'bg-purple-100',
            textColor: 'text-purple-800',
          },
        ];

  return (
    <div className="w-full min-h-[230px] bg-card relative border rounded-lg shadow-sm p-6 flex flex-col h-full">
      {/* Header with domain name and status */}
      <div className="flex justify-between items-start mb-4">
        <HoverCard>
          <HoverCardTrigger>
            <h2 className="text-lg cursor-pointer font-semibold ">
              {truncateFileName(domainName)}
            </h2>
          </HoverCardTrigger>
          <HoverCardContent className="py-2 w-auto">
            {domainName}
          </HoverCardContent>
        </HoverCard>

        <Badge className="bg-green-100 text-green-800 capitalize text-xs px-2 py-1 rounded-md">
          {status?.toLocaleLowerCase() || 'Active'}
        </Badge>
      </div>

      {/* Team members with profile badges, names, and emails */}
      {/* Team members with profile badges, names, and emails in same row */}
      <div className="mb-4 space-y-3">
        {displayTeam.slice(0, 3).map((member, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {member.profilePic ? (
                <img
                  src={member.profilePic}
                  alt={member.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${member.color} ${member.textColor}`}
                >
                  <span className="text-xs font-medium">
                    {getInitials(member.name)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-between items-center min-w-0">
              <span className="text-sm font-medium truncate mr-2">
                {member.name}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {member.email}
              </span>
            </div>
          </div>
        ))}
        {displayTeam.length > 3 && (
          <div className="text-sm text-gray-500 pl-11">
            +{displayTeam.length - 3} more members
          </div>
        )}
      </div>

      {/* <div className="border-t border-gray-200 my-3"></div> */}

      {/* Date range */}
      <div className="flex items-center text-sm  mb-4">
        <Calendar className="w-4 h-4 mr-2" />
        {startDate ? (
          <>
            Start {formatDate(startDate)}
            {endDate && ` - ${formatDate(endDate)}`}
            {!endDate && ' - Present'}
          </>
        ) : (
          'No dates specified'
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-100 mb-4 flex-grow">
        {description || 'No description available.'}
      </p>

      {/* View Details button */}
      <div className="pt-3 mt-auto">
        <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProjectSkillCard;
