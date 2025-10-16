import React, { useState } from 'react';
import { Github, ExternalLink, Folder, Users } from 'lucide-react';
import Image from 'next/image';

import { Button } from '../ui/button';

import { DateHistory } from '@/components/shared/DateHistory';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface ProjectProps {
  _id: string;
  projectName: string;
  githubLink: string;
  liveDemoLink?: string;
  thumbnail?: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  role: string;
  projectType: string;
  oracleAssigned: string | null;
  verificationUpdateTime: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  isViewOnly?: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectProps> = ({
  projectName,
  githubLink,
  liveDemoLink,
  thumbnail,
  start,
  end,
  projectType,
  role,
  isViewOnly = false,
  verificationStatus = 'pending',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Convert string dates to Date objects
  const formatDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString || dateString === 'current') return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const startDate = formatDate(start);
  const endDate = end === 'current' ? null : formatDate(end);

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        'w-full overflow-hidden rounded-xl border bg-card/60 shadow-sm transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5 border-border/50 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
        isViewOnly ? 'cursor-default' : 'cursor-pointer',
      )}
      onClick={!isViewOnly ? onClick : undefined}
    >
      {thumbnail && !imageError && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={thumbnail}
            alt={`${projectName} thumbnail`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-foreground/70" />
              <h3 className="text-lg font-semibold text-foreground">
                {projectName}
              </h3>
              <StatusBadge
                status={verificationStatus}
                className="group-hover:shadow-sm transition-shadow"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              {projectType && (
                <Badge
                  variant="outline"
                  className="text-xs px-2.5 py-1 border-border/60 bg-background/80 hover:bg-background/90 transition-colors duration-200"
                >
                  {projectType}
                </Badge>
              )}
              {role && (
                <Badge
                  variant="outline"
                  className="text-xs px-2.5 py-1 border-border/60 bg-background/80 hover:bg-background/90 transition-colors duration-200"
                >
                  <Users className="h-3 w-3 mr-1.5" />
                  {role}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {githubLink && githubLink.trim() && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleLinkClick(e, githubLink)}
                  >
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub Repository</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View on GitHub</TooltipContent>
              </Tooltip>
            )}
            {liveDemoLink && liveDemoLink.trim() && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleLinkClick(e, liveDemoLink)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Live Demo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Live Demo</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-6">
        <div className="mt-4">
          <DateHistory
            startDate={startDate}
            endDate={endDate}
            className="bg-muted/20 border-border/50 hover:bg-muted/30 transition-colors"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
