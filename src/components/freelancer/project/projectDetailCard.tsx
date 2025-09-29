import React from 'react';
import { CheckCircle, Code2, FlagIcon, Mail, Play, Tag } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadge } from '@/utils/statusBadge';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';

export interface ProjectDetailCardProps {
  projectName: string;
  description: string;
  email: string;
  status: string | undefined;
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
  projectDomain: string[];
  skills: string[];
  userRole?: 'Business' | 'Freelancer'; // Added role prop
  projectId: string; // Added project ID prop
  handleCompleteProject?: () => void;
  handleStartProject?: () => void; // Added start project handler
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
  projectId,
  handleCompleteProject,
  handleStartProject,
}: ProjectDetailCardProps) {
  const { text: projectStatus } = getStatusBadge(status);

  const user = useSelector((state: RootState) => state.user);

  // Construct the milestone route dynamically based on userRole and projectId
  const milestoneRoute = `${user?.type === 'business' ? '/business' : ''}/project/${projectId}/milestone`;

  // Compute timeline progress between start and end dates
  const formatDate = (d?: Date | null) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const computeProgress = (start?: Date | null, end?: Date | null) => {
    if (!start || !end) return 0;
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const nowMs = Date.now();
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return 0;
    const clampedNow = Math.min(Math.max(nowMs, startMs), endMs);
    const pct = Math.round(((clampedNow - startMs) / (endMs - startMs)) * 100);
    return pct;
  };

  const progress = computeProgress(startDate, endDate);

  return (
    <Card className="rounded-xl border border-border/60 shadow-sm hover:shadow-lg transition-shadow bg-muted-foreground/20 dark:bg-muted/20 ">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight">
            {projectName}
          </CardTitle>
          <Badge
            variant="outline"
            className={`px-2 py-0.5 text-xs md:text-sm rounded-md ${statusOutlineClasses(projectStatus)}`}
          >
            {projectStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Timeline visualization */}
        <div className="p-3 rounded-lg border bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(startDate)}</span>
            <span>{formatDate(endDate)}</span>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-background bg-blue-600 shadow"
              style={{ left: `calc(${progress}% - 6px)` }}
              aria-label={`Progress ${progress}%`}
            />
          </div>
          <div className="mt-2 text-right text-xs font-medium text-muted-foreground">
            {progress}% complete
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Project Domain Section */}
          <div className="flex flex-col gap-2 px-3 py-2 text-xs md:text-sm rounded-lg border bg-muted/30 w-full md:w-1/2">
            <div className="flex items-center gap-2 text-foreground">
              <Tag className="w-4 h-4 block md:hidden" />
              <p className="font-medium">Project Domains</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectDomain.map((domain, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs md:text-sm px-2.5 py-0.5 rounded-full"
                >
                  {domain}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="flex flex-col gap-2 px-3 py-2 text-xs md:text-sm rounded-lg border bg-muted/30 w-full md:w-1/2">
            <div className="flex items-center gap-2 text-foreground">
              <Code2 className="w-4 h-4 block md:hidden" />
              <p className="font-medium">Skills</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs md:text-sm px-2.5 py-0.5 rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs md:text-sm rounded-lg border bg-muted/20">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <a href={`mailto:${email}`} className="text-sm hover:underline">
            {email}
          </a>
        </div>

        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
          <Link href={milestoneRoute}>
            <Button size="sm" variant="outline" className="gap-2">
              <FlagIcon className="w-4 h-4" />
              Milestones
            </Button>
          </Link>
          {/* Conditional button based on project status */}
          {projectStatus === 'PENDING' ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-green-700/40 text-green-600 hover:text-green-600 bg-green-100 hover:bg-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/60"
              onClick={handleStartProject}
              disabled={!handleStartProject}
            >
              <Play className="w-4 h-4" />
              Start Project
            </Button>
          ) : projectStatus === 'ACTIVE' ? (
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-500"
              onClick={handleCompleteProject}
              disabled={!handleCompleteProject}
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </Button>
          ) : projectStatus === 'COMPLETED' ? (
            <Button size="sm" variant="secondary" className="gap-2" disabled>
              <CheckCircle className="w-4 h-4" />
              Completed
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectDetailCard;
