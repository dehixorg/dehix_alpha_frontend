'use client';
import React, { useEffect, useState } from 'react';
import {
  MessageSquareIcon,
  Github,
  User2Icon,
  Phone,
  Building,
  MoreVertical,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { notifyError } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import { getReportTypeFromPath } from '@/utils/getReporttypeFromPath';
import { NewReportTab } from '@/components/report-tabs/NewReportTabs';

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
  status: string | 'Pending'; // Add initial status prop
  onStatusUpdate: (newStatus: string) => void;
  onCommentUpdate: (newComment: string) => void;
}

const FormSchema = z.object({
  type: z.enum(['Approved', 'Denied'], {
    required_error: 'You need to select a type.',
  }),
  comment: z.string().optional(),
});

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
  status, // Get initial status from props
  onStatusUpdate,
  onCommentUpdate,
}) => {
  const [verificationStatus, setVerificationStatus] = useState(status);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const selectedType = form.watch('type');
  useEffect(() => {
    setVerificationStatus(status);
  }, [status]);
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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await axiosInstance.put(
        `/verification/${_id}/oracle?doc_type=experience`,
        {
          comments: data.comment,
          verification_status: data.type,
        },
      );
    } catch (error) {
      notifyError('Something went wrong.Please try again.', 'Error');
    }
    setVerificationStatus(data.type);
    onStatusUpdate(data.type);
    onCommentUpdate(data.comment || '');
  }

  return (
    <Card className="max-w-full mx-auto md:min-w-[30vw]">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{jobTitle}</span>
          <div className="flex items-center space-x-2 ml-auto">
            {githubRepoLink && (
              <a
                href={githubRepoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white underline"
              >
                <Github />
              </a>
            )}
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
        </CardTitle>

        <CardDescription className="text-justify text-gray-600">
          {verificationStatus === 'Pending' ? (
            <Badge className="bg-warning-foreground text-white my-2">
              Pending
            </Badge>
          ) : verificationStatus === 'Approved' ? (
            <Badge className="bg-success text-white my-2">Approved</Badge>
          ) : (
            <Badge className="bg-red-500 text-white my-2">Denied</Badge>
          )}
          <br />
          {workDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="mt-4">
            <p className="mt-4 mb-3 text-m text-gray-600 flex items-center">
              <span className="flex">
                <Building className="mr-2" />
                {company}
              </span>
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 flex items-center">
                  <User2Icon className="mr-2" />
                  {referencePersonName}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {referencePersonName}
              </TooltipContent>
            </Tooltip>
            {/* Adding Tooltip for Reference Person Email */}
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-600 flex items-center mt-2">
                  <Phone className="mr-2" />
                  {referencePersonContact}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {referencePersonContact}
              </TooltipContent>
            </Tooltip>
          </div>
          {comments && (
            <p className="mt-2 flex items-center text-gray-500 border p-3 rounded">
              <MessageSquareIcon className="mr-2" />
              {comments}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex gap-4 text-gray-500">
          {new Date(startFrom).toLocaleDateString()} -{' '}
          {endTo !== 'current'
            ? new Date(endTo).toLocaleDateString()
            : 'Current'}
        </div>

        {verificationStatus === 'Pending' && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 mt-6"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Choose Verification Status:</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="Approved" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Approved
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <RadioGroupItem value="Denied" />
                          </FormControl>
                          <FormLabel className="font-normal">Denied</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments:</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter comments:" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedType || form.formState.isSubmitting}
              >
                Submit
              </Button>
            </form>
          </Form>
        )}
      </CardFooter>
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

export default WorkExpVerificationCard;
