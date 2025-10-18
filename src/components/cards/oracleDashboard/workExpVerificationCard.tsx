'use client';
import React, { useEffect, useState } from 'react';
const isSafeGithubUrl = (value?: string) => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 'github.com';
  } catch {
    return false;
  }
};
import {
  MessageSquareIcon,
  Github,
  User2Icon,
  Phone,
  Building,
  MoreVertical,
  CircleAlert,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';

import { axiosInstance } from '@/lib/axiosinstance';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import VerificationDecisionForm from '@/components/verification/VerificationDecisionForm';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { VerificationStatus } from '@/utils/verificationStatus';
import { DateHistory } from '@/components/shared/DateHistory';

interface WorkExpProps {
  _id: string;
  jobTitle: string;
  startFrom: string;
  endTo: string | 'current';
  company: string;
  referencePersonName: string;
  referencePersonContact: string;
  githubRepoLink: string;
  comments: string;
  status: VerificationStatus;
  onStatusUpdate: (newStatus: VerificationStatus) => void;
  onCommentUpdate: (newComment: string) => void;
}

// Schema handled in reusable form component

const WorkExpVerificationCard: React.FC<WorkExpProps> = ({
  _id,
  jobTitle,
  startFrom,
  company,
  endTo,
  referencePersonName,
  referencePersonContact,
  githubRepoLink,
  comments,
  status,
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(status); // Form is handled by reusable component
  useEffect(() => {
    setVerificationStatus(status);
  }, [status]);
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
    reportedId: user?.uid || 'user123',
  };

  async function onSubmit(data: { type: string; comment?: string }) {
    const apiStatus = data.type === 'Approved' ? 'APPROVED' : 'DENIED';
    try {
      await axiosInstance.put(`/verification/${_id}/update`, {
        comment: data.comment,
        verification_status: apiStatus,
      });
      const newStatus =
        apiStatus === 'APPROVED'
          ? VerificationStatus.APPROVED
          : VerificationStatus.DENIED;
      setVerificationStatus(newStatus);
      onStatusUpdate(newStatus);
      onCommentUpdate(data.comment || '');
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
      return;
    }
  }

  return (
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
            <DropdownMenuContent align="end" className="w-44">
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
              alt={company || 'Company'}
            />
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-xl font-bold">
              {company?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center w-full gap-2">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors max-w-[calc(100%-80px)]">
                {jobTitle}
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
              {githubRepoLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Open GitHub repo"
                      >
                        <a
                          href={githubRepoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open GitHub repository"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">View GitHub</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
            <div className="flex items-start gap-2 w-full min-w-0">
              <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white break-all">
                {company}
              </span>
            </div>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Reference Contact
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User2Icon className="h-4 w-4" /> {referencePersonName}
            </p>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white break-all">
                {referencePersonContact}
              </span>
            </div>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Repository
            </p>
            {githubRepoLink && isSafeGithubUrl(githubRepoLink) ? (
              <a
                href={githubRepoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
                aria-label="Open GitHub repository"
              >
                <Github className="h-4 w-4" /> View Repo
              </a>
            ) : (
              'N/A'
            )}
          </div>
        </div>

        {comments && (
          <div className="mt-4 flex items-start text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 p-3 rounded-lg">
            <MessageSquareIcon className="mr-2 h-4 w-4 mt-0.5" />
            <p className="text-sm">{comments}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex-col items-stretch gap-4">
        <DateHistory
          startDate={startFrom ? new Date(startFrom) : undefined}
          endDate={endTo !== 'current' && endTo ? new Date(endTo) : undefined}
          className="dark:bg-background"
        />

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
        {/* Hover effect border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 rounded-xl pointer-events-none transition-all duration-300"></div>
      </CardFooter>

      <Dialog open={openReport} onOpenChange={setOpenReport}>
        <DialogContent className="p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <NewReportTab
            reportData={reportData}
            onSubmitted={() => {
              notifySuccess('Report submitted successfully!', 'Success');
              setOpenReport(false);
              return true;
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkExpVerificationCard;
