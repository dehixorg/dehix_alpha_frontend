import React from 'react';
import { Plus, CheckCircle, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { profileTypeOutlineClasses } from '@/utils/common/getBadgeStatus';
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
  profileType,
  startDate,
  endDate,
  isLastCard,
  onAddProfile,
  team = [],
}: ProjectSkillCardProps) {
  const router = useRouter();
  if (isLastCard) {
    return (
      <Card
        className="group flex h-[400px] w-full cursor-pointer items-center justify-center rounded-xl border border-dashed bg-muted/20 transition-colors hover:bg-muted/30"
        onClick={onAddProfile}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-background shadow-sm transition-colors group-hover:border-primary/30">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">
              Add profile
            </div>
            <div className="text-xs text-muted-foreground">
              Create a new profile requirement
            </div>
          </div>
        </div>
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

  return (
    <Card className="flex h-[400px] w-full flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <HoverCard>
              <HoverCardTrigger asChild>
                <CardTitle className="cursor-pointer truncate text-base font-semibold tracking-tight sm:text-lg">
                  {truncateFileName(domainName)}
                </CardTitle>
              </HoverCardTrigger>
              <HoverCardContent className="py-2 w-auto">
                {domainName}
              </HoverCardContent>
            </HoverCard>
            <div className="text-xs text-muted-foreground">Team & timeline</div>
          </div>

          <Badge
            variant="outline"
            className={`shrink-0 capitalize text-xs px-2 py-0.5 ${profileTypeOutlineClasses(profileType)}`}
          >
            {profileType || 'FREELANCER'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {/* Date history/status */}
        <DateHistory
          startDate={startDate}
          endDate={endDate}
          className="dark:bg-background"
        />
        {/* Team members */}
        <ScrollArea className="flex-1 rounded-lg border bg-muted/20 p-3">
          <div className="space-y-2">
            {team.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-background">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-foreground">
                  No team members
                </div>
                <div className="text-xs text-muted-foreground">
                  Add members to start collaborating
                </div>
              </div>
            ) : (
              <>
                {team.slice(0, 5).map((member, index) => (
                  <div
                    key={index}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-background/60"
                    onClick={() =>
                      router.push(`/business/freelancerProfile/${member._id}`)
                    }
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profilePic} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {member.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                ))}
                {team.length > 5 && (
                  <div className="px-2 text-xs text-muted-foreground">
                    +{team.length - 5} more members
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Description */}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button size="sm" variant="outline" className="ml-auto gap-2">
          <CheckCircle className="w-4 h-4" />
          Mark as completed
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProjectSkillCard;
