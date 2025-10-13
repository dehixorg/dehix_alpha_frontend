'use client';
import React, { useState } from 'react';
import {
  MessageSquareIcon,
  MapPin,
  MoreVertical,
  CircleAlert,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';

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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
// Textarea provided by reusable form
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerificationStatus } from '@/utils/verificationStatus';

interface EducationProps {
  _id: string;
  type: string;
  location: string;
  degree: string;
  startFrom: string;
  endTo: string | 'current';
  grade: string;
  comments: string;
  fieldOfStudy: string;
  status: string | VerificationStatus;
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

// Schema handled in reusable form

const EducationVerificationCard: React.FC<EducationProps> = ({
  _id,
  degree,
  location,
  startFrom,
  endTo,
  grade,
  fieldOfStudy,
  comments,
  status,
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [openReport, setOpenReport] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatus | undefined
  >(status as VerificationStatus);

  // Form handled via reusable component

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
    try {
      await axiosInstance.put(
        `/verification/${_id}/oracle?doc_type=education`,
        {
          comments: data.comment,
          verification_status: data.type,
        },
      );
      const newStatus =
        data.type === 'Approved'
          ? VerificationStatus.APPROVED
          : VerificationStatus.DENIED;
      setVerificationStatus(newStatus);
      onStatusUpdate(newStatus);
      onCommentUpdate(data.comment || '');
      notifySuccess('Verification status updated successfully.');
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    }
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Invalid Date';
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

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
                alt={location || 'University'}
              />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-xl font-bold">
                {location?.charAt(0) || degree?.charAt(0) || 'E'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center w-full gap-2">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors max-w-[calc(100%-80px)]">
                  {degree}
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

              <CardDescription className="mt-2 text-gray-700 dark:text-gray-300">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Location</TooltipContent>
                </Tooltip>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Field Of Study
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {fieldOfStudy}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Grade</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {grade}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(startFrom)}
              </p>
            </div>
            <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">End</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {endTo !== 'current' ? formatDate(endTo) : 'Current'}
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
            <span>{formatDate(startFrom)}</span>
            <span>-</span>
            <span>{endTo !== 'current' ? formatDate(endTo) : 'Current'}</span>
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
    </TooltipProvider>
  );
};

export default EducationVerificationCard;
