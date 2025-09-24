import React from 'react';
import {
  Eye,
  Pencil,
  Trash2,
  User,
  Briefcase,
  MoreVertical,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ProfileSummary = {
  _id?: string;
  profileName?: string;
  description?: string;
  skills?: any[];
  domains?: any[];
  projects?: any[];
  experiences?: any[];
  hourlyRate?: number | null;
  typeLabel?: string; // Optional label to distinguish types if needed
};

export interface ProfileSummaryCardProps {
  profile: ProfileSummary;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  onView,
  onEdit,
  onDelete,
}) => {
  const {
    profileName,
    description,
    skills = [],
    domains = [],
    projects,
    experiences,
    hourlyRate,
  } = profile;

  const renderSkillBadges = (items: any[]) => {
    if (!items || items.length === 0) {
      return (
        <div>
          <p className="text-sm font-medium mb-2">Skills:</p>
          <p className="text-xs text-muted-foreground">No skills added</p>
        </div>
      );
    }
    return (
      <div>
        <p className="text-sm font-medium mb-2">Skills:</p>
        <div className="flex flex-wrap gap-1">
          {items.slice(0, 3).map((skill: any, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {typeof skill === 'string'
                ? skill
                : skill.name || skill.skillName}
            </Badge>
          ))}
          {items.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{items.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderDomainBadges = (items: any[]) => {
    if (!items || items.length === 0) {
      return (
        <div>
          <p className="text-sm font-medium mb-2">Domains:</p>
          <p className="text-xs text-muted-foreground">No domains added</p>
        </div>
      );
    }
    return (
      <div>
        <p className="text-sm font-medium mb-2">Domains:</p>
        <div className="flex flex-wrap gap-1">
          {items.slice(0, 2).map((domain: any, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {typeof domain === 'string'
                ? domain
                : domain.name || domain.domainName}
            </Badge>
          ))}
          {items.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{items.length - 2} more
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-black/20 flex flex-col h-full">
        <CardHeader className="pb-2 px-6 pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-xl border border-gray-200 dark:border-gray-700">
              <AvatarImage
                src="/placeholder-avatar.svg"
                alt={profileName || 'Profile'}
              />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-base font-bold">
                {(profileName || 'P').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                  {profileName || 'Untitled Profile'}
                </CardTitle>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {profile.typeLabel && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 border-border/60 bg-background/80"
                    >
                      {profile.typeLabel}
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted/70"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={onView}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onEdit}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-red-600 focus:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description && description.length > 140
                  ? `${description.substring(0, 140)}...`
                  : description || 'No description available'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4 space-y-4 flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="min-h-[60px]">{renderSkillBadges(skills)}</div>
            <div className="min-h-[60px]">{renderDomainBadges(domains)}</div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="text-sm font-medium">{projects?.length || 0}</p>
                </div>
              </div>
              <div className="bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                  <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm font-medium">
                    {experiences?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm min-h-[20px]">
              {hourlyRate ? (
                <>
                  <span className="font-medium">Rate: </span>
                  <span className="text-green-600">${hourlyRate}/hr</span>
                </>
              ) : (
                <span className="text-muted-foreground text-xs">
                  No rate set
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 mt-auto" />
        </CardContent>

        {/* Hover effect border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
      </Card>
    </TooltipProvider>
  );
};

export default ProfileSummaryCard;
