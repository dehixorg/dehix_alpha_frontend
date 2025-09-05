import React, { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusBadge } from '@/utils/statusBadge';
import { Type } from '@/utils/enum';
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
  const { text, className } = getStatusBadge(project.status);
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

  return (
    <Card
      className={cn('flex flex-col h-[400px] relative', cardClassName)}
      {...props}
    >
      {/* 3-dot menu */}
      <div className="absolute top-3 right-3 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => setOpenReport(true)}
              className="text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader>
        <CardTitle className="flex">
          {project.projectName}&nbsp;
          {project.verified && <ShieldCheck className="text-success" />}
        </CardTitle>
        <CardDescription className="text-gray-600">
          <p className="my-auto">
            {project.createdAt
              ? new Date(project.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>
          <br />
          <Badge className={className}>{text}</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 mb-auto flex-grow">
        <div className="mb-4 items-start pb-4 last:mb-0 last:pb-0 w-full">
          <p className="text-sm text-muted-foreground">
            {project.description?.length > 40
              ? `${project.description.slice(0, 40)}...`
              : project.description || 'No description available'}
          </p>
        </div>
        <div>
          <p>
            <strong>Company:</strong> {project.companyName}
          </p>
          <p>
            <strong>Role:</strong> {project.role}
          </p>
          <p>
            <strong>Experience:</strong> {project.experience}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {project?.skillsRequired?.map((skill, index) => (
              <Badge key={index} className="text-xs text-white bg-muted">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link
          href={`${user?.type === 'business' ? '/business' : ''}/project/${project._id}`}
          className="w-full"
        >
          <Button
            className={`w-full ${project.status === StatusEnum.COMPLETED && 'bg-green-900 hover:bg-green-700'}`}
          >
            View full Details
          </Button>
        </Link>
      </CardFooter>

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
    </Card>
  );
}
