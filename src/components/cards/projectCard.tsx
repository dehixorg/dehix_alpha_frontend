import React, { useState } from 'react';
import {
  MoreVertical,
  ShieldCheck,
  Briefcase,
  Clock,
  CheckCircle2,
  Activity,
  Flag,
  Tag,
  Award,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DateHistory } from '@/components/shared/DateHistory';
import { Badge } from '@/components/ui/badge';
import { StatusEnum } from '@/utils/freelancer/enum';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface ProjectType {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: StatusEnum;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ProjectCardProps = React.ComponentProps<typeof Card> & {
  cardClassName?: string;
  project: ProjectType;
  type?: string;
};

export function ProjectCard({
  cardClassName,
  project,
  ...props
}: ProjectCardProps) {
  const [openReport, setOpenReport] = useState(false);
  const lastDialogCloseAt = React.useRef<number>(0);
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  const reportType = getReportTypeFromPath(pathname);
  const reportData = {
    subject: '',
    description: '',
    report_role: user?.type || 'FREELANCER',
    report_type: reportType,
    status: 'OPEN',
    reportedbyId: user?.uid || 'user123',
    reportedId: user?.uid || 'user123',
  };

  const projectUrl = `${user?.type === 'business' ? '/business' : ''}/project/${project._id}`;

  // Status configuration
  const statusConfig = {
    [StatusEnum.ACTIVE]: {
      color: 'bg-blue-500',
      icon: Activity,
      text: 'Active',
    },
    [StatusEnum.COMPLETED]: {
      color: 'bg-green-500',
      icon: CheckCircle2,
      text: 'Completed',
    },
    [StatusEnum.PENDING]: {
      color: 'bg-amber-500',
      icon: Clock,
      text: 'In Progress',
    },
    [StatusEnum.REJECTED]: {
      color: 'bg-red-500',
      icon: CheckCircle2,
      text: 'Rejected',
    },
    default: {
      color: 'bg-gray-400',
      icon: Briefcase,
      text: 'Draft',
    },
  };

  const { color: statusColor } =
    statusConfig[project.status || 'default'] || statusConfig.default;

  return (
    <Card
      className={cn(
        'flex flex-col relative group overflow-hidden transition-all hover:shadow-lg border-border/60 hover:border-primary/30 cursor-pointer',
        cardClassName,
      )}
      onMouseDownCapture={(e) => {
        if (openReport) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onClick={() => {
        if (openReport) return;
        if (Date.now() - lastDialogCloseAt.current < 350) return;
        router.push(projectUrl);
      }}
      onKeyDown={(e) => {
        if (openReport) return;
        if (Date.now() - lastDialogCloseAt.current < 350) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(projectUrl);
        }
      }}
      tabIndex={0}
      role="button"
      {...props}
    >
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${statusColor}`} />

      {/* 3-dot menu */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setOpenReport(true);
              }}
              className="text-red-600 focus:text-red-600 focus:bg-destructive/50 cursor-pointer"
            >
              <Flag className="mr-2 h-4 w-4" />
              <span>Report</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 rounded-xl border">
            <AvatarImage
              src="/placeholder-avatar.svg"
              alt={project.companyName || 'Company'}
            />
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl font-bold">
              {project.companyName?.charAt(0) ||
                project.projectName?.charAt(0) ||
                'P'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg sm:text-xl font-bold truncate group-hover:text-primary transition-colors">
                {project.projectName}
              </CardTitle>
              {project.verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top">Verified</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="truncate">{project.companyName}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {(project.start || project.end) && (
          <DateHistory
            startDate={project.start ? new Date(project.start) : undefined}
            endDate={project.end ? new Date(project.end) : undefined}
            className="dark:bg-background"
          />
        )}

        {Array.isArray((project as any).projectDomain) &&
          (project as any).projectDomain.length > 0 && (
            <Card className="space-y-2 p-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                <span>Domains</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(project as any).projectDomain
                  .slice(0, 3)
                  .map((domain: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs rounded-full px-3 py-1"
                    >
                      {domain}
                    </Badge>
                  ))}
                {(project as any).projectDomain.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs rounded-full px-2"
                  >
                    +{(project as any).projectDomain.length - 3}
                  </Badge>
                )}
              </div>
            </Card>
          )}

        {project.skillsRequired?.length > 0 && (
          <Card className="space-y-2 p-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Award className="h-3.5 w-3.5" />
              <span>Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.skillsRequired.slice(0, 4).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs rounded-full px-3 py-1"
                >
                  {skill}
                </Badge>
              ))}
              {project.skillsRequired.length > 4 && (
                <Badge variant="outline" className="text-xs rounded-full px-2">
                  +{project.skillsRequired.length - 4}
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Report Dialog */}
        <Dialog
          open={openReport}
          onOpenChange={(v) => {
            setOpenReport(v);
            if (!v) {
              lastDialogCloseAt.current = Date.now();
            }
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <NewReportTab
              reportData={reportData}
              onSubmitted={() => {
                setOpenReport(false);
                return true;
              }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
