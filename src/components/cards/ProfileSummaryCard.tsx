import React from 'react';
import { Briefcase, DollarSign, Trash2, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  onDelete: () => void;
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  onView,
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

  // Extract a display label from various item shapes (string or object)
  const getItemLabel = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const label =
        item.label ||
        item.name ||
        item.skillName ||
        item.domainName ||
        item.title ||
        item.value ||
        item.text ||
        '';
      // Ensure we return a string, not an object
      return label ? String(label) : '';
    }
    return String(item);
  };

  const renderSkillBadges = (items: any[]) => {
    const labels = (Array.isArray(items) ? items : [])
      .map((item) => getItemLabel(item))
      .filter((label) => label && label.trim() !== '');
    if (labels.length === 0) {
      return <p className="text-xs text-muted-foreground">No skills added</p>;
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {labels.slice(0, 3).map((label: string, index: number) => (
          <Badge key={index} variant="secondary" className="text-[11px]">
            {String(label)}
          </Badge>
        ))}
        {labels.length > 3 && (
          <Badge variant="outline" className="text-[11px]">
            +{labels.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  const renderDomainBadges = (items: any[]) => {
    const labels = (Array.isArray(items) ? items : [])
      .map((item) => getItemLabel(item))
      .filter((label) => label && label.trim() !== '');
    if (labels.length === 0) {
      return <p className="text-xs text-muted-foreground">No domains added</p>;
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {labels.slice(0, 2).map((label: string, index: number) => (
          <Badge key={index} variant="outline" className="text-[11px]">
            {label}
          </Badge>
        ))}
        {labels.length > 2 && (
          <Badge variant="outline" className="text-[11px]">
            +{labels.length - 2}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView();
        }
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 rounded-xl border">
            <AvatarImage
              src="/placeholder-avatar.svg"
              alt={profileName || 'Profile'}
            />
            <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
              {(profileName || 'P').charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="truncate text-base font-semibold transition-colors group-hover:text-primary">
                {profileName || 'Untitled Profile'}
              </CardTitle>

              <div className="flex shrink-0 items-center gap-2">
                {profile.typeLabel && (
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] font-semibold uppercase tracking-wide"
                  >
                    {profile.typeLabel}
                  </Badge>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-destructive opacity-70 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive/30"
                        aria-label="Delete profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description && description.length > 140
                ? `${description.substring(0, 140)}...`
                : description || 'No description available'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-5 pb-5 pt-0">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Skills
          </div>
          {renderSkillBadges(skills)}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Domains
          </div>
          {renderDomainBadges(domains)}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[11px]">
            <Briefcase className="mr-1 h-3.5 w-3.5" />
            {projects?.length || 0} projects
          </Badge>
          <Badge variant="secondary" className="text-[11px]">
            <User className="mr-1 h-3.5 w-3.5" />
            {experiences?.length || 0} experiences
          </Badge>
          {hourlyRate ? (
            <Badge variant="outline" className="text-[11px]">
              <DollarSign className="mr-1 h-3.5 w-3.5" />
              {hourlyRate}/hr
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">No rate set</span>
          )}
        </div>
      </CardContent>

      {/* Hover effect border */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-primary/20 dark:group-hover:border-primary/30" />
    </Card>
  );
};

export default ProfileSummaryCard;
