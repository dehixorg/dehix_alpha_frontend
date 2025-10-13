'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Linkedin,
  Github,
  GlobeIcon,
  Users,
  Mail,
  Phone,
  MoreVertical,
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
import VerificationDecisionForm from '@/components/verification/VerificationDecisionForm';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { VerificationStatus } from '@/utils/verificationStatus';

interface BusinessProps {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companySize: string;
  referenceEmail: string;
  websiteLink: string;
  linkedInLink: string;
  githubLink: string;
  comments: string;
  status: string | VerificationStatus;
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const BusinessVerificationCard: React.FC<BusinessProps> = ({
  firstName,
  lastName,
  email,
  phone,
  companyName,
  companySize,
  referenceEmail,
  websiteLink,
  linkedInLink,
  githubLink,
  comments,
  status,
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<string>(
    status as string,
  );
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Reusable decision form will handle its own form state and validation

  useEffect(() => {
    setVerificationStatus(status as string);
  }, [status]);

  async function onSubmit(data: { type: string; comment?: string }) {
    const newStatus = data.type === 'verified' ? 'APPROVED' : 'DENIED';
    setVerificationStatus(newStatus);
    onStatusUpdate(newStatus);
    onCommentUpdate(data.comment || '');
  }

  return (
    <Card className="max-w-full md:max-w-2xl relative">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center w-full">
            <span>
              {firstName} {lastName}
            </span>
            <div className="flex items-center space-x-3">
              {websiteLink && (
                <a href={websiteLink} target="_blank" rel="noopener noreferrer">
                  <GlobeIcon className="text-muted-foreground hover:text-primary" />
                </a>
              )}
              {linkedInLink && (
                <a
                  href={linkedInLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="text-muted-foreground hover:text-primary" />
                </a>
              )}
              {githubLink && (
                <a href={githubLink} target="_blank" rel="noopener noreferrer">
                  <Github className="text-muted-foreground hover:text-primary" />
                </a>
              )}
              {/* Report menu button */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-md z-50">
                    <button
                      onClick={() => {
                        setOpenReport(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardTitle>
        <CardDescription className="mt-1 text-justify text-gray-600">
          {companyName}
          <br />
          {verificationStatus === 'PENDING' && (
            <Badge className="bg-yellow-500 text-white mt-2">PENDING</Badge>
          )}
          {verificationStatus === 'APPROVED' && (
            <Badge className="bg-green-500 text-white mt-2">APPROVED</Badge>
          )}
          {verificationStatus === 'DENIED' && (
            <Badge className="bg-red-500 text-white mt-2">DENIED</Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Users className="mr-2" />
                {companySize}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Company Size</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="mr-2" />
                {email}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Email</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Phone className="mr-2" />
                {phone}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Phone</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="mr-2" />
                {referenceEmail}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom">Reference Email</TooltipContent>
          </Tooltip>

          {comments && (
            <p className="mt-2 flex items-center text-gray-500 border p-3 rounded">
              <MessageSquareIcon className="mr-2" />
              {comments}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center">
        {verificationStatus === 'PENDING' && (
          <VerificationDecisionForm
            radioOptions={[
              { value: 'verified', label: 'Verify' },
              { value: 'rejected', label: 'Reject' },
            ]}
            onSubmit={onSubmit}
            className="w-full space-y-6 mt-6"
          />
        )}
      </CardFooter>

      {/* Report Modal */}
      {openReport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-md w-full max-w-lg relative shadow-lg">
            <button
              onClick={() => setOpenReport(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
            <NewReportTab reportData={reportData} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default BusinessVerificationCard;
