'use client';
import React, { useEffect, useState } from 'react';
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
import VerificationDecisionForm from '@/components/verification/VerificationDecisionForm';
import { notifyError } from '@/utils/toastMessage';
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

interface WorkExpProps {
  _id: string;
  jobTitle: string;
  workDescription: string;
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
  workDescription,
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
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatus | undefined
  >(status);
  // Form is handled by reusable component
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

        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors max-w-[calc(100%-80px)]">
          {jobTitle}
        </CardTitle>

        <CardDescription className="text-gray-700 dark:text-gray-300">
          {verificationStatus === VerificationStatus.PENDING ? (
            <Badge className="bg-warning-foreground text-white my-2">
              PENDING
            </Badge>
          ) : verificationStatus === VerificationStatus.APPROVED ? (
            <Badge className="bg-success text-white my-2">APPROVED</Badge>
          ) : (
            <Badge className="bg-red-500 text-white my-2">DENIED</Badge>
          )}
          <br />
          {workDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="h-4 w-4" /> {company}
            </p>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ref. Person
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User2Icon className="h-4 w-4" /> {referencePersonName}
            </p>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Phone className="h-4 w-4" /> {referencePersonContact}
            </p>
          </div>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Repository
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {githubRepoLink ? (
                <a
                  href={githubRepoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Github className="h-4 w-4" /> View Repo
                </a>
              ) : (
                'N/A'
              )}
            </p>
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
        <div className="flex flex-1 gap-2 text-sm text-muted-foreground">
          <span>{new Date(startFrom).toLocaleDateString()}</span>
          <span>-</span>
          <span>
            {endTo !== 'current'
              ? new Date(endTo).toLocaleDateString()
              : 'Current'}
          </span>
        </div>

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
        <DialogContent className="p-0 overflow-hidden">
          <NewReportTab reportData={reportData} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkExpVerificationCard;
