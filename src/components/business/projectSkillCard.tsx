import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import Image from 'next/image';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  statusOutlineClasses,
  profileTypeOutlineClasses,
} from '@/utils/common/getBadgeStatus';
import DateHistory from '@/components/shared/DateHistory';

export interface ProjectSkillCardProps {
  domainName?: string | undefined;
  description?: string | undefined;
  email?: string;
  status?: string | undefined;
  profileType?: string | undefined;
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
  status,
  profileType,
  startDate,
  endDate,
  isLastCard,
  onAddProfile,
  team = [],
}: ProjectSkillCardProps) {
  if (isLastCard) {
    return (
      <Card
        className="flex bg-muted-foreground/20 dark:bg-muted/20 w-full items-center justify-center h-[400px] border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
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
    <Card className="w-full h-[400px] bg-muted-foreground/20 dark:bg-muted/20 border rounded-lg shadow-sm flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <HoverCard>
            <HoverCardTrigger>
              <CardTitle className="text-lg cursor-pointer font-semibold tracking-tight">
                {truncateFileName(domainName)}
              </CardTitle>
            </HoverCardTrigger>
            <HoverCardContent className="py-2 w-auto">
              {domainName}
            </HoverCardContent>
          </HoverCard>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`capitalize text-xs px-2 py-0.5 rounded-md ${profileTypeOutlineClasses(profileType)}`}
            >
              {profileType || 'FREELANCER'}
            </Badge>
            <Badge
              variant="outline"
              className={`capitalize text-xs px-2 py-0.5 rounded-md ${statusOutlineClasses(status)}`}
            >
              {status || 'ACTIVE'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {/* Date history/status */}
        <DateHistory startDate={startDate} endDate={endDate} />
        {/* Team members */}
        <ScrollArea className="flex-1 rounded-md border bg-muted/20 p-3">
          <div className="space-y-3">
            {displayTeam.slice(0, 5).map((member, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {member.profilePic ? (
                    <Image
                      src={member.profilePic}
                      alt={member.name}
                      width={32}
                      height={32}
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
            {displayTeam.length > 5 && (
              <div className="text-sm text-gray-500 pl-11">
                +{displayTeam.length - 5} more members
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Description */}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description || 'No description available.'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          size="sm"
          variant="outline"
          className="ml-auto gap-2 border-green-700/40 text-green-600 hover:text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60"
        >
          <CheckCircle className="w-4 h-4" />
          Mark as completed
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectSkillCard;
