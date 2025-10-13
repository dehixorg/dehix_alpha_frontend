'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Github,
  Mail,
  MoreVertical,
  CircleAlert,
  X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import VerificationDecisionForm from '@/components/verification/VerificationDecisionForm';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
// Textarea is now part of the reusable component
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { VerificationStatus } from '@/utils/verificationStatus';
interface ProjectProps {
  _id: string;
  projectName: string;
  description: string;
  githubLink: string;
  startFrom: string;
  endTo: string | 'current';
  reference: string;
  techUsed: string[];
  comments: string;
  role: string;
  projectType: string;
  status: VerificationStatus;
  onStatusUpdate: (newStatus: VerificationStatus) => void;
  onCommentUpdate: (newComment: string) => void;
}

// Inline schema removed; handled in reusable component

const ProjectVerificationCard: React.FC<ProjectProps> = ({
  _id,
  projectName,
  githubLink,
  startFrom,
  endTo,
  reference,
  techUsed,
  comments,
  status,
  role,
  projectType,
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatus | undefined
  >(status as VerificationStatus);
  // Form handled by reusable component
  const [openReport, setOpenReport] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const reportType = getReportTypeFromPath(pathname);

  const reportData = {
    subject: '',
    description: '',
    report_role: user?.type || 'STUDENT',
    report_type: reportType,
    status: 'OPEN',
    reportedbyId: user?.uid || 'user123',
    reportedId: user?.uid, // project ID
  };
  useEffect(() => {
    setVerificationStatus(status as VerificationStatus);
  }, [status]);

  async function onSubmit(data: { type: string; comment?: string }) {
    const apiStatus = data.type === 'Approved' ? 'APPROVED' : 'DENIED';
    try {
      await axiosInstance.put(`/verification/${_id}/update`, {
        comment: data.comment,
        verification_status: apiStatus,
      });
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    }
    const newStatus =
      apiStatus === 'APPROVED'
        ? VerificationStatus.APPROVED
        : VerificationStatus.DENIED;
    setVerificationStatus(newStatus);
    onStatusUpdate(newStatus);
    onCommentUpdate(data.comment || '');
  }

  return (
    <TooltipProvider>
      <Card className="group relative overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 bg-muted-foreground/20 dark:bg-muted/20">
        <CardHeader className="pb-3 px-6 pt-6 relative">
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44" align="end">
                <DropdownMenuItem
                  onClick={() => setOpenReport(true)}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <CircleAlert className="mr-2 h-4 w-4" />
                  <span>Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-xl border border-gray-200 dark:border-gray-700">
              <AvatarImage
                src="/placeholder-avatar.svg"
                alt={projectName || 'Project'}
              />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-xl font-bold">
                {projectName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center w-full gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors max-w-[calc(100%-80px)]">
                  {projectName}
                </CardTitle>
              </div>

              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {verificationStatus === VerificationStatus.PENDING ? (
                  <Badge className="bg-warning-foreground text-white">
                    PENDING
                  </Badge>
                ) : verificationStatus === VerificationStatus.APPROVED ? (
                  <Badge className="bg-success text-white">APPROVED</Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">DENIED</Badge>
                )}
              </div>

              <CardDescription className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">
                {githubLink && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Open GitHub repo"
                      >
                        <a href={githubLink} target="_blank" rel="noreferrer">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">View GitHub</TooltipContent>
                  </Tooltip>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {role}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Project Type
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {projectType}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(startFrom).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">End</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {endTo !== 'current'
                  ? new Date(endTo).toLocaleDateString()
                  : 'Current'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Tech Used
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(techUsed || []).map((tech, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="rounded-full text-xs font-medium px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/10 dark:border-primary/30 transition-all duration-200"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{reference}</span>
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">{reference}</TooltipContent>
            </Tooltip>
          </div>

          {comments && (
            <div className="mt-4 flex items-start text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-3 rounded-lg">
              <MessageSquareIcon className="mr-2 h-4 w-4 mt-0.5" />
              <p className="text-sm">{comments}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex-col items-stretch gap-4">
          {verificationStatus === VerificationStatus.PENDING && (
            <VerificationDecisionForm
              radioOptions={[
                { value: 'Approved', label: 'Approve' },
                { value: 'Denied', label: 'Deny' },
              ]}
              onSubmit={onSubmit}
              className="w-full space-y-6"
            />
          )}
        </CardFooter>

        {/* Hover effect border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>

        {openReport && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setOpenReport(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
              <NewReportTab reportData={reportData} />
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default ProjectVerificationCard;
