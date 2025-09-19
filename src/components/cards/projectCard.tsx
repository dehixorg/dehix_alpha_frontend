import React, { useState } from 'react';
import Link from 'next/link';
import {
  MoreVertical,
  ShieldCheck,
  Briefcase,
  Clock,
  CheckCircle2,
  Activity,
  Flag,
  Eye,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuSeparator,
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
  const pathname = usePathname();
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
        'flex flex-col h-[250px] relative group overflow-hidden transition-all hover:shadow-lg',
        cardClassName,
      )}
      {...props}
    >
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${statusColor}`} />

      {/* 3-dot menu */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <Link
                className="flex items-center"
                href={`${user?.type === 'business' ? '/business' : ''}/project/${project._id}`}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpenReport(true)}
              className="text-red-600 focus:text-red-600 focus:bg-destructive/50 cursor-pointer"
            >
              <Flag className="mr-2 h-4 w-4" />
              <span>Report</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between"></div>
        <CardTitle className="text-xl font-semibold mt-3 line-clamp-1 flex items-center">
          {project.projectName}
          {project.verified && (
            <ShieldCheck className="h-5 w-5 ml-1.5 text-green-300" />
          )}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{project.companyName}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="bg-muted/30 dark:bg-muted/10 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description ||
              'No description available for this project.'}
          </p>
        </div>

        {project.skillsRequired?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Skills Required
            </p>
            <div className="flex flex-wrap gap-2">
              {project.skillsRequired.slice(0, 4).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs font-normal hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {project.skillsRequired.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{project.skillsRequired.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Report Dialog */}
        <Dialog open={openReport} onOpenChange={setOpenReport}>
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
